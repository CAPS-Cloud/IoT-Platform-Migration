const Sequelize = require('sequelize');
const sequelize = require('../connections/mysql');

const Users = sequelize.define('users', {
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
                msg: 'Username can contain only lowercase a-z, 0-9 and underscores. The length of username have to be between 3 and 30 characters long.',
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

module.exports = Users;