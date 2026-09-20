const express = require('express');
const { redeemStreamToken } = require('../controllers/videoController');

const router = express.Router();

router.get('/:token', redeemStreamToken);

module.exports = router;
