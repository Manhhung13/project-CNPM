const express = require('express');
const router = express.Router();
const householdController = require('../controllers/householdController');
const residentController = require('../controllers/residentController');
const apartmentController = require('../controllers/apartmentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Validates token for all routes
router.use(authMiddleware);

// Household Routes
router.get('/households', householdController.getAllHouseholds);
router.post('/households', householdController.createHousehold);
//router.get('/households/:id', householdController.getHouseholdById);
router.put('/households/:id', householdController.updateHousehold);
router.delete('/households/:id', householdController.deleteHousehold);

// Resident Routes
router.get('/residents', residentController.getAllResidents);
router.post('/residents', residentController.createResident);
router.put('/residents/:id', residentController.updateResident);
router.delete('/residents/:id', residentController.deleteResident);

// Apartment Routes
router.get('/apartments', apartmentController.getAllApartments);
router.post('/apartments', apartmentController.createApartment);
router.get('/apartments/empty', apartmentController.getEmptyApartments);
router.put('/apartments/:id', apartmentController.updateApartment);
router.delete('/apartments/:id', apartmentController.deleteApartment);

module.exports = router;
