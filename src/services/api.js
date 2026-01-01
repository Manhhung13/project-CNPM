import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Gửi token kèm mọi request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // đảm bảo object headers tồn tại
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// (Tùy chọn) Tự xử lý khi token hết hạn
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Ví dụ: xóa token, reload hoặc chuyển login
            localStorage.removeItem('token');
            // window.location.href = '/login'; // nếu muốn
        }
        return Promise.reject(error);
    }
);

export default api;
