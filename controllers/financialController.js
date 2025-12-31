const { Invoice, Fee, Household, sequelize, Op } = require('../models');

// -------------------- 1. GET DANH SÁCH HÓA ĐƠN --------------------
exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            order: [['issueDate', 'DESC'], ['id', 'DESC']],
            include: [
                {
                    model: Household,
                    as: 'household',
                    include: [
                        {
                            model: require('../models/Apartment'),
                            as: 'apartment',
                            attributes: ['name']
                        },
                        {
                            model: require('../models/Resident'),
                            as: 'headResident',
                            attributes: ['fullName']
                        }
                    ]
                },
                {
                    model: Fee,
                    as: 'fee',
                    attributes: ['name', 'type', 'unitPrice']
                }
            ]
        });
        res.json(invoices);
    } catch (error) {
        console.error('Lỗi lấy hóa đơn:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// -------------------- 2. TẠO HÓA ĐƠN MỚI --------------------
exports.createInvoice = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { householdId, feeId, amount, dueDate, details } = req.body;

        // Validation
        if (!householdId || !feeId || !amount || !dueDate) {
            await t.rollback();
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        const household = await Household.findOne({
            where: { id: householdId, status: 'Active' },
            transaction: t
        });
        if (!household) {
            await t.rollback();
            return res.status(400).json({ message: 'Hộ khẩu không tồn tại hoặc không active' });
        }

        const fee = await Fee.findByPk(feeId, { transaction: t });
        if (!fee) {
            await t.rollback();
            return res.status(400).json({ message: 'Khoản phí không tồn tại' });
        }

        // Tạo invoice number: INV-YYYYMMDD-XXX
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await Invoice.count({
            where: { invoiceNumber: { [Op.like]: `INV-${today}%` } },
            transaction: t
        });
        const invoiceNumber = `INV-${today}-${String(count + 1).padStart(3, '0')}`;

        // Tạo hóa đơn
        const invoice = await Invoice.create({
            invoiceNumber,
            householdId,
            feeId,
            totalAmount: parseFloat(amount),
            dueDate,
            details: details || null
        }, { transaction: t });

        await t.commit();
        res.status(201).json({
            message: 'Tạo hóa đơn thành công!',
            invoiceNumber,
            invoiceId: invoice.id
        });
    } catch (error) {
        await t.rollback();
        console.error('Lỗi tạo hóa đơn:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// -------------------- 3. CẬP NHẬT HÓA ĐƠN --------------------
exports.updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, details } = req.body;

        const invoice = await Invoice.findByPk(id);
        if (!invoice) {
            return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        }

        await invoice.update({ status, details });
        res.json({ message: 'Cập nhật thành công!' });
    } catch (error) {
        console.error('Lỗi cập nhật:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// -------------------- 4. XÓA HÓA ĐƠN --------------------
exports.deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findByPk(id);
        if (!invoice) {
            return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        }
        await invoice.destroy();
        res.json({ message: 'Xóa thành công!' });
    } catch (error) {
        console.error('Lỗi xóa:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
