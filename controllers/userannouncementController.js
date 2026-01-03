const { Announcement, User, Resident, Apartment } = require('../models');
const { Op } = require('sequelize');
exports.createUserRequest = async (req, res) => {
    try {
        const { subject, content } = req.body; ``

        if (!subject || !content) {
            return res.status(400).json({ message: 'Tiêu đề và nội dung là bắt buộc' });
        }

        // Lấy user hiện tại
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(400).json({ message: 'User không tồn tại' });
        }

        // Tìm apartmentId của cư dân nếu cần gắn
        let apartmentId = null;
        if (user.residentId) {
            const resident = await Resident.findByPk(user.residentId);
            if (resident && resident.apartmentId) {
                apartmentId = resident.apartmentId;
            }
        }

        const ann = await Announcement.create({
            title: subject,
            content,
            userId: user.id,
            apartmentId,
            type: 'Request',
        });

        return res.status(201).json({
            message: 'Gửi yêu cầu thành công',
            id: ann.id,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};
exports.getUserAnnouncements = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);

        // có thể null nếu cư dân chưa có căn hộ
        const apartmentId = user ? user.apartmentId : null;

        const orConditions = [{ scope: 'all' }];

        if (apartmentId) {
            orConditions.push({ scope: 'apartment', apartmentId });
        }

        const announcements = await Announcement.findAll({
            where: {
                type: 'General',
                [Op.or]: orConditions,
            },
            order: [['createdAt', 'DESC']],
        });

        res.json(announcements);
    } catch (err) {
        console.error('getUserAnnouncements error =====');
        console.error(err);              // in full error ra console
        return res.status(500).json({ message: 'Server error' });
    }
};