import pino from "pino";
import { env } from "./config.ts";

const logger = pino({
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "SYS:HH:mm:ss",
        },
    },
    level: env.NODE_ENV === "development" ? "debug" : "info",
});

export default logger;
