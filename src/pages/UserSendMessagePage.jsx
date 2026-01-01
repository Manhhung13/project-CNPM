import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import api from '../services/api';

const UserSendMessagePage = () => {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/user/messages', { subject, content });
        setSubject('');
        setContent('');
        // Có thể thêm snackbar báo gửi thành công
    };

    return (
        <Box maxWidth={600}>
            <Typography variant="h5" gutterBottom>
                Gửi thông báo / yêu cầu cho ban quản lý
            </Typography>
            <form onSubmit={handleSubmit}>
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
                <Button variant="contained" type="submit" sx={{ mt: 2 }}>
                    Gửi
                </Button>
            </form>
        </Box>
    );
};

export default UserSendMessagePage;