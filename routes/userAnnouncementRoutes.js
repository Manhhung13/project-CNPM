const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const announcementController = require('../controllers/userannouncementController');
router.post('/messages', authMiddleware, requireRole(['resident', 'manager']), announcementController.createUserRequest);
router.get('/announcements', authMiddleware, requireRole(['resident', 'manager']), announcementController.getUserAnnouncements);
module.exports = router;
