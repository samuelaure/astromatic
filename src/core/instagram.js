import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function publishToInstagram(videoUrl, caption) {
  const { IG_TOKEN, IG_USER_ID } = process.env;

  // 1. Create Media Container
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
    },
  );

  const creationId = container.data.id;

  // 2. Wait for processing & Publish (Simplified for core)
  // In production, we'd poll for status, but for core we trigger publish
  // after a safety delay or status check.
  await new Promise((res) => setTimeout(res, 30000)); // Safety wait for FB processing

  await axios.post(
    `https://graph.facebook.com/v24.0/${IG_USER_ID}/media_publish`,
    null,
    {
      params: {
        creation_id: creationId,
        access_token: IG_TOKEN,
      },
    },
  );
}
