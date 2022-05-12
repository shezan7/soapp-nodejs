const { DataTypes } = require('sequelize')

const sequelize = require('../config/db');

const { INTEGER } = DataTypes

const tag = sequelize.define('tag', {
    post_id: {
        type: INTEGER,
        allowNull: false
    },
    tag_id: {
        type: INTEGER,
        allowNull: false
    }
}, {
    schema: "soapp",
    timestamps: true,
    // freezeTableName: true
})

module.exports = tag