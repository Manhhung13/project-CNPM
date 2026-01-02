// controllers/userInvoiceController.js
const { Invoice, User, Resident, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getMonthlyStats = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user || !user.residentId) {
            return res.status(400).json({ message: 'User không gắn với cư dân nào' });
        }

        const resident = await Resident.findByPk(user.residentId);

        if (!resident || !resident.householdId) {
            return res.status(400).json({ message: 'Cư dân chưa thuộc hộ khẩu nào' });
        }

        const householdId = resident.householdId;

        // Group by tháng/năm theo issueDate
        const rows = await Invoice.findAll({
            where: { householdId },
            attributes: [
                // dạng "MM/YYYY" cho frontend
                [
                    sequelize.fn(
                        'DATE_FORMAT',
                        sequelize.col('issueDate'),
                        '%m/%Y'
                    ),
                    'month',
                ],
                // tổng đã trả
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.literal(
                            "CASE WHEN status = 'paid' THEN totalAmount ELSE 0 END"
                        )
                    ),
                    'totalPaid',
                ],
                // tổng chưa trả (pending + overdue)
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.literal(
                            "CASE WHEN status <> 'paid' THEN totalAmount ELSE 0 END"
                        )
                    ),
                    'totalUnpaid',
                ],
            ],
            group: [sequelize.fn('DATE_FORMAT', sequelize.col('issueDate'), '%m/%Y')],
            order: [sequelize.fn('MIN', sequelize.col('issueDate'))],
            raw: true,
        });

        // rows trả về string, convert số
        const stats = rows.map((r) => ({
            month: r.month,
            totalPaid: Number(r.totalPaid) || 0,
            totalUnpaid: Number(r.totalUnpaid) || 0,
        }));

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
exports.getMyInvoices = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user || !user.residentId) {
            return res.status(400).json({ message: 'User không gắn với cư dân nào' });
        }

        const resident = await Resident.findByPk(user.residentId);
        if (!resident || !resident.householdId) {
            return res.status(400).json({ message: 'Cư dân chưa thuộc hộ khẩu nào' });
        }

        const invoices = await Invoice.findAll({
            where: { householdId: resident.householdId },
            order: [['issueDate', 'DESC']],
            attributes: [
                'id',
                'invoiceNumber', // mã hóa đơn
                'issueDate',
                'dueDate',
                'totalAmount',
                'status',
            ],
        });

        // Map lại field cho đúng với frontend
        const result = invoices.map((inv) => {
            const issueDate = inv.issueDate;              // kiểu Date hoặc string

            let monthLabel = '';
            if (issueDate) {
                const d = new Date(issueDate);
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                monthLabel = `${month}/${year}`;           // "MM/YYYY"
            }

            return {
                id: inv.id,
                code: inv.invoiceNumber,
                month: monthLabel,                         // dùng cho cột "Tháng"
                amount: inv.totalAmount,
                status: inv.status === 'paid' ? 'PAID' : 'UNPAID',
            };
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.payMyInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(req.user.id);

        if (!user || !user.residentId) {
            return res.status(400).json({ message: 'User không gắn với cư dân nào' });
        }

        const resident = await Resident.findByPk(user.residentId);
        if (!resident || !resident.householdId) {
            return res.status(400).json({ message: 'Cư dân chưa thuộc hộ khẩu nào' });
        }

        const invoice = await Invoice.findOne({
            where: { id, householdId: resident.householdId },
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Hóa đơn không tồn tại' });
        }

        if (invoice.status === 'paid') {
            return res.status(400).json({ message: 'Hóa đơn đã được thanh toán' });
        }

        invoice.status = 'paid';
        await invoice.save();

        res.json({ message: 'Thanh toán thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

