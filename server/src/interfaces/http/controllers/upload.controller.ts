import { Request, Response } from "express";
import { IUploadService } from "../../../domain/services/upload.service.interface";

export class UploadController {
  constructor(private uploadService: IUploadService) {}

  async uploadImage(req: Request, res: Response) {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    try {
      const url = await this.uploadService.uploadImage(file.buffer);
      return res.json({ url });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Failed to upload image" });
    }
  }

  async uploadAudio(req: Request, res: Response) {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    try {
      const url = await this.uploadService.uploadAudio(file.buffer);
      return res.json({ url });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Failed to upload audio" });
    }
  }
}