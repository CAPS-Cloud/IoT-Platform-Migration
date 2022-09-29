const Sequelize = require('sequelize')
const { mariadbhost, mariadbhostexposedport} = require('./common')

const sequelize = new Sequelize('backend', 'root', 'mP6AMBTSSElsq1oQttZ1', {
  dialect: 'mysql',
  host: mariadbhost,
  port: mariadbhostexposedport,
  //host: "iot.pcxd.me",
  //port: 3306,
  operatorsAliases: Sequelize.Op,
  pool: {
    max: 100,
    min: 0,
    idle: 2400000,
    acquire: 90000,
    evict: 2400000
  }
})

module.exports = sequelize
