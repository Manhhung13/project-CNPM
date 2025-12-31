const { Household, Resident, Apartment, sequelize } = require('../models');
const { Op } = require('sequelize');


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
            return res
                .status(400)
                .json({ message: 'Căn hộ này không còn trống hoặc không tồn tại!' });
        }

        // 2. Check CCCD
        const existingResident = await Resident.findOne({
            where: { identityCard },
            transaction: t
        });

        if (existingResident) {
            await t.rollback();
            return res
                .status(400)
                .json({ message: 'Số CCCD/CMND này đã tồn tại trong hệ thống!' });
        }

        // 3. Tạo Chủ hộ
        const newHead = await Resident.create(
            {
                fullName,
                identityCard,
                phoneNumber,
                dob,
                gender,
                email,
                isHost: true,
                apartmentId
            },
            { transaction: t }
        );

        // 4. Tạo Hộ khẩu
        const newHousehold = await Household.create(
            {
                apartmentId,
                headResidentId: newHead.id,
                moveInDate: new Date(),
                status: 'Active'
            },
            { transaction: t }
        );

        // 5. Update householdId cho chủ hộ
        await newHead.update(
            { householdId: newHousehold.id },
            { transaction: t }
        );

        // 6. Update phòng -> Occupied
        await apartment.update(
            { status: 'Occupied' },
            { transaction: t }
        );

        await t.commit();
        res
            .status(201)
            .json({ message: 'Tạo hộ khẩu thành công', household: newHousehold });
    } catch (error) {
        await t.rollback();
        console.error('Lỗi tạo hộ khẩu:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};


// -------------------- 2. LẤY DANH SÁCH HỘ ĐANG Ở --------------------
exports.getAllHouseholds = async (req, res) => {
    try {
        const households = await Household.findAll({
            where: { status: 'Active' },          // CHỈ hộ đang ở
            include: [
                {
                    model: Apartment,
                    as: 'apartment',
                    attributes: ['name', 'area']
                },
                {
                    model: Resident,
                    as: 'headResident',
                    attributes: [
                        'fullName',
                        'phoneNumber',
                        'identityCard',
                        'dob',
                        'gender',
                        'email'
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(households);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};


// -------------------- 3. CẬP NHẬT HỘ KHẨU --------------------
exports.updateHousehold = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const {
            apartmentId,
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
                return res
                    .status(400)
                    .json({ message: 'Căn hộ mới không trống hoặc không tồn tại!' });
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
            await household.update({ apartmentId }, { transaction: t });

            // 5. Cập nhật apartmentId cho TẤT CẢ thành viên trong hộ
            await Resident.update(
                { apartmentId },
                { where: { householdId: id }, transaction: t }
            );
        }

        // --- XỬ LÝ 2: CẬP NHẬT THÔNG TIN CHỦ HỘ ---
        if (household.headResidentId) {
            const headResident = await Resident.findByPk(
                household.headResidentId,
                { transaction: t }
            );

            if (headResident) {
                // Check trùng CCCD nếu đổi
                if (identityCard && identityCard !== headResident.identityCard) {
                    const duplicate = await Resident.findOne({
                        where: { identityCard },
                        transaction: t
                    });
                    if (duplicate) {
                        await t.rollback();
                        return res
                            .status(400)
                            .json({ message: 'Số CCCD mới bị trùng với cư dân khác!' });
                    }
                }

                await headResident.update(
                    { fullName, identityCard, phoneNumber, dob, gender, email },
                    { transaction: t }
                );
            }
        }

        await t.commit();
        res.json({ message: 'Cập nhật thông tin thành công!' });
    } catch (error) {
        await t.rollback();
        console.error('Lỗi update:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};


// -------------------- 4. "XÓA" HỘ KHẨU = CHUYỂN LỊCH SỬ --------------------
exports.deleteHousehold = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;

        const household = await Household.findByPk(id, { transaction: t });
        if (!household) {
            await t.rollback();
            return res.status(404).json({ message: 'Không tìm thấy hộ khẩu' });
        }

        // 1. Trả phòng về Empty
        if (household.apartmentId) {
            await Apartment.update(
                { status: 'Empty' },
                { where: { id: household.apartmentId }, transaction: t }
            );
        }

        // 2. XÓA CỨ DÂN THƯỜNG (GIỮ CHỦ HỘ để xem lịch sử)
        if (household.headResidentId) {
            await Resident.destroy({
                where: {
                    householdId: id,
                    id: { [Op.ne]: household.headResidentId }  // GIỮ CHỦ HỘ
                },
                transaction: t
            });
        }

        // 3. CẬP NHẬT TRẠNG THÁI - GIỮ headResidentId
        await household.update(
            {
                status: 'History',
                moveOutDate: new Date()
            },
            { transaction: t }
        );

        await t.commit();
        res.json({ message: 'Cập nhật hộ khẩu sang lịch sử thành công!' });
    } catch (error) {
        await t.rollback();
        console.error('Lỗi xóa hộ khẩu:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// -------------------- 5. LỊCH SỬ CÁC ĐỜI CHỦ HỘ - FIX MYSQL + HIỂN THỊ FULL INFO --------------------
exports.getHouseholdHistoryByApartment = async (req, res) => {
    try {
        const { apartmentId } = req.params;

        //  FIX MYSQL: KHÔNG dùng NULLS FIRST/LAST
        const history = await Household.findAll({
            where: { apartmentId },  // LẤY CẢ Active + History
            include: [
                {
                    model: Apartment,
                    as: 'apartment',
                    attributes: ['name', 'area']
                },
                {
                    model: Resident,
                    as: 'headResident',
                    attributes: ['fullName', 'phoneNumber', 'identityCard'],
                    required: false  // LEFT JOIN - HIỂN THỊ kể cả headResidentId = null
                }
            ],
            //  FIX ORDER: MySQL tự động NULL lên đầu khi ASC
            order: [
                ['moveOutDate', 'ASC'],     // NULL (hộ hiện tại) lên đầu
                ['moveInDate', 'DESC']      // Hộ cũ sắp xếp theo ngày vào
            ]
        });

        res.json(history);
    } catch (error) {
        console.error('Lỗi lấy lịch sử hộ khẩu:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

