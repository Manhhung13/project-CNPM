const sequelize = require('../config/database');
const User = require('./User');
const Household = require('./Household');
const Resident = require('./Resident');
const Fee = require('./Fee');
const Payment = require('./Payment');
const Apartment = require('./Apartment');
const Invoice = require('./Invoice');

// --- 1. Quan hệ giữa Căn hộ và Hộ khẩu (Giữ nguyên) ---
Apartment.hasMany(Household, { foreignKey: 'apartmentId', as: 'households' });
Household.belongsTo(Apartment, { foreignKey: 'apartmentId', as: 'apartment' });

// --- 2. Quan hệ giữa User và Resident (Giữ nguyên) ---
User.belongsTo(Resident, { foreignKey: 'residentId', as: 'resident' });
Resident.hasOne(User, { foreignKey: 'residentId', as: 'user' });

// --- 3. Quan hệ thành viên trong Hộ khẩu (Giữ nguyên) ---
// Một hộ khẩu có nhiều thành viên
Household.hasMany(Resident, { foreignKey: 'householdId', as: 'residents' });
Resident.belongsTo(Household, { foreignKey: 'householdId', as: 'household' });

// --- 4. [MỚI] Quan hệ CHỦ HỘ (Quan trọng) ---
// Một hộ khẩu thuộc về (đứng tên bởi) một Chủ hộ cụ thể
Household.belongsTo(Resident, {
    foreignKey: 'headResidentId',
    as: 'headResident',
    constraints: false // Tránh lỗi vòng lặp khóa ngoại khi tạo mới
});
// (Tuỳ chọn) Một người có thể đứng tên chủ hộ cho 1 hộ khẩu
Resident.hasOne(Household, { foreignKey: 'headResidentId', as: 'ownedHousehold' });


// --- 5. [MỚI] Quan hệ trực tiếp Căn hộ - Cư dân ---
// Giúp query nhanh: Lấy danh sách người trong phòng A
Apartment.hasMany(Resident, { foreignKey: 'apartmentId', as: 'residents' });
Resident.belongsTo(Apartment, { foreignKey: 'apartmentId', as: 'apartment' });


// --- 6. Quan hệ Thu phí (Giữ nguyên) ---
Household.hasMany(Payment, { foreignKey: 'householdId', as: 'payments' });
Payment.belongsTo(Household, { foreignKey: 'householdId', as: 'household' });

Fee.hasMany(Payment, { foreignKey: 'feeId', as: 'payments' });
Payment.belongsTo(Fee, { foreignKey: 'feeId', as: 'fee' });

Household.hasMany(Invoice, { foreignKey: 'householdId', as: 'invoices' });
Invoice.belongsTo(Household, { foreignKey: 'householdId', as: 'household' });
Fee.hasMany(Invoice, { foreignKey: 'feeId', as: 'invoices' });
Invoice.belongsTo(Fee, { foreignKey: 'feeId', as: 'fee' });
module.exports = {
    sequelize,
    User,
    Household,
    Resident,
    Fee,
    Payment,
    Apartment,
    Invoice,
};