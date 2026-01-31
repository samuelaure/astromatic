import { exec } from "child_process";
import { promisify } from "util";
import logger from "../shared/logger.ts";
import { FPS } from "./utils.ts";

const execAsync = promisify(exec);

/**
 * Fetches the duration of a video (local or remote) using remotion's ffprobe.
 */
export async function getVideoDuration(source: string): Promise<number> {
    try {
        const { stdout } = await execAsync(
            `npx remotion ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${source}"`
        );

        const durationInSeconds = parseFloat(stdout.trim());
        if (isNaN(durationInSeconds)) {
            throw new Error("ffprobe returned invalid duration");
        }

        return Math.floor(durationInSeconds * FPS);
    } catch (error: any) {
        logger.warn(
            { source, err: error.message },
            "Failed to fetch duration via ffprobe. Using 15s fallback."
        );
        // Return 15s (450 frames) as a safe fallback
        return 450;
    }
}
