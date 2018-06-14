const connection = require('../connections/mysql');

connection.query('CREATE TABLE IF NOT EXISTS users(\
        id MEDIUMINT NOT NULL AUTO_INCREMENT,\
        name TEXT,\
        username TEXT,\
        role TEXT,\
        PRIMARY KEY (id)\
    )', function (error, results, fields) {
    if (error) throw error;
});
