import axios from "axios";
import { env } from "../shared/config.ts";
import logger from "../shared/logger.ts";
import { withRetry } from "../shared/retry.ts";
import { ContentFetchError } from "../shared/errors.ts";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

export interface AirtablePayload {
    id: string;
    sequences: Record<string, any>;
    caption: string;
}

/**
 * Fetches the first record with status 'Approved' from Airtable for a specific template
 */
export async function fetchApprovedRecord(
    templateId: string,
    tableId: string
): Promise<AirtablePayload | null> {
    const url = `${AIRTABLE_API_URL}/${env.AIRTABLE_BASE_ID}/${tableId}`;

    return withRetry(async () => {
        try {
            logger.info({ templateId }, "Fetching approved records from Airtable...");
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
                },
                params: {
                    filterByFormula: "{status} = 'Approved'",
                    maxRecords: 1,
                },
                timeout: 10000,
            });

            const records = response.data.records;
            if (!records || records.length === 0) {
                logger.info({ templateId }, "No approved records found in Airtable.");
                return null;
            }

            const record = records[0];

            const sequences =
                templateId === "asfa-t1"
                    ? {
                        hook: record.fields.text_1_hook,
                        problem: record.fields.text_2_problem,
                        solution: record.fields.text_3_solution,
                        cta: record.fields.text_4_action,
                    }
                    : {
                        hook: record.fields.text_1_hook,
                        message: record.fields.text_2_message,
                    };

            return {
                id: record.id,
                sequences,
                caption: record.fields.caption,
            };
        } catch (error: any) {
            throw new ContentFetchError("Failed to fetch from Airtable", {
                templateId,
                err: error.response?.data || error.message
            });
        }
    }, "fetchApprovedRecord");
}

/**
 * Updates a record status to 'Processed'
 */
export async function updateRecordToProcessed(
    recordId: string,
    tableId: string
): Promise<void> {
    const url = `${AIRTABLE_API_URL}/${env.AIRTABLE_BASE_ID}/${tableId}`;

    return withRetry(async () => {
        try {
            logger.info(
                { recordId, tableId },
                "Updating Airtable record status to Processed..."
            );
            await axios.patch(
                url,
                {
                    records: [
                        {
                            id: recordId,
                            fields: {
                                status: "Processed",
                            },
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 10000,
                }
            );
            logger.info({ recordId }, "Airtable record updated successfully.");
        } catch (error: any) {
            throw new ContentFetchError("Failed to update Airtable record", {
                recordId,
                err: error.response?.data || error.message
            });
        }
    }, "updateRecordToProcessed");
}
