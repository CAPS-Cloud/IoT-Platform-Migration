const connection = require('./connections/mysql');
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const Q = require('q');
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const { addTopic } = require('./connections/kafka')
const { addConnectJob } = require('./connections/connect')
const { addElasticsearchIndex } = require('./connections/elasticsearch')


const controller = new (class {

  _isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  }

  add (req) {
    var deferred = Q.defer();
    Users.findOne({where: {id: {[Op.eq]: req.authenticated_as.id}}}).then(user => {
        if (!user) {
            // return res.status(400).json({name: 'UserNotFound', errors: [{message: 'User not found'}]});
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
                    userId: {[Op.eq]: user.id}
                }
            }).then(device => {
                if (!device) {
                    // return res.status(400).json({name: 'DeviceNotFound', errors: [{message: 'Device not found'}]});
                    deferred.reject({
                      statusCode: 400,
                      headers: { "Content-Type": "application/json" },
                      body: {
                        name: "DeviceNotFound",
                        errors:  [{message: 'Device not found'}],
                      },
                    });
                } else if (!req.body.mapping) {
                    // return res.status(400).json({
                    //     name: 'MappingIsRequired',
                    //     errors: [{message: 'Please enter mapping'}]
                    // });
                    deferred.reject({
                      statusCode: 400,
                      headers: { "Content-Type": "application/json" },
                      body: {
                        name: "MappingIsRequired",
                        errors:  [{message: 'Please enter mapping'}]
                      },
                    });
                } else if (!this._isJsonString(req.body.mapping)) {
                    // return res.status(400).json({
                    //     name: 'MappingIsNotValidJSON',
                    //     errors: [{message: 'Mapping is not valid JSON'}]
                    // });
                    deferred.reject({
                      statusCode: 400,
                      headers: { "Content-Type": "application/json" },
                      body: {
                        name: "MappingIsNotValidJSON",
                        errors: [{message: 'Mapping is not valid JSON'}]
                      },
                    });
                } else {
                    if (!!req.file) {
                        Sensors.create({
                            name: req.body.name, description: req.body.description,
                            deviceId: device.id
                        }).then(sensor => {
                            var topic = `${user.id}_${device.id}_${sensor.id}`;

                            // Add Elasticsearch Index, then Kafka Topic, then Flink Job asynchronously.
                            addElasticsearchIndex(topic, JSON.parse(req.body.mapping)).then(() => {
                                addTopic(topic).then(() => {
                                    addConnectJob(topic).catch(err => {
                                      deferred.reject({
                                        statusCode: 400,
                                        headers: { "Content-Type": "application/json" },
                                        body: { error: err },
                                      });
                                    });
                                }).catch(err => {
                                  deferred.reject({
                                    statusCode: 400,
                                    headers: { "Content-Type": "application/json" },
                                    body: { error: err },
                                  });
                                });
                            }).catch(err => {
                              deferred.reject({
                                statusCode: 400,
                                headers: { "Content-Type": "application/json" },
                                body: { error: err },
                              });
                            });

                            // return res.json(sensor);
                            deferred.resolve({
                              statusCode: 200,
                              headers: { "Content-Type": "application/json" },
                              body: { result: sensor },
                            });
                        }).catch(err => {
                          deferred.reject({
                            statusCode: 400,
                            headers: { "Content-Type": "application/json" },
                            body: { error: err },
                          });
                        });
                    } else {
                            Sensors.create({
                                name: req.body.name,
                                description: req.body.description,
                                deviceId: device.id
                            }).then(sensor => {
                                var topic = `${user.id}_${device.id}_${sensor.id}`;

                                // Add Elasticsearch Index, then Kafka Topic, then Flink Job asynchronously.
                                addElasticsearchIndex(topic, JSON.parse(req.body.mapping)).then(() => {
                                    addTopic(topic).then(() => {
                                        addConnectJob(topic, ).catch(err => {
                                          deferred.reject({
                                            statusCode: 400,
                                            headers: { "Content-Type": "application/json" },
                                            body: { error: err },
                                          });
                                        });
                                    }).catch(err => {
                                      deferred.reject({
                                        statusCode: 400,
                                        headers: { "Content-Type": "application/json" },
                                        body: { error: err },
                                      });
                                    });
                                }).catch(err => {
                                  deferred.reject({
                                    statusCode: 400,
                                    headers: { "Content-Type": "application/json" },
                                    body: { error: err },
                                  });
                                });
                                deferred.resolve({
                                  statusCode: 200,
                                  headers: { "Content-Type": "application/json" },
                                  body: { result: sensor },
                                });
                                // return res.json(sensor);
                            }).catch(err => {
                              deferred.reject({
                                statusCode: 400,
                                headers: { "Content-Type": "application/json" },
                                body: { error: err },
                              });
                            });
                    }
                }

            }).catch(err => {
              deferred.reject({
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: { error: err },
              });
            });
        }
    }).catch(err => {
      deferred.reject({
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: { error: err },
      });
    });
    return deferred.promise;
  }

})();


function main (params) {
  var parsedReq = parse(params['req']);
  const add = controller.add.bind(controller)
  return add(parsedReq)
}

module.exports.main = main


