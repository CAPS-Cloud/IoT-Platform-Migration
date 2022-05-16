const Users = require("./models/UsersModel");
const Devices = require("./models/DevicesModel");
const Sensors = require("./models/SensorsModel");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const controller = new (class {
  getAll(req) {
    console.log(req);
    return new Promise((resolve, reject) => {
      if (!req["body"]?.["authUser"] && !req["authUser"]) {
        return reject({
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: { error: "No Authentication Provided" },
        });
      }

      let authUser = !req["authUser"]
        ? req["body"]["authUser"]
        : req["authUser"];

      if (!authUser.id) {
        return reject({
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: { error: "User ID is missing" },
        });
      }

      if (!req["body"]?.["device_id"] && !req["device_id"]) {
        return reject({
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: { error: "Device ID is missing" },
        });
      }

      let deviceId = !req["device_id"]
        ? req["body"]["device_id"]
        : req["device_id"];

      Users.findOne({ where: { id: { [Op.eq]: authUser.id } } })
        .then((user) => {
          if (!user) {
            return reject({
              statusCode: 400,
              headers: { "Content-Type": "application/json" },
              body: {
                name: "UserNotFound",
                error: { message: "User not found" },
              },
            });
          }

          Devices.findOne({
            where: {
              id: deviceId,
              userId: { [Op.eq]: user.id },
            },
          }).then((device) => {
            if (!device) {
              return reject({
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: {
                  name: "DeviceNotFound",
                  error: { message: "Device not found" },
                },
              });
            }

            Sensors.findAll({
              where: { deviceId: { [Op.eq]: device.id } },
            }).then((sensors) => {
              return resolve({
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: { result: sensors },
              });
            });
          });
        })
        .catch((err) => {
          deferred.reject({
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: { error: err },
          });
        });
    });
  }
})();

function main(params) {
  const getAll = controller.getAll.bind(controller);
  return getAll(params);
}

module.exports.main = main;
