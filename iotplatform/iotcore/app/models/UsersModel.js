const Sequelize = require('sequelize');
const sequelize = require('../connections/mysql');

module.exports = sequelize.define('users', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            is: {
                args: /^\S+([ ]\S+)*$/,
                msg: 'Name is invalid.',
            },
        },
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: {
                args: /^[a-z0-9_]{3,30}$/,
                msg: 'Username can contain only 3-30 lowercase a-z, 0-9 and _.',
            },
        },
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    role: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isIn: [['ADMIN', 'USER']],
        },
    },
});
