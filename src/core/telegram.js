import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function notifyTelegram(message) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN) return;

  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      },
    );
  } catch (err) {
    console.error("Telegram notification failed", err.message);
  }
}
