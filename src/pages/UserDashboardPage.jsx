// src/pages/UserDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    CircularProgress,
} from '@mui/material';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import api from '../services/api';

const UserDashboardPage = () => {
    const [dailyStats, setDailyStats] = useState([]);
    const [loading, setLoading] = useState(true);

    // ngày hiện tại làm mặc định
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');

    // state tháng / năm được chọn
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(currentMonth);

    useEffect(() => {
        const fetchDailyStats = async () => {
            setLoading(true);
            try {
                // backend trả: [{ day: '01', totalPaid, totalUnpaid }, ...]
                const { data } = await api.get('/user/invoices/stats-daily', {
                    params: { year, month },
                });

                const mapped =
                    (data || []).map((d) => ({
                        day: d.day,
                        paid: d.totalPaid || 0,
                        unpaid: d.totalUnpaid || 0,
                    })) ?? [];

                setDailyStats(mapped);
            } finally {
                setLoading(false);
            }
        };

        fetchDailyStats();
    }, [year, month]);

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // tổng đã nộp / chưa nộp trong tháng
    const totalPaidMonth = dailyStats.reduce((sum, d) => sum + d.paid, 0);
    const totalUnpaidMonth = dailyStats.reduce(
        (sum, d) => sum + d.unpaid,
        0,
    );

    const formatCurrency = (val) =>
        `${Number(val || 0).toLocaleString('vi-VN')} ₫`;

    return (
        <Box sx={{ px: { xs: 1.5, md: 3 }, py: 2 }}>
            {/* Header + chọn tháng/năm */}
            <Box
                sx={{
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: 'primary.main' }}
                        gutterBottom
                    >
                        Thống kê chi phí của bạn
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                    >
                        Tổng hợp khoản phí đã nộp và chưa nộp theo ngày trong tháng
                        được chọn.
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* chọn tháng */}
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        style={{
                            padding: '6px 10px',
                            borderRadius: 8,
                            border: '1px solid #e5e7eb',
                            fontSize: 13,
                        }}
                    >
                        {Array.from({ length: 12 }).map((_, i) => {
                            const m = String(i + 1).padStart(2, '0');
                            return (
                                <option key={m} value={m}>
                                    Tháng {m}
                                </option>
                            );
                        })}
                    </select>

                    {/* chọn năm (5 năm quanh hiện tại) */}
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        style={{
                            padding: '6px 10px',
                            borderRadius: 8,
                            border: '1px solid #e5e7eb',
                            fontSize: 13,
                        }}
                    >
                        {Array.from({ length: 5 }).map((_, i) => {
                            const y = currentYear - 2 + i;
                            return (
                                <option key={y} value={y}>
                                    Năm {y}
                                </option>
                            );
                        })}
                    </select>
                </Box>
            </Box>

            {/* KPI tổng đã nộp / chưa nộp */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'grey.200',
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{ color: 'text.secondary', mb: 0.5 }}
                        >
                            Tổng phí đã nộp trong tháng
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, color: 'primary.main' }}
                        >
                            {formatCurrency(totalPaidMonth)}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'grey.200',
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{ color: 'text.secondary', mb: 0.5 }}
                        >
                            Tổng phí chưa nộp trong tháng
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, color: '#ef4444' }}
                        >
                            {formatCurrency(totalUnpaidMonth)}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Biểu đồ theo ngày trong tháng */}
            <Paper
                sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'grey.200',
                }}
            >
                <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                >
                    Thống kê phí theo ngày trong tháng
                </Typography>
                <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 2 }}
                >
                    Đường xanh là số tiền đã nộp, đường đỏ là số tiền còn lại từng
                    ngày.
                </Typography>

                <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={dailyStats}
                            margin={{ left: 0, right: 0, top: 10 }}
                        >
                            <defs>
                                <linearGradient
                                    id="paidGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#22c55e"
                                        stopOpacity={0.5}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#22c55e"
                                        stopOpacity={0.05}
                                    />
                                </linearGradient>
                                <linearGradient
                                    id="unpaidGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#ef4444"
                                        stopOpacity={0.4}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#ef4444"
                                        stopOpacity={0.05}
                                    />
                                </linearGradient>
                            </defs>

                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={{ stroke: '#e5e7eb' }}
                                tickFormatter={(v) =>
                                    v >= 1000000
                                        ? `${v / 1000000}M`
                                        : v.toLocaleString('vi-VN')
                                }
                            />
                            <Tooltip
                                formatter={(v) =>
                                    `${v.toLocaleString('vi-VN')} ₫`
                                }
                                labelFormatter={(label) => `Ngày: ${label}`}
                            />
                            <Legend />

                            <Area
                                type="monotone"
                                dataKey="unpaid"
                                name="Chưa nộp"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fill="url(#unpaidGradient)"
                            />
                            <Area
                                type="monotone"
                                dataKey="paid"
                                name="Đã nộp"
                                stroke="#22c55e"
                                strokeWidth={3}
                                fill="url(#paidGradient)"
                                activeDot={{ r: 5 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>
        </Box>
    );
};

export default UserDashboardPage;
