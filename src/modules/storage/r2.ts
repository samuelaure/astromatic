import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { env } from "../shared/config.ts";
import logger from "../shared/logger.ts";
import { withRetry } from "../shared/retry.ts";
import { UploadError } from "../shared/errors.ts";

const s3Client = new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT,
    credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Uploads a file to Cloudflare R2
 */
export const uploadToR2 = async (
    localFilePath: string,
    remoteFileName: string | null = null
): Promise<string> => {
    const fileName = remoteFileName || path.basename(localFilePath);
    const fileStream = fs.createReadStream(localFilePath);
    const fileStats = fs.statSync(localFilePath);

    const command = new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: fileName,
        Body: fileStream,
        ContentLength: fileStats.size,
        ContentType: "video/mp4",
    });

    return withRetry(async () => {
        try {
            logger.info(
                { bucket: env.R2_BUCKET_NAME, key: fileName },
                "Uploading file to R2..."
            );
            await s3Client.send(command);

            const baseUrl = env.R2_PUBLIC_URL.endsWith("/")
                ? env.R2_PUBLIC_URL
                : `${env.R2_PUBLIC_URL}/`;

            const publicUrl = `${baseUrl}${fileName}`;
            logger.info({ publicUrl }, "File uploaded successfully to R2");
            return publicUrl;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown R2 upload error";
            throw new UploadError("Failed to upload file to R2", {
                fileName,
                err: errorMessage
            });
        }
    }, "uploadToR2");
};
