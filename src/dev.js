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

    // Override hardcoded composition duration with dynamic calculation
    composition.durationInFrames = durationInFrames;

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
    logger.info(
      "ℹ️ Distribution and Airtable updates were skipped in DEV MODE.",
    );
  } catch (error) {
    logger.error({ err: error }, "Test render failed");
    process.exit(1);
  }
};

runDev();
