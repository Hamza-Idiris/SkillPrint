const fs = require('fs/promises');
const asyncHandler = require('express-async-handler');
const youtubeService = require('../services/youtubeService');

// POST /api/admin/videos/upload  (Admin only) — multipart field "video"
// Uploads a local video file to YouTube as unlisted and returns the watch
// URL, ready to drop straight into a lesson's videoUrl field.
const uploadLessonVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No video file uploaded');
  }

  const { title, description } = req.body;

  try {
    const result = await youtubeService.uploadVideo({
      filePath: req.file.path,
      title,
      description,
    });
    res.status(201).json({ success: true, videoUrl: result.url, videoId: result.videoId });
  } catch (err) {
    res.status(err.statusCode || 502);
    throw new Error(err.message || 'Video upload to YouTube failed');
  } finally {
    // Always clean up the temp file, whether the upload succeeded or failed
    await fs.unlink(req.file.path).catch(() => {});
  }
});

module.exports = { uploadLessonVideo };
