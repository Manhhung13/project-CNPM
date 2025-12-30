const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Import kết nối DB trực tiếp tại đây

const Resident = sequelize.define("Resident", {
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    identityCard: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phoneNumber: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    gender: {
        type: DataTypes.ENUM('Nam', 'Nữ', 'Khác'),
        defaultValue: 'Nam'
    },
    dob: {
        type: DataTypes.DATEONLY
    },
    isHost: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    // --- CÁC TRƯỜNG MỚI THÊM (QUAN TRỌNG) ---
    relationship: {
        type: DataTypes.STRING,
        defaultValue: 'Thành viên',
        comment: 'Mối quan hệ với chủ hộ (Vợ, Con, ...)'
    },
    // Khai báo rõ 2 khóa ngoại này để Sequelize hiểu rõ cấu trúc bảng
    apartmentId: {
        type: DataTypes.INTEGER
    },
    householdId: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'residents', // Đặt tên bảng cố định
});

module.exports = Resident;