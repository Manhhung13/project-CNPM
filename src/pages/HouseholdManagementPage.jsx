import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle,
    TextField, Typography, Grid, MenuItem, Snackbar, Alert, FormControl, InputLabel, Select,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Tooltip
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const HouseholdManagementPage = () => {
    const [open, setOpen] = useState(false);
    const [emptyApartments, setEmptyApartments] = useState([]);
    const [households, setHouseholds] = useState([]);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // STATE MỚI CHO TÍNH NĂNG EDIT
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [formData, setFormData] = useState({
        apartmentId: '',
        fullName: '',
        identityCard: '',
        phoneNumber: '',
        dob: '',
        gender: 'Nam',
        email: ''
    });

    useEffect(() => {
        fetchEmptyApartments();
        fetchHouseholds();
    }, []);

    const fetchHouseholds = async () => {
        try {
            const response = await api.get('/management/households');
            setHouseholds(response.data);
        } catch (error) {
            console.error("Lỗi tải danh sách hộ khẩu:", error);
        }
    };

    const fetchEmptyApartments = async () => {
        try {
            const response = await api.get('/management/apartments/empty');
            setEmptyApartments(response.data);
        } catch (error) {
            console.error("Lỗi tải danh sách phòng trống", error);
        }
    };

    // --- HÀM XÓA MỀM - CHỈ SỬA TEXT ---
    const handleDelete = async (id) => {
        if (window.confirm(
            "👋 Cư dân sẽ rời khỏi căn hộ?\n\n" +
            "• Phòng sẽ được trả về trạng thái Trống\n" +
            "• Hộ khẩu được lưu vào Lịch sử\n" +
            "• Tất cả cư dân trong hộ sẽ bị xóa"
        )) {
            try {
                await api.delete(`/management/households/${id}`);
                setNotification({
                    open: true,
                    message: 'Cập nhật hộ khẩu sang lịch sử thành công!',
                    severity: 'success'
                });
                fetchHouseholds();
                fetchEmptyApartments();
            } catch (error) {
                setNotification({
                    open: true,
                    message: error.response?.data?.message || 'Không thể cập nhật trạng thái hộ khẩu',
                    severity: 'error'
                });
            }
        }
    };

    // --- HÀM MỞ FORM EDIT ---
    const handleEdit = (row) => {
        setIsEditMode(true);
        setSelectedId(row.id);

        setFormData({
            apartmentId: row.apartmentId,
            fullName: row.headResident?.fullName || '',
            identityCard: row.headResident?.identityCard || '',
            phoneNumber: row.headResident?.phoneNumber || '',
            dob: row.headResident?.dob ? new Date(row.headResident.dob).toISOString().split('T')[0] : '',
            gender: row.headResident?.gender || 'Nam',
            email: row.headResident?.email || ''
        });

        if (row.apartment) {
            setEmptyApartments(prev => {
                const exists = prev.find(a => a.id === row.apartment.id);
                if (!exists) return [...prev, row.apartment];
                return prev;
            });
        }

        setOpen(true);
    };

    const handleOpenCreate = () => {
        setIsEditMode(false);
        setFormData({ apartmentId: '', fullName: '', identityCard: '', phoneNumber: '', dob: '', gender: 'Nam', email: '' });
        fetchEmptyApartments();
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setIsEditMode(false);
        setSelectedId(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            if (isEditMode) {
                await api.put(`/management/households/${selectedId}`, formData);
                setNotification({ open: true, message: 'Cập nhật hộ khẩu thành công!', severity: 'success' });
            } else {
                await api.post('/management/households', formData);
                setNotification({ open: true, message: 'Thêm hộ khẩu & Chủ hộ thành công!', severity: 'success' });
            }

            handleClose();
            fetchHouseholds();
            fetchEmptyApartments();
        } catch (error) {
            setNotification({
                open: true,
                message: error.response?.data?.message || 'Có lỗi xảy ra',
                severity: 'error'
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return '';
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Quản lý Cư dân & Hộ khẩu
                </Typography>
                <Box>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchHouseholds} sx={{ mr: 1 }}>
                        Làm mới
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                        + Thêm mới
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
                            <TableCell><strong>Căn hộ</strong></TableCell>
                            <TableCell><strong>Chủ hộ</strong></TableCell>
                            <TableCell><strong>CCCD/CMND</strong></TableCell>
                            <TableCell><strong>SĐT</strong></TableCell>
                            <TableCell><strong>Ngày vào</strong></TableCell>
                            <TableCell><strong>Trạng thái</strong></TableCell>
                            <TableCell align="center"><strong>Hành động</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {households.length > 0 ? (
                            households.map((row, index) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <Typography fontWeight="bold" color="primary">
                                            {row.apartment?.name || 'Chưa gán'}
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            {row.apartment?.area ? `${row.apartment.area} m²` : ''}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight="500">
                                            {row.headResident?.fullName || 'Chưa cập nhật'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{row.headResident?.identityCard}</TableCell>
                                    <TableCell>{row.headResident?.phoneNumber}</TableCell>
                                    <TableCell>{formatDate(row.moveInDate)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.status === 'Active' ? 'Đang ở' : row.status}
                                            color={row.status === 'Active' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {/* NÚT SỬA */}
                                        <Tooltip title="Chỉnh sửa thông tin">
                                            <IconButton
                                                color="primary"
                                                size="small"
                                                onClick={() => handleEdit(row)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>

                                        {/* NÚT XÓA MỀM - SỬA TOOLTIP & MESSAGE */}
                                        <Tooltip title="Cư dân rời khỏi căn hộ">
                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={() => handleDelete(row.id)}
                                                sx={{ ml: 1 }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="textSecondary">
                                        Chưa có dữ liệu hộ khẩu nào.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* MODAL FORM THÊM/SỬA */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                    {isEditMode ? 'Cập nhật thông tin Hộ khẩu' : 'Đăng ký Hộ khẩu & Chủ hộ mới'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                                1. Thông tin Căn hộ
                            </Typography>
                            <FormControl fullWidth required>
                                <InputLabel>Chọn Căn hộ</InputLabel>
                                <Select
                                    name="apartmentId"
                                    value={formData.apartmentId}
                                    onChange={handleChange}
                                    label="Chọn Căn hộ"
                                >
                                    {emptyApartments.map((apt) => (
                                        <MenuItem key={apt.id} value={apt.id}>
                                            {apt.name} - Diện tích: {apt.area} m²
                                            {isEditMode && apt.id === formData.apartmentId ? ' (Hiện tại)' : ''}
                                        </MenuItem>
                                    ))}
                                    {emptyApartments.length === 0 && <MenuItem disabled>Không có căn hộ trống</MenuItem>}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                                2. Thông tin chi tiết Chủ hộ
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField fullWidth required label="Họ và Tên Chủ hộ" name="fullName" value={formData.fullName} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth required label="Số CCCD / CMND" name="identityCard" value={formData.identityCard} onChange={handleChange} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Số điện thoại" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Ngày sinh"
                                name="dob"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={formData.dob}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Giới tính</InputLabel>
                                <Select name="gender" value={formData.gender} label="Giới tính" onChange={handleChange}>
                                    <MenuItem value="Nam">Nam</MenuItem>
                                    <MenuItem value="Nữ">Nữ</MenuItem>
                                    <MenuItem value="Khác">Khác</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} color="inherit">Hủy</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.apartmentId || !formData.fullName || !formData.identityCard}
                    >
                        {isEditMode ? 'Lưu thay đổi' : 'Tạo Hộ Khẩu'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })}>
                <Alert severity={notification.severity}>{notification.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default HouseholdManagementPage;
