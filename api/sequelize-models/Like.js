const { DataTypes } = require('sequelize')

const sequelize = require('../config/db');

const { INTEGER } = DataTypes

const like = sequelize.define('like', {
    user_id: {
        type: INTEGER,
        allowNull: false
    },
    post_id: {
        type: INTEGER,
        allowNull: false
    }
}, {
    schema: "soapp",
    timestamps: true,
    // freezeTableName: true
})

module.exports = like 