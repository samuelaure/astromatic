import { PipelineService, type PipelineConfig } from "./pipeline.service.ts";
import logger from "../shared/logger.ts";

export class DevPipelineService extends PipelineService {
    constructor(config: PipelineConfig) {
        super(config);
    }

    // Dev mode skips distribution and updates
    public override async execute(): Promise<void> {
        logger.info(
            { templateId: (this as any).config.templateId },
            "🧪 [DEV MODE] Starting pipeline test (Render only)..."
        );

        try {
            const payload = await (this as any).fetchContent();
            if (!payload) return;

            (this as any).prepareOutputDirectory();
            const assets = await (this as any).selectAssets();

            // Just render, don't upload or publish
            await (this as any).renderOnly(payload, assets);

            logger.info("✅ Render complete! Check out/video.mp4 (locally)");
            logger.info("ℹ️ Distribution and Airtable updates were skipped in DEV MODE.");
        } catch (error: any) {
            logger.error({ err: error }, "Test render failed");
            process.exit(1);
        }
    }

    protected async renderOnly(payload: any, assets: any): Promise<void> {
        const { bundle } = await import("@remotion/bundler");
        const { renderMedia, selectComposition } = await import("@remotion/renderer");
        const { calculateTotalFrames } = await import("../rendering/utils.ts");

        const bundled = await bundle((this as any).entryPath);
        const durationInFrames = calculateTotalFrames(payload.sequences);

        const inputProps = {
            ...payload,
            templateId: (this as any).config.templateId,
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
            outputLocation: (this as any).outputPath,
            inputProps,
            codec: "h264",
            audioCodec: "aac",
        });
    }
}
