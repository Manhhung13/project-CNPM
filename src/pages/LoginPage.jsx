import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert } from '@mui/material';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = await login(username, password);

        if (user.role === 'manager') {
            navigate('/');          // dashboard manager
        } else if (user.role === 'resident') {
            navigate('/user');      // dashboard user
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
                        Đăng nhập để quản lý chung cư
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
                            Đăng nhập
                        </Button>
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography variant="body2">
                                Chưa có tài khoản? <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2' }}>Đăng ký ngay</Link>
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default LoginPage;
