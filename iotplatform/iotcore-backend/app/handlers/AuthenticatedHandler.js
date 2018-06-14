const { AUTHENTICATION_SECRET } = require('../secrets');
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Authorization: Bearer <access_token>
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        // Split the space
        const bearer = bearerHeader.split(' ');
        if (bearer.length != 2) {
            // Forbidden
            return res.sendStatus(403);
        }
        const bearerToken = bearer[1];

        jwt.verify(bearerToken, AUTHENTICATION_SECRET, (err, authData) => {
            if (!err && authData.id == 1) {
                return next();
            }
            // Forbidden
            return res.sendStatus(403);
        })
    } else {
        // Forbidden
        return res.sendStatus(403);
    }
}
