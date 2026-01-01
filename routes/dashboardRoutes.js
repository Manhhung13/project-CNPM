// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

router.use(authMiddleware, requireRole('manager'));

// GET /dashboard/overview
router.get('/overview', dashboardController.getOverview);

module.exports = router;
