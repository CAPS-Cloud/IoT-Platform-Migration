const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const Q = require('q');

const controller = new (class {
    
    update (req, res) {
        var deferred = Q.defer();
        Users.findOne({where: {id: {[Op.eq]: req.authenticated_as.id}}}).then(user => {
            if (!user) {
                // return res.status(400).json({name: 'UserNotFound', errors: [{message: 'User not found'}]});
                deferred.reject({
                    statusCode: 400,
                    headers: { "Content-Type": "application/json" },
                    body: {
                            name: 'UserNotFound',
                            errors: [{message: 'User not found'}]
                        }
                });
            } else {
                Devices.findOne({
                    where: {
                        id: req.params.device_id,
                        userId: {[Op.eq]: user.id}
                    }
                }).then(device => {
                    if (!device) {
                        // return res.status(400).json({name: 'DeviceNotFound', errors: [{message: 'Device not found'}]});
                        deferred.reject({
                            statusCode: 400,
                            headers: { "Content-Type": "application/json" },
                            body: {
                                    name: 'DeviceNotFound',
                                    errors: [{message: 'Device not found'}]
                                }
                        });
                    } else {
                        Sensors.findOne({
                            where: {
                                deviceId: {[Op.eq]: device.id},
                                id: {[Op.eq]: req.params.id}
                            }
                        }).then(data => {
                            if (data) {
                                delete req.body.id;
                                Sensors.update(req.body, {where: {id: {[Op.eq]: req.params.id}}}).then(sensor => {
                                    // return res.status(200).json({result: sensor});
                                    deferred.resolve({
                                        statusCode: 200,
                                        headers: { "Content-Type": "application/json" },
                                        body: { result: sensor }
                                      });
                                }).catch(err => {
                                    deferred.reject({
                                        statusCode: 400,
                                        headers: { "Content-Type": "application/json" },
                                        body: { error: err }
                                      });
                                });
                            } else {
                                // return res.status(400).json({
                                //     name: 'SensorNotFound',
                                //     errors: [{message: 'Sensor not found'}]
                                // });
                                deferred.reject({
                                    statusCode: 400,
                                    headers: { "Content-Type": "application/json" },
                                    body: {
                                            name: 'SensorNotFound',
                                            errors: [{message: 'Sensor not found'}]
                                        }
                                });
                            }
                        });
                    }
                }).catch(err => {
                    deferred.reject({
                        statusCode: 400,
                        headers: { "Content-Type": "application/json" },
                        body: { error: err }
                      });
                });
            }
        }).catch(err => {
            deferred.reject({
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: { error: err }
              });
        });
        return deferred.promise;
    }
})();

function main (params) {
    var parsedReq = parse(params['req']);
    const update = controller.update.bind(controller)
    return update(parsedReq)
}

module.exports.main = main
