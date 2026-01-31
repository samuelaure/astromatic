import axios from "axios";
import { env } from "../shared/config.ts";
import logger from "../shared/logger.ts";
import { withRetry } from "../shared/retry.ts";
import { DistributionError } from "../shared/errors.ts";
import {
    INSTAGRAM_POLL_RETRIES,
    INSTAGRAM_POLL_INTERVAL_MS
} from "../shared/constants.ts";

async function waitForMediaProcessing(
    containerId: string,
    maxRetries = INSTAGRAM_POLL_RETRIES
): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
        logger.info(
            `Checking media processing status (attempt ${i + 1}/${maxRetries})...`
        );
        const response = await axios.get(
            `https://graph.facebook.com/v24.0/${containerId}`,
            {
                params: {
                    fields: "status_code,status",
                    access_token: env.IG_TOKEN,
                },
                timeout: 10000,
            }
        );

        const { status_code } = response.data;
        if (status_code === "FINISHED") {
            logger.info("Media processing finished.");
            return true;
        }

        if (status_code === "ERROR") {
            throw new DistributionError(`Media processing failed: ${response.data.status}`, {
                containerId,
                response: response.data
            });
        }

        await new Promise((res) => setTimeout(res, INSTAGRAM_POLL_INTERVAL_MS));
    }
    throw new DistributionError("Media processing timed out.", { containerId });
}

export async function publishToInstagram(
    videoUrl: string,
    caption: string
): Promise<string> {
    const { IG_TOKEN, IG_USER_ID } = env;

    return withRetry(async () => {
        try {
            // 1. Create Media Container
            logger.info("Creating Instagram media container...");
            const container = await axios.post(
                `https://graph.facebook.com/v24.0/${IG_USER_ID}/media`,
                null,
                {
                    params: {
                        media_type: "REELS",
                        video_url: videoUrl,
                        caption: caption,
                        access_token: IG_TOKEN,
                    },
                    timeout: 15000,
                }
            );

            const creationId = container.data.id;
            logger.info({ creationId }, "Container created. Waiting for processing...");

            // 2. Wait for processing (Polling)
            await waitForMediaProcessing(creationId);

            // 3. Publish
            logger.info("Publishing media...");
            const publishResponse = await axios.post(
                `https://graph.facebook.com/v24.0/${IG_USER_ID}/media_publish`,
                null,
                {
                    params: {
                        creation_id: creationId,
                        access_token: IG_TOKEN,
                    },
                    timeout: 15000,
                }
            );

            const publishId = publishResponse.data.id;
            logger.info({ publishId }, "Media published successfully.");

            // 4. Get Permalink
            const mediaResponse = await axios.get(
                `https://graph.facebook.com/v24.0/${publishId}`,
                {
                    params: {
                        fields: "permalink",
                        access_token: IG_TOKEN,
                    },
                    timeout: 10000,
                }
            );

            return mediaResponse.data.permalink;
        } catch (error: unknown) {
            if (error instanceof DistributionError) throw error;

            const err = error as { response?: { data?: { error?: { error_subcode?: number }; status?: string } }; message?: string };
            const errorData = err.response?.data || err.message || "Unknown error";
            const subcode = err.response?.data?.error?.error_subcode;

            let errorMessage = "Instagram publication session failed";
            if (subcode === 467) {
                errorMessage = "Instagram Token Revoked: User logged out or password changed. Please update IG_TOKEN in .env.";
            } else if (subcode === 463) {
                errorMessage = "Instagram Token Expired: Please generate a new token.";
            }

            throw new DistributionError(errorMessage, {
                err: errorData,
                videoUrl
            });
        }
    }, "publishToInstagram");
}
