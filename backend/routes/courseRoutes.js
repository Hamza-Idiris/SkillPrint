const express = require('express');
const {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadCourseCoverImage,
  getCourseForAdmin,
} = require('../controllers/courseController');
const { issueStreamToken } = require('../controllers/videoController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadCourseCover } = require('../middleware/upload');
const commentRoutes = require('./commentRoutes');

const router = express.Router();

// Public catalog
router.get('/', listCourses);
router.get('/:id', optionalAuth, getCourse);

// Lesson video access (token issuance — see videoController for the gating logic)
router.post('/:courseId/lessons/:lessonId/token', optionalAuth, issueStreamToken);

// Per-lesson comments (enrolled students + admin)
router.use('/:courseId/lessons/:lessonId/comments', commentRoutes);

// Admin only
router.get('/:id/admin', protect, authorize('admin'), getCourseForAdmin);
router.post('/', protect, authorize('admin'), createCourse);
router.put('/:id', protect, authorize('admin'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);
router.post('/:id/cover', protect, authorize('admin'), uploadCourseCover.single('cover'), uploadCourseCoverImage);

module.exports = router;
