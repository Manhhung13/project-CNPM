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
    Divider
} from '@mui/material';
import {
    ArrowUpward,
    ArrowDownward
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import api from '../services/api';

const StatCard = ({ title, value, color, trend }) => (
    <Paper
        sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            height: 140,
            bgcolor: color,
            color: '#fff',
            borderRadius: 2
        }}
        elevation={0}
    >
        <Typography component="h2" variant="subtitle2" gutterBottom>
            {title}
        </Typography>
        <Typography component="p" variant="h4" sx={{ fontWeight: 600 }}>
            {value}
        </Typography>
        {trend != null && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {trend > 0 ? (
                    <ArrowUpward fontSize="small" />
                ) : (
                    <ArrowDownward fontSize="small" />
                )}
                <Typography variant="caption">
                    {trend > 0 ? '+' : ''}
                    {trend}% so với tháng trước
                </Typography>
            </Box>
        )}
    </Paper>
);

const DONUT_COLORS = ['#1976d2', '#26a69a', '#ffb300'];

const DashboardPage = () => {
    const [stats, setStats] = useState({
        totalCollected: 0,
        totalUncollected: 0,
        householdCount: 0,
        financeByMonth: [],
        apartmentStatus: {},
        announcements: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/overview');
                // có thể backend vẫn trả residentTickets thì cũng bỏ qua, không dùng
                setStats({
                    totalCollected: data.totalCollected,
                    totalUncollected: data.totalUncollected,
                    householdCount: data.householdCount,
                    financeByMonth: data.financeByMonth || [],
                    apartmentStatus: data.apartmentStatus || {},
                    announcements: data.announcements || [],
                    collectedTrend: data.collectedTrend,
                    uncollectedTrend: data.uncollectedTrend
                });
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    const financeChartData = stats.financeByMonth || [];
    const apartmentStatusData = [
        { name: 'Đang ở', value: stats.apartmentStatus?.occupied || 0 },
        { name: 'Trống', value: stats.apartmentStatus?.empty || 0 },
        { name: 'Đang thi công', value: stats.apartmentStatus?.constructing || 0 }
    ];

    const totalCollectedLabel = `${(stats.totalCollected || 0).toLocaleString(
        'vi-VN'
    )} ₫`;
    const totalUncollectedLabel = `${(
        stats.totalUncollected || 0
    ).toLocaleString('vi-VN')} ₫`;

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Tổng quan
            </Typography>

            {/* Hàng 1: KPI cards */}
            <Grid container spacing={3} sx={{ mb: 1 }}>
                <Grid item xs={12} md={4} lg={4}>
                    <StatCard
                        title="Tổng số hộ"
                        value={stats.householdCount}
                        color="#1976d2"
                    />
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                    <StatCard
                        title="Phí đã thu"
                        value={totalCollectedLabel}
                        color="#2e7d32"
                        trend={stats.collectedTrend}
                    />
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                    <StatCard
                        title="Phí chưa thu"
                        value={totalUncollectedLabel}
                        color="#f57c00"
                        trend={stats.uncollectedTrend}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Thống kê tài chính: Bar chart */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Thống kê tài chính theo tháng
                        </Typography>
                        <Box sx={{ height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={financeChartData}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(v) =>
                                            v.toLocaleString('vi-VN') + ' ₫'
                                        }
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="collected"
                                        name="Đã thu"
                                        fill="#1976d2"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="uncollected"
                                        name="Chưa thu"
                                        fill="#ef6c00"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Tình trạng căn hộ: Donut chart */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Tình trạng căn hộ
                        </Typography>
                        <Box sx={{ height: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={apartmentStatusData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={50}
                                        outerRadius={80}
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

                {/* Thông báo (Timeline đơn giản dạng list) */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Thông báo gần đây
                        </Typography>
                        <List sx={{ maxHeight: 320, overflow: 'auto' }}>
                            {(stats.announcements || []).map((a) => (
                                <React.Fragment key={a.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemText
                                            primary={a.title}
                                            secondary={
                                                <>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                    >
                                                        {new Date(a.createdAt).toLocaleString('vi-VN')}
                                                    </Typography>
                                                    {' — '}
                                                    {a.content}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </React.Fragment>
                            ))}
                            {(!stats.announcements ||
                                stats.announcements.length === 0) && (
                                    <Typography variant="body2" color="text.secondary">
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
