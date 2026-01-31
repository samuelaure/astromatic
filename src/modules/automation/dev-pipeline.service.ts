import { PipelineService, type PipelineConfig, type PipelineAssets } from "./pipeline.service.ts";
import { type AirtablePayload } from "../content/airtable.ts";
import logger from "../shared/logger.ts";

export class DevPipelineService extends PipelineService {
    constructor(config: PipelineConfig) {
        super(config);
    }

    // Dev mode skips distribution and updates
    public override async execute(): Promise<void> {
        logger.info(
            { templateId: this.config.templateId },
            "🧪 [DEV MODE] Starting pipeline test (Render only)..."
        );

        try {
            const payload = await this.fetchContent();
            if (!payload) return;

            this.prepareOutputDirectory();
            const assets = await this.selectAssets();

            // Just render, don't upload or publish
            await this.renderOnly(payload, assets);

            logger.info("✅ Render complete! Check out/video.mp4 (locally)");
            logger.info("ℹ️ Distribution and Airtable updates were skipped in DEV MODE.");
        } catch (error: unknown) {
            logger.error({ err: error }, "Test render failed");
            process.exit(1);
        }
    }

    protected async renderOnly(payload: AirtablePayload, assets: PipelineAssets): Promise<void> {
        const { bundle } = await import("@remotion/bundler");
        const { renderMedia, selectComposition } = await import("@remotion/renderer");
        const { calculateTotalFrames } = await import("../rendering/utils.ts");

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

        await renderMedia({
            composition,
            serveUrl: bundled,
            outputLocation: this.outputPath,
            inputProps,
            codec: "h264",
            audioCodec: "aac",
        });
    }
}
