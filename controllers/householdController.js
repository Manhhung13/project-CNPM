const { Household, Resident, Payment } = require('../models');

exports.getAllHouseholds = async (req, res) => {
    try {
        const households = await Household.findAll({
            include: ['residents'], // Include residents to count or show details
        });
        res.json(households);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createHousehold = async (req, res) => {
    try {
        const { name, apartmentNumber, area, contactNumber } = req.body;
        const newHousehold = await Household.create({ name, apartmentNumber, area, contactNumber });
        res.status(201).json(newHousehold);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getHouseholdById = async (req, res) => {
    try {
        const household = await Household.findByPk(req.params.id, {
            include: ['residents', 'payments'],
        });
        if (!household) return res.status(404).json({ message: 'Household not found' });
        res.json(household);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateHousehold = async (req, res) => {
    try {
        const household = await Household.findByPk(req.params.id);
        if (!household) return res.status(404).json({ message: 'Household not found' });
        await household.update(req.body);
        res.json(household);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteHousehold = async (req, res) => {
    try {
        const household = await Household.findByPk(req.params.id);
        if (!household) return res.status(404).json({ message: 'Household not found' });
        await household.destroy();
        res.json({ message: 'Household deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
