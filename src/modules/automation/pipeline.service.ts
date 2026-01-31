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
import {
    MAX_BACKGROUND_VIDEOS,
    MAX_BACKGROUND_AUDIOS
} from "../shared/constants.ts";
import { PipelineError, RenderingError } from "../shared/errors.ts";

export interface PipelineConfig {
    templateId: string;
    tableId: string;
}

export class PipelineService {
    private readonly entryPath = path.resolve("src/index.ts");
    private readonly outputPath = path.resolve("out/video.mp4");

    constructor(private readonly config: PipelineConfig) { }

    public async execute(): Promise<void> {
        logger.info(
            { templateId: this.config.templateId },
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
            const postLink = await publishToInstagram(publicUrl, payload.caption);
            logger.info({ postLink }, "Published to Instagram successfully.");

            // 6. Finalize
            await updateRecordToProcessed(payload.id, this.config.tableId);
            await this.sendSuccessNotification(payload, assets, postLink);

            logger.info("✅ Automation cycle finished successfully.");
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private async fetchContent(): Promise<AirtablePayload | null> {
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

    private prepareOutputDirectory(): void {
        const outDir = path.dirname(this.outputPath);
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        if (fs.existsSync(this.outputPath)) {
            try {
                fs.unlinkSync(this.outputPath);
            } catch (e) {
                throw new RenderingError(
                    `Could not delete ${this.outputPath}. Ensure it is not open in another program.`
                );
            }
        }
    }

    private async selectAssets() {
        const selectRandom = (max: number) => Math.floor(Math.random() * max) + 1;

        const videoIndex1 = selectRandom(MAX_BACKGROUND_VIDEOS);
        let videoIndex2 = selectRandom(MAX_BACKGROUND_VIDEOS);
        while (videoIndex2 === videoIndex1) {
            videoIndex2 = selectRandom(MAX_BACKGROUND_VIDEOS);
        }
        const musicIndex = selectRandom(MAX_BACKGROUND_AUDIOS);

        const pad = (n: number) => String(n).padStart(4, "0");
        const r2BaseUrl = env.R2_PUBLIC_URL.replace(/\/$/, "");

        const bg1Url = `${r2BaseUrl}/AstrologiaFamiliar/videos/ASFA_VID_${pad(videoIndex1)}.mp4`;
        const bg2Url = `${r2BaseUrl}/AstrologiaFamiliar/videos/ASFA_VID_${pad(videoIndex2)}.mp4`;

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
                vid1: `ASFA_VID_${pad(videoIndex1)}`,
                vid2: `ASFA_VID_${pad(videoIndex2)}`,
                aud: `ASFA_AUD_${pad(musicIndex)}`
            }
        };
    }

    private async renderAndUpload(payload: AirtablePayload, assets: any): Promise<string> {
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

        const remoteKey = `AstrologiaFamiliar/outputs/ASFA_OUTPUT_${timestamp}.mp4`;
        return uploadToR2(this.outputPath, remoteKey);
    }

    private async sendSuccessNotification(_payload: AirtablePayload, assets: any, postLink: string): Promise<void> {
        await notifyTelegram(
            `✅ <b>Astromatic:</b> Cycle completed for <b>${this.config.templateId}</b>!\n\n🎬 <b>Assets:</b>\n- Video 1: <code>${assets.names.vid1}</code>\n- Video 2: <code>${assets.names.vid2}</code>\n- Music: <code>${assets.names.aud}</code>\n\n🔗 <a href="${postLink}">View on Instagram</a>`
        );
    }

    private handleError(error: any): never {
        const message = error instanceof PipelineError ? error.message : "Critical failure in automation pipeline";
        logger.error({ err: error, context: error.context }, message);
        notifyTelegram(`❌ <b>Astromatic Error:</b>\n${message}\n\n<code>${error.message}</code>`);
        process.exit(1);
    }
}
