const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
//const paymentController = require('../controllers/paymentController');
const financialController = require('../controllers/financialController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Fee Routes
router.get('/fees', feeController.getAllFees);
router.post('/fees', feeController.createFee);
router.put('/fees/:id', feeController.updateFee);
router.delete('/fees/:id', feeController.deleteFee);

// Payment Routes
//router.get('/payments', paymentController.getAllPayments);
//router.post('/payments', paymentController.createPayment);

// Financial Routes
router.get('/invoices', financialController.getInvoices);
router.post('/invoices', financialController.createInvoice);
router.put('/invoices/:id', financialController.updateInvoice);
router.delete('/invoices/:id', financialController.deleteInvoice);

// Stats Route
//router.get('/stats', paymentController.getStats);

module.exports = router;
