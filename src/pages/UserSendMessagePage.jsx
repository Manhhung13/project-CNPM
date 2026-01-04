// src/pages/UserSendMessagePage.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    Paper,
} from '@mui/material';
import api from '../services/api';

const UserSendMessagePage = () => {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [announcements, setAnnouncements] = useState([]);

    const fetchAnnouncements = async () => {
        const res = await api.get('/user/announcements');
        setAnnouncements(res.data || []);
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !content.trim()) return;

        await api.post('/user/messages', { subject, content });
        setSubject('');
        setContent('');
        await fetchAnnouncements();
    };

    return (
        <Box
            sx={{
                px: { xs: 1.5, md: 3 },
                py: 2,
                bgcolor: '#f3f4f6',
                minHeight: '100vh',
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 3 },
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    maxWidth: 800,
                    bgcolor: '#ffffff',
                }}
            >
                {/* Header */}
                <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}
                >
                    Gửi thông báo / yêu cầu cho ban quản lý
                </Typography>
                <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 3 }}
                >
                    Bạn có thể gửi thắc mắc, yêu cầu hỗ trợ hoặc góp ý cho ban quản lý
                    chung cư tại đây.
                </Typography>

                {/* Form gửi yêu cầu */}
                <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
                    <TextField
                        fullWidth
                        label="Tiêu đề"
                        margin="normal"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Nội dung"
                        margin="normal"
                        multiline
                        minRows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={!subject.trim() || !content.trim()}
                        >
                            Gửi
                        </Button>
                    </Box>
                </Box>

                {/* Danh sách thông báo nhận được */}
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 1.5 }}
                >
                    Thông báo từ ban quản lý
                </Typography>

                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        maxHeight: 360,
                        overflow: 'auto',
                    }}
                >
                    <List sx={{ p: 0 }}>
                        {announcements.length > 0 ? (
                            announcements.map((a) => (
                                <React.Fragment key={a.id}>
                                    <ListItem alignItems="flex-start" sx={{ px: 2, py: 1.5 }}>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{ fontWeight: 600, mb: 0.5 }}
                                                >
                                                    {a.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <>
                                                    <Typography
                                                        component="span"
                                                        variant="caption"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        {new Date(a.createdAt).toLocaleString('vi-VN')}
                                                    </Typography>
                                                    <br />
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        sx={{ color: 'text.primary' }}
                                                    >
                                                        {a.content}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </React.Fragment>
                            ))
                        ) : (
                            <Box sx={{ p: 2 }}>
                                <Typography
                                    variant="body2"
                                    sx={{ color: 'text.secondary' }}
                                >
                                    Hiện chưa có thông báo nào từ ban quản lý.
                                </Typography>
                            </Box>
                        )}
                    </List>
                </Paper>
            </Paper>
        </Box>
    );
};

export default UserSendMessagePage;
