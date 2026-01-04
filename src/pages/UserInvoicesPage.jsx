// src/pages/UserInvoicesPage.jsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    TableContainer,
    TextField,
    MenuItem,
} from '@mui/material';
import api from '../services/api';
import maQR from '../assets/maQR.jpg';

const UserInvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [openQR, setOpenQR] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const fetchInvoices = async () => {
            const { data } = await api.get('/user/invoices');
            setInvoices(data || []);
        };
        fetchInvoices();
    }, []);

    const handlePayClick = (invoice) => {
        setSelectedInvoice(invoice);
        setOpenQR(true);
    };

    const handleCloseQR = () => {
        setOpenQR(false);
        setSelectedInvoice(null);
    };

    const formatCurrency = (amount) =>
        `${Number(amount || 0).toLocaleString('vi-VN')} ₫`;

    const filteredInvoices = invoices.filter((inv) => {
        if (!statusFilter) return true;
        if (statusFilter === 'PAID') return inv.status === 'PAID';
        return inv.status !== 'PAID';
    });

    const getStatusChip = (status) => {
        const isPaid = status === 'PAID';
        return (
            <Chip
                label={isPaid ? 'Đã trả' : 'Chưa trả'}
                color={isPaid ? 'success' : 'warning'}
                size="small"
                sx={{ fontWeight: 500 }}
            />
        );
    };

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                py: 3,
                bgcolor: '#f3f4f6',
                minHeight: '100vh',
            }}
        >
            {/* Header + filter */}
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
                <Box>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: 'primary.main' }}
                    >
                        Hóa đơn của bạn
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', mt: 0.5 }}
                    >
                        Danh sách hóa đơn phí dịch vụ căn hộ
                    </Typography>
                </Box>

                <TextField
                    select
                    size="small"
                    label="Lọc theo trạng thái"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ minWidth: 200, bgcolor: 'white' }}
                >
                    <MenuItem value="">Tất cả hóa đơn</MenuItem>
                    <MenuItem value="UNPAID">Chưa trả</MenuItem>
                    <MenuItem value="PAID">Đã trả</MenuItem>
                </TextField>
            </Box>

            {/* Bảng */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    bgcolor: '#ffffff',
                }}
            >
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f9fafb' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, width: '18%' }}>
                                    Mã
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, width: '24%' }}>
                                    Khoản phí
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, width: '14%' }}>
                                    Tháng
                                </TableCell>
                                <TableCell
                                    sx={{ fontWeight: 600, width: '18%' }}
                                    align="right"
                                >
                                    Số tiền
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, width: '14%' }}>
                                    Trạng thái
                                </TableCell>
                                <TableCell
                                    sx={{ fontWeight: 600, width: '12%' }}
                                    align="center"
                                >
                                    Thao tác
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredInvoices.map((inv) => (
                                <TableRow key={inv.id} hover>
                                    <TableCell sx={{ width: '18%' }}>{inv.code}</TableCell>
                                    <TableCell sx={{ width: '24%' }}>
                                        {inv.feeName || '—'}
                                    </TableCell>
                                    <TableCell sx={{ width: '14%' }}>{inv.month}</TableCell>
                                    <TableCell
                                        sx={{ width: '18%', fontWeight: 700, color: 'primary.main' }}
                                        align="right"
                                    >
                                        {formatCurrency(inv.amount)}
                                    </TableCell>
                                    <TableCell sx={{ width: '14%' }}>
                                        {getStatusChip(inv.status)}
                                    </TableCell>
                                    <TableCell sx={{ width: '12%' }} align="center">
                                        {inv.status !== 'PAID' && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => handlePayClick(inv)}
                                                sx={{ borderRadius: 999 }}
                                            >
                                                Thanh toán
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            Không có hóa đơn nào phù hợp điều kiện lọc.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Dialog QR */}
            <Dialog open={openQR} onClose={handleCloseQR} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>Thanh toán bằng QR</DialogTitle>
                <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
                    {selectedInvoice && (
                        <>
                            <Typography mb={0.5}>
                                Mã hóa đơn:{' '}
                                <Typography component="span" fontWeight={600}>
                                    {selectedInvoice.code}
                                </Typography>
                            </Typography>
                            <Typography mb={0.5}>
                                Khoản phí:{' '}
                                <Typography component="span" fontWeight={500}>
                                    {selectedInvoice.feeName || '—'}
                                </Typography>
                            </Typography>
                            <Typography mb={2}>
                                Số tiền:{' '}
                                <Typography component="span" fontWeight={700} color="primary">
                                    {formatCurrency(selectedInvoice.amount)}
                                </Typography>
                            </Typography>

                            <img
                                src={maQR}
                                alt="QR thanh toán"
                                style={{ width: 220, height: 220, borderRadius: 12 }}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseQR}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserInvoicesPage;
