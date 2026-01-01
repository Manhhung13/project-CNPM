import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { id, username, fullName, role }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await api.get('/auth/profile');
                // Đảm bảo luôn có role; nếu backend không trả thì giữ user null
                console.log(data);
                if (data && data.role) {
                    setUser(data);
                } else {
                    console.warn('Profile không có role, logout');
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } catch (error) {
                console.error('Lỗi lấy profile', error);
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    const login = async (username, password) => {
        const { data } = await api.post('/auth/login', { username, password });
        // data: { token, user: { id, username, fullName, role } }
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data.user;
    };

    const register = async (username, password, fullName) => {
        const { data } = await api.post('/auth/register', { username, password, fullName });
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isManager: user?.role === 'manager',
        isResident: user?.role === 'resident',
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
