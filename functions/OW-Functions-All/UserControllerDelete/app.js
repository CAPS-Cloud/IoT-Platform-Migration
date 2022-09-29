// const express = require('express')

const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const BaseController = require('./controllers/BaseController')
const Sensors = require('./models/SensorsModel')
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const Q = require('q');
// const testapp = express()
// const port = '8066'

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { deleteTopic } = require('./connections/kafka')
const { deleteConnectJob } = require('./connections/connect')
const { deleteElasticsearchIndex } = require('./connections/elasticsearch')

// testapp.use(express.json())

// function responseError (res, err) {
//     console.log(err)
//     res.status(400).json(err)
// }

const controller = new (class extends BaseController {
    constructor () {
        super(Users)
        this.findAllOptions = {
          exclude: ['password'],
          include: [{ model: Devices }]
        }
      }

        pre_delete (req, deferred, callback) {
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
                                }).catch(err => {
                                    deferred.reject({
                                        statusCode: 400,
                                        headers: { "Content-Type": "application/json" },
                                        body: { error: err }
                                      });
                                  });
                            });
                            callback();
                        } else {
                            callback();
                        }
                    }).catch(err => {
                        deferred.reject({
                            statusCode: 400,
                            headers: { "Content-Type": "application/json" },
                            body: { error: err }
                          });
                      });
                });
                callback();
            } else {
                callback();
            }
        }).catch(err => {
            deferred.reject({
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: { error: err }
              });
          });
    }

    delete (req) {
        var deferred = Q.defer();
        this.pre_delete(req, deferred, () => {
            this.model.destroy({ where: { id: { [Op.eq]: req.params.id } } }).then(data => {
                // return res.status(200).json({ result: data });
                deferred.resolve({
                    statusCode: 200,
                    headers: { "Content-Type": "application/json" },
                    body: { result: data }
                });
            }).catch(err => {
                deferred.reject({
                    statusCode: 400,
                    headers: { "Content-Type": "application/json" },
                    body: { error: err }
                  });
              });
        });
        return deferred.promise;
    }
})()

function main (params) {
    var parsedReq = parse(params['req']);
    const deletefunc = controller.delete.bind(controller)
    return deletefunc(parsedReq)
}

module.exports.main = main
// let deletefunc = controller.delete.bind(controller)

// testapp.post('/', (req, res) => {
//     var parsedReq = parse(req.body['req'])
//     deletefunc(parsedReq, res)
// })
  
// if (require.main === module) {
//     // app.listen(port);
//     http.createServer(testapp).listen(port, function () {
//       console.log(`Server is listening on port ${port}`)
//     })
// }
  
// module.exports = testapp
  
