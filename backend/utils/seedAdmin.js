/**
 * Usage: npm run seed:admin -- --name "Admin Name" --email admin@skillsprint.com --password Secret123
 * Or just: node utils/seedAdmin.js
 * (falls back to env vars SEED_ADMIN_NAME / SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD, or sane defaults)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const parseArg = (flag, fallback) => {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
};

(async () => {
  await connectDB();

  const name = parseArg('--name', process.env.SEED_ADMIN_NAME || 'SkillSprint Admin');
  const email = parseArg('--email', process.env.SEED_ADMIN_EMAIL || 'admin@skillsprint.local');
  const password = parseArg('--password', process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!');

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`User with email ${email} already exists (role: ${existing.role}). Nothing to do.`);
  } else {
    await User.create({ name, email, password, role: 'admin' });
    console.log(`✅ Admin created: ${email} / ${password}`);
    console.log('Log in and change this password immediately.');
  }

  await mongoose.connection.close();
  process.exit(0);
})().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
