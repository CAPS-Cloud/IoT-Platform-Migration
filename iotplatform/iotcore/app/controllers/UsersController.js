const connection = require('../connections/mysql');
const {responseError, responseSystemError} = require('../utils/express_utils');
const Users = require('../models/UsersModel');
const Devices = require('../models/DevicesModel');
const Sensors = require('../models/SensorsModel');
const jwt = require('jsonwebtoken');
const {AUTHENTICATION_SECRET, ROOT_USERNAME, ROOT_PASSWORD} = require('../secrets');
const bcrypt = require('bcryptjs');
const BaseController = require('./BaseController');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const {addTopic, deleteTopic} = require('../connections/kafka');
//const {addFlinkJob, deleteFlinkJob} = require('../connections/flink');
const {addConnectJob, deleteConnectJob} = require('../connections/connect');

const {addElasticsearchIndex, deleteElasticsearchIndex} = require('../connections/elasticsearch');

const controller = new class extends BaseController {

    constructor() {
        super(Users);
        this.findAllOptions = {exclude: ['password'], include: [{model: Devices}]}
    }

    getAll(req, res) {
        console.log(req);
        if (req.authenticated_as.id === -1){
            Users.findAll(this.findAllOptions).then(datas => {
                return res.status(200).json({ result: datas });
            }).catch(err => responseError(res, err));

        }else{
            Users.findById(req.authenticated_as.id).then(user => {
                if (!user) {
                    return res.status(400).json({name: 'UserNotFound', errors: [{message: 'User not found'}]});
                } else {
                    return res.status(200).json({ result: user });
                }
            }).catch(err => responseError(res, err));
        }

    }

    pre_add(req, res, callback) {
        var toAdd = req.body;

        if (toAdd.username == ROOT_USERNAME) {
            return res.status(400).json({
                name: 'RestrictedUsername',
                errors: [{message: '"root" is restricted username'}]
            });
        }

        if (toAdd.password) {
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(toAdd.password, salt);
            toAdd.password = hash;
        }

        callback(toAdd);
    }

    post_add(data, callback) {
        delete data.password;
        callback(data);
    }

    pre_update(data, callback) {
        if (data.username) {
            return res.status(400).json({
                name: 'NotAllowUpdate',
                errors: [{message: 'You are not allowed to change username'}]
            });
        }

        if (data.password) {
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(data.password, salt);
            data.password = hash;
        }
        callback(data);
    }

    pre_delete(req, res, callback) {
        Users.findOne({where: {id: {[Op.eq]: req.params.id}},
            include: [{ model: Devices }]
        }).then(user => {
            if (user) {
                console.log(user);
                const USER_ID = user.id;
                const DEVICES_ID = user.devices.map(device => device.id);

                DEVICES_ID.forEach(device_id => {
                    Devices.findOne({where: {userId: {[Op.eq]: USER_ID}, id: {[Op.eq]: device_id}},
                        include: [{ model: Sensors }]
                    }).then(device => {
                        if (device) {
                            const USER_ID = device.userId;
                            const DEVICE_ID = device.id;
                            const SENSORS_ID = device.sensors.map(sensor => sensor.id);

                            SENSORS_ID.forEach(sensor_id => {
                                Sensors.destroy({where: {id: {[Op.eq]: sensor_id}}}).then(sensor => {

                                    const topic = `${USER_ID}_${DEVICE_ID}_${sensor_id}`;

                                    // Delete Flink Job, then Kafka Topic, then Elasticsearch Index asynchronously.
                                    deleteConnectJob(topic).then(() => {
                                        deleteTopic(topic).then(() => {
                                            deleteElasticsearchIndex(topic).catch(err => console.error(err));
                                        }).catch(err => console.error(`Kafka topic deletion error with exit code: ${err}`));
                                    }).catch(err => console.error(err));
                                }).catch(err => responseError(res, err));
                            });
                            callback();
                        } else {
                            callback();
                        }
                    }).catch(err => responseError(res, err));
                });
                callback();
            } else {
                callback();
            }
        }).catch(err => responseError(res, err));
    }

    signin(req, res) {
        if (req.body.username &&
            req.body.password &&
            req.body.username === ROOT_USERNAME &&
            req.body.password === ROOT_PASSWORD
        ) {
            jwt.sign({}, AUTHENTICATION_SECRET, {
                algorithm: 'RS256',
                issuer: 'iotplatform',
                subject: '-1'
            }, (err, token) => {
                return res.json({token});
            });
        } else if (!req.body.username) {
            return res.status(400).json({name: 'NoUsernameProvided', errors: [{message: 'No username provided'}]});
        } else if (!req.body.password) {
            return res.status(400).json({name: 'NoPasswordProvided', errors: [{message: 'No password provided'}]});
        } else {
            this.model.findOne({where: {username: {[Op.eq]: req.body.username}}}).then(data => {
                if (data && bcrypt.compareSync(req.body.password, data.password)) {
                    jwt.sign({}, AUTHENTICATION_SECRET, {
                        algorithm: 'RS256',
                        issuer: 'iotplatform',
                        subject: data.id.toString()
                    }, (err, token) => {
                        return res.json({token});
                    });
                } else {
                    return res.status(400).json({name: 'InvalidCredential', errors: [{message: 'Invalid credential'}]});
                }
            }).catch(err => responseError(res, err));
        }
    }

    self(req, res) {
        var result = req.authenticated_as;
        delete result.password;
        res.json({result});
    }
};

module.exports = {
    getAll: controller.getAll.bind(controller),
    add: controller.add.bind(controller),
    update: controller.update.bind(controller),
    delete: controller.delete.bind(controller),
    signin: controller.signin.bind(controller),
    self: controller.self.bind(controller),
};
