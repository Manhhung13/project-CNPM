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
    Select,
    FormControl,
    InputLabel,
    Chip,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Home as HomeIcon,
} from '@mui/icons-material';
import api from '../services/api';

const ResidentManagementPage = () => {
    const [residents, setResidents] = useState([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // form cư dân
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        gender: 'Nam',
        citizenId: '',
        phoneNumber: '',
        householdId: '',
        relationship: '',
    });

    const [activeHouseholds, setActiveHouseholds] = useState([]);

    // dialog tạo tài khoản
    const [accountDialogOpen, setAccountDialogOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);
    const [accountForm, setAccountForm] = useState({
        username: '',
        password: '',
    });

    const fetchResidents = async () => {
        try {
            const { data } = await api.get('/management/residents');
            setResidents(data);
        } catch (error) {
            console.error('Lỗi tải danh sách cư dân:', error);
        }
    };

    const fetchActiveHouseholds = async () => {
        try {
            const { data } = await api.get('/management/households?status=Active');
            setActiveHouseholds(data);
        } catch (error) {
            console.error('Lỗi tải danh sách hộ khẩu:', error);
        }
    };

    useEffect(() => {
        fetchResidents();
        fetchActiveHouseholds();
    }, []);

    const handleOpen = () => {
        setFormData({
            fullName: '',
            dob: '',
            gender: 'Nam',
            citizenId: '',
            phoneNumber: '',
            householdId: '',
            relationship: '',
        });
        setEditMode(false);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditMode(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            if (editMode) {
                await api.put(`/management/residents/${currentId}`, formData);
            } else {
                await api.post('/management/residents', formData);
            }
            fetchResidents();
            handleClose();
        } catch (error) {
            console.error(error);
            alert('Lỗi khi lưu thông tin. Vui lòng kiểm tra lại.');
        }
    };

    const handleEdit = (resident) => {
        setEditMode(true);
        setCurrentId(resident.id);
        setFormData({
            fullName: resident.fullName,
            dob: resident.dob ? resident.dob.split('T')[0] : '',
            gender: resident.gender,
            citizenId: resident.citizenId,
            phoneNumber: resident.phoneNumber,
            householdId: resident.householdId,
            relationship: resident.relationship || '',
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

    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // ====== tạo tài khoản cho cư dân ======
    const openAccountDialog = (resident) => {
        setSelectedResident(resident);
        setAccountForm({
            username: resident.phoneNumber || '',
            password: '',
        });
        setAccountDialogOpen(true);
    };

    const closeAccountDialog = () => {
        setAccountDialogOpen(false);
        setSelectedResident(null);
        setAccountForm({ username: '', password: '' });
    };

    const handleAccountChange = (e) => {
        setAccountForm({ ...accountForm, [e.target.name]: e.target.value });
    };

    const handleCreateAccount = async () => {
        try {
            await api.post(
                `/management/residents/${selectedResident.id}/create-account`,
                {
                    username: accountForm.username,
                    password: accountForm.password,
                    fullName: selectedResident.fullName,
                }
            );
            alert('Tạo tài khoản thành công');
            closeAccountDialog();
            fetchResidents();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Lỗi khi tạo tài khoản');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 3,
                    alignItems: 'center',
                }}
            >
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Quản lý Nhân khẩu
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Thêm nhân khẩu
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>
                                <strong>Họ tên</strong>
                            </TableCell>
                            <TableCell>
                                <strong>Thông tin cá nhân</strong>
                            </TableCell>
                            <TableCell>
                                <strong>Thuộc Hộ Khẩu (Phòng)</strong>
                            </TableCell>
                            <TableCell>
                                <strong>Quan hệ với Chủ hộ</strong>
                            </TableCell>
                            <TableCell align="center">
                                <strong>Hành động</strong>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {residents.map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {row.fullName}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {row.gender} -{' '}
                                        {row.isHost ? (
                                            <Chip
                                                label="Là Chủ hộ"
                                                color="primary"
                                                size="small"
                                                sx={{ height: 20, fontSize: '0.6rem' }}
                                            />
                                        ) : (
                                            'Thành viên'
                                        )}
                                    </Typography>
                                </TableCell>

                                <TableCell>
                                    <Box display="flex" flexDirection="column">
                                        <Typography variant="body2">CCCD: {row.citizenId}</Typography>
                                        <Typography variant="body2">
                                            SĐT: {row.phoneNumber || 'N/A'}
                                        </Typography>
                                        <Typography variant="body2">
                                            Ngày sinh: {formatDateDisplay(row.dob)}
                                        </Typography>
                                    </Box>
                                </TableCell>

                                <TableCell>
                                    {row.household ? (
                                        <Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <HomeIcon fontSize="small" color="action" />
                                                <Typography fontWeight="bold">
                                                    {row.household.apartment?.name || 'Phòng ?'}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" display="block" ml={3}>
                                                Chủ hộ:{' '}
                                                {row.household.headResident?.fullName || '---'}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Chip label="Chưa gán hộ" color="warning" size="small" />
                                    )}
                                </TableCell>

                                <TableCell>
                                    {row.isHost ? (
                                        <Typography fontWeight="bold" color="primary">
                                            Chủ hộ
                                        </Typography>
                                    ) : (
                                        <Typography>{row.relationship || 'Chưa cập nhật'}</Typography>
                                    )}
                                </TableCell>

                                <TableCell align="center">
                                    <Tooltip title="Sửa">
                                        <IconButton onClick={() => handleEdit(row)} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Xóa">
                                        <IconButton
                                            onClick={() => handleDelete(row.id)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>

                                    {/* Tạo tài khoản đăng nhập */}
                                    <Tooltip title="Tạo tài khoản đăng nhập">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            sx={{ ml: 1 }}
                                            onClick={() => openAccountDialog(row)}
                                        >
                                            Tạo tài khoản
                                        </Button>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog thêm / sửa cư dân */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle
                    sx={{ borderBottom: '1px solid #eee', fontWeight: 'bold' }}
                >
                    {editMode ? 'Cập nhật thông tin cư dân' : 'Thêm cư dân vào hộ khẩu'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box
                        display="grid"
                        gridTemplateColumns="repeat(2, 1fr)"
                        gap={2}
                        sx={{ mt: 1 }}
                    >
                        <FormControl fullWidth sx={{ gridColumn: 'span 2' }}>
                            <InputLabel>Chọn Hộ Khẩu (Phòng - Chủ hộ)</InputLabel>
                            <Select
                                name="householdId"
                                value={formData.householdId}
                                label="Chọn Hộ Khẩu (Phòng - Chủ hộ)"
                                onChange={handleChange}
                            >
                                {activeHouseholds.map((h) => (
                                    <MenuItem key={h.id} value={h.id}>
                                        <strong>{h.apartment?.name}</strong> &nbsp; (Chủ hộ:{' '}
                                        {h.headResident?.fullName})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Họ và Tên"
                            name="fullName"
                            fullWidth
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />

                        <FormControl fullWidth required>
                            <InputLabel>Quan hệ với Chủ hộ</InputLabel>
                            <Select
                                name="relationship"
                                value={formData.relationship}
                                label="Quan hệ với Chủ hộ"
                                onChange={handleChange}
                            >
                                <MenuItem value="Vợ">Vợ</MenuItem>
                                <MenuItem value="Chồng">Chồng</MenuItem>
                                <MenuItem value="Con">Con</MenuItem>
                                <MenuItem value="Bố">Bố</MenuItem>
                                <MenuItem value="Mẹ">Mẹ</MenuItem>
                                <MenuItem value="Anh/Chị/Em">Anh/Chị/Em</MenuItem>
                                <MenuItem value="Ông/Bà">Ông/Bà</MenuItem>
                                <MenuItem value="Khác">Khác</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Số CCCD / CMND"
                            name="citizenId"
                            fullWidth
                            value={formData.citizenId}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Số điện thoại"
                            name="phoneNumber"
                            fullWidth
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />

                        <TextField
                            label="Ngày sinh"
                            name="dob"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={formData.dob}
                            onChange={handleChange}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Giới tính</InputLabel>
                            <Select
                                name="gender"
                                value={formData.gender}
                                label="Giới tính"
                                onChange={handleChange}
                            >
                                <MenuItem value="Nam">Nam</MenuItem>
                                <MenuItem value="Nữ">Nữ</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} color="inherit">
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={!formData.fullName || !formData.householdId}
                    >
                        Lưu thông tin
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog tạo tài khoản cư dân */}
            <Dialog open={accountDialogOpen} onClose={closeAccountDialog}>
                <DialogTitle>
                    Tạo tài khoản cho {selectedResident?.fullName}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField
                        margin="dense"
                        label="Username"
                        name="username"
                        fullWidth
                        value={accountForm.username}
                        onChange={handleAccountChange}
                    />
                    <TextField
                        margin="dense"
                        label="Mật khẩu"
                        name="password"
                        type="password"
                        fullWidth
                        value={accountForm.password}
                        onChange={handleAccountChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeAccountDialog}>Hủy</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateAccount}
                        disabled={!accountForm.username || !accountForm.password}
                    >
                        Tạo tài khoản
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ResidentManagementPage;
