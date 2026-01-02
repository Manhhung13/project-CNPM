// src/pages/UserInvoicesPage.jsx
import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Table, TableHead, TableRow,
    TableCell, TableBody, Button, Chip, Dialog,
    DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import api from '../services/api';
import maQR from '../assets/maQR.jpg';
const UserInvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [openQR, setOpenQR] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            const { data } = await api.get('/user/invoices');
            setInvoices(data);
        };
        fetchInvoices();
    }, []);

    // Khi bấm nút Thanh toán -> chỉ mở dialog QR
    const handlePayClick = (invoice) => {
        setSelectedInvoice(invoice);
        setOpenQR(true);
    };

    const handleCloseQR = () => {
        setOpenQR(false);
        setSelectedInvoice(null);
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Hóa đơn của bạn
            </Typography>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Mã</TableCell>
                        <TableCell>Tháng</TableCell>
                        <TableCell align="right">Số tiền</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Thao tác</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {invoices.map((inv) => (
                        <TableRow key={inv.id}>
                            <TableCell>{inv.code}</TableCell>
                            <TableCell>{inv.month}</TableCell>
                            <TableCell align="right">
                                {inv.amount.toLocaleString()} đ
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={inv.status === 'PAID' ? 'Đã trả' : 'Chưa trả'}
                                    color={inv.status === 'PAID' ? 'success' : 'warning'}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>
                                {inv.status !== 'PAID' && (
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => handlePayClick(inv)}
                                    >
                                        Thanh toán
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Dialog hiển thị QR */}
            <Dialog open={openQR} onClose={handleCloseQR} maxWidth="xs" fullWidth>
                <DialogTitle>Thanh toán bằng QR</DialogTitle>
                <DialogContent sx={{ textAlign: 'center' }}>
                    {selectedInvoice && (
                        <>
                            <Typography mb={1}>
                                Mã hóa đơn: <strong>{selectedInvoice.code}</strong>
                            </Typography>
                            <Typography mb={2}>
                                Số tiền: <strong>{selectedInvoice.amount.toLocaleString()} đ</strong>
                            </Typography>

                            <img
                                src={maQR}
                                alt="QR thanh toán"
                                style={{ width: 220, height: 220 }}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseQR}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserInvoicesPage;
