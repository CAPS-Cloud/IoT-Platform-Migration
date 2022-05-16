const Users = require("./models/UsersModel");
const Devices = require("./models/DevicesModel");
const BaseController = require("./controllers/BaseController");
const ROOT_USERNAME = "root";
const bcrypt = require("bcryptjs");

const controller = new (class extends BaseController {
  constructor() {
    super(Users);
    this.findAllOptions = {
      exclude: ["password"],
      include: [{ model: Devices }],
    };
  }

  add(req) {
    return new Promise((resolve, reject) => {
      if (!req["body"]?.["authUser"] && !req["authUser"]) {
        return reject({
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: { error: "No Authentication Provided" },
        });
      }

      if (req["body"]?.username === ROOT_USERNAME) {
        return reject({
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: {
            error: { message: "'root' is restricted username" },
          },
        });
      }

      if (req["body"]?.password) {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req["body"].password, salt);
        req["body"].password = hash;
      }

      this.model
        .create(req["body"])
        .then((user) => {
          let returnUser = JSON.parse(JSON.stringify(user));
          delete returnUser.password;
          return resolve({
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: { result: returnUser },
          });
        })
        .catch((err) => {
          return reject({
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: { error: err },
          });
        });
    });
  }
})();

function main(params) {
  const add = controller.add.bind(controller);
  return add(params);
}

module.exports.main = main;
