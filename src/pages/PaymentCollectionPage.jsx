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
    TableBody
} from '@mui/material';
import api from '../services/api';

const PaymentCollectionPage = () => {
    const [households, setHouseholds] = useState([]);
    const [fees, setFees] = useState([]);
    const [payments, setPayments] = useState([]);

    const [selectedHousehold, setSelectedHousehold] = useState('');
    const [selectedFee, setSelectedFee] = useState('');
    const [amount, setAmount] = useState('');
    const [details, setDetails] = useState('');
    const [message, setMessage] = useState('');

    const fetchData = async () => {
        try {
            const [hRes, fRes, pRes] = await Promise.all([
                api.get('/management/households'),
                api.get('/financial/fees'),
                api.get('/financial/payments')
            ]);
            setHouseholds(hRes.data);
            setFees(fRes.data);
            setPayments(pRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFeeChange = (e) => {
        const feeId = e.target.value;
        setSelectedFee(feeId);
        const fee = fees.find(f => f.id === feeId);
        if (fee && fee.unitPrice) {
            setAmount(fee.unitPrice);
        } else {
            setAmount('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/financial/payments', {
                householdId: selectedHousehold,
                feeId: selectedFee,
                amount,
                details: JSON.stringify({ note: details })
            });
            setMessage('Ghi nhận thanh toán thành công!');
            fetchData();
            // Reset form
            setSelectedHousehold('');
            setSelectedFee('');
            setAmount('');
            setDetails('');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error(error);
            setMessage('Lỗi khi ghi nhận thanh toán.');
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Thu phí</Typography>

            {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}

            <Paper sx={{ p: 3, mb: 4 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Hộ khẩu"
                                fullWidth
                                value={selectedHousehold}
                                onChange={(e) => setSelectedHousehold(e.target.value)}
                                required
                            >
                                {households.map((h) => (
                                    <MenuItem key={h.id} value={h.id}>
                                        {h.apartmentNumber} - {h.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Khoản thu"
                                fullWidth
                                value={selectedFee}
                                onChange={handleFeeChange}
                                required
                            >
                                {fees.map((f) => (
                                    <MenuItem key={f.id} value={f.id}>
                                        {f.name} ({f.type})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Số tiền (VND)"
                                type="number"
                                fullWidth
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Chi tiết / Ghi chú"
                                fullWidth
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" size="large">
                                Ghi nhận thanh toán
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            <Typography variant="h5" gutterBottom>Thanh toán gần đây</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ngày</TableCell>
                            <TableCell>Hộ khẩu</TableCell>
                            <TableCell>Khoản thu</TableCell>
                            <TableCell>Số tiền</TableCell>
                            <TableCell>Trạng thái</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments.slice(0, 10).map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{new Date(row.paymentDate).toLocaleDateString()}</TableCell>
                                <TableCell>{row.household?.apartmentNumber}</TableCell>
                                <TableCell>{row.fee?.name}</TableCell>
                                <TableCell>{Number(row.amount).toLocaleString()} VND</TableCell>
                                <TableCell>{row.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default PaymentCollectionPage;
