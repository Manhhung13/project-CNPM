// src/pages/ManagerAnnouncementsPage.jsx

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
} from '@mui/material';
import api from '../services/api';

const ManagerAnnouncementsPage = () => {
    const [apartments, setApartments] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    // tách state ra cho dễ kiểm soát
    const [scope, setScope] = useState('all');     // 'all' | 'apartment'
    const [apartmentId, setApartmentId] = useState(''); // string
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const fetchApartments = async () => {
        const { data } = await api.get('/managerannouncement/household-heads');
        setApartments(data || []);
    };

    const fetchAnnouncements = async () => {
        const { data } = await api.get('/managerannouncement/announcements');
        setAnnouncements(data || []);
    };

    useEffect(() => {
        fetchApartments();
        fetchAnnouncements();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        await api.post('/managerannouncement/announcements', {
            scope,
            title,
            content,
            apartmentId:
                scope === 'apartment' && apartmentId
                    ? Number(apartmentId)
                    : null,
        });

        // reset form
        setScope('all');
        setApartmentId('');
        setTitle('');
        setContent('');

        fetchAnnouncements();
    };

    console.log('render scope =', scope, 'apartmentId =', apartmentId);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" color="primary" mb={3}>
                Quản lý Thông báo
            </Typography>

            {/* Form tạo thông báo */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" mb={2}>
                    Gửi thông báo cho cư dân
                </Typography>

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 700 }}
                >
                    <FormControl fullWidth>
                        <InputLabel>Phạm vi</InputLabel>
                        <Select
                            label="Phạm vi"
                            value={scope}
                            onChange={(e) => setScope(e.target.value)}
                        >
                            <MenuItem value="all">Tất cả cư dân</MenuItem>
                            <MenuItem value="apartment">Theo căn hộ (phòng)</MenuItem>
                        </Select>
                    </FormControl>

                    {scope === 'apartment' && (
                        <FormControl fullWidth>
                            <InputLabel>Căn hộ</InputLabel>
                            <Select
                                label="Căn hộ"
                                value={apartmentId}
                                onChange={(e) => setApartmentId(e.target.value)}
                            >
                                {apartments.map((a) => (
                                    <MenuItem key={a.id} value={String(a.id)}>
                                        {a.apartmentName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    <TextField
                        label="Tiêu đề"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <TextField
                        label="Nội dung"
                        fullWidth
                        multiline
                        minRows={3}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    <Box>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={
                                !title ||
                                !content ||
                                (scope === 'apartment' && !apartmentId)
                            }
                        >
                            Gửi thông báo
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Danh sách thông báo đã gửi */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>
                    Thông báo đã gửi
                </Typography>

                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Tiêu đề</TableCell>
                            <TableCell>Phạm vi</TableCell>
                            <TableCell>Thời gian</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {announcements.map((a) => (
                            <TableRow key={a.id}>
                                <TableCell>{a.title}</TableCell>
                                <TableCell>
                                    {a.apartment
                                        ? `Căn hộ ${a.apartment.name}`
                                        : <Chip label="Tất cả cư dân" size="small" color="primary" />}
                                </TableCell>
                                <TableCell>
                                    {a.createdAt
                                        ? new Date(a.createdAt).toLocaleString('vi-VN')
                                        : ''}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default ManagerAnnouncementsPage;
