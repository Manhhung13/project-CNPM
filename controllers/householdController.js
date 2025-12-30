const { Household, Resident, Apartment, sequelize } = require('../models');
const { Op } = require("sequelize");

// -------------------- 1. TẠO HỘ KHẨU --------------------
exports.createHousehold = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            apartmentId,
            fullName, identityCard, phoneNumber, dob, gender, email
        } = req.body;

        // 1. Check phòng trống
        const apartment = await Apartment.findOne({
            where: {
                id: apartmentId,
                status: { [Op.or]: ['Empty', 'Available'] }
            },
            transaction: t
        });

        if (!apartment) {
            await t.rollback();
            return res.status(400).json({ message: 'Căn hộ này không còn trống hoặc không tồn tại!' });
        }

        // 2. Check CCCD
        const existingResident = await Resident.findOne({
            where: { identityCard: identityCard },
            transaction: t
        });

        if (existingResident) {
            await t.rollback();
            return res.status(400).json({ message: 'Số CCCD/CMND này đã tồn tại trong hệ thống!' });
        }

        // 3. Tạo Chủ hộ
        const newHead = await Resident.create({
            fullName, identityCard, phoneNumber, dob, gender, email,
            isHost: true,
            apartmentId: apartmentId
        }, { transaction: t });

        // 4. Tạo Hộ khẩu
        const newHousehold = await Household.create({
            apartmentId: apartmentId,
            headResidentId: newHead.id,
            moveInDate: new Date(),
            status: 'Active'
        }, { transaction: t });

        // 5. Update householdId cho chủ hộ
        await newHead.update({ householdId: newHousehold.id }, { transaction: t });

        // 6. Update phòng -> Occupied
        await apartment.update({ status: 'Occupied' }, { transaction: t });

        await t.commit();
        res.status(201).json({ message: 'Tạo hộ khẩu thành công', household: newHousehold });

    } catch (error) {
        await t.rollback();
        console.error("Lỗi tạo hộ khẩu:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// -------------------- 2. LẤY DANH SÁCH --------------------
exports.getAllHouseholds = async (req, res) => {
    try {
        const households = await Household.findAll({
            include: [
                {
                    model: Apartment,
                    as: 'apartment',
                    attributes: ['name', 'area']
                },
                {
                    model: Resident,
                    as: 'headResident',
                    attributes: ['fullName', 'phoneNumber', 'identityCard', 'dob', 'gender', 'email'] // Lấy đủ thông tin để fill vào form sửa
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(households);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// -------------------- 3. CẬP NHẬT HỘ KHẨU (MỚI THÊM) --------------------
exports.updateHousehold = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const {
            apartmentId, // ID phòng mới (nếu đổi)
            fullName, identityCard, phoneNumber, dob, gender, email
        } = req.body;

        const household = await Household.findByPk(id);
        if (!household) {
            await t.rollback();
            return res.status(404).json({ message: 'Không tìm thấy hộ khẩu' });
        }

        // --- XỬ LÝ 1: NẾU CÓ THAY ĐỔI CĂN HỘ ---
        if (apartmentId && apartmentId != household.apartmentId) {
            // 1. Kiểm tra phòng mới có trống không
            const newApartment = await Apartment.findOne({
                where: {
                    id: apartmentId,
                    status: { [Op.or]: ['Empty', 'Available'] }
                },
                transaction: t
            });

            if (!newApartment) {
                await t.rollback();
                return res.status(400).json({ message: 'Căn hộ mới không trống hoặc không tồn tại!' });
            }

            // 2. Trả phòng cũ về trạng thái Empty
            if (household.apartmentId) {
                await Apartment.update(
                    { status: 'Empty' },
                    { where: { id: household.apartmentId }, transaction: t }
                );
            }

            // 3. Cập nhật phòng mới thành Occupied
            await newApartment.update({ status: 'Occupied' }, { transaction: t });

            // 4. Cập nhật apartmentId cho Hộ khẩu
            await household.update({ apartmentId: apartmentId }, { transaction: t });

            // 5. Cập nhật apartmentId cho TẤT CẢ thành viên trong hộ (di chuyển cả nhà)
            await Resident.update(
                { apartmentId: apartmentId },
                { where: { householdId: id }, transaction: t }
            );
        }

        // --- XỬ LÝ 2: CẬP NHẬT THÔNG TIN CHỦ HỘ ---
        if (household.headResidentId) {
            const headResident = await Resident.findByPk(household.headResidentId);
            if (headResident) {
                // Kiểm tra trùng CCCD nếu người dùng sửa số CCCD
                if (identityCard && identityCard !== headResident.identityCard) {
                    const duplicate = await Resident.findOne({ where: { identityCard }, transaction: t });
                    if (duplicate) {
                        await t.rollback();
                        return res.status(400).json({ message: 'Số CCCD mới bị trùng với cư dân khác!' });
                    }
                }

                await headResident.update({
                    fullName, identityCard, phoneNumber, dob, gender, email
                }, { transaction: t });
            }
        }

        await t.commit();
        res.json({ message: 'Cập nhật thông tin thành công!' });

    } catch (error) {
        await t.rollback();
        console.error("Lỗi update:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// -------------------- 4. XÓA HỘ KHẨU --------------------
exports.deleteHousehold = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;

        const household = await Household.findByPk(id);
        if (!household) {
            await t.rollback();
            return res.status(404).json({ message: 'Không tìm thấy hộ khẩu' });
        }

        // Trả phòng về Empty
        if (household.apartmentId) {
            await Apartment.update(
                { status: 'Empty' },
                { where: { id: household.apartmentId }, transaction: t }
            );
        }

        // Xóa cư dân liên quan
        await Resident.destroy({ where: { householdId: id }, transaction: t });

        // Gỡ link chủ hộ & Xóa hộ khẩu
        await household.update({ headResidentId: null }, { transaction: t });
        await household.destroy({ transaction: t });

        await t.commit();
        res.json({ message: 'Xóa hộ khẩu thành công!' });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};