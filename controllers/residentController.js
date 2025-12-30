const { Resident, Household, Apartment } = require('../models');

// 1. Lấy danh sách tất cả nhân khẩu (kèm thông tin Phòng & Chủ hộ)
exports.getAllResidents = async (req, res) => {
    try {
        const residents = await Resident.findAll({
            include: [
                {
                    model: Household,
                    as: 'household',
                    include: [
                        {
                            model: Apartment,
                            as: 'apartment',
                            attributes: ['name'] // Lấy tên phòng (P101)
                        },
                        {
                            model: Resident,
                            as: 'headResident', // Lấy thông tin chủ hộ để hiển thị
                            attributes: ['fullName']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(residents);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// 2. Thêm nhân khẩu mới vào hộ
exports.createResident = async (req, res) => {
    try {
        const {
            fullName, dob, gender, citizenId, // Frontend gửi là citizenId
            phoneNumber, householdId, relationship
        } = req.body;

        // Kiểm tra CCCD trùng lặp
        const existing = await Resident.findOne({ where: { identityCard: citizenId } });
        if (existing) {
            return res.status(400).json({ message: 'Số CCCD/CMND đã tồn tại!' });
        }

        // Tìm hộ khẩu để lấy apartmentId (Cư dân phải ở cùng phòng với hộ khẩu)
        const household = await Household.findByPk(householdId);
        if (!household) {
            return res.status(404).json({ message: 'Hộ khẩu không tồn tại' });
        }

        // Tạo cư dân mới
        const newResident = await Resident.create({
            fullName,
            dob,
            gender,
            identityCard: citizenId, // Map citizenId -> identityCard
            phoneNumber,
            householdId, // Link vào hộ khẩu
            apartmentId: household.apartmentId, // Tự động lấy ID phòng theo hộ khẩu
            relationship: relationship,
            isHost: false // Mặc định thêm mới ở đây là thành viên, không phải chủ hộ
        });

        res.status(201).json({ message: 'Thêm nhân khẩu thành công', data: newResident });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// 3. Cập nhật thông tin nhân khẩu
exports.updateResident = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, dob, gender, citizenId, phoneNumber, relationship, householdId } = req.body;

        const resident = await Resident.findByPk(id);
        if (!resident) return res.status(404).json({ message: 'Không tìm thấy nhân khẩu' });

        // Nếu người dùng đổi hộ khẩu, cần update cả apartmentId
        let newApartmentId = resident.apartmentId;
        if (householdId && householdId !== resident.householdId) {
            const newHousehold = await Household.findByPk(householdId);
            if (newHousehold) newApartmentId = newHousehold.apartmentId;
        }

        await resident.update({
            fullName, dob, gender,
            identityCard: citizenId,
            phoneNumber, relationship, householdId,
            apartmentId: newApartmentId
        });

        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi update', error: error.message });
    }
};

// 4. Xóa nhân khẩu
exports.deleteResident = async (req, res) => {
    try {
        const { id } = req.params;
        const resident = await Resident.findByPk(id);

        if (!resident) return res.status(404).json({ message: 'Không tìm thấy' });

        if (resident.isHost) {
            return res.status(400).json({ message: 'Không thể xóa Chủ hộ ở đây. Hãy xóa Hộ khẩu.' });
        }

        await resident.destroy();
        res.json({ message: 'Đã xóa nhân khẩu' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa', error: error.message });
    }
};