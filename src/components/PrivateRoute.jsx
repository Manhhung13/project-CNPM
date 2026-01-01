import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const PrivateRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Chưa đăng nhập -> về login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Nếu không truyền allowedRoles thì chỉ cần login là vào
    if (!allowedRoles || allowedRoles.length === 0) {
        return <Outlet />;
    }

    // Kiểm tra role
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!rolesArray.includes(user.role)) {
        // Không đủ quyền -> về trang khác (có thể là / hoặc /unauthorized)
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
