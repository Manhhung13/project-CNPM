import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import api from '../services/api';

const StatCard = ({ title, value, color }) => (
    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: color, color: '#fff' }}>
        <Typography component="h2" variant="h6" gutterBottom>
            {title}
        </Typography>
        <Typography component="p" variant="h3">
            {value}
        </Typography>
    </Paper>
);

const DashboardPage = () => {
    const [stats, setStats] = useState({ totalCollected: 0, householdCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch stats from payment controller and household count
                const { data } = await api.get('/financial/stats');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Tổng quan
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4} lg={3}>
                    <StatCard title="Tổng số hộ" value={stats.householdCount} color="#1976d2" />
                </Grid>
                <Grid item xs={12} md={4} lg={3}>
                    <StatCard title="Phí đã thu" value={`${stats.totalCollected?.toLocaleString()} VND`} color="#2e7d32" />
                </Grid>
                {/* Add more stats here */}
            </Grid>
        </Box>
    );
};

export default DashboardPage;
