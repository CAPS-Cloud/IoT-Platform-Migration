const connection = require('./connections/mysql');
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const Q = require('q');
const Sequelize = require('sequelize')
const Op = Sequelize.Op
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const { deleteTopic } = require('./connections/kafka')
const { deleteConnectJob } = require('./connections/connect')
const { deleteElasticsearchIndex } = require('./connections/elasticsearch')

const controller = new (class {
  delete(req) {
    var deferred = Q.defer();
    Users.findOne({ where: { id: { [Op.eq]: req.authenticated_as.id } } })
      .then((user) => {
        if (!user) {
          deferred.reject({
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: {
              name: "UserNotFound",
              errors: [{ message: "User not found" }],
            },
          });
        } else {
          Devices.findOne({
            where: {
              id: req.params.device_id,
              userId: { [Op.eq]: user.id },
            },
          })
            .then((device) => {
              if (!device) {
                // return res
                //   .status(400)
                //   .json({
                //     name: "DeviceNotFound",
                //     errors: [{ message: "Device not found" }],
                //   });
                deferred.reject({
                  statusCode: 400,
                  headers: { "Content-Type": "application/json" },
                  body: {
                    name: "DeviceNotFound",
                    errors: [{ message: "Device not found" }],
                  },
                });
              } else {
                Sensors.findOne({
                  where: {
                    deviceId: { [Op.eq]: device.id },
                    id: { [Op.eq]: req.params.id },
                  },
                }).then((data) => {
                  if (data) {
                    Sensors.destroy({
                      where: { id: { [Op.eq]: req.params.id } },
                    })
                      .then((sensor) => {
                        var topic = `${user.id}_${device.id}_${req.params.id}`;

                        // Delete Connect Job, then Kafka Topic, then Elasticsearch Index asynchronously.
                        deleteConnectJob(topic)
                          .then(() => {
                            deleteTopic(topic)
                              .then(() => {
                                deleteElasticsearchIndex(topic).catch((err) =>
                                  console.error(err)
                                );
                              })
                              .catch((err) =>
                                console.error(
                                  `Kafka topic deletion error with exit code: ${err}`
                                )
                              );
                          })
                          .catch((err) => console.error(err));
                        // return res.status(200).json({ result: sensor });
                        deferred.resolve({
                          statusCode: 200,
                          headers: { "Content-Type": "application/json" },
                          body: { result: sensor },
                        });
                      })
                      .catch((err) => {
                        deferred.reject({
                          statusCode: 400,
                          headers: { "Content-Type": "application/json" },
                          body: { error: err },
                        });
                      });
                  } else {
                    // return res.status(400).json({
                    //   name: 'SensorNotFound',
                    //   errors: [{ message: 'Sensor not found' }],
                    // });
                    deferred.reject({
                      statusCode: 400,
                      headers: { "Content-Type": "application/json" },
                      body: {
                        name: "SensorNotFound",
                        errors: [{ message: 'Sensor not found' }],
                      },
                    });
                  }
                });
              }
            })
            .catch((err) => {
              deferred.reject({
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: { error: err },
              });
            })
        }
      })
      .catch((err) => {
        deferred.reject({
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: { error: err },
        });
      })
    return deferred.promise;
  }
})()

function main (params) {
  var parsedReq = parse(params["req"]);
  const deletefunc = controller.delete.bind(controller);
  return deletefunc(parsedReq);
}

module.exports.main = main
