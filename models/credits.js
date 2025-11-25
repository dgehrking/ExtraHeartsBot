const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

module.exports = sequelize.define('credits', {
    rank: {
        type: Sequelize.STRING,
        defaultValue: "Rookie",
        primaryKey: true
    },
    uuid: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: true,
        unique: true
    },
    ign: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: true,
    },
    credits: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        primaryKey: true
    }
});