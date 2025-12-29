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
    IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';

const HouseholdManagementPage = () => {
    const [households, setHouseholds] = useState([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        apartmentNumber: '',
        area: '',
        contactNumber: ''
    });

    const fetchHouseholds = async () => {
        try {
            const { data } = await api.get('/management/households');
            setHouseholds(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchHouseholds();
    }, []);

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        setEditMode(false);
        setFormData({ name: '', apartmentNumber: '', area: '', contactNumber: '' });
    };

    const handleSave = async () => {
        try {
            if (editMode) {
                await api.put(`/management/households/${currentId}`, formData);
            } else {
                await api.post('/management/households', formData);
            }
            fetchHouseholds();
            handleClose();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (household) => {
        setEditMode(true);
        setCurrentId(household.id);
        setFormData({
            name: household.name,
            apartmentNumber: household.apartmentNumber,
            area: household.area,
            contactNumber: household.contactNumber
        });
        setOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa hộ khẩu này?')) {
            try {
                await api.delete(`/management/households/${id}`);
                fetchHouseholds();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Quản lý hộ khẩu</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Thêm hộ khẩu
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Số phòng</TableCell>
                            <TableCell>Chủ hộ</TableCell>
                            <TableCell>Diện tích (m2)</TableCell>
                            <TableCell>Liên hệ</TableCell>
                            <TableCell align="right">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {households.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.apartmentNumber}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.area}</TableCell>
                                <TableCell>{row.contactNumber}</TableCell>
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
                <DialogTitle>{editMode ? 'Sửa hộ khẩu' : 'Thêm hộ khẩu mới'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Tên chủ hộ"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Số phòng"
                        fullWidth
                        value={formData.apartmentNumber}
                        onChange={(e) => setFormData({ ...formData, apartmentNumber: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Diện tích (m2)"
                        type="number"
                        fullWidth
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Số điện thoại"
                        fullWidth
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
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

export default HouseholdManagementPage;
