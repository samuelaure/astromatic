import { env } from "./modules/shared/config.ts";
import logger from "./modules/shared/logger.ts";
import { DevPipelineService } from "./modules/automation/dev-pipeline.service.ts";

const bootstrap = async () => {
    const templateArg = (process.argv[2] || "asfa-t1").replace(/^--/, "");

    const configs: Record<string, { id: string; tableId: string }> = {
        "asfa-t1": {
            id: "asfa-t1",
            tableId: env.AIRTABLE_ASFA_T1_TABLE_ID,
        },
        "asfa-t2": {
            id: "asfa-t2",
            tableId: env.AIRTABLE_ASFA_T2_TABLE_ID,
        },
        "mafa-t1": {
            id: "mafa-t1",
            tableId: env.AIRTABLE_MAFA_T1_TABLE_ID || "",
        },
        "mafa-t2": {
            id: "mafa-t2",
            tableId: env.AIRTABLE_MAFA_T2_TABLE_ID || "",
        },
    };

    const activeConfig = configs[templateArg];

    if (!activeConfig) {
        logger.error({ templateArg }, "Invalid template ID provided.");
        process.exit(1);
    }

    const pipeline = new DevPipelineService({
        templateId: activeConfig.id,
        tableId: activeConfig.tableId
    });

    await pipeline.execute();
};

bootstrap().catch((err) => {
    logger.fatal({ err }, "Fatal error during dev bootstrap");
    process.exit(1);
});
