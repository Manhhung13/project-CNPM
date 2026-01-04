import React, { useEffect, useState } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip,
} from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import api from '../services/api';

const DONUT_COLORS = ['#4f46e5', '#22c55e', '#f97316'];

const StatCard = ({ title, value, trend, accentColor, helperText }) => {
    const hasTrend = typeof trend === 'number';

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                bgcolor: '#ffffff',
                border: '1px solid',
                borderColor: 'grey.100',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography
                    variant="subtitle2"
                    sx={{ color: 'text.secondary', fontWeight: 500 }}
                >
                    {title}
                </Typography>
                <Box
                    sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: accentColor,
                    }}
                />
            </Box>

            <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}
            >
                {value}
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {hasTrend && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {trend >= 0 ? (
                            <ArrowUpward fontSize="small" sx={{ color: '#16a34a' }} />
                        ) : (
                            <ArrowDownward fontSize="small" sx={{ color: '#dc2626' }} />
                        )}
                        <Typography
                            variant="caption"
                            sx={{
                                color: trend >= 0 ? '#16a34a' : '#dc2626',
                                fontWeight: 600,
                            }}
                        >
                            {trend >= 0 ? '+' : ''}
                            {trend}% so với tháng trước
                        </Typography>
                    </Box>
                )}

                {helperText && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {helperText}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

const DashboardPage = () => {
    const [stats, setStats] = useState({
        totalCollected: 0,
        totalUncollected: 0,
        householdCount: 0,
        financeByPeriod: [],
        apartmentStatus: null,
        announcements: [],
        collectedTrend: 0,
        uncollectedTrend: 0,
    });

    const [loading, setLoading] = useState(true);

    // luôn thống kê theo ngày trong tháng hiện tại
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    const [startDate, setStartDate] = useState(`${yyyy}-${mm}-01`);
    const [endDate, setEndDate] = useState(`${yyyy}-${mm}-${dd}`);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/dashboard/overview', {
                params: {
                    granularity: 'day', // THỐNG KÊ THEO NGÀY
                    startDate,
                    endDate,
                },
            });

            setStats({
                totalCollected: data.totalCollected,
                totalUncollected: data.totalUncollected,
                householdCount: data.householdCount,
                // backend nên trả financeByDay: [{ period: '01', collected, uncollected }, ...]
                financeByPeriod: data.financeByDay || data.financeByPeriod || [],
                apartmentStatus: data.apartmentStatus || {},
                announcements: data.announcements || [],
                collectedTrend: data.collectedTrend,
                uncollectedTrend: data.uncollectedTrend,
            });
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate]);

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f9fafb',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    const financeChartData = stats.financeByPeriod || [];
    const apartmentStatusData = [
        {
            name: 'Đang ở',
            value: (stats.apartmentStatus && stats.apartmentStatus.occupied) || 0,
        },
        {
            name: 'Trống',
            value: (stats.apartmentStatus && stats.apartmentStatus.empty) || 0,
        },
        {
            name: 'Đang thi công',
            value:
                (stats.apartmentStatus && stats.apartmentStatus.constructing) || 0,
        },
    ];

    const totalCollectedLabel = `${(stats.totalCollected || 0).toLocaleString(
        'vi-VN',
    )} ₫`;
    const totalUncollectedLabel = `${(
        stats.totalUncollected || 0
    ).toLocaleString('vi-VN')} ₫`;

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                py: 2,
                bgcolor: '#f3f4f6',
                minHeight: '100vh',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                }}
            >
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Tổng quan
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', mt: 0.5 }}
                    >
                        Tình trạng thu phí và căn hộ trong tháng hiện tại
                    </Typography>
                </Box>

                <Chip
                    label={new Date().toLocaleString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    })}
                    size="small"
                    sx={{ bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 500 }}
                />
            </Box>

            {/* KPI */}
            <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title="Tổng số hộ"
                        value={stats.householdCount}
                        accentColor="#4f46e5"
                        helperText="Số hộ đang quản lý"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title="Phí đã thu"
                        value={totalCollectedLabel}
                        accentColor="#16a34a"
                        trend={stats.collectedTrend}
                        helperText="Tổng số tiền đã thu"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title="Phí chưa thu"
                        value={totalUncollectedLabel}
                        accentColor="#f97316"
                        trend={stats.uncollectedTrend}
                        helperText="Số tiền còn phải thu"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={2.5}>
                {/* BIỂU ĐỒ TÀI CHÍNH THEO NGÀY */}
                <Grid item xs={12} md={8}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: '#ffffff',
                            border: '1px solid',
                            borderColor: 'grey.100',
                            height: '100%',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1.5,
                                gap: 2,
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 600, color: 'text.primary' }}
                                >
                                    Thống kê tài chính theo ngày trong tháng
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: 'text.secondary' }}
                                >
                                    Tổng hợp số tiền đã thu và chưa thu theo từng ngày (dueDate)
                                </Typography>
                            </Box>

                            {/* chọn khoảng ngày trong tháng */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    flexWrap: 'wrap',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <input
                                        type="date"
                                        value={startDate || ''}
                                        onChange={(e) => setStartDate(e.target.value || null)}
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: 6,
                                            border: '1px solid #e5e7eb',
                                            fontSize: 13,
                                        }}
                                    />
                                    <span style={{ fontSize: 13, color: '#6b7280' }}>đến</span>
                                    <input
                                        type="date"
                                        value={endDate || ''}
                                        onChange={(e) => setEndDate(e.target.value || null)}
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: 6,
                                            border: '1px solid #e5e7eb',
                                            fontSize: 13,
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={financeChartData}
                                    margin={{ left: 0, right: 0, top: 10 }}
                                >
                                    <defs>
                                        <linearGradient
                                            id="collectedGradient"
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
                                            id="uncollectedGradient"
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
                                                stopOpacity={0.04}
                                            />
                                        </linearGradient>
                                    </defs>

                                    <XAxis
                                        dataKey="period" // ví dụ '01', '02', ... hoặc '2026-01-01'
                                        tickLine={false}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickFormatter={(val) => val}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickFormatter={(v) =>
                                            v >= 1000000 ? `${v / 1000000}M` : v.toLocaleString('vi-VN')
                                        }
                                    />
                                    <Tooltip
                                        formatter={(v) => `${v.toLocaleString('vi-VN')} ₫`}
                                        labelFormatter={(label) => `Ngày: ${label}`}
                                    />
                                    <Legend />

                                    <Area
                                        type="monotone"
                                        dataKey="collected"
                                        name="Đã thu"
                                        stroke="#22c55e"
                                        strokeWidth={3}
                                        fill="url(#collectedGradient)"
                                        activeDot={{ r: 5 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="uncollected"
                                        name="Chưa thu"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        fill="url(#uncollectedGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* BIỂU ĐỒ TÌNH TRẠNG CĂN HỘ */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: '#ffffff',
                            border: '1px solid',
                            borderColor: 'grey.100',
                            height: '100%',
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}
                        >
                            Tình trạng căn hộ
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary', mb: 2 }}
                        >
                            Phân bổ số lượng căn hộ theo trạng thái
                        </Typography>

                        <Box sx={{ height: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={apartmentStatusData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={3}
                                    >
                                        {apartmentStatusData.map((entry, index) => (
                                            <Cell
                                                key={entry.name}
                                                fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* THÔNG BÁO GẦN ĐÂY */}
                <Grid item xs={12}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: '#ffffff',
                            border: '1px solid',
                            borderColor: 'grey.100',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1.5,
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 600, color: 'text.primary' }}
                            >
                                Thông báo gần đây
                            </Typography>
                            {stats.announcements && stats.announcements.length > 0 && (
                                <Typography
                                    variant="caption"
                                    sx={{ color: 'text.secondary' }}
                                >
                                    {stats.announcements.length} thông báo
                                </Typography>
                            )}
                        </Box>

                        <List sx={{ maxHeight: 320, overflow: 'auto', pt: 0 }}>
                            {stats.announcements && stats.announcements.length > 0 ? (
                                stats.announcements.map((a) => (
                                    <React.Fragment key={a.id}>
                                        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{ fontWeight: 600, mb: 0.5 }}
                                                    >
                                                        {a.title}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography
                                                            component="span"
                                                            variant="caption"
                                                            sx={{ color: 'text.secondary' }}
                                                        >
                                                            {new Date(a.createdAt).toLocaleString('vi-VN')}
                                                        </Typography>
                                                        {' — '}
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            sx={{ color: 'text.primary' }}
                                                        >
                                                            {a.content}
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                        <Divider component="li" />
                                    </React.Fragment>
                                ))
                            ) : (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ py: 1 }}
                                >
                                    Chưa có thông báo nào.
                                </Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
