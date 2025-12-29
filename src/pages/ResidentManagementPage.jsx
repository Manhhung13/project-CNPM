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

const ResidentManagementPage = () => {
    const [residents, setResidents] = useState([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        gender: '',
        citizenId: '',
        phoneNumber: '',
        householdId: ''
    });

    const fetchResidents = async () => {
        try {
            const { data } = await api.get('/management/residents');
            setResidents(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchResidents();
    }, []);

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        setEditMode(false);
        setFormData({ fullName: '', dob: '', gender: '', citizenId: '', phoneNumber: '', householdId: '' });
    };

    const handleSave = async () => {
        try {
            // Basic validation for Household ID (in real app, use a Select/Autocomplete)
            if (editMode) {
                await api.put(`/management/residents/${currentId}`, formData);
            } else {
                await api.post('/management/residents', formData);
            }
            fetchResidents();
            handleClose();
        } catch (error) {
            console.error(error);
            alert('Lỗi khi lưu nhân khẩu. Đảm bảo ID hộ khẩu hợp lệ.');
        }
    };

    const handleEdit = (resident) => {
        setEditMode(true);
        setCurrentId(resident.id);
        setFormData({
            fullName: resident.fullName,
            dob: resident.dob,
            gender: resident.gender,
            citizenId: resident.citizenId,
            phoneNumber: resident.phoneNumber,
            householdId: resident.householdId
        });
        setOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhân khẩu này?')) {
            try {
                await api.delete(`/management/residents/${id}`);
                fetchResidents();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Quản lý nhân khẩu</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Thêm nhân khẩu
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Họ tên</TableCell>
                            <TableCell>Giới tính</TableCell>
                            <TableCell>Ngày sinh</TableCell>
                            <TableCell>Phòng</TableCell> {/* Needs nested data or careful join */}
                            <TableCell align="right">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {residents.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.fullName}</TableCell>
                                <TableCell>{row.gender}</TableCell>
                                <TableCell>{row.dob}</TableCell>
                                <TableCell>{row.household?.apartmentNumber || 'N/A'}</TableCell>
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
                <DialogTitle>{editMode ? 'Sửa nhân khẩu' : 'Thêm nhân khẩu mới'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Họ tên"
                        fullWidth
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Ngày sinh"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Giới tính"
                        fullWidth
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Số CCCD"
                        fullWidth
                        value={formData.citizenId}
                        onChange={(e) => setFormData({ ...formData, citizenId: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Số điện thoại"
                        fullWidth
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="ID Hộ khẩu"
                        type="number"
                        fullWidth
                        helperText="Nhập ID của hộ khẩu mà cư dân này thuộc về"
                        value={formData.householdId}
                        onChange={(e) => setFormData({ ...formData, householdId: e.target.value })}
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

export default ResidentManagementPage;
