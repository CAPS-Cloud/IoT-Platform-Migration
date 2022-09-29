const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const fs = require('fs')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const BaseController = require('./controllers/BaseController')
const jwt = require('jsonwebtoken')
const testapp = express()
const port = '8091'
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const DEVICE_SECRET = fs.readFileSync('.keys/jwtRS256.key')

testapp.use(express.json())

function responseError (res, err) {
  // console.log(err)
  res.status(400).json(err)
}

const controller = new (class extends BaseController {
  constructor() {
    super(Devices);
    this.findAllOptions = {
      include: [{ model: Sensors }],
    };
  }

  key(req, res) {
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
          Devices.findOne({
            where: {
              userId: { [Op.eq]: user.id },
              id: { [Op.eq]: req.params.device_id },
            },
          })
            .then((device) => {
              if (device) {
                jwt.sign(
                  {},
                  DEVICE_SECRET,
                  {
                    algorithm: "RS256",
                    issuer: "iotplatform",
                    subject:
                      "" + user.id.toString() + "_" + device.id.toString(),
                  },
                  (err, token) => {
                    return res.json({
                      token,
                      user_id: user.id,
                      device_id: device.id,
                    });
                  }
                );
              } else {
                return res
                  .status(400)
                  .json({
                    name: "DeviceNotFound",
                    errors: [{ message: "Device not found" }],
                  });
              }
            })
            .catch((err) => responseError(res, err));
        }
      })
      .catch((err) => responseError(res, err));
  }
})()

const key = controller.key.bind(controller)

testapp.post('/', (req, res) => {
  const parsedReq = parse(req.body["req"])
  // console.log(parsedReq)
  key(parsedReq, res)
})

if (require.main === module) {
  // app.listen(port);
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`)
  })
}
