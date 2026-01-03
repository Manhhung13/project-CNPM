// controllers/announcement.controller.js

// Ví dụ dùng Sequelize
const { Household, Apartment, Resident, Announcement } = require('../models');

// Lấy danh sách chủ hộ đang ở (status = 'Active')
exports.getHouseholdHeads = async (req, res, next) => {
    try {
        const households = await Household.findAll({
            where: { status: 'Active' },
            include: [
                { model: Apartment, as: 'apartment', attributes: ['id', 'name'] },
                { model: Resident, as: 'headResident', attributes: ['id', 'fullName'] },
            ],
            // dùng đúng alias trong order
            order: [[{ model: Apartment, as: 'apartment' }, 'name', 'ASC']],
        });

        const result = households.map((h) => ({
            householdId: h.id,
            apartmentId: h.apartmentId,
            // dùng đúng tên alias: 'apartment' (chữ thường), không phải 'Apartment'
            apartmentName: h.apartment?.name,
            headResidentId: h.headResidentId,
            headResidentName: h.headResident?.fullName,
        }));

        res.json(result);
    } catch (err) {
        next(err);
    }
};

// Lấy danh sách thông báo đã gửi
exports.getAnnouncements = async (req, res, next) => {
    try {
        const announcements = await Announcement.findAll({
            where: { type: 'General' },                 // chỉ lấy type = 'General'
            include: [
                {
                    model: Apartment,
                    as: 'apartment',
                    attributes: ['id', 'name'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json(announcements);
    } catch (err) {
        next(err);
    }
};


// Tạo thông báo mới
exports.createAnnouncement = async (req, res, next) => {
    try {
        const { scope, apartmentId, title, content } = req.body;
        const userId = req.user.id;

        // validate cơ bản
        if (!scope || !title || !content) {
            return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' });
        }

        // nếu gửi theo căn hộ thì phải có apartmentId
        if (scope === 'apartment' && !apartmentId) {
            return res
                .status(400)
                .json({ message: 'Cần chọn căn hộ khi gửi theo căn hộ' });
        }

        const announcement = await Announcement.create({
            scope,
            title,
            content,
            apartmentId: scope === 'apartment' ? apartmentId : null,
            userId,
            type: 'General',          // luôn set type = 'General'
        });

        return res.status(201).json(announcement);
    } catch (err) {
        return next(err);
    }
};
