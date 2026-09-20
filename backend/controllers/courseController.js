const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const Settings = require('../models/Settings');
const { uploadImage, deleteImage } = require('../services/storageService');
const Enrollment = require('../models/Enrollment');

// Strip videoUrl from lessons for any non-admin-facing response.
const publicLesson = (lesson) => ({
  id: lesson._id,
  title: lesson.title,
  duration: lesson.duration,
  order: lesson.order,
  isPreviewFree: lesson.isPreviewFree,
});

const toPublicCourse = (course, globalDiscount) => {
  const effectivePrice = course.getEffectivePrice(globalDiscount);
  return {
    id: course._id,
    title: course.title,
    description: course.description,
    category: course.category,
    price: course.price,
    effectivePrice,
    discount: {
      active: course.discountActive ? true : !!globalDiscount?.active,
      percent: course.discountActive ? course.discountPercent : globalDiscount?.active ? globalDiscount.percent : 0,
      source: course.discountActive ? 'course' : globalDiscount?.active ? 'global' : 'none',
    },
    coverImage: course.coverImage,
    lessons: course.lessons.map(publicLesson),
    lessonCount: course.lessons.length,
    isPublished: course.isPublished,
    createdAt: course.createdAt,
  };
};

// GET /api/courses  (Public) — search, category filter, price sort
const listCourses = asyncHandler(async (req, res) => {
  const { search, category, sort } = req.query;

  const filter = { isPublished: true };
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  let sortSpec = { createdAt: -1 };
  if (sort === 'price_asc') sortSpec = { price: 1 };
  if (sort === 'price_desc') sortSpec = { price: -1 };

  const [courses, settings] = await Promise.all([
    Course.find(filter).sort(sortSpec),
    Settings.getSingleton(),
  ]);

  // Cache public course list for 30 seconds in browsers / 60 seconds in CDN
  res.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
  res.json({
    success: true,
    count: courses.length,
    globalDiscount: settings.globalDiscount,
    courses: courses.map((c) => toPublicCourse(c, settings.globalDiscount)),
  });
});

// GET /api/courses/:id  (Public)
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course || !course.isPublished) {
    res.status(404);
    throw new Error('Course not found');
  }
  const settings = await Settings.getSingleton();

  let isEnrolled = false;
  let enrollmentExpired = false;
  let enrollmentExpiresAt = null;
  if (req.user) {
    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: course._id,
      status: 'approved',
    });
    if (enrollment) {
      const expired = enrollment.expiresAt && enrollment.expiresAt < new Date();
      isEnrolled = !expired;
      enrollmentExpired = !!expired;
      enrollmentExpiresAt = enrollment.expiresAt || null;
    }
  }

  res.json({
    success: true,
    course: toPublicCourse(course, settings.globalDiscount),
    isEnrolled,
    enrollmentExpired,
    enrollmentExpiresAt,
  });
});

// POST /api/courses  (Admin only)
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, price, discountPercent, discountActive, lessons, coverImage } = req.body;

  if (!title || !description || !category || price === undefined || !coverImage?.url) {
    res.status(400);
    throw new Error('title, description, category, price, and coverImage are required');
  }

  const course = await Course.create({
    title,
    description,
    category,
    price,
    discountPercent: discountPercent || 0,
    discountActive: !!discountActive,
    coverImage,
    lessons: Array.isArray(lessons) ? lessons : [],
  });

  res.status(201).json({ success: true, course });
});

// PUT /api/courses/:id  (Admin only) — also used to set price/discount ("course salary")
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const fields = ['title', 'description', 'category', 'price', 'discountPercent', 'discountActive', 'isPublished', 'lessons', 'coverImage'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) course[f] = req.body[f];
  });

  await course.save();
  res.json({ success: true, course });
});

// DELETE /api/courses/:id  (Admin only)
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  await deleteImage(course.coverImage?.public_id);
  await course.deleteOne();
  res.json({ success: true, message: 'Course deleted' });
});

// POST /api/courses/:id/cover  (Admin only) — multipart field "cover"
const uploadCourseCoverImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No cover image uploaded');
  }
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  const oldPath = course.coverImage?.public_id;

  const { url, path } = await uploadImage(req.file.buffer, req.file.mimetype, 'course-covers');
  course.coverImage = { url, public_id: path };
  await course.save();

  await deleteImage(oldPath);

  res.json({ success: true, coverImage: course.coverImage });
});

// GET /api/courses/:id/admin  (Admin only) — includes raw videoUrl for editing
const getCourseForAdmin = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).select('+lessons.videoUrl');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ success: true, course });
});

module.exports = {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadCourseCoverImage,
  getCourseForAdmin,
  toPublicCourse,
};
