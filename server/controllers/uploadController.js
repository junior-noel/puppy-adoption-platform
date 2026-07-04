import asyncHandler from "express-async-handler";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Streams a single buffer to Cloudinary without writing to disk
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// @desc    Upload puppy photos to Cloudinary
// @route   POST /api/upload/puppies
// @access  Private (shelter)
export const uploadPuppyPhotos = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("No files uploaded");
  }

  const uploads = await Promise.all(
    req.files.map((file) =>
      uploadToCloudinary(file.buffer, "puppy-adoption/puppies"),
    ),
  );

  res.json({
    urls: uploads.map((r) => r.secure_url),
    public_ids: uploads.map((r) => r.public_id),
  });
});
