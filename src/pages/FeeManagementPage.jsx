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
    MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
        description: ''
    });

    const fetchFees = async () => {
        try {
            const { data } = await api.get('/financial/fees');
            setFees(data);
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
        setFormData({ name: '', type: 'Dịch vụ', unitPrice: '', description: '' });
    };

    const handleSave = async () => {
        try {
            if (editMode) {
                await api.put(`/financial/fees/${currentId}`, formData);
            } else {
                await api.post('/financial/fees', formData);
            }
            fetchFees();
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
            description: fee.description
        });
        setOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khoản thu này?')) {
            try {
                await api.delete(`/financial/fees/${id}`);
                fetchFees();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Quản lý khoản thu</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Thêm khoản thu
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tên khoản thu</TableCell>
                            <TableCell>Loại</TableCell>
                            <TableCell>Đơn giá</TableCell>
                            <TableCell>Mô tả</TableCell>
                            <TableCell align="right">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fees.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.type}</TableCell>
                                <TableCell>{row.unitPrice}</TableCell>
                                <TableCell>{row.description}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleEdit(row)} color="primary"><EditIcon /></IconButton>
                                    <IconButton onClick={() => handleDelete(row.id)} color="error"><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{editMode ? 'Sửa khoản thu' : 'Thêm khoản thu mới'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Tên khoản thu"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <TextField
                        select
                        margin="dense"
                        label="Loại"
                        fullWidth
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Mô tả"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Hủy</Button>
                    <Button onClick={handleSave} variant="contained">Lưu</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FeeManagementPage;
