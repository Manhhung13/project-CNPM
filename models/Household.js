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
  // Active: Đang ở, History: Đã chuyển đi
  status: {
    type: DataTypes.ENUM('Active', 'History'),
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

  // Cột dùng cho soft delete (Sequelize paranoid)
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,   // tạo createdAt, updatedAt, deletedAt
  paranoid: true,     // bật soft delete: destroy() chỉ set deletedAt
  tableName: 'Households', // nếu bảng trong DB là tên này
});

module.exports = Household;
