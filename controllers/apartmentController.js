const { Apartment } = require('../models');

// 1. Lấy danh sách căn hộ
exports.getAllApartments = async (req, res) => {
    try {
        const apartments = await Apartment.findAll({
            order: [['createdAt', 'DESC']], // Sắp xếp mới nhất lên đầu (hoặc [['name', 'ASC']] nếu muốn theo tên)
        });
        res.json(apartments);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
// Lấy danh sách căn hộ có trạng thái 'Empty' để hiển thị lên Dropdown
exports.getEmptyApartments = async (req, res) => {
    try {
        const emptyApartments = await Apartment.findAll({
            where: { status: 'Empty' },
            attributes: ['id', 'name', 'area'] // Chỉ lấy thông tin cần thiết
        });
        res.json(emptyApartments);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
// 2. Tạo căn hộ mới
exports.createApartment = async (req, res) => {
    try {
        // Frontend chỉ gửi name và area
        const { name, area } = req.body;

        // Kiểm tra trùng tên
        const existing = await Apartment.findOne({ where: { name } });
        if (existing) {
            return res.status(400).json({ message: 'Tên căn hộ này đã tồn tại!' });
        }

        // FIX LỖI Ở ĐÂY: Gán cứng status = 'Empty' vì frontend không gửi lên
        const newApartment = await Apartment.create({
            name,
            area,
            status: 'Empty'
        });

        res.status(201).json(newApartment);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// 3. Cập nhật căn hộ (Bổ sung cho khớp giao diện)
exports.updateApartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, area } = req.body;

        const apartment = await Apartment.findByPk(id);
        if (!apartment) {
            return res.status(404).json({ message: 'Không tìm thấy căn hộ' });
        }

        // Kiểm tra nếu đổi tên thì tên mới có bị trùng không
        if (name && name !== apartment.name) {
            const existing = await Apartment.findOne({ where: { name } });
            if (existing) {
                return res.status(400).json({ message: 'Tên căn hộ mới đã tồn tại!' });
            }
        }

        // Chỉ update name và area, giữ nguyên status hiện tại
        await apartment.update({ name, area });

        res.json({ message: 'Cập nhật thành công', apartment });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// 4. Xóa căn hộ (Bổ sung cho khớp giao diện)
exports.deleteApartment = async (req, res) => {
    try {
        const { id } = req.params;

        const apartment = await Apartment.findByPk(id);
        if (!apartment) {
            return res.status(404).json({ message: 'Không tìm thấy căn hộ' });
        }

        // (Tuỳ chọn) Kiểm tra xem căn hộ có đang có người ở không trước khi xóa
        if (apartment.status === 'Active') {
            return res.status(400).json({ message: 'Không thể xóa căn hộ đang có người ở!' });
        }

        await apartment.destroy();
        res.json({ message: 'Xóa thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};