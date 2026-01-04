import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    MenuItem,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../services/api';

const FeeTypes = ['Dịch vụ', 'Đóng góp', 'Gửi xe', 'Tiện ích', 'Khác'];

const FeeManagementPage = () => {
    const [fees, setFees] = useState([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Dịch vụ',
        unitPrice: '',
        description: '',
    });

    // state truy vấn
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');

    const fetchFees = async () => {
        try {
            const { data } = await api.get('/financial/fees');
            setFees(data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        setEditMode(false);
        setCurrentId(null);
        setFormData({
            name: '',
            type: 'Dịch vụ',
            unitPrice: '',
            description: '',
        });
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                unitPrice: Number(formData.unitPrice) || 0,
            };

            if (editMode && currentId) {
                await api.put(`/financial/fees/${currentId}`, payload);
            } else {
                await api.post('/financial/fees', payload);
            }
            await fetchFees();
            handleClose();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (fee) => {
        setEditMode(true);
        setCurrentId(fee.id);
        setFormData({
            name: fee.name,
            type: fee.type,
            unitPrice: fee.unitPrice,
            description: fee.description || '',
        });
        setOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khoản thu này?')) {
            try {
                await api.delete(`/financial/fees/${id}`);
                await fetchFees();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const formatCurrency = (value) => {
        if (value == null) return '—';
        return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
    };

    // áp dụng truy vấn (tên & loại)
    const filteredFees = fees.filter((fee) => {
        const matchSearch = search
            ? fee.name.toLowerCase().includes(search.toLowerCase())
            : true;
        const matchType = filterType ? fee.type === filterType : true;
        return matchSearch && matchType;
    });

    return (
        <Box sx={{ px: { xs: 1.5, md: 3 }, py: 2 }}>
            {/* Header: chữ xanh giống các trang khác */}
            <Box
                sx={{
                    mb: 2.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: 'primary.main' }}
                >
                    Quản lý khoản thu
                </Typography>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    {/* ô truy vấn: tìm theo tên */}
                    <TextField
                        size="small"
                        placeholder="Tìm theo tên khoản thu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ minWidth: 220, bgcolor: 'white' }}
                    />
                    {/* lọc theo loại */}
                    <TextField
                        select
                        size="small"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        sx={{ minWidth: 160, bgcolor: 'white' }}
                        label="Loại"
                    >
                        <MenuItem value="">Tất cả loại</MenuItem>
                        {FeeTypes.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpen}
                        sx={{ borderRadius: 2 }}
                    >
                        Thêm khoản thu
                    </Button>
                </Box>
            </Box>

            {/* Bảng */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                }}
            >
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f9fafb' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Tên khoản thu</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Loại</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Đơn giá</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Mô tả</TableCell>
                                <TableCell
                                    align="right"
                                    sx={{ fontWeight: 600, width: 120 }}
                                >
                                    Hành động
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredFees.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.type}</TableCell>

                                    {/* Đơn giá nổi bật: đậm + màu primary */}
                                    <TableCell
                                        sx={{
                                            fontWeight: 600,
                                            color: 'primary.main',
                                        }}
                                    >
                                        {formatCurrency(row.unitPrice)}
                                    </TableCell>

                                    <TableCell>{row.description || '—'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleEdit(row)}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(row.id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredFees.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            Không tìm thấy khoản thu phù hợp.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Dialog thêm / sửa khoản thu */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>
                    {editMode ? 'Sửa khoản thu' : 'Thêm khoản thu mới'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Tên khoản thu"
                        fullWidth
                        value={formData.name}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                    />
                    <TextField
                        select
                        margin="dense"
                        label="Loại"
                        fullWidth
                        value={formData.type}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, type: e.target.value }))
                        }
                    >
                        {FeeTypes.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Đơn giá (VND)"
                        type="number"
                        fullWidth
                        value={formData.unitPrice}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                unitPrice: e.target.value,
                            }))
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Mô tả"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                description: e.target.value,
                            }))
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Hủy</Button>
                    <Button variant="contained" onClick={handleSave}>
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FeeManagementPage;
