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
    Tabs,
    Tab,
    Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, History as HistoryIcon, ExitToApp as MoveOutIcon } from '@mui/icons-material';
import api from '../services/api';

const HouseholdManagementPage = () => {
    const [households, setHouseholds] = useState([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [currentTab, setCurrentTab] = useState(0); // 0: Active, 1: History
    const [formData, setFormData] = useState({
        name: '',
        apartmentNumber: '',
        area: '',
        contactNumber: ''
    });

    const fetchHouseholds = async () => {
        try {
            const status = currentTab === 0 ? 'Active' : 'MovedOut';
            const { data } = await api.get(`/management/households?status=${status}`);
            setHouseholds(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchHouseholds();
    }, [currentTab]);

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
        // If in Active tab, this is "Move Out"
        // If in History tab, maybe delete permanently? Or disable?
        // Let's assume current logic is Move Out for active items.

        if (currentTab === 0) {
            if (window.confirm('Bạn có chắc chắn muốn chuyển hộ này đi? Trạng thái sẽ chuyển sang "Đã chuyển đi" và lưu vào lịch sử.')) {
                try {
                    await api.delete(`/management/households/${id}`);
                    fetchHouseholds();
                } catch (error) {
                    console.error(error);
                }
            }
        } else {
            if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn lịch sử này?')) {
                // Implement hard delete if needed, or just disable
                // For now reuse delete endpoint which does soft delete, so it might not do anything if already soft deleted?
                // Or maybe we just hide the delete button for history.
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

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)}>
                    <Tab label="Đang ở (Active)" />
                    <Tab label="Lịch sử (History)" />
                </Tabs>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Số phòng</TableCell>
                            <TableCell>Chủ hộ</TableCell>
                            <TableCell>Diện tích (m2)</TableCell>
                            <TableCell>Liên hệ</TableCell>
                            {currentTab === 1 && <TableCell>Ngày chuyển đi</TableCell>}
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
                                {currentTab === 1 && <TableCell>{row.moveOutDate}</TableCell>}
                                <TableCell align="right">
                                    {currentTab === 0 && (
                                        <>
                                            <IconButton onClick={() => handleEdit(row)} color="primary"><EditIcon /></IconButton>
                                            <IconButton onClick={() => handleDelete(row.id)} color="warning" title="Chuyển đi"><MoveOutIcon /></IconButton>
                                        </>
                                    )}
                                    {currentTab === 1 && (
                                        <Chip label="Đã chuyển đi" color="default" size="small" />
                                    )}
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
