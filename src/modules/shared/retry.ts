import logger from "./logger.ts";
import { INITIAL_RETRY_DELAY_MS, MAX_RETRY_ATTEMPTS } from "./constants.ts";

/**
 * Executes a function with exponential backoff retry logic.
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    context: string,
    attempts: number = MAX_RETRY_ATTEMPTS
): Promise<T> {
    let lastError: any;
    let delay = INITIAL_RETRY_DELAY_MS;

    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            const isLastAttempt = i === attempts - 1;

            if (!isLastAttempt) {
                logger.warn(
                    { context, attempt: i + 1, nextDelay: delay, err: error.message },
                    "Operation failed, retrying..."
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            }
        }
    }

    throw lastError;
}
