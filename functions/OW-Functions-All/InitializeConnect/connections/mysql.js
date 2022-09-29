const Sequelize = require('sequelize')
const { mariadbhost, mariadbhostexposedport} = require('./common')

const sequelize = new Sequelize('backend', 'root', 'mP6AMBTSSElsq1oQttZ1', {
  dialect: 'mysql',
  host: mariadbhost,
  port: mariadbhostexposedport,
  //host: "iot.pcxd.me",
  //port: 3306,
  operatorsAliases: Sequelize.Op
})

module.exports = sequelize
