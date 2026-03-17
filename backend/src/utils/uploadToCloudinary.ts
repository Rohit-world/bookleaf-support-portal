import path from "path";
import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";

export interface UploadedAttachment {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  publicId: string;
  resourceType: string;
}

function uploadSingleFile(
  file: Express.Multer.File
): Promise<UploadedAttachment> {
  return new Promise((resolve, reject) => {
    const ext = path.extname(file.originalname).replace(".", "") || undefined;
    const baseName = path.basename(file.originalname, path.extname(file.originalname));

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "bookleaf-support/tickets",
        resource_type: "raw",
        public_id: `${Date.now()}-${baseName}`,
        format: ext,
        use_filename: false,
        unique_filename: false,
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }

        resolve({
          fileName: file.originalname,
          fileUrl: result.secure_url,
          mimeType: file.mimetype,
          fileSize: file.size,
          publicId: result.public_id,
          resourceType: result.resource_type,
        });
      }
    );

    uploadStream.end(file.buffer);
  });
}

export async function uploadAttachmentsToCloudinary(
  files: Express.Multer.File[]
): Promise<UploadedAttachment[]> {
  return Promise.all(files.map(uploadSingleFile));
}
