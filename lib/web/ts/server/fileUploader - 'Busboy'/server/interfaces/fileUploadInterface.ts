// v1.0.0

import { handleFileUpload_Busboy } from '../core/service/common/fileUploader_Busboy.js';

import type { UploadResult } from '../core/service/common/fileUploader_Busboy.js';


export async function handleFileUpload(req: Request): Promise<UploadResult> {
    const options = {
        limits: { 
            fileSize: 10 * 1024 * 1024, // 10MB
            files: 3 
        },
        allowedMimeTypes: ["image/jpeg", "image/png"], // image for example
        uploadDir: "/tmp/uploads",
    };
    return await handleFileUpload_Busboy(req, options);
}