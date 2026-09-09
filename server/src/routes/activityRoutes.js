const express = require('express');
const { getActivities } = require('../controllers/activityController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticate);
router.get('/', getActivities);

module.exports = router;
