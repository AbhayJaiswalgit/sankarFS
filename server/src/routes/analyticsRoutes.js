const express = require('express');
const { getDashboardAnalytics, getProjectAnalytics } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticate);

router.get('/dashboard', getDashboardAnalytics);
router.get('/projects/:id', getProjectAnalytics);

module.exports = router;
