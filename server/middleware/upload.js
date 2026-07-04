import multer from 'multer';

// Stores in memory, then your controller pipes the buffer to Cloudinary.
// Keeps the API stateless - no files ever touch local disk.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

export default upload;
