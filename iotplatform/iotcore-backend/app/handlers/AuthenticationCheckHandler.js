const { AUTHENTICATION_SECRET, ROOT_USERNAME } = require('../secrets');
const jwt = require('jsonwebtoken');
const Users = require('../models/UsersModel');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


module.exports = function (req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        if (bearer.length != 2) {
            return next();
        }
        const bearerToken = bearer[1];

        jwt.verify(bearerToken, AUTHENTICATION_SECRET, { algorithm: 'RS256' }, (err, authData) => {
            if (!err) {
                if (authData.id == -1) {
                    req.authenticated_as = { id: -1, name: '<root>', username: ROOT_USERNAME, role: 'SUPER_USER' };
                    return next();
                } else {
                    Users.findOne({ where: { id: { [Op.eq]: authData.id } } }).then(data => {
                        if(data) {
                            req.authenticated_as = data;
                            return next();
                        } else {
                            return next();
                        }
                    });
                }
            } else {
                return next();
            }
        })
    } else {
        return next();
    }
}
