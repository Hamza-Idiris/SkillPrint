const express = require('express');
const { getSettings } = require('../controllers/adminController');

const router = express.Router();

router.get('/', getSettings);

module.exports = router;
