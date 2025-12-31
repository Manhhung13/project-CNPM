// const { Payment, Fee, Household } = require('../models');

// exports.getAllPayments = async (req, res) => {
//     try {
//         const payments = await Payment.findAll({
//             include: [
//                 { model: Household, as: 'household', attributes: ['name', 'apartmentNumber'] },
//                 { model: Fee, as: 'fee', attributes: ['name', 'type'] }
//             ]
//         });
//         res.json(payments);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };

// exports.createPayment = async (req, res) => {
//     try {
//         const { householdId, feeId, amount, details } = req.body;
//         const payment = await Payment.create({
//             householdId,
//             feeId,
//             amount,
//             details,
//             status: 'Paid' // Default to Paid when recording a collection
//         });
//         res.status(201).json(payment);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };

// exports.getStats = async (req, res) => {
//     try {
//         const totalCollected = await Payment.sum('amount');
//         const householdCount = await Household.count();
//         // Add more stats as needed
//         res.json({
//             totalCollected: totalCollected || 0,
//             householdCount
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };
