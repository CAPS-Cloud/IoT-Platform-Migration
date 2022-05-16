const Users = require("./models/UsersModel");
const Devices = require("./models/DevicesModel");
const BaseController = require("./controllers/BaseController");

const controller = new (class extends BaseController {
  constructor() {
    super(Users);
    this.findAllOptions = {
      exclude: ["password"],
      include: [{ model: Devices }],
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
        Users.findAll(this.findAllOptions)
          .then((users) => {
            return resolve({
              statusCode: 200,
              headers: { "Content-Type": "application/json" },
              body: { result: users },
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

            return resolve({
              statusCode: 200,
              headers: { "Content-Type": "application/json" },
              body: { result: user },
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
