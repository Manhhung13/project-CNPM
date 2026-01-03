import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    TextField,
    MenuItem,
    Grid,
    Alert,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
    IconButton,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';
import api from '../services/api';

const PaymentCollectionPage = () => {
    const [households, setHouseholds] = useState([]);
    const [fees, setFees] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);

    // form tạo hóa đơn mới (không còn amount)
    const [formData, setFormData] = useState({
        householdId: '',
        feeId: '',
        dueDate: '',
        details: '',
    });

    const [message, setMessage] = useState('');

    // sửa / xóa
    const [editInvoice, setEditInvoice] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // filter
    const [filterHouseholdId, setFilterHouseholdId] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [hRes, fRes, iRes] = await Promise.all([
                api.get('/management/households-for-bill'),
                api.get('/financial/fees'),
                api.get('/financial/invoices'),
            ]);

            setHouseholds(hRes.data || []);
            setFees(fRes.data || []);
            setInvoices(iRes.data || []);
        } catch (error) {
            console.error('Fetch error:', error.response?.data || error);
            setMessage('Lỗi tải dữ liệu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFeeChange = (e) => {
        const feeId = e.target.value;
        setFormData((prev) => ({ ...prev, feeId }));
        // không set amount, backend sẽ dựa unitPrice * số thành viên
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.householdId || !formData.feeId || !formData.dueDate) {
            setMessage('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            await api.post('/financial/invoices', {
                householdId: parseInt(formData.householdId, 10),
                feeId: parseInt(formData.feeId, 10),
                // amount bỏ, backend tự tính totalAmount
                dueDate: formData.dueDate || null,
                details: formData.details || null,
            });
            setMessage('Tạo hóa đơn thành công! User có thể thanh toán.');
            fetchData();
            setFormData({
                householdId: '',
                feeId: '',
                dueDate: '',
                details: '',
            });
            setTimeout(() => setMessage(''), 4000);
        } catch (error) {
            setMessage(
                'Lỗi tạo hóa đơn: ' +
                (error.response?.data?.message || error.message),
            );
        }
    };

    const handleEditInvoice = (invoice) => {
        setEditInvoice({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            householdId: invoice.householdId,
            feeId: invoice.feeId,
            totalAmount: invoice.totalAmount,
            dueDate: invoice.dueDate
                ? invoice.dueDate.toString().split('T')[0]
                : '',
            details: invoice.details || '',
            status: invoice.status,
        });
    };

    const handleSaveInvoice = async () => {
        if (!editInvoice) return;
        try {
            await api.put(`/financial/invoices/${editInvoice.id}`, {
                householdId: editInvoice.householdId,
                feeId: editInvoice.feeId,
                amount: parseFloat(editInvoice.totalAmount),
                dueDate: editInvoice.dueDate || null,
                details: editInvoice.details || null,
                status: editInvoice.status,
            });
            setMessage('Cập nhật hóa đơn thành công');
            setEditInvoice(null);
            fetchData();
            setTimeout(() => setMessage(''), 4000);
        } catch (error) {
            setMessage(
                'Lỗi cập nhật hóa đơn: ' +
                (error.response?.data?.message || error.message),
            );
        }
    };

    const handleDeleteClick = (id) => {
        setConfirmDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            await api.delete(`/financial/invoices/${confirmDeleteId}`);
            setMessage('Xóa hóa đơn thành công');
            setConfirmDeleteId(null);
            fetchData();
            setTimeout(() => setMessage(''), 4000);
        } catch (error) {
            setMessage(
                'Lỗi xóa hóa đơn: ' +
                (error.response?.data?.message || error.message),
            );
        }
    };

    const formatCurrency = (amount) => {
        if (amount == null) return '—';
        return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
    };

    const formatDate = (dateString) => {
        return dateString
            ? new Date(dateString).toLocaleDateString('vi-VN')
            : '—';
    };

    const getStatusChip = (status) => {
        const config = {
            pending: { label: 'Chờ thanh toán', color: 'warning' },
            paid: { label: 'Đã thanh toán', color: 'success' },
            overdue: { label: 'Quá hạn', color: 'error' },
            cancelled: { label: 'Đã hủy', color: 'default' },
        };
        const s = config[status];
        return (
            <Chip
                label={s?.label || status}
                color={s?.color || 'default'}
                size="small"
                variant="outlined"
            />
        );
    };

    const filteredInvoices = invoices.filter((inv) => {
        const matchHousehold = filterHouseholdId
            ? inv.householdId?.toString() === filterHouseholdId
            : true;
        const matchStatus = filterStatus ? inv.status === filterStatus : true;
        return matchHousehold && matchStatus;
    });

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                }}
            >
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Quản lý Hóa đơn
                </Typography>
                <IconButton onClick={fetchData} disabled={loading}>
                    <RefreshIcon />
                </IconButton>
            </Box>

            {message && (
                <Alert
                    severity={message.includes('thành công') ? 'success' : 'error'}
                    sx={{ mb: 3 }}
                >
                    {message}
                </Alert>
            )}

            {/* FORM TẠO HÓA ĐƠN */}
            <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: 3 }}>
                <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ mb: 3 }}
                >
                    Tạo hóa đơn mới (User sẽ thanh toán)
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Hộ khẩu"
                                fullWidth
                                value={formData.householdId || ''}
                                onChange={handleInputChange}
                                name="householdId"
                                required
                            >
                                <MenuItem value="">Chọn hộ khẩu</MenuItem>
                                {households.map((h) => (
                                    <MenuItem key={h.id} value={h.id.toString()}>
                                        {h.apartment?.name || h.name || 'N/A'} -{' '}
                                        {h.headResident?.fullName ||
                                            h.fullName ||
                                            'Chưa cập nhật'}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Khoản phí"
                                fullWidth
                                value={formData.feeId}
                                onChange={handleFeeChange}
                                name="feeId"
                                required
                            >
                                <MenuItem value="">Chọn khoản phí</MenuItem>
                                {fees.map((f) => (
                                    <MenuItem key={f.id} value={f.id}>
                                        {f.name} ({f.type}) - {formatCurrency(f.unitPrice)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Hạn thanh toán"
                                type="date"
                                fullWidth
                                value={formData.dueDate}
                                onChange={handleInputChange}
                                name="dueDate"
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Ghi chú"
                                fullWidth
                                multiline
                                rows={2}
                                name="details"
                                value={formData.details}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                startIcon={<ReceiptIcon />}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    borderRadius: 2,
                                }}
                            >
                                Tạo hóa đơn
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* BẢNG HÓA ĐƠN */}
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3,
                    }}
                >
                    <Typography variant="h6" fontWeight="bold">
                        Danh sách hóa đơn
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                            select
                            size="small"
                            label="Lọc theo hộ khẩu"
                            value={filterHouseholdId}
                            onChange={(e) => setFilterHouseholdId(e.target.value)}
                            sx={{ minWidth: 220 }}
                        >
                            <MenuItem value="">Tất cả hộ</MenuItem>
                            {households.map((h) => (
                                <MenuItem key={h.id} value={h.id.toString()}>
                                    {h.apartment?.name || h.name || 'N/A'} -{' '}
                                    {h.headResident?.fullName ||
                                        h.fullName ||
                                        'Chưa cập nhật'}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            size="small"
                            label="Lọc theo trạng thái"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            sx={{ minWidth: 180 }}
                        >
                            <MenuItem value="">Tất cả trạng thái</MenuItem>
                            <MenuItem value="pending">Chờ thanh toán</MenuItem>
                            <MenuItem value="paid">Đã thanh toán</MenuItem>
                            <MenuItem value="overdue">Quá hạn</MenuItem>
                            <MenuItem value="cancelled">Đã hủy</MenuItem>
                        </TextField>

                        <Typography variant="body2" color="text.secondary">
                            {filteredInvoices.length} hóa đơn
                        </Typography>
                    </Box>
                </Box>

                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Số HD</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Hộ khẩu</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Khoản phí</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Số tiền</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Hạn TT</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Ghi chú</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: 100 }}>
                                    Thao tác
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredInvoices.map((invoice) => (
                                <TableRow key={invoice.id} hover>
                                    <TableCell>
                                        <strong>{invoice.invoiceNumber}</strong>
                                    </TableCell>
                                    <TableCell>
                                        <Box>
                                            <Typography fontWeight={500}>
                                                {invoice.household?.apartment?.name || '—'}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {invoice.household?.headResident?.fullName || '—'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{invoice.fee?.name || '—'}</TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: 'bold',
                                            color: 'primary.main',
                                        }}
                                    >
                                        {formatCurrency(invoice.totalAmount)}
                                    </TableCell>
                                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                                    <TableCell>{getStatusChip(invoice.status)}</TableCell>
                                    <TableCell>{invoice.details || '—'}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            title="Chỉnh sửa"
                                            onClick={() => handleEditInvoice(invoice)}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            title="Hủy"
                                            onClick={() => handleDeleteClick(invoice.id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        align="center"
                                        sx={{ py: 8 }}
                                    >
                                        <Typography color="text.secondary">
                                            Không có hóa đơn nào phù hợp
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Dialog sửa hóa đơn */}
            {editInvoice && (
                <Paper
                    sx={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1300,
                        p: 3,
                        minWidth: 500,
                    }}
                    elevation={6}
                >
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Sửa hóa đơn {editInvoice.invoiceNumber}
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Hộ khẩu"
                                fullWidth
                                value={editInvoice.householdId}
                                onChange={(e) =>
                                    setEditInvoice((prev) => ({
                                        ...prev,
                                        householdId: parseInt(e.target.value, 10),
                                    }))
                                }
                            >
                                {households.map((h) => (
                                    <MenuItem key={h.id} value={h.id}>
                                        {h.apartment?.name || 'N/A'} -{' '}
                                        {h.headResident?.fullName || 'Chưa cập nhật'}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Khoản phí"
                                fullWidth
                                value={editInvoice.feeId}
                                onChange={(e) =>
                                    setEditInvoice((prev) => ({
                                        ...prev,
                                        feeId: parseInt(e.target.value, 10),
                                    }))
                                }
                            >
                                {fees.map((f) => (
                                    <MenuItem key={f.id} value={f.id}>
                                        {f.name} ({f.type}) - {formatCurrency(f.unitPrice)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Số tiền"
                                type="number"
                                fullWidth
                                value={editInvoice.totalAmount}
                                onChange={(e) =>
                                    setEditInvoice((prev) => ({
                                        ...prev,
                                        totalAmount: e.target.value,
                                    }))
                                }
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Hạn thanh toán"
                                type="date"
                                fullWidth
                                value={editInvoice.dueDate}
                                onChange={(e) =>
                                    setEditInvoice((prev) => ({
                                        ...prev,
                                        dueDate: e.target.value,
                                    }))
                                }
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                label="Trạng thái"
                                fullWidth
                                value={editInvoice.status}
                                onChange={(e) =>
                                    setEditInvoice((prev) => ({
                                        ...prev,
                                        status: e.target.value,
                                    }))
                                }
                            >
                                <MenuItem value="pending">Chờ thanh toán</MenuItem>
                                <MenuItem value="paid">Đã thanh toán</MenuItem>
                                <MenuItem value="overdue">Quá hạn</MenuItem>
                                <MenuItem value="cancelled">Đã hủy</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Ghi chú"
                                fullWidth
                                multiline
                                rows={2}
                                value={editInvoice.details}
                                onChange={(e) =>
                                    setEditInvoice((prev) => ({
                                        ...prev,
                                        details: e.target.value,
                                    }))
                                }
                            />
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            display="flex"
                            justifyContent="flex-end"
                            gap={1}
                        >
                            <Button onClick={() => setEditInvoice(null)}>Hủy</Button>
                            <Button variant="contained" onClick={handleSaveInvoice}>
                                Lưu thay đổi
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Confirm xóa hóa đơn */}
            {confirmDeleteId && (
                <Paper
                    sx={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1300,
                        p: 3,
                        minWidth: 300,
                    }}
                    elevation={6}
                >
                    <Typography mb={2}>
                        Bạn có chắc chắn muốn xóa hóa đơn này?
                    </Typography>
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                        <Button onClick={() => setConfirmDeleteId(null)}>Hủy</Button>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={handleConfirmDelete}
                        >
                            Xóa
                        </Button>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default PaymentCollectionPage;
