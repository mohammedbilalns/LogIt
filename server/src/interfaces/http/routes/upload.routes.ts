import { Router } from "express";
import multer from "multer";
import { UploadController } from "../controllers/upload.controller";
import { UploadService } from "../../../application/services/upload.service";
import { asyncHandler } from "../../../utils/asyncHandler";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const audioUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const uploadService = new UploadService();
const uploadController = new UploadController(uploadService);

router.post(
  "/upload-image",
  upload.single("file"),
  asyncHandler((req, res) => uploadController.uploadImage(req, res))
);

router.post(
  "/upload-audio",
  audioUpload.single("file"),
  asyncHandler((req, res) => uploadController.uploadAudio(req, res))
);


export default router; 