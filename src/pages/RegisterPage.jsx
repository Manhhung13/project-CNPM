import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert } from '@mui/material';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await register(username, password, fullName);
            setSuccess('Đăng ký thành công! Đang chuyển hướng...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 10 }}>
            <Card sx={{ p: 4 }}>
                <CardContent>
                    <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
                        Quản trị BlueMoon
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom align="center" sx={{ mb: 4 }}>
                        Tạo tài khoản mới
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            label="Tên đăng nhập"
                            fullWidth
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <TextField
                            label="Họ và tên"
                            fullWidth
                            margin="normal"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                        <TextField
                            label="Mật khẩu"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            sx={{ mt: 3 }}
                        >
                            Đăng ký
                        </Button>
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography variant="body2">
                                Đã có tài khoản? <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>Đăng nhập ngay</Link>
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default RegisterPage;
