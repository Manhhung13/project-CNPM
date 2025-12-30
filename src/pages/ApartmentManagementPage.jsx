import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Chip,
    Tooltip,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Apartment as ApartmentIcon
} from '@mui/icons-material';

const ApartmentManagementPage = () => {
    // State dữ liệu
    const [apartments, setApartments] = useState([]);

    // State Modal & Form
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ name: '', area: '' });

    // State thông báo (Snackbar)
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // Hàm lấy dữ liệu
    const fetchApartments = async () => {
        try {
            const response = await api.get('/management/apartments');
            setApartments(response.data || response);
        } catch (error) {
            showNotification('Không thể tải dữ liệu danh sách căn hộ', 'error');
            console.error(error);
        }
    };

    useEffect(() => {
        fetchApartments();
    }, []);

    // Xử lý đóng/mở Modal
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setEditMode(false);
        setCurrentId(null);
        setFormData({ name: '', area: '' });
    };

    // Xử lý hiển thị thông báo
    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };
    const handleCloseNotification = () => setNotification({ ...notification, open: false });

    // Xử lý nhập liệu
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'area' ? value : value
        }));
    };

    // Chuẩn bị form Sửa
    const handleEdit = (apartment) => {
        setEditMode(true);
        setCurrentId(apartment.id);
        setFormData({
            name: apartment.name,
            area: apartment.area
        });
        handleOpen();
    };

    // Xử lý Lưu (Create/Update)
    const handleSave = async () => {
        // Validate cơ bản
        if (!formData.name || !formData.area) {
            showNotification('Vui lòng điền đầy đủ thông tin', 'warning');
            return;
        }

        try {
            const payload = {
                ...formData,
                area: parseFloat(formData.area) // Đảm bảo area là số
            };

            if (editMode) {
                await api.put(`/management/apartments/${currentId}`, payload);
                showNotification('Cập nhật căn hộ thành công');
            } else {
                await api.post('/management/apartments', payload);
                showNotification('Thêm mới căn hộ thành công');
            }
            fetchApartments();
            handleClose();
        } catch (error) {
            console.error("Lỗi lưu dữ liệu:", error);
            showNotification('Có lỗi xảy ra khi lưu dữ liệu', 'error');
        }
    };

    // Xử lý Xóa
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa căn hộ này không? Hành động này không thể hoàn tác.")) {
            try {
                await api.delete(`/management/apartments/${id}`);
                showNotification('Đã xóa căn hộ thành công');
                fetchApartments();
            } catch (error) {
                console.error("Lỗi xóa:", error);
                showNotification('Không thể xóa căn hộ này', 'error');
            }
        }
    };

    // Helper hiển thị màu sắc trạng thái (Chip)
    const getStatusChip = (status) => {
        let color = 'default';
        let label = status;

        switch (status) {
            case 'Active':
                color = 'success';
                label = 'Đang ở (Active)';
                break;
            case 'Maintenance':
                color = 'warning';
                label = 'Bảo trì (Maintenance)';
                break;
            case 'Empty':
                color = 'info'; // Hoặc 'default'
                label = 'Trống (Empty)';
                break;
            default:
                color = 'default';
        }
        return <Chip label={label} color={color} size="small" variant="outlined" />;
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={1}>
                    <ApartmentIcon color="primary" fontSize="large" />
                    <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
                        Quản lý Căn hộ
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                    Thêm Căn hộ
                </Button>
            </Box>

            {/* Bảng dữ liệu */}
            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table sx={{ minWidth: 650 }} aria-label="apartment table">
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tên Căn Hộ</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Diện Tích (m²)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Hành Động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {apartments.length > 0 ? (
                            apartments.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                                    <TableCell>{row.area}</TableCell>
                                    <TableCell>
                                        {getStatusChip(row.status)}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Chỉnh sửa">
                                            <IconButton color="primary" onClick={() => handleEdit(row)} size="small">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Xóa">
                                            <IconButton color="error" onClick={() => handleDelete(row.id)} size="small">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Chưa có dữ liệu căn hộ nào.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal Dialog Thêm/Sửa */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {editMode ? 'Cập nhật thông tin Căn hộ' : 'Thêm Căn hộ mới'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Tên Căn hộ (Số phòng)"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            autoFocus
                            placeholder="Ví dụ: P101, A205..."
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Diện tích (m²)"
                            name="area"
                            type="number"
                            value={formData.area}
                            onChange={handleChange}
                            inputProps={{ step: "0.01", min: "0" }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleClose} color="inherit">Hủy bỏ</Button>
                    <Button onClick={handleSave} variant="contained" disabled={!formData.name || !formData.area}>
                        {editMode ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Thông báo Alert (Snackbar) */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ApartmentManagementPage;