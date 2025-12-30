const { Household, Resident, Payment, Apartment, User } = require('../models');

exports.getAllHouseholds = async (req, res) => {
    try {
        const { status } = req.query;
        const whereClause = status ? { status } : {}; // If no status, return all or maybe default to Active? Let's return all and filter in frontend or default to Active if needed. 
        // Better: let frontend decide.

        const households = await Household.findAll({
            where: whereClause,
            include: ['residents'],
            order: [['updatedAt', 'DESC']], // Show recent first
        });
        res.json(households);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createHousehold = async (req, res) => {
    const { name, apartmentNumber, area, contactNumber, apartmentId } = req.body;
    try {
        // Logic 1: If apartmentId is provided, check compatibility
        if (apartmentId) {
            const apartment = await Apartment.findByPk(apartmentId);
            if (!apartment) {
                return res.status(404).json({ message: 'Apartment not found' });
            }
            if (apartment.status === 'Occupied') {
                return res.status(400).json({ message: `Apartment ${apartment.name} is already occupied.` });
            }

            // Lock the apartment
            await apartment.update({ status: 'Occupied' });
        } else {
            // Fallback for old compatibility or loose creation if allowed
            // Check if there is an active household with this apartmentNumber (legacy check)
            const existing = await Household.findOne({ where: { apartmentNumber, status: 'Active' } });
            if (existing) {
                return res.status(400).json({ message: `Phòng ${apartmentNumber} đang có người ở (Active). Vui lòng chuyển đi trước khi thêm mới.` });
            }
        }

        const newHousehold = await Household.create({
            name,
            apartmentNumber,
            apartmentId,
            area,
            contactNumber,
            status: 'Active'
        });
        res.status(201).json(newHousehold);
    } catch (error) {
        console.error('Create Household Error:', error);
        // Rollback
        if (apartmentId) {
            const apartment = await Apartment.findByPk(apartmentId);
            if (apartment) {
                await apartment.update({ status: 'Available' });
            }
        }
        res.status(500).json({ message: 'Server error', error: error.message, details: error.errors });
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
        const household = await Household.findByPk(req.params.id, {
            include: ['residents', 'apartment']
        });
        if (!household) return res.status(404).json({ message: 'Household not found' });

        // Perform Soft Delete (Move Out)
        await household.update({
            status: 'MovedOut',
            moveOutDate: new Date()
        });

        // 1. Release the Apartment
        if (household.apartmentId) {
            const apartment = await Apartment.findByPk(household.apartmentId);
            if (apartment) {
                await apartment.update({ status: 'Available' });
            }
        }

        // 2. Update all associated residents to MovedOut
        const residents = await Resident.findAll({ where: { householdId: household.id, status: ['Permanent', 'Temporary'] } });
        const residentIds = residents.map(r => r.id);

        await Resident.update(
            { status: 'MovedOut', moveOutDate: new Date() },
            { where: { id: residentIds } }
        );

        // 3. Deactivate Users associated with these residents
        if (residentIds.length > 0) {
            await User.update(
                { isActive: false },
                { where: { residentId: residentIds } }
            );
        }

        res.json({ message: 'Household moved out successfully, apartment released, and users deactivated.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
