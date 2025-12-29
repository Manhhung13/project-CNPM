const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Fee Routes
router.get('/fees', feeController.getAllFees);
router.post('/fees', feeController.createFee);
router.put('/fees/:id', feeController.updateFee);
router.delete('/fees/:id', feeController.deleteFee);

// Payment Routes
router.get('/payments', paymentController.getAllPayments);
router.post('/payments', paymentController.createPayment);

// Stats Route
router.get('/stats', paymentController.getStats);

module.exports = router;
