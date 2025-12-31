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
    Alert,
    Grid
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Apartment as ApartmentIcon,
    History as HistoryIcon
} from '@mui/icons-material';

const ApartmentManagementPage = () => {
    // State dữ liệu căn hộ
    const [apartments, setApartments] = useState([]);

    // State Modal & Form
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ name: '', area: '' });

    // State thông báo (Snackbar)
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // STATE LỊCH SỬ CHỦ HỘ - MỚI THÊM
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyItems, setHistoryItems] = useState([]);
    const [selectedApartment, setSelectedApartment] = useState(null);

    // Hàm lấy dữ liệu căn hộ
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

    // HÀM LẤY LỊCH SỬ CHỦ HỘ - MỚI THÊM
    const fetchHouseholdHistory = async (apartmentId) => {
        try {
            setHistoryLoading(true);
            const response = await api.get(`/management/apartments/${apartmentId}/household-history`);
            setHistoryItems(response.data || []);
        } catch (error) {
            console.error('Lỗi tải lịch sử:', error);
            showNotification('Không tải được lịch sử chủ hộ', 'error');
        } finally {
            setHistoryLoading(false);
        }
    };

    // Mở modal lịch sử
    const handleOpenHistory = async (apartment) => {
        console.log(' Apartment data:', apartment); // XEM apartment.id có gì

        if (!apartment?.id) {
            showNotification('Không thể tải lịch sử: Căn hộ không hợp lệ', 'error');
            return;
        }

        console.log('Gọi API với ID:', apartment.id); //  XEM ID gửi đi

        setSelectedApartment(apartment);
        setHistoryOpen(true);
        await fetchHouseholdHistory(apartment.id);
    };

    // Đóng modal lịch sử
    const handleCloseHistory = () => {
        setHistoryOpen(false);
        setHistoryItems([]);
        setSelectedApartment(null);
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
                color = 'info';
                label = 'Trống (Empty)';
                break;
            case 'Available':
                color = 'info';
                label = 'Có sẵn (Available)';
                break;
            default:
                color = 'default';
        }
        return <Chip label={label} color={color} size="small" variant="outlined" />;
    };

    // Format ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('vi-VN');
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
                                        {/* Nút Sửa */}
                                        <Tooltip title="Chỉnh sửa">
                                            <IconButton color="primary" onClick={() => handleEdit(row)} size="small">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>

                                        {/* Nút Xem Lịch sử - MỚI THÊM */}
                                        <Tooltip title="Xem lịch sử chủ hộ">
                                            <IconButton
                                                color="info"
                                                onClick={() => handleOpenHistory(row)}
                                                size="small"
                                                sx={{ ml: 0.5 }}
                                            >
                                                <HistoryIcon />
                                            </IconButton>
                                        </Tooltip>

                                        {/* Nút Xóa */}
                                        <Tooltip title="Xóa">
                                            <IconButton color="error" onClick={() => handleDelete(row.id)} size="small" sx={{ ml: 0.5 }}>
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

            {/* Modal Dialog Thêm/Sửa Căn hộ */}
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

            {/* MODAL LỊCH SỬ CHỦ HỘ - MỚI THÊM */}
            <Dialog open={historyOpen} onClose={handleCloseHistory} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                    📋 Lịch sử các đời chủ hộ - {selectedApartment?.name || ''}
                </DialogTitle>
                <DialogContent dividers sx={{ p: 3 }}>
                    {historyLoading ? (
                        <Box display="flex" justifyContent="center" p={3}>
                            <Typography>Đang tải lịch sử...</Typography>
                        </Box>
                    ) : historyItems.length === 0 ? (
                        <Box p={3} textAlign="center">
                            <Typography variant="h6" color="textSecondary">
                                📭 Chưa có lịch sử chủ hộ nào cho căn hộ này
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell><strong>STT</strong></TableCell>
                                        <TableCell><strong>Chủ hộ</strong></TableCell>
                                        <TableCell><strong>CCCD/CMND</strong></TableCell>
                                        <TableCell><strong>SĐT</strong></TableCell>
                                        <TableCell><strong>Ngày vào</strong></TableCell>
                                        <TableCell><strong>Ngày rời</strong></TableCell>
                                        <TableCell><strong>Trạng thái</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {historyItems.map((item, index) => (
                                        <TableRow key={item.id} hover>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <strong>{item.headResident?.fullName || '—'}</strong>
                                            </TableCell>
                                            <TableCell>{item.headResident?.identityCard || '—'}</TableCell>
                                            <TableCell>{item.headResident?.phoneNumber || '—'}</TableCell>
                                            <TableCell>{formatDate(item.moveInDate)}</TableCell>
                                            <TableCell>{formatDate(item.moveOutDate)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.status === 'Active' ? 'Đang ở' : 'Đã rời'}
                                                    size="small"
                                                    color={item.status === 'Active' ? 'success' : 'default'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseHistory} variant="contained">
                        Đóng
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
