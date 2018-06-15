const Sequelize = require('sequelize');


const sequelize = new Sequelize('backend', 'root', 'mP6AMBTSSElsq1oQttZ1', {
  dialect: 'mysql',
  //host: process.env.MARIA_DB,
  host: "iot.pcxd.me",
  port: 3306,
  operatorsAliases: Sequelize.Op,
})


module.exports = sequelize;
