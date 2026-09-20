const express = require('express');
const { uploadLessonVideo } = require('../controllers/videoUploadController');
const { protect, authorize } = require('../middleware/auth');
const { uploadVideoFile } = require('../middleware/videoUpload');

const router = express.Router();

router.post('/upload', protect, authorize('admin'), uploadVideoFile.single('video'), uploadLessonVideo);

module.exports = router;
