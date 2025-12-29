import React from 'react';
import { Box, Paper, Typography, Button, Divider, Avatar } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
    const { user, logout } = useAuth();

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Hồ sơ quản trị</Typography>
            <Paper sx={{ p: 4, maxWidth: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
                        {user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h5">{user?.fullName || 'Quản trị viên'}</Typography>
                        <Typography variant="body1" color="text.secondary">@{user?.username}</Typography>
                    </Box>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom>Thông tin tài khoản</Typography>
                <Typography variant="body1" paragraph>
                    <strong>Role:</strong> Quản trị viên cấp cao
                </Typography>
                <Typography variant="body1" paragraph>
                    <strong>ID:</strong> {user?.id}
                </Typography>

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button variant="outlined" color="primary">Đổi mật khẩu</Button>
                    <Button variant="contained" color="error" onClick={logout}>Đăng xuất</Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ProfilePage;
