/**
 * Helper utility to export enrollment and revenue metrics into formatted JSON/CSV reports.
 */
const exportEnrollmentsSummary = (enrollments = []) => {
  let totalRevenue = 0;
  const courseSummary = {};

  enrollments.forEach((e) => {
    const amount = e.payment?.amountPaid || 0;
    totalRevenue += amount;

    const courseId = e.courseId?._id || e.courseId || 'unknown';
    const courseTitle = e.courseId?.title || 'Unknown Course';

    if (!courseSummary[courseId]) {
      courseSummary[courseId] = { title: courseTitle, count: 0, revenue: 0 };
    }
    courseSummary[courseId].count += 1;
    courseSummary[courseId].revenue += amount;
  });

  return {
    totalEnrollments: enrollments.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    breakdown: Object.values(courseSummary),
    exportedAt: new Date().toISOString(),
  };
};

module.exports = { exportEnrollmentsSummary };
