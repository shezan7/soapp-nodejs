const { DataTypes } = require('sequelize')

const sequelize = require('../config/db');

const { STRING, DATE } = DataTypes

const user = sequelize.define('user', {
    email: {
        type: STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: STRING,
        allowNull: false
    },
    first_name: {
        type: STRING,
        allowNull: false
    },
    last_name: {
        type: STRING,
        allowNull: false
    },
    date_of_birth: {
        type: DATE,
        allowNull: false
    },
    gender: {
        type: STRING,
        allowNull: false
    },
    profile_picture: {
        type: STRING,
        allowNull: true
    }
}, {
    schema: "soapp",
    timestamps: true,
    // freezeTableName: true,

    // indexes: [
    //     // Create a unique index on email
    //     {
    //         unique: true,
    //         fields: ['email']
    //     }]
})

module.exports = user 