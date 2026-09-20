const express = require('express');
const {
  purchaseCourse,
  myEnrollments,
  revokeEnrollment,
  listEnrollments,
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/purchase', protect, authorize('learner'), purchaseCourse);
router.get('/mine', protect, authorize('learner'), myEnrollments);

router.get('/', protect, authorize('admin'), listEnrollments);
router.put('/:id/revoke', protect, authorize('admin'), revokeEnrollment);

module.exports = router;
