// controllers/residentAccountController.js
const bcrypt = require('bcryptjs');
const { User, Resident } = require('../models');

exports.createAccountForResident = async (req, res) => {
    try {
        const residentId = req.params.id;                     // /residents/:id/create-account
        const { username, password, fullName } = req.body;

        // 1. Kiểm tra resident tồn tại
        const resident = await Resident.findByPk(residentId);
        if (!resident) {
            return res.status(400).json({ message: 'Cư dân không tồn tại' });
        }

        // 2. Mỗi cư dân chỉ có 1 tài khoản
        const existedUserForResident = await User.findOne({ where: { residentId } });
        if (existedUserForResident) {
            return res.status(400).json({ message: 'Cư dân này đã có tài khoản' });
        }

        // 3. Username không trùng
        const existedUserName = await User.findOne({ where: { username } });
        if (existedUserName) {
            return res.status(400).json({ message: 'Username đã tồn tại' });
        }

        // 4. Hash mật khẩu và tạo User
        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            password: hashed,
            fullName: fullName || resident.fullName,
            role: 'resident',
            residentId: resident.id,          // LIÊN KẾT VỚI BẢNG residents
            isActive: true,
        });

        return res.status(201).json({
            message: 'Tạo tài khoản cư dân thành công',
            user: { id: user.id, username: user.username, residentId: user.residentId },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};
