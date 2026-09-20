const express = require('express');
const {
  getAnalytics,
  getSettings,
  updateSettings,
  updateBannerImage,
  updateGlobalDiscount,
  listUsers,
  updateUser,
  resetUserPassword,
  deleteUser,
} = require('../controllers/adminController');
const { listUnansweredComments } = require('../controllers/commentController');
const { protect, authorize } = require('../middleware/auth');
const { uploadBanner } = require('../middleware/upload');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', listUsers);
router.put('/users/:id', updateUser);
router.put('/users/:id/reset-password', resetUserPassword);
router.delete('/users/:id', deleteUser);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/settings/banner', uploadBanner.single('banner'), updateBannerImage);
router.put('/settings/discount', updateGlobalDiscount);

router.get('/comments/unanswered', listUnansweredComments);

module.exports = router;
