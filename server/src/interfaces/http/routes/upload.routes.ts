import { Router } from "express";
import multer from "multer";
import { UploadController } from "../controllers/upload.controller";
import { UploadService } from "../../../application/usecases/upload/upload.service";
import { asyncHandler } from "../../../utils/asyncHandler";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const uploadService = new UploadService();
const uploadController = new UploadController(uploadService);

router.post(
  "/upload-image",
  upload.single("file"),
  asyncHandler((req, res) => uploadController.uploadImage(req, res))
);

router.post(
  "/upload-audio",
  upload.single("file"),
  asyncHandler((req, res) => uploadController.uploadAudio(req, res))
);

router.post(
  "/upload-video",
  upload.single("file"),
  asyncHandler((req, res) => uploadController.uploadVideo(req, res))
);

export default router; 