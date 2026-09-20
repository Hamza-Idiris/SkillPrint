const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// GET /api/health/metrics - Extended system health & performance metrics
router.get('/metrics', (req, res) => {
  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  const dbStateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const dbStatus = dbStateMap[mongoose.connection.readyState] || 'unknown';

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'skillsprint',
    },
    system: {
      memoryHeapUsedMB: Math.round(memory.heapUsed / 1024 / 1024 * 100) / 100,
      memoryHeapTotalMB: Math.round(memory.heapTotal / 1024 / 1024 * 100) / 100,
      rssMB: Math.round(memory.rss / 1024 / 1024 * 100) / 100,
      nodeVersion: process.version,
      platform: process.platform,
    },
  });
});

module.exports = router;
