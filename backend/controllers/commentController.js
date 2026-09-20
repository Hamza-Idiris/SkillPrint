const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const Enrollment = require('../models/Enrollment');

const isEnrolledAndActive = async (userId, courseId) => {
  const enrollment = await Enrollment.findOne({ studentId: userId, courseId, status: 'approved' });
  if (!enrollment) return false;
  if (enrollment.expiresAt && enrollment.expiresAt < new Date()) return false;
  return true;
};

// GET /api/courses/:courseId/lessons/:lessonId/comments  (enrolled learner or admin)
const getComments = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;

  if (req.user.role !== 'admin') {
    const ok = await isEnrolledAndActive(req.user._id, courseId);
    if (!ok) {
      res.status(403);
      throw new Error('You must be enrolled in this course to view comments');
    }
  }

  const topLevel = await Comment.find({ courseId, lessonId, parentId: null })
    .populate('authorId', 'name avatar role')
    .sort({ createdAt: 1 });

  const replies = await Comment.find({ courseId, lessonId, parentId: { $ne: null } })
    .populate('authorId', 'name avatar role')
    .sort({ createdAt: 1 });

  // Attach replies to their parent
  const replyMap = {};
  replies.forEach((r) => {
    const key = r.parentId.toString();
    if (!replyMap[key]) replyMap[key] = [];
    replyMap[key].push(r);
  });

  const result = topLevel.map((c) => ({
    ...c.toObject(),
    replies: replyMap[c._id.toString()] || [],
  }));

  res.json({ success: true, count: result.length, comments: result });
});

// POST /api/courses/:courseId/lessons/:lessonId/comments  (enrolled learner or admin)
const postComment = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const { text, parentId } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  if (req.user.role !== 'admin') {
    const ok = await isEnrolledAndActive(req.user._id, courseId);
    if (!ok) {
      res.status(403);
      throw new Error('You must be enrolled in this course to comment');
    }
  }

  // If replying, verify parent exists on the same lesson
  if (parentId) {
    const parent = await Comment.findOne({ _id: parentId, courseId, lessonId, parentId: null });
    if (!parent) {
      res.status(404);
      throw new Error('Parent comment not found');
    }
  }

  const comment = await Comment.create({
    courseId,
    lessonId,
    authorId: req.user._id,
    text: text.trim(),
    parentId: parentId || null,
    isAdminReply: req.user.role === 'admin',
  });

  await comment.populate('authorId', 'name avatar role');
  res.status(201).json({ success: true, comment });
});

// DELETE /api/comments/:id  (admin or own comment)
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }
  if (req.user.role !== 'admin' && comment.authorId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not allowed to delete this comment');
  }
  // Delete replies too if deleting a top-level comment
  if (!comment.parentId) {
    await Comment.deleteMany({ parentId: comment._id });
  }
  await comment.deleteOne();
  res.json({ success: true, message: 'Comment deleted' });
});

// GET /api/admin/comments  (admin — unanswered top-level comments)
const listUnansweredComments = asyncHandler(async (req, res) => {
  // Top-level comments that have no admin reply
  const topLevel = await Comment.find({ parentId: null }).select('_id courseId lessonId').lean();
  if (!topLevel.length) {
    return res.json({ success: true, count: 0, comments: [] });
  }

  const ids = topLevel.map((c) => c._id);
  const answered = await Comment.find({ parentId: { $in: ids }, isAdminReply: true }).distinct('parentId');
  const answeredSet = new Set(answered.map((id) => id.toString()));

  const unansweredIds = ids.filter((id) => !answeredSet.has(id.toString()));

  const comments = await Comment.find({ _id: { $in: unansweredIds } })
    .populate('authorId', 'name email')
    .populate('courseId', 'title')
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ success: true, count: comments.length, comments });
});

module.exports = { getComments, postComment, deleteComment, listUnansweredComments };
