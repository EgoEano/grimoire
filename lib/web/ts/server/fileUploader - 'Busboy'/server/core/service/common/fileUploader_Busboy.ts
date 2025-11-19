// v1.0.0

import fs from "fs";
import path from "path";
import { IncomingMessage } from "http";
import Busboy from "busboy";

export interface UploadedFileInfo {
  fieldname: string;
  filename: string;
  mimeType: string;
  encoding: string;
  filepath: string;
  size: number;
}

export interface UploadResult {
  files: UploadedFileInfo[];
  errors: { filename?: string; error: string }[];
}

export interface UploadOptions {
  limits?: {
    fileSize?: number; // bytes
    files?: number;
  };
  allowedMimeTypes?: string[];
  uploadDir?: string;
}

export function handleFileUpload_Busboy(
  req: IncomingMessage,
  options: UploadOptions = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const {
      limits = { fileSize: 20 * 1024 * 1024, files: 5 }, // 20MB per file, max 5 files
      allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"],
      uploadDir = "./uploads",
    } = options;

    // Create path if not exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const busboy = Busboy({
      headers: req.headers,
      limits,
    });

    const files: UploadedFileInfo[] = [];
    const errors: { filename?: string; error: string }[] = [];

    busboy.on(
      "file",
      (fieldname, file, filename, encoding, mimeType) => {
        if (!filename) {
          file.resume();
          errors.push({ error: "File has no name." });
          return;
        }

        // Checking MIME-type
        if (!allowedMimeTypes.includes(mimeType)) {
          file.resume();
          errors.push({ filename, error: `File type not allowed: ${mimeType}` });
          return;
        }

        // Generating safe name
        const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
        const savePath = path.join(uploadDir, `${Date.now()}_${safeName}`);

        const writeStream = fs.createWriteStream(savePath);
        let fileSize = 0;

        file.on("data", (chunk) => {
          fileSize += chunk.length;
        });

        file.pipe(writeStream);

        writeStream.on("close", () => {
          files.push({
            fieldname,
            filename: safeName,
            mimeType,
            encoding,
            filepath: savePath,
            size: fileSize,
          });
        });

        file.on("limit", () => {
          errors.push({
            filename,
            error: `File size exceeds ${Math.round(limits.fileSize! / (1024 * 1024))}MB`,
          });
          file.unpipe(writeStream);
          writeStream.end();
          fs.unlink(savePath, () => {}); // deleting unsaved file
        });

        file.on("error", (err) => {
          errors.push({ filename, error: `File stream error: ${err.message}` });
          fs.unlink(savePath, () => {});
        });
      }
    );

    busboy.on("error", (err) => {
      reject(err);
    });

    busboy.on("finish", () => {
      resolve({ files, errors });
    });

    req.pipe(busboy);
  });
}
