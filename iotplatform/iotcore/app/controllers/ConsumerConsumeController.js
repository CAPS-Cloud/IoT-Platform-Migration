const connection = require('../connections/mysql');
const { responseError, responseSystemError } = require('../utils/express_utils');
const Consumers = require('../models/ConsumersModel');
const Devices = require('../models/DevicesModel');
const Sensors = require('../models/SensorsModel');
const BaseController =  require('./BaseController');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { CONSUMER_PUBLIC } = require('../secrets');
const ELASTICSEARCH_HOST = require('../connections/elasticsearch').host;
const proxy = require('express-http-proxy');
const jwt = require('jsonwebtoken');

const controller = new class {

    get(req, res, next) {
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            if (bearer.length != 2) {
                return res.sendStatus(401);
            }
            const bearerToken = bearer[1];

            jwt.verify(bearerToken, CONSUMER_PUBLIC, { algorithms: ['RS256'], issuer: 'iotplatform' }, (err, authData) => {
                if (!err) {
                    Sensors.findOne({ where: { id: { [Op.eq]: req.params.sensor_id } }, include: [{ model: Consumers }, { model: Devices }] }).then(sensor => {
                        if (sensor) {
                            if (sensor.consumers && sensor.consumers.some(consumer => consumer.id.toString() == authData.sub)) {
                                const topic = `${sensor.device.id}_${sensor.id}`;
                                return proxy(`http://${ELASTICSEARCH_HOST}`, {
                                    proxyReqPathResolver: function (req) {
                                        var parts = req.url.split('?');
                                        var queryString = parts[1];
                                        var updatedPath = parts[0].replace(new RegExp(`^/api/consumers/consume/${req.params.sensor_id}`, 'i'), topic);
                                        return updatedPath + (queryString ? '?' + queryString : '');
                                    }
                                })(req, res, next);
                            } else {
                                console.log(4);
                                return res.sendStatus(401);
                            }
                        } else {
                            return res.sendStatus(401);
                        }
                    }).catch(err => responseError(res, err));
                } else {
                    return res.sendStatus(401);
                }
            })
        } else {
            return res.sendStatus(401);
        }
    }
}

module.exports = {
    get: controller.get.bind(controller),
}
