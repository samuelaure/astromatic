import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import {
  fetchApprovedRecord,
  updateRecordToProcessed,
} from "./core/airtable.js";
import { uploadToR2 } from "./core/s3.js";
import { publishToInstagram } from "./core/instagram.js";
import { notifyTelegram } from "./core/telegram.js";
import { calculateTotalFrames } from "./core/timing.js";
import { env } from "./core/config.js";
import logger from "./core/logger.js";

const run = async () => {
  const entry = path.resolve("src/index.js");
  const outputLocation = path.resolve("out/video.mp4");

  logger.info("🚀 Astromatic: Starting Airtable-driven automation cycle...");

  try {
    // 1. Fetch Approved Content from Airtable
    const payload = await fetchApprovedRecord();

    if (!payload) {
      logger.info("Nothing to process. Exiting.");
      await notifyTelegram(
        "⚠️ <b>Astromatic:</b> No approved records found in Airtable today.",
      );
      return;
    }

    // Ensure output directory exists and old file is removed
    if (fs.existsSync(outputLocation)) {
      try {
        fs.unlinkSync(outputLocation);
      } catch (e) {
        throw new Error(
          `Could not delete ${outputLocation}. Please close any program (like VLC or Windows Media Player) that is using it.`,
        );
      }
    }

    // 2. Random Background & Music Selection
    const selectRandom = (max) => Math.floor(Math.random() * max) + 1;

    const videoIndex1 = selectRandom(28);
    let videoIndex2 = selectRandom(28);
    while (videoIndex2 === videoIndex1) videoIndex2 = selectRandom(28); // Ensure they are different

    const musicIndex = selectRandom(10);

    logger.info(
      { videoIndex1, videoIndex2, musicIndex },
      "Selected random assets indices",
    );

    // 3. Prepare Composition
    logger.info("Bundling and selecting composition...");
    const bundled = await bundle(entry);

    // Calculate dynamic duration based on text content
    const durationInFrames = calculateTotalFrames(payload.sequences);
    logger.info({ durationInFrames }, "Calculated composition duration");

    // Construct common input props
    const inputProps = {
      ...payload,
      templateId: "reel-v1",
      videoIndex1,
      videoIndex2,
      musicIndex,
      durationInFrames,
      r2BaseUrl: env.R2_PUBLIC_URL.replace(/\/$/, ""), // Ensure no trailing slash
    };

    const composition = await selectComposition({
      serveUrl: bundled,
      id: "Main",
      inputProps,
    });

    // Override hardcoded composition duration with dynamic calculation
    composition.durationInFrames = durationInFrames;

    // 4. Render
    logger.info(`Rendering video (${durationInFrames} frames)...`);
    await renderMedia({
      composition,
      serveUrl: bundled,
      outputLocation,
      inputProps,
      codec: "h264",
      audioCodec: "aac",
    });
    logger.info("Render complete.");

    // 5. Distribution (Cloudflare R2)
    logger.info("Uploading to Cloudflare R2...");

    // Generate formatted timestamp: YYYYMMDD_HHMMSS
    const now = new Date();
    const timestamp = now
      .toISOString()
      .replace(/[-T:]/g, "")
      .split(".")[0]
      .replace(/(\d{8})(\d{6})/, "$1_$2");
    const remoteKey = `astrologia_familiar/outputs/ASFA_OUTPUT_${timestamp}.mp4`;

    const publicUrl = await uploadToR2(outputLocation, remoteKey);
    logger.info({ publicUrl }, "File uploaded to R2");

    logger.info("Publishing to Instagram...");
    const postLink = await publishToInstagram(publicUrl, payload.caption);
    logger.info({ postLink }, "Published to Instagram successfully.");

    // 6. Update Status in Airtable
    await updateRecordToProcessed(payload.id);

    await notifyTelegram(
      `✅ <b>Astromatic:</b> Cycle completed!\n\n🔗 <a href="${postLink}">View on Instagram</a>`,
    );
    logger.info("✅ Automation cycle finished.");
  } catch (error) {
    logger.error({ err: error }, "Critical failure in automation pipeline");
    await notifyTelegram(`❌ <b>Astromatic Error:</b>\n${error.message}`);
    process.exit(1);
  }
};

run();
