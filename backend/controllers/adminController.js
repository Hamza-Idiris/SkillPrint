const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Comment = require('../models/Comment');
const Settings = require('../models/Settings');
const { uploadImage, deleteImage } = require('../services/storageService');

// GET /api/admin/analytics  (Admin only)
const getAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalRevenueAgg,
    activeStudents,
    enrolledCoursesCount,
    totalCourses,
    approvedEnrollments,
    expiringCount,
    recentEnrollments,
    revenueByMonth,
  ] = await Promise.all([
    Enrollment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$payment.amountPaid' } } },
    ]),
    Enrollment.distinct('studentId', { status: 'approved' }),
    Enrollment.distinct('courseId', { status: 'approved' }),
    Course.countDocuments(),
    Enrollment.countDocuments({ status: 'approved' }),
    // Enrollments expiring in the next 7 days
    Enrollment.countDocuments({
      status: 'approved',
      expiresAt: { $gte: now, $lte: in7Days },
    }),
    // 10 most recent enrollments
    Enrollment.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('studentId', 'name email')
      .populate('courseId', 'title'),
    // Revenue per month for last 6 months
    Enrollment.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$payment.amountPaid' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  // Unanswered comment count
  let unansweredComments = 0;
  try {
    const topLevel = await Comment.find({ parentId: null }).select('_id').lean();
    if (topLevel.length > 0) {
      const ids = topLevel.map((c) => c._id);
      const answered = await Comment.find({ parentId: { $in: ids }, isAdminReply: true }).distinct('parentId');
      unansweredComments = ids.length - answered.length;
    }
  } catch (_) {
    // Comment model may not exist yet
  }

  res.json({
    success: true,
    stats: {
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      activeStudents: activeStudents.length,
      coursesWithEnrollments: enrolledCoursesCount.length,
      totalCourses,
      totalApprovedEnrollments: approvedEnrollments,
      expiringIn7Days: expiringCount,
      unansweredComments,
    },
    recentEnrollments,
    revenueByMonth,
  });
});

// GET /api/admin/settings  (Admin only) — also usable as public GET /api/settings for the CMS
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  // Public settings route (/api/settings) can be cached; admin route should not
  if (!req.user) {
    res.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
  } else {
    res.set('Cache-Control', 'no-store');
  }
  res.json({ success: true, settings });
});

// PUT /api/admin/settings  (Admin only) — hero, footer/contact, social links, homepage stats
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  const {
    heroTitle,
    heroSubtitle,
    announcementBar,
    contactEmail,
    contactPhone,
    address,
    socialLinks,
    footerCopyright,
    stats,
    aboutTitle,
    aboutLead,
    aboutMission,
    aboutDescription,
    aboutHighlights,
    aboutHowItWorks,
    aboutValues,
    aboutPrimaryCtaLabel,
    aboutPrimaryCtaHref,
    aboutContactTitle,
    aboutContactLead,
    aboutFaq,
    aboutTimeline,
    coursePackages,
  } = req.body;

  if (heroTitle !== undefined) settings.heroTitle = heroTitle;
  if (heroSubtitle !== undefined) settings.heroSubtitle = heroSubtitle;
  if (announcementBar !== undefined) settings.announcementBar = announcementBar;
  if (contactEmail !== undefined) settings.contactEmail = contactEmail;
  if (contactPhone !== undefined) settings.contactPhone = contactPhone;
  if (address !== undefined) settings.address = address;
  if (footerCopyright !== undefined) settings.footerCopyright = footerCopyright;

  if (socialLinks !== undefined) {
    settings.socialLinks = { ...settings.socialLinks.toObject(), ...socialLinks };
  }

  if (stats !== undefined) {
    if (!Array.isArray(stats)) {
      res.status(400);
      throw new Error('stats must be an array of { label, value }');
    }
    settings.stats = stats.filter((s) => s.label && s.value);
  }

  if (aboutTitle !== undefined) settings.aboutTitle = aboutTitle;
  if (aboutLead !== undefined) settings.aboutLead = aboutLead;
  if (aboutMission !== undefined) settings.aboutMission = aboutMission;
  if (aboutDescription !== undefined) settings.aboutDescription = aboutDescription;

  const normalizeAboutArray = (arr) => {
    if (!Array.isArray(arr)) return null;
    return arr
      .filter((x) => x && (x.title || x.description))
      .map((x) => ({
        title: x?.title || '',
        description: x?.description || '',
      }));
  };

  if (aboutHighlights !== undefined) {
    const normalized = normalizeAboutArray(aboutHighlights);
    if (!normalized) {
      res.status(400);
      throw new Error('aboutHighlights must be an array of { title, description }');
    }
    settings.aboutHighlights = normalized;
  }

  if (aboutHowItWorks !== undefined) {
    const normalized = normalizeAboutArray(aboutHowItWorks);
    if (!normalized) {
      res.status(400);
      throw new Error('aboutHowItWorks must be an array of { title, description }');
    }
    settings.aboutHowItWorks = normalized;
  }

  if (aboutValues !== undefined) {
    const normalized = normalizeAboutArray(aboutValues);
    if (!normalized) {
      res.status(400);
      throw new Error('aboutValues must be an array of { title, description }');
    }
    settings.aboutValues = normalized;
  }

  if (aboutPrimaryCtaLabel !== undefined) settings.aboutPrimaryCtaLabel = aboutPrimaryCtaLabel;
  if (aboutPrimaryCtaHref !== undefined) settings.aboutPrimaryCtaHref = aboutPrimaryCtaHref;

  if (aboutContactTitle !== undefined) settings.aboutContactTitle = aboutContactTitle;
  if (aboutContactLead !== undefined) settings.aboutContactLead = aboutContactLead;

  const normalizeFaqArray = (arr) => {
    if (!Array.isArray(arr)) return null;
    return arr
      .filter((x) => x && (x.question || x.answer))
      .map((x) => ({
        question: x?.question || '',
        answer: x?.answer || '',
      }));
  };

  const normalizeTimelineArray = (arr) => {
    if (!Array.isArray(arr)) return null;
    return arr
      .filter((x) => x && (x.year || x.title || x.description))
      .map((x) => ({
        year: x?.year || '',
        title: x?.title || '',
        description: x?.description || '',
      }));
  };

  if (aboutFaq !== undefined) {
    const normalized = normalizeFaqArray(aboutFaq);
    if (!normalized) {
      res.status(400);
      throw new Error('aboutFaq must be an array of { question, answer }');
    }
    settings.aboutFaq = normalized;
  }

  if (coursePackages !== undefined) {
    if (!Array.isArray(coursePackages)) {
      res.status(400);
      throw new Error('coursePackages must be an array');
    }
    settings.coursePackages = coursePackages.filter((p) => p.key && p.label && p.priceUSD != null);
  }

  if (aboutTimeline !== undefined) {
    const normalized = normalizeTimelineArray(aboutTimeline);
    if (!normalized) {
      res.status(400);
      throw new Error('aboutTimeline must be an array of { year, title, description }');
    }
    settings.aboutTimeline = normalized;
  }

  await settings.save();
  res.json({ success: true, settings });
});

// POST /api/admin/settings/banner  (Admin only) — multipart field "banner"
const updateBannerImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No banner image uploaded');
  }
  const settings = await Settings.getSingleton();
  const oldPath = settings.bannerImage?.public_id;

  const { url, path } = await uploadImage(req.file.buffer, req.file.mimetype, 'site-banners');
  settings.bannerImage = { url, public_id: path };
  await settings.save();

  await deleteImage(oldPath);

  res.json({ success: true, bannerImage: settings.bannerImage });
});

// PUT /api/admin/settings/discount  (Admin only) — global/site-wide discount
const updateGlobalDiscount = asyncHandler(async (req, res) => {
  const { active, percent, label } = req.body;
  const settings = await Settings.getSingleton();

  if (active !== undefined) settings.globalDiscount.active = !!active;
  if (percent !== undefined) {
    if (percent < 0 || percent > 100) {
      res.status(400);
      throw new Error('Discount percent must be between 0 and 100');
    }
    settings.globalDiscount.percent = percent;
  }
  if (label !== undefined) settings.globalDiscount.label = label;

  await settings.save();
  res.json({ success: true, globalDiscount: settings.globalDiscount });
});

// GET /api/admin/users  (Admin only)
const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

// PUT /api/admin/users/:id  (Admin only)
// Update: name, role, phoneNumber, isActive (email is not changed here)
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, role, phoneNumber, isActive } = req.body;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  if (isActive !== undefined) user.isActive = !!isActive;

  await user.save();

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  });
});

// PUT /api/admin/users/:id/reset-password  (Admin only)
const resetUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.password = password;
  await user.save();

  res.json({ success: true, message: 'Password updated.' });
});

// DELETE /api/admin/users/:id  (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Best-effort cleanup to prevent orphans in app features.
  await Enrollment.deleteMany({ studentId: user._id });
  await Comment.deleteMany({ authorId: user._id });
  await User.deleteOne({ _id: user._id });

  res.json({ success: true, message: 'User deleted.' });
});

module.exports = {
  getAnalytics,
  getSettings,
  updateSettings,
  updateBannerImage,
  updateGlobalDiscount,
  listUsers,
  updateUser,
  resetUserPassword,
  deleteUser,
};
