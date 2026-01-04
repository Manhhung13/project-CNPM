// controllers/userInvoiceController.js
const { Invoice, User, Resident, Fee, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Thống kê theo THÁNG (đã dùng cho biểu đồ cột theo tháng)
 * Trả: [{ month: '01/2026', totalPaid, totalUnpaid }, ...]
 */
exports.getMonthlyStats = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user || !user.residentId) {
            return res
                .status(400)
                .json({ message: 'User không gắn với cư dân nào' });
        }

        const resident = await Resident.findByPk(user.residentId);

        if (!resident || !resident.householdId) {
            return res
                .status(400)
                .json({ message: 'Cư dân chưa thuộc hộ khẩu nào' });
        }

        const householdId = resident.householdId;

        const rows = await Invoice.findAll({
            where: { householdId },
            attributes: [
                [
                    sequelize.fn(
                        'DATE_FORMAT',
                        sequelize.col('issueDate'),
                        '%m/%Y',
                    ),
                    'month',
                ],
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.literal(
                            "CASE WHEN status = 'paid' THEN totalAmount ELSE 0 END",
                        ),
                    ),
                    'totalPaid',
                ],
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.literal(
                            "CASE WHEN status <> 'paid' THEN totalAmount ELSE 0 END",
                        ),
                    ),
                    'totalUnpaid',
                ],
            ],
            group: [
                sequelize.fn(
                    'DATE_FORMAT',
                    sequelize.col('issueDate'),
                    '%m/%Y',
                ),
            ],
            order: [sequelize.fn('MIN', sequelize.col('issueDate'))],
            raw: true,
        });

        const stats = rows.map((r) => ({
            month: r.month,
            totalPaid: Number(r.totalPaid) || 0,
            totalUnpaid: Number(r.totalUnpaid) || 0,
        }));

        res.json(stats);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Server error', error: err.message });
    }
};

/**
 * THỐNG KÊ THEO NGÀY TRONG THÁNG (phục vụ dashboard user mới)
 * Query: year, month (VD: 2026, '01'), nếu không truyền thì lấy tháng hiện tại
 * Trả: [{ day: '01', totalPaid, totalUnpaid }, ...]
 */
exports.getDailyStats = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user || !user.residentId) {
            return res
                .status(400)
                .json({ message: 'User không gắn với cư dân nào' });
        }

        const resident = await Resident.findByPk(user.residentId);
        if (!resident || !resident.householdId) {
            return res
                .status(400)
                .json({ message: 'Cư dân chưa thuộc hộ khẩu nào' });
        }

        const { year, month } = req.query;

        const today = new Date();
        const y = year || today.getFullYear();
        const m = month || String(today.getMonth() + 1).padStart(2, '0');

        const startDate = `${y}-${m}-01`;
        const endDate = `${y}-${m}-31`; // đủ cho mọi tháng, DB sẽ tự cắt

        const rows = await Invoice.findAll({
            where: {
                householdId: resident.householdId,
                dueDate: {
                    [Op.between]: [startDate, endDate],
                },
            },
            attributes: [
                [
                    sequelize.fn('DATE_FORMAT', sequelize.col('dueDate'), '%d'),
                    'day',
                ],
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.literal(
                            "CASE WHEN status = 'paid' THEN totalAmount ELSE 0 END",
                        ),
                    ),
                    'totalPaid',
                ],
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.literal(
                            "CASE WHEN status <> 'paid' THEN totalAmount ELSE 0 END",
                        ),
                    ),
                    'totalUnpaid',
                ],
            ],
            group: [
                sequelize.fn('DATE_FORMAT', sequelize.col('dueDate'), '%d'),
            ],
            order: [
                sequelize.fn('DATE_FORMAT', sequelize.col('dueDate'), '%d'),
            ],
            raw: true,
        }); // [web:35][web:46]

        const stats = rows.map((r) => ({
            day: r.day, // '01', '02', ...
            totalPaid: Number(r.totalPaid) || 0,
            totalUnpaid: Number(r.totalUnpaid) || 0,
        }));

        res.json(stats);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Server error', error: err.message });
    }
};

/**
 * Danh sách hóa đơn của user (bảng + dialog QR)
 */
exports.getMyInvoices = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user || !user.residentId) {
            return res
                .status(400)
                .json({ message: 'User không gắn với cư dân nào' });
        }

        const resident = await Resident.findByPk(user.residentId);
        if (!resident || !resident.householdId) {
            return res
                .status(400)
                .json({ message: 'Cư dân chưa thuộc hộ khẩu nào' });
        }

        const invoices = await Invoice.findAll({
            where: { householdId: resident.householdId },
            order: [['issueDate', 'DESC']],
            attributes: [
                'id',
                'invoiceNumber',
                'issueDate',
                'dueDate',
                'totalAmount',
                'status',
                'feeId',
            ],
            include: [
                {
                    model: Fee,
                    as: 'fee',
                    attributes: ['name'],
                },
            ],
        });

        const result = invoices.map((inv) => {
            const issueDate = inv.issueDate;
            let monthLabel = '';

            if (issueDate) {
                const d = new Date(issueDate);
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                monthLabel = `${month}/${year}`;
            }

            const isPaid = inv.status === 'paid';

            return {
                id: inv.id,
                code: inv.invoiceNumber,
                month: monthLabel,
                amount: inv.totalAmount,
                status: isPaid ? 'PAID' : 'UNPAID',
                feeName: inv.fee ? inv.fee.name : null,
            };
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Server error', error: err.message });
    }
};

/**
 * Thanh toán 1 hóa đơn (user)
 */
exports.payMyInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(req.user.id);

        if (!user || !user.residentId) {
            return res
                .status(400)
                .json({ message: 'User không gắn với cư dân nào' });
        }

        const resident = await Resident.findByPk(user.residentId);
        if (!resident || !resident.householdId) {
            return res
                .status(400)
                .json({ message: 'Cư dân chưa thuộc hộ khẩu nào' });
        }

        const invoice = await Invoice.findOne({
            where: { id, householdId: resident.householdId },
        });

        if (!invoice) {
            return res
                .status(404)
                .json({ message: 'Hóa đơn không tồn tại' });
        }

        if (invoice.status === 'paid') {
            return res
                .status(400)
                .json({ message: 'Hóa đơn đã được thanh toán' });
        }

        invoice.status = 'paid';
        await invoice.save();

        res.json({ message: 'Thanh toán thành công' });
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: 'Server error', error: err.message });
    }
};
