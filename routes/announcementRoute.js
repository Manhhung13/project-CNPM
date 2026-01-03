const express = require('express');
const router = express.Router();

const announcementController = require('../controllers/announcementController'); // controller riêng
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// TẤT CẢ ROUTE NÀY CHỈ DÀNH CHO MANAGER
router.use(authMiddleware, requireRole('manager'));

// Lấy danh sách chủ hộ đang ở (để hiện dropdown gửi theo căn hộ/phòng)
router.get('/household-heads', announcementController.getHouseholdHeads);

// Lấy danh sách thông báo đã gửi
router.get('/announcements', announcementController.getAnnouncements);

// Tạo thông báo mới
router.post('/announcements', announcementController.createAnnouncement);

module.exports = router;
