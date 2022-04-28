const { DataTypes } = require('sequelize')

const sequelize = require('../config/db');

const { INTEGER, TEXT } = DataTypes

const comment = sequelize.define('comment', {
    user_id: {
        type: INTEGER,
        allowNull: false
    },
    post_id: {
        type: INTEGER,
        allowNull: false
    },
    content: {
        type: TEXT,
        allowNull: false
    }
}, {
    schema: "soapp",
    timestamps: true,
    // freezeTableName: true
})

module.exports = comment 