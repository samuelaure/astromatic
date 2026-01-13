import axios from "axios";

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
      if (i === retries - 1) throw err;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}
