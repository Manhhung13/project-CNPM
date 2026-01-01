// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// GET /dashboard/overview
router.get('/overview', dashboardController.getOverview);

module.exports = router;
