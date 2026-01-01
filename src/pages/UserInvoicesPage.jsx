// src/pages/UserInvoicesPage.jsx
import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Table, TableHead, TableRow,
    TableCell, TableBody, Button, Chip
} from '@mui/material';
import api from '../services/api';

const UserInvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        const fetchInvoices = async () => {
            const { data } = await api.get('/user/invoices'); // backend trả các hóa đơn của resident hiện tại
            setInvoices(data);
        };
        fetchInvoices();
    }, []);

    const handlePay = async (invoiceId) => {
        await api.post(`/user/invoices/${invoiceId}/pay`);
        setInvoices((prev) =>
            prev.map((i) =>
                i.id === invoiceId ? { ...i, status: 'PAID' } : i
            )
        );
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
                            <TableCell align="right">{inv.amount.toLocaleString()} đ</TableCell>
                            <TableCell>
                                <Chip
                                    label={inv.status === 'PAID' ? 'Đã trả' : 'Chưa trả'}
                                    color={inv.status === 'PAID' ? 'success' : 'warning'}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>
                                {inv.status === 'UNPAID' && (
                                    <Button size="small" variant="contained" onClick={() => handlePay(inv.id)}>
                                        Thanh toán
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
};

export default UserInvoicesPage;
