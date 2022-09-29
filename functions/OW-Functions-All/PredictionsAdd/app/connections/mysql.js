const Sequelize = require('sequelize')

const sequelize = new Sequelize('backend', 'root', 'mP6AMBTSSElsq1oQttZ1', {
  dialect: 'mysql',
  host: '10.195.5.180',
  port: 27179,
  //host: "iot.pcxd.me",
  //port: 3306,
  operatorsAliases: Sequelize.Op
})

module.exports = sequelize
