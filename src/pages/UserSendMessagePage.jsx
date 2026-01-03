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
} from '@mui/material';
import api from '../services/api';

const UserSendMessagePage = () => {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [announcements, setAnnouncements] = useState([]);

    // lấy thông báo từ manager
    const fetchAnnouncements = async () => {
        const res = await api.get('/user/announcements');
        setAnnouncements(res.data);
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/user/messages', { subject, content });
        setSubject('');
        setContent('');
        // sau khi gửi yêu cầu, có thể reload lại danh sách nếu cần
        await fetchAnnouncements();
    };

    return (
        <Box maxWidth={600}>
            <Typography variant="h5" gutterBottom>
                Gửi thông báo / yêu cầu cho ban quản lý
            </Typography>

            {/* form gửi yêu cầu */}
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

            {/* danh sách thông báo nhận được */}
            <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
                Thông báo từ ban quản lý
            </Typography>
            <List>
                {announcements.map((a) => (
                    <React.Fragment key={a.id}>
                        <ListItem alignItems="flex-start">
                            <ListItemText
                                primary={a.title}
                                secondary={
                                    <>
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {new Date(a.createdAt).toLocaleString()}
                                        </Typography>
                                        <br />
                                        {a.content}
                                    </>
                                }
                            />
                        </ListItem>
                        <Divider component="li" />
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};

export default UserSendMessagePage;
