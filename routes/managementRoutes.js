const express = require('express');
const router = express.Router();
const householdController = require('../controllers/householdController');
const residentController = require('../controllers/residentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Validates token for all routes
router.use(authMiddleware);

// Household Routes
router.get('/households', householdController.getAllHouseholds);
router.post('/households', householdController.createHousehold);
router.get('/households/:id', householdController.getHouseholdById);
router.put('/households/:id', householdController.updateHousehold);
router.delete('/households/:id', householdController.deleteHousehold);

// Resident Routes
router.get('/residents', residentController.getAllResidents);
router.post('/residents', residentController.createResident);
router.put('/residents/:id', residentController.updateResident);
router.delete('/residents/:id', residentController.deleteResident);

module.exports = router;
