import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { fetchApprovedRecord } from "./core/airtable.js";
import { calculateTotalFrames } from "./core/timing.js";
import { env } from "./core/config.js";
import logger from "./core/logger.js";

const runDev = async () => {
  const entry = path.resolve("src/index.js");
  const outputLocation = path.resolve("out/test-video.mp4");

  logger.info("🧪 [DEV MODE] Starting pipeline test (Render only)...");

  try {
    // 0. Ensure old file is removed
    if (fs.existsSync(outputLocation)) {
      try {
        fs.unlinkSync(outputLocation);
      } catch (e) {
        throw new Error(
          `Could not delete ${outputLocation}. Please close any program (like VLC or Windows Media Player) that is using it.`,
        );
      }
    }

    // 1. Fetch Approved Content from Airtable
    const payload = await fetchApprovedRecord();

    if (!payload) {
      logger.info("No 'Approved' record found in Airtable to test with.");
      return;
    }

    logger.info({ recordId: payload.id }, "Testing with Airtable record...");

    // 2. Asset Selection (Indices)
    const selectRandom = (max) => Math.floor(Math.random() * max) + 1;
    const videoIndex1 = selectRandom(28);
    let videoIndex2 = selectRandom(28);
    while (videoIndex2 === videoIndex1) videoIndex2 = selectRandom(28);
    const musicIndex = selectRandom(10);

    logger.info(
      { videoIndex1, videoIndex2, musicIndex },
      "Selected random asset indices...",
    );

    // 3. Prepare Composition
    logger.info("Bundling and selecting composition...");
    const bundled = await bundle(entry);

    // Calculate dynamic duration
    const durationInFrames = calculateTotalFrames(payload.sequences);
    logger.info({ durationInFrames }, "Calculated duration");

    const inputProps = {
      ...payload,
      templateId: "reel-v1",
      videoIndex1,
      videoIndex2,
      musicIndex,
      durationInFrames,
      r2BaseUrl: env.R2_PUBLIC_URL.replace(/\/$/, ""),
    };

    const composition = await selectComposition({
      serveUrl: bundled,
      id: "Main",
      inputProps,
    });

    // Override hardcoded composition duration with dynamic calculation
    composition.durationInFrames = durationInFrames;

    // 4. Render Locally
    logger.info(`Rendering test video to ${outputLocation}...`);
    await renderMedia({
      composition,
      serveUrl: bundled,
      outputLocation,
      inputProps,
      codec: "h264",
      audioCodec: "aac",
    });

    logger.info("✅ Render complete! Check out/test-video.mp4");
    logger.info(
      "ℹ️ Distribution and Airtable updates were skipped in DEV MODE.",
    );
  } catch (error) {
    logger.error({ err: error }, "Test render failed");
    process.exit(1);
  }
};

runDev();
