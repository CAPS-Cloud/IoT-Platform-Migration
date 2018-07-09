const connection = require('../connections/mysql');
const { responseError, responseSystemError } = require('../utils/express_utils');
const Consumers = require('../models/ConsumersModel');
const Sensors = require('../models/SensorsModel');
const ConsumersSensors = require('../models/ConsumerSensorsModel');
const BaseController =  require('./BaseController');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
    setPermission(req, res){
        Consumers.findOne({ where: { id: { [Op.eq]: req.params.consumer_id } } }).then(data => {
            if(data){
                Sensors.findOne({ where: { id: { [Op.eq]: req.body.sensor_id } } }).then(data3 => {
                    if(data3){
                        data.addSensors(data3).then(data4 => {
                            return res.status(200).json({ result: data4 });
                        }).catch(err => {
                            return responseError(res, err);
                        })
                    } else {
                        return res.status(400).json({ name: 'SensorNotFound', errors: [{ message: 'Device not found' }] });
                    }
                });
            } else {
                return res.status(400).json({ name: 'ConsumerNotFound', errors: [{ message: 'Device not found' }] });
            }
        });
    }
}