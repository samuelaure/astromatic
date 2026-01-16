import PromiseFtp from "promise-ftp";
import fs from "fs";
import { env } from "./config.js";
import logger from "./logger.js";

export async function uploadToFtp(localPath) {
  const ftp = new PromiseFtp();
  const fileName = `video-${Date.now()}.mp4`;

  logger.debug(
    { host: env.FTP_HOST, user: env.FTP_USER },
    "Connecting to FTP...",
  );

  try {
    await ftp.connect({
      host: env.FTP_HOST,
      user: env.FTP_USER,
      password: env.FTP_PASSWORD,
    });

    const stream = fs.createReadStream(localPath);
    await ftp.put(stream, fileName);
    await ftp.end();

    const publicUrl = `${env.PUBLIC_VIDEO_BASE_URL}/${fileName}`;
    return publicUrl;
  } catch (err) {
    logger.error({ err }, "FTP upload failed");
    throw err;
  }
}
