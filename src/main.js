import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { fetchData } from "./core/fetcher.js";
import { uploadToFtp } from "./core/ftp.js";
import { publishToInstagram } from "./core/instagram.js";
import { notifyTelegram } from "./core/telegram.js";
import { calculateTotalFrames } from "./core/timing.js";
import { env } from "./core/config.js";
import logger from "./core/logger.js";

const run = async () => {
  const entry = path.resolve("src/index.js");
  const outputLocation = path.resolve("out/video.mp4");

  logger.info("🚀 Astromatic: Starting automation cycle...");

  try {
    await notifyTelegram("🚀 <b>Astromatic:</b> Starting automation cycle...");

    // 1. Fetch Dynamic Content
    logger.info("Fetching payload from webhook...");
    const payload = await fetchData(env.WEBHOOK_URL, env.TEMPLATE_ID);

    if (!payload || !payload.sequences) {
      throw new Error("Invalid payload received from webhook: missing sequences");
    }

    // 2. Prepare Composition with dynamic duration
    logger.info("Bundling and selecting composition...");
    const bundled = await bundle(entry);

    // Calculate duration based on text content
    const durationInFrames = calculateTotalFrames(payload.sequences);
    logger.info({ durationInFrames }, "Calculated composition duration");

    const composition = await selectComposition({
      serveUrl: bundled,
      id: "Main",
      inputProps: { ...payload, durationInFrames },
    });

    // 3. Render
    logger.info(`Rendering video (${durationInFrames} frames)...`);
    await renderMedia({
      composition,
      serveUrl: bundled,
      outputLocation,
      inputProps: { ...payload, durationInFrames },
      codec: "h264",
      audioCodec: "aac",
    });
    logger.info("Render complete.");

    // 4. Distribution
    logger.info("Uploading to FTP...");
    const publicUrl = await uploadToFtp(outputLocation);
    logger.info({ publicUrl }, "File uploaded to FTP");

    logger.info("Publishing to Instagram...");
    await publishToInstagram(publicUrl, payload.caption);
    logger.info("Published to Instagram successfully.");

    await notifyTelegram("✅ <b>Astromatic:</b> Cycle completed successfully!");
    logger.info("✅ Automation cycle finished.");
  } catch (error) {
    logger.error({ err: error }, "Critical failure in automation pipeline");
    await notifyTelegram(`❌ <b>Astromatic Error:</b>\n${error.message}`);
    process.exit(1);
  }
};

run();
