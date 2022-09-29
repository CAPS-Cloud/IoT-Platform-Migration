const Sequelize = require('sequelize')
const sequelize = require('../connections/mysql')
const Alerts = require('./AlertsModel')
const Devices = require('./DevicesModel')
const Consumers = require('./ConsumersModel')
const Predictions = require('./PredictionsModel')

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
      isIn: [["ADMIN", "USER"]],
    },
  },
});

Users.hasMany(Devices, { onDelete: 'cascade' });
Devices.belongsTo(Users, { onDelete: 'cascade' });

Users.hasMany(Consumers, { onDelete: 'cascade' });
Consumers.belongsTo(Users, { onDelete: 'cascade' });

Users.hasMany(Predictions, { onDelete: 'cascade' });
Predictions.belongsTo(Users, { onDelete: 'cascade' });

Users.hasMany(Alerts, { onDelete: 'cascade' });
Alerts.belongsTo(Users, { onDelete: 'cascade' });

module.exports = Users;