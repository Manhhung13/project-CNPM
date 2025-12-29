const { Fee } = require('../models');

exports.getAllFees = async (req, res) => {
    try {
        const fees = await Fee.findAll();
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createFee = async (req, res) => {
    try {
        const { name, type, unitPrice, description } = req.body;
        const newFee = await Fee.create({ name, type, unitPrice, description });
        res.status(201).json(newFee);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateFee = async (req, res) => {
    try {
        const fee = await Fee.findByPk(req.params.id);
        if (!fee) return res.status(404).json({ message: 'Fee not found' });
        await fee.update(req.body);
        res.json(fee);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteFee = async (req, res) => {
    try {
        const fee = await Fee.findByPk(req.params.id);
        if (!fee) return res.status(404).json({ message: 'Fee not found' });
        await fee.destroy();
        res.json({ message: 'Fee deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
