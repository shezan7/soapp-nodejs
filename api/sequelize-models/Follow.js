const { DataTypes } = require('sequelize')

const sequelize = require('../config/db');

const { INTEGER } = DataTypes

const follow = sequelize.define('follow', {
    user_id: {
        type: INTEGER,
        allowNull: false
    },
    following_user: {
        type: INTEGER,
        allowNull: false
    }
}, {
    schema: "soapp",
    timestamps: true,
    // freezeTableName: true
})

module.exports = follow 