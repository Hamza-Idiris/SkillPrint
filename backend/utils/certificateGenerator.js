const { v4: uuidv4 } = require('uuid');

/**
 * Generates a verification certificate record for a student upon completing a course.
 */
const generateCertificate = ({ studentName, courseTitle, completionDate = new Date() }) => {
  const certificateId = `CERT-${uuidv4().substring(0, 8).toUpperCase()}`;

  return {
    certificateId,
    studentName,
    courseTitle,
    issuedAt: completionDate.toISOString(),
    verificationUrl: `/verify-certificate/${certificateId}`,
    status: 'VALID',
  };
};

module.exports = { generateCertificate };
