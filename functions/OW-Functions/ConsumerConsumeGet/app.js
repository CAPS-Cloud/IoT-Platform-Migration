const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Devices = require("./models/DevicesModel");
const Sensors = require("./models/SensorsModel");
const Users = require("./models/UsersModel");
const Consumers = require("./models/ConsumersModel");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const CONSUMER_PUBLIC = fs.readFileSync(".keys/consumer_jwtRS256.key.pub");
const request = require("request");
const ELASTICSEARCH_HOST = require("./connections/common").elasticsearchhost;
const ELASTICSEARCH_LIMITED_USER = "elastic";
const ELASTICSEARCH_LIMITED_USER_PASSWORD = "CzJToWAkKYt4R71V7izW";
const elastic_search_host = `http://${ELASTICSEARCH_LIMITED_USER}:${ELASTICSEARCH_LIMITED_USER_PASSWORD}@${ELASTICSEARCH_HOST}`;

const controller = new (class {
  get(params) {
    return new Promise((resolve, reject) => {
      if (!params["__ow_headers"]["authorization"]) {
        return reject({
          statusCode: 401,
          headers: { "Content-Type": "application/json" },
          body: { error: "Error bearerHeader undefined" },
        });
      }

      const jwtToken = params["__ow_headers"]["authorization"].split(" ")[1];
      if (!jwtToken) {
        return reject({
          statusCode: 401,
          headers: { "Content-Type": "application/json" },
          body: { error: "Syntax error in Authorization Header" },
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(jwtToken, CONSUMER_PUBLIC, {
          algorithms: ["RS256"],
          issuer: "iotplatform",
        });
      } catch (error) {
        return reject({
          statusCode: 401,
          headers: { "Content-Type": "application/json" },
          body: { error: "Error in jwt verification" },
        });
      }

      const sensorId = params["sensor_id"];
      if (!sensorId) {
        return reject({
          statusCode: 401,
          headers: { "Content-Type": "application/json" },
          body: { error: "Sensor ID not provided" },
        });
      }

      Sensors.findOne({
        where: { id: { [Op.eq]: sensorId } },
        include: [
          { model: Consumers },
          {
            model: Devices,
            include: [
              {
                model: Users,
              },
            ],
          },
        ],
      })
        .then((sensor) => {
          if (!sensor) {
            return reject({
              statusCode: 401,
              headers: { "Content-Type": "application/json" },
              body: { error: "Sensor not found" },
            });
          }

          if (
            !(
              sensor.consumers &&
              sensor.consumers.some(
                (consumer) =>
                  sensor.device.userId.toString() +
                    "_" +
                    consumer.id.toString() ===
                  decoded.sub
              )
            )
          ) {
            return reject({
              statusCode: 401,
              headers: { "Content-Type": "application/json" },
              body: { error: "Sensor authorization failed" },
            });
          }

          const topic = `${sensor.device.userId}_${sensor.deviceId}_${sensor.id}`;

          const url = elastic_search_host + "/" + topic + "/_search";

          request.get(url, function (error, response, body) {
            if (error) {
              return reject({
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: { error: error },
              });
            } else {
              return resolve({
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: { body: body },
              });
            }
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
  const get = controller.get.bind(controller);
  return get(params);
}

module.exports.main = main;
