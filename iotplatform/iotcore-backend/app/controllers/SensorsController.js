const connection = require('../connections/mysql');
const { responseError, responseSystemError } = require('../utils/express_utils');
const Sensors = require('../models/SensorsModel');
const Devices = require('../models/DevicesModel')
const jwt = require('jsonwebtoken');
const { SENSOR_SECRET } = require('../secrets');
const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const kafka = require('kafka-node');

module.exports = {

    getAll(req, res) {
        console.log("sensors are");

        Sensors.findAll({ where: { deviceId: { [Op.eq]: req.params.id } } }).then(data => {
            if(data){
            return res.status(200).json({ result: data });
            }
            else {
                return res.status(400).json({ name: 'NoSensorsExist', errors: [{ message: 'No Sensors Exist' }] });
            }
        }).catch(err => {
            return responseError(res, err);
        });
    },
    pre_update(data, callback) {
        callback(data);
    },

    update(req, res) {
        Devices.findOne({ where: { id: { [Op.eq]: req.params.device_id } } }).then(data => {
            if(data){
                Sensors.pre_update(req.body, toUpdate => {
                    delete toUpdate.id;
                    Sensors.update(toUpdate, { where: { id: { [Op.eq]: req.params.id } } }).then(data2 => {
                        return res.status(200).json({ result: data2 });
                    }).catch(err => {
                        return responseError(res, err);
                    });
                });
            }
        });
    },

    delete(req, res) {
        Devices.findOne({ where: { id: { [Op.eq]: req.params.device_id } } }).then(data => {
            if(data){
                Sensors.destroy({ where: { id: { [Op.eq]: req.params.id } } }).then(data2 => {
                    return res.status(200).json({ result: data2 });
                }).catch(err => {
                    return responseError(res, err);
                });
            } else {
                return res.status(400).json({ name: 'DeviceNotFound', errors: [{ message: 'Device not found' }] });
            }
        });
    },
    add(req, res) {
        var Producer = kafka.Producer,
        client = new kafka.Client('localhost:2181/'),
        producer = new Producer(client);

        Devices.findById(req.params.id).then(device => {
            console.log("device id",device.id);
            
            device.getSensors().then(res => {
                console.log("Sensors =", res.map(e => e.dataValues));
                Sensors.create({ name: "temperature sensor", description: "test", unit: "unit", path: "path", deviceId: device.id }).then(res2 => {
                    console.log("Added a sensor");
    
                    device.getSensors().then(res3 => {
                        console.log("Sensors =", res3.map(e => e.dataValues));
                    });
                });              
            }).catch(err => {
                console.log("err", err);
                return responseError(res, err);
            });
            client.on("error", (err) => {
                console.log(err);
            });
    
            producer.on('ready', () => {
                producer.on("error", (err) => {
                    console.log(err);
                })
    
                producer.createTopics([req.body.topic], true, (err, data) => {
                    if (err) {
                        console.log("err", err);
                        res.status(500).json({ err });
                    }
                    else {
                        console.log("data", data);
                        res.json({ data });
                    }
                });
            });
            return res.json(device.getSensors());    

        }).catch(err => {
            console.log("err", err);
            return responseError(res, err);        
        });
        
    }
}
