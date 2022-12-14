const { AUTHENTICATION_PUBLIC, ROOT_USERNAME } = require('../secrets');
const jwt = require('jsonwebtoken');
const Users = require('../models/UsersModel');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


module.exports = function (req, res, next) {
    const bearerHeader = req.headers['authorization'];
    // console.log("req: ", req);
    // console.log("bearerHeader:", bearerHeader);
    
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');

        console.log("bearer:", bearer);

        if (bearer.length != 2) {
            return next();
        }
        const bearerToken = bearer[1];

        // console.log("bearerToken:", bearerToken)

        jwt.verify(bearerToken, AUTHENTICATION_PUBLIC, { algorithms: ['RS256'], issuer: 'iotplatform' }, (err, authData) => {
            if (!err) {

                // console.log("authData:", authData);
                
                if (authData.sub == '-1') {
                    req.authenticated_as = { id: -1, name: '<root>', username: ROOT_USERNAME, role: 'SUPER_USER' };
                    // console.log("req.authenticated_as:", req.authenticated_as);
                    return next();
                } else {
                    // console.log("authData.sub:", authData.sub)
                    Users.findOne({ where: { id: { [Op.eq]: authData.sub } } }).then(data => {
                        if(data) {
                            req.authenticated_as = data;
                            // console.log("req.authenticated_as", data);
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
