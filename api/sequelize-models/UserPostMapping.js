const { DataTypes } = require('sequelize')

const sequelize = require('../config/db');

const { INTEGER } = DataTypes

const userPostMapping = sequelize.define('user_post_mapping', {
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
    timestamps: false,
    // freezeTableName: true
})

module.exports = userPostMapping 