import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const UserDashboardPage = () => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            // backend trả: [{ month: '01/2026', totalPaid: 1200000, totalUnpaid: 500000 }, ...]
            const { data } = await api.get('/user/invoices/stats-monthly');
            setStats(data);
        };
        fetchStats();
    }, []);

    const chartData = {
        labels: stats.map((s) => s.month),
        datasets: [
            {
                label: 'Đã trả',
                data: stats.map((s) => s.totalPaid),
                backgroundColor: '#4caf50',
            },
            {
                label: 'Chưa trả',
                data: stats.map((s) => s.totalUnpaid),
                backgroundColor: '#ff9800',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: { mode: 'index', intersect: false },
        },
        interaction: { mode: 'index', intersect: false },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) =>
                        value.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' đ',
                },
            },
        },
    };

    // mỗi tháng ~80px, tối thiểu 400px để không quá hẹp
    const minWidth = Math.max(stats.length * 80, 400);

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Thống kê chi phí theo tháng
            </Typography>

            <Paper sx={{ p: 2, bgcolor: '#0b1020', color: '#fff' }}>
                {/* container trượt ngang */}
                <Box sx={{ overflowX: 'auto' }}>
                    <Box sx={{ minWidth, height: 260 }}>
                        <Bar data={chartData} options={options} />
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default UserDashboardPage;
