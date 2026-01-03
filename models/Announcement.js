// backend/models/Announcement.js
module.exports = (sequelize, DataTypes) => {
    const Announcement = sequelize.define('Announcement', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        scope: {
            type: DataTypes.ENUM('all', 'apartment'),
            allowNull: false,
            defaultValue: 'all',
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        // FK: user tạo / gửi thông báo
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // FK tuỳ chọn: căn hộ gửi thông báo
        apartmentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        type: {
            // loại thông báo, có thể chỉnh lại enum cho phù hợp
            type: DataTypes.ENUM('General', 'Request', 'Complaint', 'Maintenance'),
            defaultValue: 'Request',
        },
    }, {
        tableName: 'Announcements',
        timestamps: true, // có createdAt, updatedAt
    });

    Announcement.associate = (models) => {
        // 1. Thông báo thuộc về 1 user
        Announcement.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });

        // 2. Tuỳ chọn: gắn với căn hộ
        Announcement.belongsTo(models.Apartment, {
            foreignKey: 'apartmentId',
            as: 'apartment',
        });
    };

    return Announcement;
};
