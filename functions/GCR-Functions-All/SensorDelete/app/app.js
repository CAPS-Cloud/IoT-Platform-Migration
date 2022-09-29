const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const testapp = express()
const port = '8101'
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const { deleteTopic } = require('./connections/kafka')
const { deleteConnectJob } = require('./connections/connect')
const { deleteElasticsearchIndex } = require('./connections/elasticsearch')

testapp.use(express.json())

function responseError(res, err) {
  console.log(err);
  res.status(400).json(err);
}

const controller = new (class {
  delete(req, res) {
    Users.findOne({ where: { id: { [Op.eq]: req.authenticated_as.id } } })
      .then((user) => {
        if (!user) {
          return res
            .status(400)
            .json({
              name: 'UserNotFound',
              errors: [{ message: 'User not found' }],
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
                return res
                  .status(400)
                  .json({
                    name: "DeviceNotFound",
                    errors: [{ message: "Device not found" }],
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
                        return res.status(200).json({ result: sensor });
                      })
                      .catch((err) => responseError(res, err));
                  } else {
                    return res.status(400).json({
                      name: 'SensorNotFound',
                      errors: [{ message: 'Sensor not found' }],
                    });
                  }
                });
              }
            })
            .catch((err) => responseError(res, err))
        }
      })
      .catch((err) => responseError(res, err))
  }
})()

let deletefunc = controller.delete.bind(controller)

testapp.post('/', (req, res) => {
  var parsedReq = parse(req.body['req'])
  deletefunc(parsedReq, res)
})

if (require.main === module) {
  // app.listen(port);
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`);
  })
}

module.exports = testapp
