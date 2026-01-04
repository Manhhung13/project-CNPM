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

        // 2. Tổng phí đã thu (tất cả thời gian)
        const totalCollected =
            (await Invoice.sum('totalAmount', { where: { status: 'paid' } })) || 0;

        // 3. Tổng phí chưa thu (tất cả thời gian)
        const totalUncollected =
            (await Invoice.sum('totalAmount', {
                where: { status: { [Op.in]: ['pending', 'overdue'] } },
            })) || 0;

        // ---------------- THỐNG KÊ TÀI CHÍNH THEO dueDate ----------------
        let dateFormat;
        let orderExpression;

        if (granularity === 'day') {
            // chỉ hiển thị ngày trong tháng: '01', '02', ...
            dateFormat = '%d';
            // sắp xếp theo ngày (dùng năm 2000 giả lập cho dễ sort)
            orderExpression =
                "STR_TO_DATE(CONCAT(period, '/01/2000'), '%d/%m/%Y')";
        } else if (granularity === 'year') {
            // hiển thị theo năm: 2026
            dateFormat = '%Y';
            orderExpression =
                "STR_TO_DATE(CONCAT('01/01/', period), '%d/%m/%Y')";
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
                        literal("CASE WHEN status = 'paid' THEN totalAmount ELSE 0 END"),
                    ),
                    'collected',
                ],
                [
                    fn(
                        'SUM',
                        literal(
                            "CASE WHEN status IN ('pending','overdue') THEN totalAmount ELSE 0 END",
                        ),
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

        // xác định key dữ liệu theo granularity
        const key =
            granularity === 'day'
                ? 'financeByDay'
                : granularity === 'year'
                    ? 'financeByYear'
                    : 'financeByMonth';

        res.json({
            householdCount,
            totalCollected,
            totalUncollected,
            collectedTrend: 0, // có thể tính sau
            uncollectedTrend: 0,
            [key]: financeByPeriod,
            // giữ thêm financeByMonth cho các chỗ frontend cũ (nếu còn)
            financeByMonth:
                key === 'financeByMonth' ? financeByPeriod : undefined,
            apartmentStatus: { occupied, empty, constructing },
            announcements,
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Lỗi server dashboard' });
    }
};
