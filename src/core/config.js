import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  // FTP
  FTP_HOST: z.string(),
  FTP_USER: z.string(),
  FTP_PASSWORD: z.string(),
  PUBLIC_VIDEO_BASE_URL: z.string().url(),

  // Airtable
  AIRTABLE_TOKEN: z.string(),
  AIRTABLE_BASE_ID: z.string().default("appEVPrTtF1XyAQ4h"),
  AIRTABLE_TABLE_ID: z.string().default("tblC7lVTkY0ftzNoS"),

  // Instagram
  IG_TOKEN: z.string(),
  IG_USER_ID: z.string(),

  // Telegram (Optional)
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),

  // Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  process.exit(1);
}

export const env = _env.data;
