const connection = require('../connections/mysql');
const { responseError, responseSystemError } = require('../utils/express_utils');
const UsersModel = require('../models/UsersModel');
const jwt = require('jsonwebtoken');
const { AUTHENTICATION_SECRET } = require('../secrets');

function getAll(req, res) {
    connection.query('SELECT * FROM `users`', function (error, results, fields) {
        if (error) {
            return responseSystemError(res, error);
        };
        return res.status(200).json({ result: results });
    });
}

function getById(req, res) {

}

function add(req, res) {
    var toAdd = {};

    for (fieldName in UsersModel) {
        if (!req.body[fieldName]) {
            return responseError(res, `No "${fieldName}" provided`);
        }
        if (!UsersModel[fieldName].validation.test(req.body[fieldName])) {
            return responseError(res, UsersModel[fieldName].validation_error_message);
        }
        toAdd[fieldName] = req.body[fieldName];
    }

    connection.query('SELECT 1 FROM `users` WHERE `username` = ?', [toAdd.username], function (error, results, fields) {
        if (error) {
            return responseSystemError(res, error);
        };
        if (results.length > 0) {
            return responseError(res, 'Username already existed');
        }

        connection.query('INSERT INTO `users` SET ?', toAdd, function (error, results, fields) {
            if (error) {
                return responseSystemError(res, error);
            };

            toAdd["id"] = results.insertId;

            return res.status(200).json({ result: toAdd });
        });
    });
}

function login(req, res) {
    jwt.sign({ id: 1 }, AUTHENTICATION_SECRET, (err, token) => {
        res.json({
            token
        });
    });
}


module.exports = {
    getAll,
    getById,
    add,
    login,
};