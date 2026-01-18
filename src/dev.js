import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { fetchApprovedRecord } from "./core/airtable.js";
import { calculateTotalFrames } from "./core/timing.js";
import logger from "./core/logger.js";

const DESKTOP_VIDEO_DIR = "C:\\Users\\Sam\\Desktop\\ASTRO";
const PUBLIC_DIR = path.resolve("public");

const runDev = async () => {
    const entry = path.resolve("src/index.js");
    const outputLocation = path.resolve("out/test-video.mp4");

    logger.info("🧪 [DEV MODE] Starting pipeline test (Render only)...");

    try {
        // 1. Fetch Approved Content from Airtable
        const payload = await fetchApprovedRecord();

        if (!payload) {
            logger.info("No 'Approved' record found in Airtable to test with.");
            return;
        }

        logger.info({ recordId: payload.id }, "Testing with Airtable record...");

        // 2. Random Background Selection
        const randomNum = Math.floor(Math.random() * 28) + 1;
        const videoFileName = `astro-background-${randomNum}.mp4`;
        const sourceVideoPath = path.join(DESKTOP_VIDEO_DIR, videoFileName);
        const targetVideoPath = path.join(PUBLIC_DIR, "background.mp4");

        if (!fs.existsSync(sourceVideoPath)) {
            throw new Error(`Background video not found: ${sourceVideoPath}`);
        }

        logger.info({ sourceVideoPath }, "Copying random background video...");
        fs.copyFileSync(sourceVideoPath, targetVideoPath);

        // 3. Prepare Composition
        logger.info("Bundling and selecting composition...");
        const bundled = await bundle(entry);

        // Calculate dynamic duration
        const durationInFrames = calculateTotalFrames(payload.sequences);
        logger.info({ durationInFrames }, "Calculated duration");

        const composition = await selectComposition({
            serveUrl: bundled,
            id: "Main",
            inputProps: {
                ...payload,
                templateId: "reel-v1",
                backgroundUrl: "",
                durationInFrames,
            },
        });

        // 4. Render Locally
        logger.info(`Rendering test video to ${outputLocation}...`);
        await renderMedia({
            composition,
            serveUrl: bundled,
            outputLocation,
            inputProps: {
                ...payload,
                templateId: "reel-v1",
                backgroundUrl: "",
                durationInFrames,
            },
            codec: "h264",
            audioCodec: "aac",
        });

        logger.info("✅ Render complete! Check out/test-video.mp4");
        logger.info("ℹ️ Distribution and Airtable updates were skipped in DEV MODE.");
    } catch (error) {
        logger.error({ err: error }, "Test render failed");
        process.exit(1);
    }
};

runDev();
