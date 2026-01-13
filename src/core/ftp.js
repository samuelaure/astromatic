import PromiseFtp from "promise-ftp";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export async function uploadToFtp(localPath) {
  const ftp = new PromiseFtp();
  const fileName = `video-${Date.now()}.mp4`;

  await ftp.connect({
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
  });

  const stream = fs.createReadStream(localPath);
  await ftp.put(stream, fileName);
  await ftp.end();

  return `${process.env.PUBLIC_VIDEO_BASE_URL}/${fileName}`;
}
