const express = require("express");
const http = require("http");
const Users = require("./models/UsersModel");
const Devices = require("./models/DevicesModel");
const Sensors = require("./models/SensorsModel");
const testapp = express();
const port = "8098";
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const authenticate = require("./authentication");

testapp.use(express.json());

const controller = new (class {
  getAll(req, res) {
    if (!req.query?.device_id) {
      return res.status(400).json({
        name: "DeviceIdMissing",
        errors: [{ message: "DeviceID is missing" }],
      });
    }

    authenticate(req)
      .then((authUser) => {
        Users.findOne({ where: { id: { [Op.eq]: authUser.id } } }).then(
          (user) => {
            if (!user) {
              return res.status(400).json({
                name: "UserNotFound",
                errors: [{ message: "User not found" }],
              });
            }

            Devices.findOne({
              where: {
                id: req.query.device_id,
                userId: { [Op.eq]: user.id },
              },
            }).then((device) => {
              if (!device) {
                return res.status(400).json({
                  name: "DeviceNotFound",
                  errors: [{ message: "Device not found" }],
                });
              }

              Sensors.findAll({
                where: { deviceId: { [Op.eq]: device.id } },
              }).then((sensors) => {
                return res.status(200).json({ result: sensors });
              });
            });
          }
        );
      })
      .catch((error) => {
        return res.status(400).json(error);
      });
  }
})();

const getAll = controller.getAll.bind(controller);

testapp.get("/", (req, res) => {
  getAll(req, res);
});

if (require.main === module) {
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`);
  });
}
