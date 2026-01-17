import axios from "axios";
import { env } from "./config.js";
import logger from "./logger.js";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

/**
 * Fetches the first record with status 'Approved' from Airtable
 */
export async function fetchApprovedRecord() {
  const url = `${AIRTABLE_API_URL}/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_ID}`;

  try {
    logger.info("Fetching approved records from Airtable...");
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
      },
      params: {
        filterByFormula: "{status} = 'Approved'",
        maxRecords: 1,
      },
    });

    const records = response.data.records;
    if (!records || records.length === 0) {
      logger.info("No approved records found in Airtable.");
      return null;
    }

    const record = records[0];
    return {
      id: record.id,
      sequences: {
        hook: record.fields.text_1_hook,
        problem: record.fields.text_2_problem,
        solution: record.fields.text_3_solution,
        cta: record.fields.text_4_action,
      },
      caption: record.fields.caption,
    };
  } catch (error) {
    logger.error(
      { err: error.response?.data || error.message },
      "Failed to fetch from Airtable",
    );
    throw error;
  }
}

/**
 * Updates a record status to 'Processed'
 */
export async function updateRecordToProcessed(recordId) {
  const url = `${AIRTABLE_API_URL}/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_ID}`;

  try {
    logger.info(
      { recordId },
      "Updating Airtable record status to Processed...",
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
      },
    );
    logger.info({ recordId }, "Airtable record updated successfully.");
  } catch (error) {
    logger.error(
      { err: error.response?.data || error.message },
      "Failed to update Airtable record",
    );
    throw error;
  }
}
