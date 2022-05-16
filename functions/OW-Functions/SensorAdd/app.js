const Users = require("./models/UsersModel");
const Devices = require("./models/DevicesModel");
const Sensors = require("./models/SensorsModel");
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { addTopic } = require("./connections/kafka");
const { addConnectJob } = require("./connections/connect");
const { addElasticsearchIndex } = require("./connections/elasticsearch");

const controller = new (class {
  _isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
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

      if (!req.body?.mapping) {
        return reject({
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: {
            error: { message: "Please enter mapping" },
          },
        });
      }

      Users.findOne({ where: { id: { [Op.eq]: authUser.id } } })
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
                  errors: [{ message: "Device not found" }],
                },
              });
            }

            Sensors.create({
              name: req.body.name,
              description: req.body.description,
              deviceId: device.id,
            })
              .then((sensor) => {
                var topic = `${user.id}_${device.id}_${sensor.id}`;
                console.log(topic);

                let parallelJobs = [
                  addElasticsearchIndex(topic, JSON.parse(req.body.mapping)),
                  addTopic(topic),
                ];

                // Add Elasticsearch Index, Kafka Topic in parallel and then Connect Job.
                Promise.all(parallelJobs)
                  .then(() => {
                    addConnectJob(topic).then(() => {
                      return resolve({
                        statusCode: 200,
                        headers: { "Content-Type": "application/json" },
                        body: { result: sensor },
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
              })
              .catch((err) => {
                return reject({
                  statusCode: 400,
                  headers: { "Content-Type": "application/json" },
                  body: { error: err },
                });
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
