import axios from "axios";
import { env } from "../shared/config.ts";
import logger from "../shared/logger.ts";

export async function notifyTelegram(message: string): Promise<void> {
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = env;
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        logger.debug(
            "Telegram notification skipped: Bot token or Chat ID not provided."
        );
        return;
    }

    try {
        await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: "HTML",
            }
        );
        logger.debug("Telegram notification sent.");
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error({ err: error.message }, "Telegram notification failed");
    }
}
