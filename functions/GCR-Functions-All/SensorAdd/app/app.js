const express = require('express')
const http = require('http')

const connection = require('./connections/mysql');
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const { addTopic } = require('./connections/kafka')
const { addConnectJob } = require('./connections/connect')
const { addElasticsearchIndex } = require('./connections/elasticsearch')

const testapp = express()
const port = '8100'
testapp.use(express.json())

function responseError (res, err) {
  console.log(err)
  res.status(400).json(err)
}


const controller = new (class {

  _isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  }

  add (req, res) {
   
    Users.findOne({where: {id: {[Op.eq]: req.authenticated_as.id}}}).then(user => {
        if (!user) {
            // return res.status(400).json({name: 'UserNotFound', errors: [{message: 'User not found'}]});
            return res
            .status(400)
            .json({
              name: "UserNotFound",
              errors: [{ message: "User not found" }],
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
                    return res
                    .status(400)
                    .json({
                      name: "DeviceNotFound",
                      errors: [{ message: "Device not found" }],
                    });
                } else if (!req.body.mapping) {
                    return res.status(400).json({
                        name: 'MappingIsRequired',
                        errors: [{message: 'Please enter mapping'}]
                    });
                } else if (!this._isJsonString(req.body.mapping)) {
                    return res.status(400).json({
                        name: 'MappingIsNotValidJSON',
                        errors: [{message: 'Mapping is not valid JSON'}]
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
                                      responseError(res, err)
                                    });
                                }).catch(err => {
                                  responseError(res, err)
                                });
                            }).catch(err => {
                              responseError(res, err)
                            });

                            return res.status(200).json(sensor);
                        }).catch(err => {
                          responseError(res, err)
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
                                        addConnectJob(topic).catch(err => {
                                          responseError(res, err)
                                        });
                                    }).catch(err => {
                                      responseError(res, err)
                                    });
                                }).catch(err => {
                                  responseError(res, err)
                                });
                                return res.status(200).json(sensor);
                            }).catch(err => {
                              responseError(res, err)
                            });
                    }
                }

            }).catch(err => {
              responseError(res, err)
            });
        }
    }).catch(err => {
      responseError(res, err)
    });
    
  }
})();


const add = controller.add.bind(controller)

testapp.post('/', (req, res) => {
  const parsedReq = parse(req.body["req"]);
  // console.log(parsedReq)
  add(parsedReq, res);
});

if (require.main === module) {
  // app.listen(port);
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`);
  });
}