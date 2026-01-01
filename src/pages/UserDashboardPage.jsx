import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';

// ĐĂNG KÝ MỘT LẦN
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
import api from '../services/api';

const UserDashboardPage = () => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            const { data } = await api.get('/user/invoices/stats-monthly');
            // data: [{ month: '01/2026', totalPaid: 1200000 }, ...]
            setStats(data);
        };
        fetchStats();
    }, []);

    const chartData = {
        labels: stats.map((s) => s.month),
        datasets: [
            {
                label: 'Số tiền đã trả',
                data: stats.map((s) => s.totalPaid),
                backgroundColor: '#1976d2',
            },
        ],
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Thống kê chi phí theo tháng
            </Typography>
            <Bar data={chartData} />
        </Box>
    );
};

export default UserDashboardPage;