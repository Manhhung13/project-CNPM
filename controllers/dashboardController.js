// backend/controllers/dashboardController.js
const { Op, fn, col, literal } = require('sequelize');
const {
    Invoice,
    Household,
    Apartment,
    Announcement
} = require('../models');

exports.getOverview = async (req, res) => {
    try {
        // 1. Tổng số hộ
        const householdCount = await Household.count();

        // 2. Tổng phí đã thu
        const totalCollected =
            (await Invoice.sum('totalAmount', { where: { status: 'paid' } })) || 0;

        // 3. Tổng phí chưa thu (chờ + quá hạn)
        const totalUncollected =
            (await Invoice.sum('totalAmount', {
                where: { status: { [Op.in]: ['pending', 'overdue'] } }
            })) || 0;

        // 4. Thống kê tài chính theo tháng (6 tháng gần nhất)
        const financeRaw = await Invoice.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('createdAt'), '%m/%Y'), 'month'],
                [
                    fn(
                        'SUM',
                        literal("CASE WHEN status = 'paid' THEN totalAmount ELSE 0 END")
                    ),
                    'collected'
                ],
                [
                    fn(
                        'SUM',
                        literal("CASE WHEN status IN ('pending','overdue') THEN totalAmount ELSE 0 END")
                    ),
                    'uncollected'
                ]
            ],
            group: [literal('month')],
            order: [literal("STR_TO_DATE(month, '%m/%Y') ASC")],
            limit: 6
        });

        const financeByMonth = financeRaw.map((r) => ({
            month: r.get('month'),
            collected: Number(r.get('collected')) || 0,
            uncollected: Number(r.get('uncollected')) || 0
        }));

        // 5. Tình trạng căn hộ
        const occupied = await Apartment.count({ where: { status: 'occupied' } });
        const empty = await Apartment.count({ where: { status: 'empty' } });
        const constructing = await Apartment.count({
            where: { status: 'constructing' }
        });

        // 6. Thông báo mới nhất
        const announcements = await Announcement.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        res.json({
            householdCount,
            totalCollected,
            totalUncollected,
            collectedTrend: 0,      // tạm thời
            uncollectedTrend: 0,    // tạm thời
            financeByMonth,
            apartmentStatus: { occupied, empty, constructing },
            announcements
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Lỗi server dashboard' });
    }
};
