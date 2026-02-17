import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { fetchApprovedRecord, updateRecordToProcessed, type AirtablePayload } from "../content/airtable.ts";
import { uploadToR2 } from "../storage/r2.ts";
import { publishToInstagram } from "../distribution/instagram.ts";
import { notifyTelegram } from "../monitoring/telegram.ts";
import { getVideoDuration } from "../rendering/metadata.ts";
import { calculateTotalFrames } from "../rendering/utils.ts";
import { env } from "../shared/config.ts";
import logger from "../shared/logger.ts";
import { PipelineError, RenderingError } from "../shared/errors.ts";
import { BrandConfig, getBrandFromTemplateId } from "../shared/brands.ts";

export interface PipelineConfig {
    templateId: string;
    tableId: string;
}

export interface PipelineAssets {
    videoIndex1: number;
    videoIndex2: number;
    video1Duration: number;
    video2Duration: number;
    musicIndex: number;
    r2BaseUrl: string;
    names: {
        vid1: string;
        vid2: string;
        aud: string;
    };
}

export class PipelineService {
    protected readonly entryPath = path.resolve("src/index.ts");
    protected readonly outputPath = path.resolve("out/video.mp4");
    protected readonly brand: BrandConfig;

    constructor(protected readonly config: PipelineConfig) {
        this.brand = getBrandFromTemplateId(config.templateId);
    }

    public async execute(): Promise<void> {
        logger.info(
            { templateId: this.config.templateId, brand: this.brand.id },
            "🚀 Astromatic: Starting automation cycle..."
        );

        try {
            // 1. Fetch Content
            const payload = await this.fetchContent();
            if (!payload) return;

            // 2. Prepare Environment
            this.prepareOutputDirectory();

            // 3. Asset Selection & Metadata
            const assets = await this.selectAssets();

            // 4. Rendering
            const publicUrl = await this.renderAndUpload(payload, assets);

            // 5. Distribution
            const postLink = await publishToInstagram(
                publicUrl,
                payload.caption,
                this.brand.igUserId
            );
            logger.info({ postLink }, "Published to Instagram successfully.");

            // 6. Finalize
            await updateRecordToProcessed(payload.id, this.config.tableId);
            await this.sendSuccessNotification(payload, assets, postLink);

            logger.info("✅ Automation cycle finished successfully.");
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    protected async fetchContent(): Promise<AirtablePayload | null> {
        const payload = await fetchApprovedRecord(
            this.config.templateId,
            this.config.tableId
        );

        if (!payload) {
            logger.info(
                { templateId: this.config.templateId },
                "Nothing to process. Exiting."
            );
            await notifyTelegram(
                `⚠️ <b>Astromatic:</b> No approved records found in Airtable for <b>${this.config.templateId}</b> today.`
            );
            return null;
        }

        return payload;
    }

    protected prepareOutputDirectory(): void {
        const outDir = path.dirname(this.outputPath);
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        if (fs.existsSync(this.outputPath)) {
            try {
                fs.unlinkSync(this.outputPath);
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                throw new RenderingError(
                    `Could not delete ${this.outputPath}. Ensure it is not open in another program. Error: ${errorMessage}`
                );
            }
        }
    }

    protected async selectAssets(): Promise<PipelineAssets> {
        const selectRandom = (max: number) => Math.floor(Math.random() * max) + 1;

        const videoIndex1 = selectRandom(this.brand.maxAssets.videos);
        let videoIndex2 = selectRandom(this.brand.maxAssets.videos);
        while (videoIndex2 === videoIndex1) {
            videoIndex2 = selectRandom(this.brand.maxAssets.videos);
        }
        const musicIndex = selectRandom(this.brand.maxAssets.audios);

        const pad = (n: number) => String(n).padStart(4, "0");
        const r2BaseUrl = env.R2_PUBLIC_URL.replace(/\/$/, "");

        const bg1Url = `${r2BaseUrl}/${this.brand.r2Folder}/videos/${this.brand.prefix.video}${pad(videoIndex1)}.mp4`;
        const bg2Url = `${r2BaseUrl}/${this.brand.r2Folder}/videos/${this.brand.prefix.video}${pad(videoIndex2)}.mp4`;

        logger.info("Fetching video metadata for smart looping...");
        const [video1Duration, video2Duration] = await Promise.all([
            getVideoDuration(bg1Url),
            getVideoDuration(bg2Url),
        ]);

        return {
            videoIndex1,
            videoIndex2,
            video1Duration,
            video2Duration,
            musicIndex,
            r2BaseUrl,
            names: {
                vid1: `${this.brand.prefix.video}${pad(videoIndex1)}`,
                vid2: `${this.brand.prefix.video}${pad(videoIndex2)}`,
                aud: `${this.brand.prefix.audio}${pad(musicIndex)}`
            }
        };
    }

    protected async renderAndUpload(payload: AirtablePayload, assets: PipelineAssets): Promise<string> {
        logger.info("Bundling and selecting composition...");
        const bundled = await bundle(this.entryPath);
        const durationInFrames = calculateTotalFrames(payload.sequences);

        const inputProps = {
            ...payload,
            templateId: this.config.templateId,
            ...assets,
            durationInFrames,
        };

        const composition = await selectComposition({
            serveUrl: bundled,
            id: "Main",
            inputProps,
        });

        composition.durationInFrames = durationInFrames;

        logger.info(`Rendering video (${durationInFrames} frames)...`);
        await renderMedia({
            composition,
            serveUrl: bundled,
            outputLocation: this.outputPath,
            inputProps,
            codec: "h264",
            audioCodec: "aac",
        });

        logger.info("Uploading to Cloudflare R2...");
        const timestamp = new Date()
            .toISOString()
            .replace(/[-T:]/g, "")
            .split(".")[0]
            .replace(/(\d{8})(\d{6})/, "$1_$2");

        const remoteKey = `${this.brand.r2Folder}/outputs/${this.brand.id.toUpperCase()}_OUTPUT_${timestamp}.mp4`;
        return uploadToR2(this.outputPath, remoteKey);
    }

    protected async sendSuccessNotification(_payload: AirtablePayload, assets: PipelineAssets, postLink: string): Promise<void> {
        await notifyTelegram(
            `✅ <b>Astromatic:</b> Cycle completed for <b>${this.config.templateId}</b>!\n\n🎬 <b>Assets:</b>\n- Video 1: <code>${assets.names.vid1}</code>\n- Video 2: <code>${assets.names.vid2}</code>\n- Music: <code>${assets.names.aud}</code>\n\n🔗 <a href="${postLink}">View on Instagram</a>`
        );
    }

    protected handleError(error: unknown): never {
        let message = "Critical failure in automation pipeline";
        let context: Record<string, unknown> | undefined;
        let errorMessage = "Unknown error";

        if (error instanceof PipelineError) {
            message = error.message;
            context = error.context;
            errorMessage = error.name;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        logger.error({ err: error, context }, message);
        notifyTelegram(`❌ <b>Astromatic Error:</b>\n${message}\n\n<code>${errorMessage}</code>`);
        process.exit(1);
    }
}
