const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { signStreamToken, verifyStreamToken, ttl } = require('../utils/streamToken');

// Converts a stored YouTube URL/ID into a proper embeddable URL.
const toEmbedUrl = (raw) => {
  if (!raw) return null;
  let videoId = raw;

  const watchMatch = raw.match(/[?&]v=([^&]+)/);
  const shortMatch = raw.match(/youtu\.be\/([^?&]+)/);
  const embedMatch = raw.match(/embed\/([^?&]+)/);

  if (watchMatch) videoId = watchMatch[1];
  else if (shortMatch) videoId = shortMatch[1];
  else if (embedMatch) videoId = embedMatch[1];

  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
};

// POST /api/courses/:courseId/lessons/:lessonId/token
// (Authenticated for gated lessons; public preview lessons don't need this route)
// Returns a short-lived opaque token — never the video URL itself.
const issueStreamToken = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;

  const course = await Course.findById(courseId).select('+lessons.videoUrl');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  const lesson = course.lessons.id(lessonId);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  if (!lesson.isPreviewFree) {
    if (!req.user) {
      res.status(401);
      throw new Error('Login required to access this lesson');
    }
    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
      status: 'approved',
    });
    if (!enrollment) {
      res.status(403);
      throw new Error('Enroll in this course to unlock this lesson');
    }
    if (enrollment.expiresAt && enrollment.expiresAt < new Date()) {
      res.status(403);
      throw new Error('Your access to this course has expired. Please re-enroll.');
    }
  }

  const token = signStreamToken(req.user ? req.user._id : 'guest', courseId, lessonId);
  res.json({ success: true, streamToken: token, expiresIn: ttl(), streamUrl: `/api/stream/${token}` });
});

// GET /api/stream/:token  (Public — token itself is the auth)
// Redeems a short-lived token and redirects the browser straight to the YouTube
// embed. The raw video URL is never present in any API JSON response, React
// state, or stored client-side data — only ever as a one-time redirect target
// tied to an expiring, lesson-specific, user-specific token.
const redeemStreamToken = asyncHandler(async (req, res) => {
  let payload;
  try {
    payload = verifyStreamToken(req.params.token);
  } catch (err) {
    res.status(401);
    throw new Error('This video link has expired. Please reload the page.');
  }

  const course = await Course.findById(payload.courseId).select('+lessons.videoUrl');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  const lesson = course.lessons.id(payload.lessonId);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  // Re-check gating at redemption time too (defense in depth vs. just token issuance)
  if (!lesson.isPreviewFree) {
    const enrollment = await Enrollment.findOne({
      studentId: payload.uid,
      courseId: payload.courseId,
      status: 'approved',
    });
    if (!enrollment) {
      res.status(403);
      throw new Error('Enrollment no longer active for this course');
    }
    if (enrollment.expiresAt && enrollment.expiresAt < new Date()) {
      res.status(403);
      throw new Error('Your access to this course has expired. Please re-enroll.');
    }
  }

  const embedUrl = toEmbedUrl(lesson.videoUrl);
  res.redirect(302, embedUrl);
});

module.exports = { issueStreamToken, redeemStreamToken };
