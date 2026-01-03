// backend/controllers/dashboardController.js
const { Op, fn, col, literal } = require('sequelize');
const { Invoice, Household, Apartment, Announcement } = require('../models');

exports.getOverview = async (req, res) => {
    try {
        // startDate, endDate: 'YYYY-MM-DD'
        // granularity: 'day' | 'month' | 'year'
        const { startDate, endDate, granularity = 'month' } = req.query;

        // 1. Tổng số hộ
        const householdCount = await Household.count();

        // 2. Tổng phí đã thu (tổng tất cả, không phụ thuộc khoảng ngày)
        const totalCollected =
            (await Invoice.sum('totalAmount', { where: { status: 'paid' } })) || 0;

        // 3. Tổng phí chưa thu (tổng tất cả)
        const totalUncollected =
            (await Invoice.sum('totalAmount', {
                where: { status: { [Op.in]: ['pending', 'overdue'] } },
            })) || 0;

        // ---------------- THỐNG KÊ TÀI CHÍNH THEO dueDate ----------------

        // Chọn format group theo granularity
        let dateFormat;
        let orderExpression;

        if (granularity === 'day') {
            // hiển thị từng ngày: 01/02/2026
            dateFormat = '%d/%m/%Y';
            orderExpression = "STR_TO_DATE(period, '%d/%m/%Y')";
        } else if (granularity === 'year') {
            // hiển thị theo năm: 2026
            dateFormat = '%Y';
            // convert period -> 01/01/period để sắp xếp theo thời gian
            orderExpression = "STR_TO_DATE(CONCAT('01/01/', period), '%d/%m/%Y')";
        } else {
            // mặc định theo tháng: 02/2026
            dateFormat = '%m/%Y';
            orderExpression = "STR_TO_DATE(period, '%m/%Y')";
        }

        // where theo khoảng dueDate user chọn
        const where = {
            dueDate: { [Op.ne]: null },
        };

        if (startDate && endDate) {
            // startDate, endDate dạng 'YYYY-MM-DD'
            where.dueDate = {
                [Op.between]: [startDate, endDate],
            };
        }

        const financeRaw = await Invoice.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('dueDate'), dateFormat), 'period'],
                [
                    fn(
                        'SUM',
                        literal("CASE WHEN status = 'paid' THEN totalAmount ELSE 0 END")
                    ),
                    'collected',
                ],
                [
                    fn(
                        'SUM',
                        literal(
                            "CASE WHEN status IN ('pending','overdue') THEN totalAmount ELSE 0 END"
                        )
                    ),
                    'uncollected',
                ],
            ],
            where,
            group: [literal('period')],
            order: [literal(`${orderExpression} ASC`)],
        });

        const financeByPeriod = financeRaw.map((r) => ({
            period: r.get('period'),
            collected: Number(r.get('collected')) || 0,
            uncollected: Number(r.get('uncollected')) || 0,
        }));

        // 5. Tình trạng căn hộ
        const occupied = await Apartment.count({ where: { status: 'occupied' } });
        const empty = await Apartment.count({ where: { status: 'empty' } });
        const constructing = await Apartment.count({
            where: { status: 'constructing' },
        });

        // 6. Thông báo mới nhất
        const announcements = await Announcement.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10,
        });

        res.json({
            householdCount,
            totalCollected,
            totalUncollected,
            collectedTrend: 0, // có thể tính sau
            uncollectedTrend: 0,
            // frontend đang dùng tên financeByMonth nhưng thực chất là theo period
            financeByMonth: financeByPeriod,
            apartmentStatus: { occupied, empty, constructing },
            announcements,
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Lỗi server dashboard' });
    }
};
