const { DataTypes } = require('sequelize')

const sequelize = require('../config/db');

const { STRING } = DataTypes

const resetPassword = sequelize.define('reset_password', {
    email: {
        type: STRING,
        unique: true,
        allowNull: false
    },
    code: {
        type: STRING,
        unique: true,
        allowNull: false
    }
}, {
    schema: "soapp",
    timestamps: true,
    // freezeTableName: true
})

module.exports = resetPassword 