const mysql = require('mysql');

var connection = mysql.createConnection({
  //host: process.env.MARIA_DB,
  host: "iot.pcxd.me",
  user: 'root',
  password: 'mP6AMBTSSElsq1oQttZ1',
  database: 'backend'
});

connection.connect();

module.exports = connection;
