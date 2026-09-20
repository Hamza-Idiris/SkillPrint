const multer = require('multer');

// Files are kept in memory (as a Buffer) and uploaded to Supabase Storage
// explicitly inside each controller — no storage-provider-specific multer
// engine needed, which keeps this swappable.
const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image uploads are allowed'), false);
};

const uploadAvatar = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadCourseCover = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadBanner = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

module.exports = { uploadAvatar, uploadCourseCover, uploadBanner };
