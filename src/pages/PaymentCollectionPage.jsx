import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, Paper, TextField, MenuItem, Grid, Alert,
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Chip, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import api from '../services/api';

const PaymentCollectionPage = () => {
    const [households, setHouseholds] = useState([]);
    const [fees, setFees] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form tạo hóa đơn
    const [formData, setFormData] = useState({
        householdId: '',
        feeId: '',
        amount: '',
        dueDate: '',
        details: ''
    });
    const [message, setMessage] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [hRes, fRes, iRes] = await Promise.all([
                api.get('/management/households'),
                api.get('/financial/fees'),
                api.get('/financial/invoices')
            ]);
            setHouseholds(hRes.data);
            setFees(fRes.data);
            setInvoices(iRes.data);
        } catch (error) {
            console.error('Fetch error:', error);
            setMessage('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFeeChange = (e) => {
        const feeId = e.target.value;
        setFormData(prev => ({ ...prev, feeId }));
        const fee = fees.find(f => f.id === parseInt(feeId));
        if (fee?.unitPrice) {
            setFormData(prev => ({ ...prev, amount: fee.unitPrice.toString() }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.householdId || !formData.feeId || !formData.amount) {
            setMessage('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            await api.post('/financial/invoices', {
                householdId: parseInt(formData.householdId),
                feeId: parseInt(formData.feeId),
                amount: parseFloat(formData.amount),
                dueDate: formData.dueDate || null,
                details: formData.details || null
            });
            setMessage('✅ Tạo hóa đơn thành công! User có thể thanh toán.');
            fetchData();
            setFormData({ householdId: '', feeId: '', amount: '', dueDate: '', details: '' });
            setTimeout(() => setMessage(''), 4000);
        } catch (error) {
            setMessage('❌ Lỗi tạo hóa đơn: ' + (error.response?.data?.message || error.message));
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
    };

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString('vi-VN') : '—';
    };

    const getStatusChip = (status) => {
        const config = {
            'pending': { label: 'Chờ thanh toán', color: 'warning' },
            'paid': { label: 'Đã thanh toán', color: 'success' },
            'overdue': { label: 'Quá hạn', color: 'error' },
            'cancelled': { label: 'Đã hủy', color: 'default' }
        };
        const s = config[status];
        return (
            <Chip label={s?.label || status} color={s?.color || 'default'} size="small" variant="outlined" />
        );
    };

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    💰 Quản lý Hóa đơn
                </Typography>
                <IconButton onClick={fetchData} disabled={loading}>
                    <RefreshIcon />
                </IconButton>
            </Box>

            {message && (
                <Alert severity={message.includes('thành công') ? 'success' : 'error'} sx={{ mb: 3 }}>
                    {message}
                </Alert>
            )}

            {/* FORM TẠO HÓA ĐƠN */}
            <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                    📝 Tạo hóa đơn mới (User sẽ thanh toán)
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="👨‍👩‍👧‍👦 Hộ khẩu"
                                fullWidth
                                value={formData.householdId}
                                onChange={handleInputChange}
                                name="householdId"
                                required
                            >
                                <MenuItem value="">Chọn hộ khẩu</MenuItem>
                                {households.map((h) => (
                                    <MenuItem key={h.id} value={h.id}>
                                        {h.apartment?.name || 'N/A'} - {h.headResident?.fullName || 'Chưa cập nhật'}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="💵 Khoản phí"
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

                        <Grid item xs={12} md={4}>
                            <TextField
                                label="💰 Số tiền"
                                type="number"
                                fullWidth
                                value={formData.amount}
                                onChange={handleInputChange}
                                name="amount"
                                required
                                InputProps={{ startAdornment: '₫' }}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                label="📅 Hạn thanh toán"
                                type="date"
                                fullWidth
                                value={formData.dueDate}
                                onChange={handleInputChange}
                                name="dueDate"
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                label="📝 Ghi chú"
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
                                sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}
                            >
                                Tạo hóa đơn
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* BẢNG HÓA ĐƠN */}
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                        📋 Danh sách hóa đơn
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {invoices.length} hóa đơn
                    </Typography>
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
                                <TableCell sx={{ fontWeight: 'bold', width: 100 }}>Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id} hover>
                                    <TableCell><strong>{invoice.invoiceNumber}</strong></TableCell>
                                    <TableCell>
                                        <Box>
                                            <Typography fontWeight={500}>
                                                {invoice.household?.apartment?.name || '—'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {invoice.household?.headResident?.fullName || '—'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{invoice.fee?.name || '—'}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                        {formatCurrency(invoice.totalAmount)}
                                    </TableCell>
                                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                                    <TableCell>
                                        {getStatusChip(invoice.status)}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton size="small" color="primary" title="Chỉnh sửa">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" title="Hủy">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {invoices.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">
                                            Chưa có hóa đơn nào
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default PaymentCollectionPage;
