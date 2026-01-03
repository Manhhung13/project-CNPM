// src/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    AppBar,
    Avatar,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Menu,
    MenuItem,
    useTheme,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Home as HomeIcon,
    People as PeopleIcon,
    AttachMoney as FeeIcon,
    Payment as PaymentIcon,
    AccountCircle,
    Apartment as ApartmentIcon,
    Notifications as NotificationsIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleMenu = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/login');
    };

    // MENU THEO ROLE
    const managerMenu = [
        { text: 'Tổng quan', icon: <DashboardIcon />, path: '/' },
        { text: 'Quản lý căn hộ', icon: <ApartmentIcon />, path: '/apartments' },
        { text: 'Quản lý hộ khẩu', icon: <HomeIcon />, path: '/households' },
        { text: 'Quản lý nhân khẩu', icon: <PeopleIcon />, path: '/residents' },
        { text: 'Quản lý khoản thu', icon: <FeeIcon />, path: '/fees' },
        { text: 'Thu phí', icon: <PaymentIcon />, path: '/payments' },
        { text: 'Thông báo', icon: <NotificationsIcon />, path: '/announcements' },
    ];

    const residentMenu = [
        { text: 'Tổng quan', icon: <DashboardIcon />, path: '/user' },
        { text: 'Hóa đơn của tôi', icon: <PaymentIcon />, path: '/user/invoices' },
        { text: 'Liên hệ ban quản lý', icon: <PeopleIcon />, path: '/user/contact' },
    ];

    const menuItems = user?.role === 'manager' ? managerMenu : residentMenu;

    const drawer = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                borderRight: '1px solid',
                borderColor: 'divider',
            }}
        >
            {/* Logo + title */}
            <Toolbar
                sx={{
                    px: 3,
                    py: 2,
                    gap: 1.2,
                }}
            >
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.contrastText',
                        fontWeight: 700,
                        fontSize: 18,
                    }}
                >
                    B
                </Box>
                <Box>
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, letterSpacing: 0.5 }}
                    >
                        BlueMoon
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Apartment System
                    </Typography>
                </Box>
            </Toolbar>

            <Divider />

            {/* MENU */}
            <Box sx={{ flex: 1, overflowY: 'auto', mt: 1 }}>
                <List sx={{ px: 1 }}>
                    {menuItems.map((item) => {
                        const selected = location.pathname === item.path;
                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    selected={selected}
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        mx: 0.5,
                                        borderRadius: 2,
                                        px: 2,
                                        py: 1,
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.main',
                                            color: '#fff',
                                            '&:hover': { bgcolor: 'primary.dark' },
                                            '& .MuiListItemIcon-root': { color: '#fff' },
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 36,
                                            color: selected ? '#fff' : 'text.secondary',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* FOOTER SHORT INFO */}
            <Box sx={{ p: 2 }}>
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: theme.palette.mode === 'light'
                            ? 'primary.light'
                            : 'background.default',
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        Phiên bản
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        BlueMoon v1.0
                    </Typography>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.100' }}>
            <CssBaseline />

            {/* APP BAR */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Toolbar sx={{ minHeight: 72 }}>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {user?.role === 'manager' ? 'Bảng điều khiển' : 'Trang cư dân'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Chào, {user?.fullName || 'Người dùng'} 👋
                        </Typography>
                    </Box>

                    {/* Icon bên phải giống Vuexy */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <IconButton color="inherit" size="large">
                            <NotificationsIcon />
                        </IconButton>

                        <IconButton
                            size="large"
                            edge="end"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                            sx={{ p: 0.5 }}
                        >
                            <Avatar sx={{ width: 36, height: 36 }}>
                                {user?.fullName?.[0] || <AccountCircle />}
                            </Avatar>
                        </IconButton>
                    </Box>

                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem disabled>{user?.fullName || 'Người dùng'}</MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* DRAWER */}
            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                {/* mobile */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                {/* desktop */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* MAIN CONTENT */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    bgcolor: 'grey.100',
                    minHeight: '100vh',
                }}
            >
                <Toolbar sx={{ minHeight: 72 }} />
                <Box sx={{ p: 3 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;
