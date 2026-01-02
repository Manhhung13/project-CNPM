const express = require('express');
const router = express.Router();
const householdController = require('../controllers/householdController');
const residentController = require('../controllers/residentController');
const apartmentController = require('../controllers/apartmentController');
const residentAccountController = require('../controllers/residentAccountController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// Validates token for all routes
router.use(authMiddleware, requireRole('manager'));

// Household Routes
router.get('/households', householdController.getAllHouseholds);
router.get('/households-for-bill', householdController.getAllHouseholdsForBill);
router.post('/households', householdController.createHousehold);
//router.get('/households/:id', householdController.getHouseholdById);
router.put('/households/:id', householdController.updateHousehold);
router.delete('/households/:id', householdController.deleteHousehold);

// Resident Routes
router.get('/residents', residentController.getAllResidents);
router.post('/residents', residentController.createResident);
router.put('/residents/:id', residentController.updateResident);
router.delete('/residents/:id', residentController.deleteResident);
router.post('/residents/:id/create-account', residentAccountController.createAccountForResident);
// Apartment Routes
router.get('/apartments', apartmentController.getAllApartments);
router.post('/apartments', apartmentController.createApartment);
router.get('/apartments/empty', apartmentController.getEmptyApartments);
router.put('/apartments/:id', apartmentController.updateApartment);
router.delete('/apartments/:id', apartmentController.deleteApartment);
router.get('/apartments/:apartmentId/household-history', householdController.getHouseholdHistoryByApartment);
module.exports = router;
