const Sequelize = require('sequelize');
const sequelize = require('../connections/mysql');
const Devices = require('../models/DevicesModel');

module.exports = sequelize.define('sensors',{
    name:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    unit: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    path: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    device_id: {
        type: Sequelize.INTEGER,
     
        references: {
          // This is a reference to another model
          model: Devices,
     
          // This is the column name of the referenced model
          key: 'id',
          
          // This declares when to check the foreign key constraint. PostgreSQL only.
          deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        },
      },
});