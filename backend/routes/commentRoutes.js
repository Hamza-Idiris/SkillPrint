const express = require('express');
const { getComments, postComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

// Mounted at /api/courses/:courseId/lessons/:lessonId/comments
const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/', getComments);
router.post('/', postComment);
router.delete('/:id', deleteComment);

module.exports = router;
