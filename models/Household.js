const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Household = sequelize.define('Household', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // --- KHÓA NGOẠI (FOREIGN KEYS) ---
    apartmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // Liên kết với bảng Apartments
    },
    headResidentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        // Liên kết với bảng Residents (Chủ hộ)
    },

    // --- THÔNG TIN TRẠNG THÁI ---
    status: {
        type: DataTypes.ENUM('Active', 'History'), // Active: Đang ở, History: Đã chuyển đi
        defaultValue: 'Active',
    },
    moveInDate: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
    },
    moveOutDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },

    // --- LƯU Ý: ĐÃ XÓA CÁC TRƯỜNG DƯ THỪA ---
    // - name: Đã có trong Resident (fullName của chủ hộ)
    // - apartmentNumber: Đã có trong Apartment (name)
    // - area: Đã có trong Apartment (area)
    // - contactNumber: Đã có trong Resident (phoneNumber)
}, {
    timestamps: true,
});

module.exports = Household;