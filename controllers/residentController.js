const { Resident, Household } = require('../models');

exports.getAllResidents = async (req, res) => {
    try {
        const residents = await Resident.findAll({
            include: [{ model: Household, as: 'household', attributes: ['apartmentNumber'] }],
        });
        res.json(residents);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createResident = async (req, res) => {
    try {
        const { householdId, ...data } = req.body;
        const resident = await Resident.create({ ...data, householdId });
        res.status(201).json(resident);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateResident = async (req, res) => {
    try {
        const resident = await Resident.findByPk(req.params.id);
        if (!resident) return res.status(404).json({ message: 'Resident not found' });
        await resident.update(req.body);
        res.json(resident);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteResident = async (req, res) => {
    try {
        const resident = await Resident.findByPk(req.params.id);
        if (!resident) return res.status(404).json({ message: 'Resident not found' });
        await resident.destroy();
        res.json({ message: 'Resident deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
