const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Sensors = require('./models/SensorsModel')
const Consumers = require('./models/ConsumersModel')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const Q = require('q');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const controller = new (class {
  enablePermission (req) {
    var deferred = Q.defer()
    Users.findById(req.authenticated_as.id)
      .then((user) => {
        if (!user) {
          deferred.reject({
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: {
              name: 'UserNotFound',
              errors: [{message: 'User not found'}]
            }
          });
        } else {
          Consumers.findOne({
            where: {
              id: { [Op.eq]: req.params.consumer_id },
              userId: { [Op.eq]: user.id },
            },
          })
            .then((consumer) => {
              if (consumer) {
                Sensors.findOne({
                  where: { id: { [Op.eq]: req.body.sensor_id } },
                }).then((sensor) => {
                  if (sensor) {
                    consumer
                      .getSensors({
                        where: { id: { [Op.eq]: req.body.sensor_id } },
                      })
                      .then((exist) => {
                        if (exist.length > 0) {
                          // return res.status(400).json({
                          //   name: "PermissionExist",
                          //   errors: [{ message: "Permission exist" }],
                          // });
                          deferred.reject({
                            statusCode: 400,
                            headers: { "Content-Type": "application/json" },
                            body: {
                              name: 'PermissionExist',
                              errors: [{ message: "Permission exist" }]
                            }
                          });
                        } else {
                          consumer
                            .addSensors(sensor)
                            .then((consumer_sensor) => {
                              // return res
                              //   .status(200)
                              //   .json({ result: consumer_sensor });
                              deferred.resolve({
                                statusCode: 200,
                                headers: { "Content-Type": "application/json" },
                                body: { result: consumer_sensor }
                              });
                            })
                            .catch((err) => {
                              deferred.reject({
                                statusCode: 400,
                                headers: { "Content-Type": "application/json" },
                                body: { error: err }
                              });
                            });
                        }
                      })
                      .catch((err) => {
                        deferred.reject({
                          statusCode: 400,
                          headers: { "Content-Type": "application/json" },
                          body: { error: err }
                        });
                      });
                  } else {
                    // return res.status(400).json({
                    //   name: "SensorNotFound",
                    //   errors: [{ message: "Sensor not found" }],
                    // });
                    deferred.reject({
                      statusCode: 400,
                      headers: { "Content-Type": "application/json" },
                      body: {
                        name: 'SensorNotFound',
                        errors: [{ message: "Sensor not found" }]
                      }
                    });
                  }
                });
              } else {
                // return res.status(400).json({
                //   name: "ConsumerNotFound",
                //   errors: [{ message: "Consumer not found" }],
                // });
                deferred.reject({
                  statusCode: 400,
                  headers: { "Content-Type": "application/json" },
                  body: {
                    name: 'ConsumerNotFound',
                    errors: [{ message: "Consumer not found" }]
                  }
                });
              }
            })
            .catch((err) => {
              deferred.reject({
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: { error: err }
              });
            });
        }
      })
      .catch((err) => {
        deferred.reject({
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: { error: err }
        });
      });
    return deferred.promise;
  }
})()

function main (params) {
  var parsedReq = parse(params['req']);
  const enablePermission = controller.enablePermission.bind(controller)
  return enablePermission(parsedReq)
}

module.exports.main = main
