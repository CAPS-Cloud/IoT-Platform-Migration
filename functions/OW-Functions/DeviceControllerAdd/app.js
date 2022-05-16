const Users = require("./models/UsersModel");
const Devices = require("./models/DevicesModel");
const Sensors = require("./models/SensorsModel");
const BaseController = require("./controllers/BaseController");

const controller = new (class extends BaseController {
  constructor() {
    super(Devices);
    this.findAllOptions = {
      include: [{ model: Sensors }],
    };
  }

  post_add(data, callback) {
    callback(data);
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

      Users.findById(authUser.id)
        .then((user) => {
          if (!user) {
            return reject({
              statusCode: 400,
              headers: { "Content-Type": "application/json" },
              body: {
                name: "UserNotFound",
                errors: [{ message: "User not found" }],
              },
            });
          }

          Devices.create({
            name: !req["name"] ? req["body"]?.name : req["name"],
            description: !req["description"]
              ? req["body"]?.description
              : req["description"],
            clientId: !req["clientId"]
              ? req["body"]?.clientId
              : req["clientId"],
            password: !req["password"]
              ? req["body"]?.password
              : req["password"],
            username: !req["username"]
              ? req["body"]?.username
              : req["username"],
            url: !req["url"] ? req["body"]?.url : req["url"],
            ttn_topic_to_subscribe: !req["ttn_topic_to_subscribe"]
              ? req["body"]?.ttn_topic_to_subscribe
              : req["ttn_topic_to_subscribe"],
            userId: user.id,
          }).then((device) => {
            return resolve({
              statusCode: 200,
              headers: { "Content-Type": "application/json" },
              body: { result: device },
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
    });
  }
})();

function main(params) {
  const add = controller.add.bind(controller);
  return add(params);
}

module.exports.main = main;
