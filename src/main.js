import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import {
  fetchApprovedRecord,
  updateRecordToProcessed,
} from "./core/airtable.js";
import { uploadToFtp } from "./core/ftp.js";
import { publishToInstagram } from "./core/instagram.js";
import { notifyTelegram } from "./core/telegram.js";
import { calculateTotalFrames } from "./core/timing.js";
import { env } from "./core/config.js";
import logger from "./core/logger.js";

const DESKTOP_VIDEO_DIR = "C:\\Users\\Sam\\Desktop\\ASTRO";
const PUBLIC_DIR = path.resolve("public");

const run = async () => {
  const entry = path.resolve("src/index.js");
  const outputLocation = path.resolve("out/video.mp4");

  logger.info("🚀 Astromatic: Starting Airtable-driven automation cycle...");

  try {
    // 1. Fetch Approved Content from Airtable
    const payload = await fetchApprovedRecord();

    if (!payload) {
      logger.info("Nothing to process. Exiting.");
      return;
    }

    await notifyTelegram(
      `🚀 <b>Astromatic:</b> Starting cycle for record ${payload.id}...`,
    );

    // 2. Random Background Selection (Dual Video)
    if (fs.existsSync(outputLocation)) {
      try {
        fs.unlinkSync(outputLocation);
      } catch (e) {
        throw new Error(
          `Could not delete ${outputLocation}. Please close any program (like VLC or Windows Media Player) that is using it.`
        );
      }
    }

    const selectRandomVideo = () => Math.floor(Math.random() * 28) + 1;
    const rnd1 = selectRandomVideo();
    let rnd2 = selectRandomVideo();
    while (rnd2 === rnd1) rnd2 = selectRandomVideo(); // Ensure they are different

    const source1 = path.join(DESKTOP_VIDEO_DIR, `astro-background-${rnd1}.mp4`);
    const source2 = path.join(DESKTOP_VIDEO_DIR, `astro-background-${rnd2}.mp4`);

    if (!fs.existsSync(source1) || !fs.existsSync(source2)) {
      throw new Error(`One or more background videos not found in ${DESKTOP_VIDEO_DIR}`);
    }

    logger.info({ rnd1, rnd2 }, "Copying dual background videos...");
    fs.copyFileSync(source1, path.join(PUBLIC_DIR, "background1.mp4"));
    fs.copyFileSync(source2, path.join(PUBLIC_DIR, "background2.mp4"));

    // 3. Prepare Composition
    logger.info("Bundling and selecting composition...");
    const bundled = await bundle(entry);

    // Calculate dynamic duration based on text content
    const durationInFrames = calculateTotalFrames(payload.sequences);
    logger.info({ durationInFrames }, "Calculated composition duration");

    const composition = await selectComposition({
      serveUrl: bundled,
      id: "Main",
      inputProps: {
        ...payload,
        templateId: "reel-v1", // Using the designated Reel template
        backgroundUrl: "", // Triggers fallback to public/background.mp4 in ReelV1
        durationInFrames,
      },
    });

    // Override hardcoded composition duration with dynamic calculation
    composition.durationInFrames = durationInFrames;

    // 4. Render
    logger.info(`Rendering video (${durationInFrames} frames)...`);
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
    logger.info("Render complete.");

    // 5. Distribution
    logger.info("Uploading to FTP...");
    const publicUrl = await uploadToFtp(outputLocation);
    logger.info({ publicUrl }, "File uploaded to FTP");

    logger.info("Publishing to Instagram...");
    await publishToInstagram(publicUrl, payload.caption);
    logger.info("Published to Instagram successfully.");

    // 6. Update Status in Airtable
    await updateRecordToProcessed(payload.id);

    await notifyTelegram(
      "✅ <b>Astromatic:</b> Cycle completed and record updated!",
    );
    logger.info("✅ Automation cycle finished.");
  } catch (error) {
    logger.error({ err: error }, "Critical failure in automation pipeline");
    await notifyTelegram(`❌ <b>Astromatic Error:</b>\n${error.message}`);
    process.exit(1);
  }
};

run();
