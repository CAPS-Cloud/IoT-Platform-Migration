const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Sensors = require('./models/SensorsModel')
const Consumers = require('./models/ConsumersModel')
const testapp = express()
const port = '8102'
const Sequelize = require('sequelize')
const Op = Sequelize.Op

testapp.use(express.json())

function responseError (res, err) {
  console.log(err)
  res.status(400).json(err)
}

const controller = new (class {
  enablePermission(req, res) {
    Users.findById(req.authenticated_as.id)
      .then((user) => {
        if (!user) {
          return res
            .status(400)
            .json({
              name: "UserNotFound",
              errors: [{ message: "User not found" }],
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
                          return res.status(400).json({
                            name: "PermissionExist",
                            errors: [{ message: "Permission exist" }],
                          });
                        } else {
                          consumer
                            .addSensors(sensor)
                            .then((consumer_sensor) => {
                              return res
                                .status(200)
                                .json({ result: consumer_sensor });
                            })
                            .catch((err) => responseError(res, err));
                        }
                      })
                      .catch((err) => responseError(res, err));
                  } else {
                    return res.status(400).json({
                      name: "SensorNotFound",
                      errors: [{ message: "Sensor not found" }],
                    });
                  }
                });
              } else {
                return res.status(400).json({
                  name: "ConsumerNotFound",
                  errors: [{ message: "Consumer not found" }],
                });
              }
            })
            .catch((err) => responseError(res, err));
        }
      })
      .catch((err) => responseError(res, err));
  }
})()

const enablePermission = controller.enablePermission.bind(controller)

testapp.post('/', (req, res) => {
  const parsedReq = parse(req.body['req'])
  // console.log(parsedReq)
  enablePermission(parsedReq, res)
})

if (require.main === module) {
  // app.listen(port);
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`)
  })
}
