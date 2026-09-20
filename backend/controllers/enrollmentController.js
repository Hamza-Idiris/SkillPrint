const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const Course = require('../models/Course');
const Settings = require('../models/Settings');
const Enrollment = require('../models/Enrollment');
const paymentProvider = require('../services/paymentService');

// POST /api/enrollments/purchase  (Learner)
// body: { courseId, accountNo, packageKey }  -- accountNo optional, falls back to user's saved phoneNumber
const purchaseCourse = asyncHandler(async (req, res) => {
  const { courseId, packageKey } = req.body;
  const accountNo = req.body.accountNo || req.user.phoneNumber;

  if (!courseId) {
    res.status(400);
    throw new Error('courseId is required');
  }
  if (!accountNo) {
    res.status(400);
    throw new Error('A mobile wallet number (accountNo) is required to pay');
  }

  const course = await Course.findById(courseId);
  if (!course || !course.isPublished) {
    res.status(404);
    throw new Error('Course not found');
  }

  const existing = await Enrollment.findOne({ studentId: req.user._id, courseId, status: 'approved' });
  if (existing) {
    res.status(400);
    throw new Error('You are already enrolled in this course');
  }

  const settings = await Settings.getSingleton();

  // Resolve the chosen package (falls back to 'forever' if not provided or not found)
  const packages = settings.coursePackages || [];
  const chosenPkg = packages.find((p) => p.enabled && p.key === packageKey) ||
    packages.find((p) => p.key === 'forever') || { key: 'forever', label: 'Forever', durationDays: 0, priceUSD: null };

  // Package price takes precedence over course price when packages are configured
  let amount;
  if (chosenPkg.priceUSD != null) {
    amount = chosenPkg.priceUSD;
  } else {
    amount = course.getEffectivePrice(settings.globalDiscount);
  }

  if (amount <= 0) {
    res.status(400);
    throw new Error('Invalid course price');
  }

  const referenceId = `ENR-${uuidv4().split('-')[0]}-${Date.now()}`;

  let result;
  try {
    result = await paymentProvider.purchase({
      accountNo,
      amount,
      referenceId,
      invoiceId: referenceId,
      description: `SkillSprint enrollment: ${course.title}`,
    });
  } catch (err) {
    res.status(502);
    throw new Error(`Payment gateway error: ${err.message}`);
  }

  if (!result.success) {
    res.status(402);
    throw new Error(result.responseMsg || 'Payment was not approved. Please check your wallet balance and PIN, then try again.');
  }

  const expiresAt = chosenPkg.durationDays > 0
    ? new Date(Date.now() + chosenPkg.durationDays * 24 * 60 * 60 * 1000)
    : null;

  const enrollment = await Enrollment.create({
    studentId: req.user._id,
    courseId: course._id,
    status: 'approved',
    package: {
      key: chosenPkg.key,
      label: chosenPkg.label,
      durationDays: chosenPkg.durationDays,
    },
    expiresAt,
    payment: {
      provider: (process.env.PAYMENT_MODE || 'mock').toLowerCase() === 'live' ? 'waafipay' : 'waafipay-mock',
      paymentMethod: 'MWALLET_ACCOUNT',
      accountNo: result.accountNo,
      amountPaid: Number(result.txAmount || amount),
      currency: 'USD',
      referenceId,
      transactionId: result.transactionId,
      issuerTransactionId: result.issuerTransactionId,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Payment approved — you are enrolled!',
    enrollment,
  });
});

// GET /api/enrollments/mine  (Learner)
const myEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ studentId: req.user._id, status: 'approved' })
    .populate('courseId', 'title coverImage category price')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: enrollments.length, enrollments });
});

// PUT /api/enrollments/:id/revoke  (Admin only) — revoke access, optionally reverse payment
const revokeEnrollment = asyncHandler(async (req, res) => {
  const { reason, refund } = req.body;
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  if (refund) {
    try {
      await paymentProvider.reverse({
        transactionId: enrollment.payment.transactionId,
        description: reason || 'Enrollment revoked by admin',
      });
    } catch (err) {
      res.status(502);
      throw new Error(`Refund failed via WaafiPay: ${err.message}`);
    }
  }

  enrollment.status = 'revoked';
  enrollment.revokedReason = reason || '';
  enrollment.revokedAt = new Date();
  await enrollment.save();

  res.json({ success: true, enrollment });
});

// GET /api/enrollments  (Admin only) — full list for analytics/dashboard table
const listEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find()
    .populate('studentId', 'name email')
    .populate('courseId', 'title price')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: enrollments.length, enrollments });
});

module.exports = { purchaseCourse, myEnrollments, revokeEnrollment, listEnrollments };
