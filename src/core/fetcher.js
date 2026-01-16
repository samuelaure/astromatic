import axios from "axios";
import logger from "./logger.js";

/**
 * Fetches data from the webhook with exponential backoff
 */
export async function fetchData(url, templateId, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { params: { templateId } });
      return response.data;
    } catch (err) {
      const delay = Math.pow(2, i) * 1000;
      logger.warn(
        { attempt: i + 1, delay, error: err.message },
        "Webhook fetch failed, retrying...",
      );
      if (i === retries - 1) {
        logger.error(
          { error: err.message },
          "Max retries reached for webhook fetch",
        );
        throw err;
      }
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}
