const { DataTypes } = require('sequelize')

const sequelize = require('../config/db');

const { STRING, TEXT } = DataTypes

const post = sequelize.define('post', {
    content: {
        type: TEXT,
        allowNull: false
    },
    picture: {
        type: STRING,
        allowNull: true
    }
}, {
    schema: "soapp",
    timestamps: true,
    // freezeTableName: true
})

module.exports = post 