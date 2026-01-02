const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const userInvoiceController = require('../controllers/userInvoiceController');

// Tất cả route ở đây yêu cầu đăng nhập role resident hoặc manager
router.use(authMiddleware, requireRole(['resident', 'manager']));

router.get('/invoices', userInvoiceController.getMyInvoices);
router.post('/invoices/:id/pay', userInvoiceController.payMyInvoice);
router.get('/invoices/stats-monthly', userInvoiceController.getMonthlyStats);
module.exports = router;
