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
    add(req, res) {
        var Producer = kafka.Producer,
        client = new kafka.Client('localhost:2181/'),
        producer = new Producer(client);
        
        var device = Devices.findById(req.body.deviceId);
        if(device){
            device.Sensors.addSensors({name: "temperature sensor", unit:"unit",path:"path"});
            device.save();
            // enable auto.create.topics.enable on Kafka server    
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
        } else {
            return res.status(400).json({ name: 'NoDeviceFound', errors: [{ message: 'No device found' }] });
        }        
    
    }
}