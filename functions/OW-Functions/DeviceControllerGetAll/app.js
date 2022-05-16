const Users = require("./models/UsersModel");
const Devices = require("./models/DevicesModel");
const Sensors = require("./models/SensorsModel");
const BaseController = require("./controllers/BaseController");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const controller = new (class extends BaseController {
  constructor() {
    super(Devices);
    this.findAllOptions = {
      include: [{ model: Sensors }],
    };
  }

  getAll(req) {
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
          body: { error: "ID is missing" },
        });
      }

      if (authUser.id === -1) {
        Devices.findAll({})
          .then((devices) => {
            return resolve({
              statusCode: 200,
              headers: { "Content-Type": "application/json" },
              body: { result: devices },
            });
          })
          .catch((err) => {
            return reject({
              statusCode: 400,
              headers: { "Content-Type": "application/json" },
              body: { error: err },
            });
          });
      } else {
        Users.findById(authUser.id)
          .then((user) => {
            if (!user) {
              return reject({
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: {
                  error: { message: "User not found" },
                },
              });
            }

            Devices.findAll({
              where: { userId: { [Op.eq]: user.id } },
              include: [{ model: Sensors }],
            })
              .then((devices) => {
                return resolve({
                  statusCode: 200,
                  headers: { "Content-Type": "application/json" },
                  body: { result: devices },
                });
              })
              .catch((err) => {
                return reject({
                  statusCode: 400,
                  headers: { "Content-Type": "application/json" },
                  body: { error: err },
                });
              });
          })
          .catch((err) => {
            return reject({
              statusCode: 400,
              headers: { "Content-Type": "application/json" },
              body: { error: err },
            });
          });
      }
    });
  }
})();

function main(params) {
  const getAll = controller.getAll.bind(controller);
  return getAll(params);
}

module.exports.main = main;
