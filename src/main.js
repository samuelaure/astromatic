import dotenv from "dotenv";
import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { fetchData } from "./core/fetcher.js";
import { uploadToFtp } from "./core/ftp.js";
import { publishToInstagram } from "./core/instagram.js";
import { notifyTelegram } from "./core/telegram.js";
import { calculateTotalFrames } from "./core/timing.js";

dotenv.config();

const run = async () => {
  const entry = path.resolve("src/index.js");
  const outputLocation = path.resolve("out/video.mp4");

  try {
    await notifyTelegram("🚀 <b>Astromatic:</b> Starting automation cycle...");

    // 1. Fetch Dynamic Content
    console.log("Fetching payload from webhook...");
    const payload = await fetchData(
      process.env.WEBHOOK_URL,
      process.env.TEMPLATE_ID,
    );

    // 2. Prepare Composition with dynamic duration
    console.log("Bundling and selecting composition...");
    const bundled = await bundle(entry);

    // Calculate duration based on text content
    const durationInFrames = calculateTotalFrames(payload.sequences);

    const composition = await selectComposition({
      serveUrl: bundled,
      id: "Main",
      inputProps: { ...payload, durationInFrames },
    });

    // 3. Render
    console.log(`Rendering video (${durationInFrames} frames)...`);
    await renderMedia({
      composition,
      serveUrl: bundled,
      outputLocation,
      inputProps: { ...payload, durationInFrames },
    });

    // 4. Distribution
    console.log("Uploading to FTP...");
    const publicUrl = await uploadToFtp(outputLocation);

    console.log("Publishing to Instagram...");
    await publishToInstagram(publicUrl, payload.caption);

    await notifyTelegram("✅ <b>Astromatic:</b> Cycle completed successfully!");
  } catch (error) {
    console.error("Critical failure:", error);
    await notifyTelegram(`❌ <b>Astromatic Error:</b>\n${error.message}`);
    process.exit(1);
  }
};

run();
