import express from "express";
import { uploadPuppyPhotos } from "../controllers/uploadController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// upload.array('photos', 6) → multer stores up to 6 images in memory
router.post(
  "/puppies",
  protect,
  authorize("shelter"),
  upload.array("photos", 6),
  uploadPuppyPhotos,
);

export default router;
