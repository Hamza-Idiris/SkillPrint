const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { uploadImage, deleteImage } = require('../services/storageService');
const { sanitizeUser } = require('./authController');

// PUT /api/users/profile  (Authenticated)
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, phoneNumber, targetSkills, password } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  if (targetSkills !== undefined) {
    user.targetSkills = Array.isArray(targetSkills) ? targetSkills : String(targetSkills).split(',').map((s) => s.trim());
  }
  if (password) {
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    user.password = password; // pre-save hook rehashes
  }

  await user.save();
  res.json({ success: true, user: sanitizeUser(user) });
});

// PUT /api/users/avatar  (Authenticated) — multipart/form-data field "avatar"
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No avatar image uploaded');
  }

  const user = await User.findById(req.user._id);
  const oldPath = user.avatar?.public_id; // reused field name, now holds the Supabase storage path

  const { url, path } = await uploadImage(req.file.buffer, req.file.mimetype, 'avatars');
  user.avatar = { url, public_id: path };
  await user.save();

  await deleteImage(oldPath); // clean up old avatar after the new one is safely saved

  res.json({ success: true, avatar: user.avatar });
});

module.exports = { updateProfile, updateAvatar };
