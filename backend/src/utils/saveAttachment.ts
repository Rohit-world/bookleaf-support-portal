import fs from "fs";
import path from "path";

export interface SavedAttachment {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
}

export async function saveAttachments(
  files: Express.Multer.File[]
): Promise<SavedAttachment[]> {
  const uploadDir = path.join(process.cwd(), "uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const savedFiles: SavedAttachment[] = [];

  for (const file of files) {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    const filePath = path.join(uploadDir, safeName);

    fs.writeFileSync(filePath, file.buffer);

    savedFiles.push({
      fileName: file.originalname,
      fileUrl: `/uploads/${safeName}`,
      mimeType: file.mimetype,
      fileSize: file.size,
    });
  }

  return savedFiles;
}
