const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const testapp = express()
const port = '8098'
const Sequelize = require('sequelize')
const Op = Sequelize.Op

testapp.use(express.json())

function responseError (res, err) {
  console.log(err)
  res.status(400).json(err)
}

const controller = new (class {
  getAll (req, res) {
    Users.findOne({ where: { id: { [Op.eq]: req.authenticated_as.id } } })
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
                Sensors.findAll({ where: { deviceId: { [Op.eq]: device.id } } })
                  .then((datas) => {
                    return res.status(200).json({ result: datas });
                  })
                  .catch((err) => responseError(res, err));
              }
            })
            .catch((err) => responseError(res, err));
        }
      })
      .catch((err) => responseError(res, err));
  }
})();

const getAll = controller.getAll.bind(controller)

testapp.post('/', (req, res) => {
  const parsedReq = parse(req.body["req"]);
  // console.log(parsedReq)
  getAll(parsedReq, res);
});

if (require.main === module) {
  // app.listen(port);
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`);
  });
}
