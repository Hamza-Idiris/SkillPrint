require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const path = require('path');
const connectDB = require('./config/db');
const { ensureBucket } = require('./config/supabase');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const videoRoutes = require('./routes/videoRoutes');
const videoUploadRoutes = require('./routes/videoUploadRoutes');

const healthRoutes = require('./routes/healthRoutes');

connectDB();
ensureBucket();

const app = express();

app.use(compression());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Serve uploaded assets locally when falling back from cloud storage
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'SkillSprint API is running' }));
app.use('/api/health', healthRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/stream', videoRoutes);
app.use('/api/admin/videos', videoUploadRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`SkillSprint API listening on port ${PORT}`));

// Express/Node's default request timeout is too short for large video
// uploads on a slow connection — extend it. Note this only controls this
// Node process; your hosting platform (Render, etc.) may impose its own,
// shorter proxy timeout that this can't override — see README.
server.timeout = 15 * 60 * 1000; // 15 minutes
server.headersTimeout = 15 * 60 * 1000 + 5000;

module.exports = app;
