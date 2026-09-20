const fs = require('fs');
const os = require('os');
const path = require('path');
const multer = require('multer');

const TMP_DIR = path.join(os.tmpdir(), 'skillsprint-video-uploads');
fs.mkdirSync(TMP_DIR, { recursive: true });

// Videos are far too large to hold in memory (unlike avatars/covers), so
// they're streamed to a temp file on disk first, then streamed on to
// YouTube, then deleted. See server.js for the matching HTTP timeout bump —
// large uploads need longer than Express's defaults.
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TMP_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) cb(null, true);
  else cb(new Error('Only video file uploads are allowed'), false);
};

const uploadVideoFile = multer({
  storage: diskStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB ceiling — see README for realistic size guidance
});

module.exports = { uploadVideoFile, TMP_DIR };
