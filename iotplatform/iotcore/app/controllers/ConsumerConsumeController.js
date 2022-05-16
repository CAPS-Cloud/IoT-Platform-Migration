const connection = require("../connections/mysql");
const {
  responseError,
  responseSystemError,
} = require("../utils/express_utils");
const Users = require("../models/UsersModel");
const Consumers = require("../models/ConsumersModel");
const Devices = require("../models/DevicesModel");
const Sensors = require("../models/SensorsModel");
const BaseController = require("./BaseController");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { CONSUMER_PUBLIC } = require("../secrets");
const ELASTICSEARCH_HOST = require("../connections/elasticsearch").host;
const proxy = require("express-http-proxy");
const jwt = require("jsonwebtoken");
const request = require("request");
// const ELASTICSEARCH_LIMITED_USER='elastic_search_user_iotcore';
// const ELASTICSEARCH_LIMITED_USER_PASSWORD='bkkmyorwyqhfggwh';
const ELASTICSEARCH_LIMITED_USER = "elastic";
const ELASTICSEARCH_LIMITED_USER_PASSWORD = "CzJToWAkKYt4R71V7izW";

const controller = new (class {
  get(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    console.log("bearerHeader:", bearerHeader);
    console.log("CONSUMER_PUBLIC:", CONSUMER_PUBLIC);
    if (!bearerHeader) {
      return res.status(401).json({ body: "Header missing" });
    }

    const bearer = bearerHeader.split(" ");
    if (bearer.length != 2) {
      return res.status(401).json({ body: "Token missing" });
    }

    const bearerToken = bearer[1];
    let decoded;
    try {
      decoded = jwt.verify(bearerToken, CONSUMER_PUBLIC, {
        algorithms: ["RS256"],
        issuer: "iotplatform",
      });
    } catch (error) {
      return res.status(401).json({ body: "JWT verification failed" });
    }

    Sensors.findOne({
      where: { id: { [Op.eq]: req.params.sensor_id } },
      include: [{ model: Consumers }, { model: Devices }],
    })
      .then((sensor) => {
        if (!sensor) {
          return res.status(401).json({ body: "Sensor not found" });
        }

        // console.log("Sensor:",sensor)
        console.log(
          "sensor.device.userId.toString():",
          sensor.device.userId.toString()
        );
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
          console.log(4);
          return res.status(401).json({ body: "Consumer missing" });
        }

        const topic = `${sensor.device.userId}_${sensor.device.id}_${sensor.id}`;

        let elastic_search_host = `http://${ELASTICSEARCH_LIMITED_USER}:${ELASTICSEARCH_LIMITED_USER_PASSWORD}@${ELASTICSEARCH_HOST}`;
        console.log(elastic_search_host);

        const url = elastic_search_host + "/" + topic + "/_search";

        request.get(url, function (error, response, body) {
          if (error) {
            return res.status(401).json({ body: "Request failed" });
          } else {
            return res.send(body);
          }
        });
      })
      .catch((err) => responseError(res, err));
  }

  delete(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
      const bearer = bearerHeader.split(" ");
      if (bearer.length != 2) {
        return res.sendStatus(401);
      }
      const bearerToken = bearer[1];

      jwt.verify(
        bearerToken,
        CONSUMER_PUBLIC,
        { algorithms: ["RS256"], issuer: "iotplatform" },
        (err, authData) => {
          if (!err) {
            Sensors.findOne({
              where: { id: { [Op.eq]: req.params.sensor_id } },
              include: [{ model: Consumers }, { model: Devices }],
            })
              .then((sensor) => {
                if (sensor) {
                  if (
                    sensor.consumers &&
                    sensor.consumers.some(
                      (consumer) =>
                        sensor.device.userId.toString() +
                          "_" +
                          consumer.id.toString() ===
                        authData.sub
                    )
                  ) {
                    const topic = `${sensor.device.userId}_${sensor.device.id}_${sensor.id}`;
                    let elastic_search_host = `http://${ELASTICSEARCH_LIMITED_USER}:${ELASTICSEARCH_LIMITED_USER_PASSWORD}@${ELASTICSEARCH_HOST}`;
                    let parts = req.url.split("?");
                    let queryString = parts[1];
                    let updatedPath = parts[0].replace(
                      new RegExp(
                        `^/api/consumers/consume/${req.params.sensor_id}`,
                        "i"
                      ),
                      topic
                    );
                    let path =
                      updatedPath + (queryString ? "?" + queryString : "");

                    let data = {};
                    let options = {};
                    if (req.body) {
                      var headersOpt = {
                        "content-type": "application/json",
                      };
                      options = {
                        url: elastic_search_host + "/" + path,
                        method: "DELETE",
                        headers: headersOpt,
                        body: req.body,
                        json: true,
                      };
                    } else {
                      options = {
                        url: elastic_search_host + "/" + path,
                        method: "DELETE",
                      };
                    }

                    request(options, function (error, response, body) {
                      console.error("error:", error); // Print the error if one occurred
                      console.log(
                        "statusCode:",
                        response && response.statusCode
                      ); // Print the response status code if a response was received
                      console.log("body:", body); // Print the HTML for the Google homepage.
                      if (error) {
                        return res.sendStatus(401);
                      } else {
                        return res.send(body);
                      }
                    });
                  } else {
                    console.log(4);
                    return res.sendStatus(401);
                  }
                } else {
                  return res.sendStatus(401);
                }
              })
              .catch((err) => responseError(res, err));
          } else {
            return res.sendStatus(401);
          }
        }
      );
    } else {
      return res.sendStatus(401);
    }
  }

  add(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
      const bearer = bearerHeader.split(" ");
      if (bearer.length != 2) {
        return res.sendStatus(401);
      }
      const bearerToken = bearer[1];

      jwt.verify(
        bearerToken,
        CONSUMER_PUBLIC,
        { algorithms: ["RS256"], issuer: "iotplatform" },
        (err, authData) => {
          if (!err) {
            Sensors.findOne({
              where: { id: { [Op.eq]: req.params.sensor_id } },
              include: [{ model: Consumers }, { model: Devices }],
            })
              .then((sensor) => {
                if (sensor) {
                  if (
                    sensor.consumers &&
                    sensor.consumers.some(
                      (consumer) =>
                        sensor.device.userId.toString() +
                          "_" +
                          consumer.id.toString() ===
                        authData.sub
                    )
                  ) {
                    const topic = `${sensor.device.userId}_${sensor.device.id}_${sensor.id}`;
                    let elastic_search_host = `http://${ELASTICSEARCH_LIMITED_USER}:${ELASTICSEARCH_LIMITED_USER_PASSWORD}@${ELASTICSEARCH_HOST}`;
                    let parts = req.url.split("?");
                    let queryString = parts[1];
                    let updatedPath = parts[0].replace(
                      new RegExp(
                        `^/api/consumers/consume/${req.params.sensor_id}`,
                        "i"
                      ),
                      topic
                    );
                    let path =
                      updatedPath + (queryString ? "?" + queryString : "");

                    let data = {};
                    let options = {};
                    if (req.body) {
                      //Custom Header pass
                      var headersOpt = {
                        "content-type": "application/json",
                      };
                      options = {
                        url: elastic_search_host + "/" + path,
                        method: "POST",
                        headers: headersOpt,
                        body: req.body,
                        json: true,
                      };
                    } else {
                      options = {
                        url: elastic_search_host + "/" + path,
                        method: "POST",
                      };
                    }

                    request(options, function (error, response, body) {
                      console.error("error:", error); // Print the error if one occurred
                      console.log(
                        "statusCode:",
                        response && response.statusCode
                      ); // Print the response status code if a response was received
                      console.log("body:", body); // Print the HTML for the Google homepage.
                      if (error) {
                        return res.sendStatus(401);
                      } else {
                        return res.send(body);
                      }
                    });
                  } else {
                    console.log(4);
                    return res.sendStatus(401);
                  }
                } else {
                  return res.sendStatus(401);
                }
              })
              .catch((err) => responseError(res, err));
          } else {
            return res.sendStatus(401);
          }
        }
      );
    } else {
      return res.sendStatus(401);
    }
  }

  update(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
      const bearer = bearerHeader.split(" ");
      if (bearer.length != 2) {
        return res.sendStatus(401);
      }
      const bearerToken = bearer[1];

      jwt.verify(
        bearerToken,
        CONSUMER_PUBLIC,
        { algorithms: ["RS256"], issuer: "iotplatform" },
        (err, authData) => {
          if (!err) {
            Sensors.findOne({
              where: { id: { [Op.eq]: req.params.sensor_id } },
              include: [{ model: Consumers }, { model: Devices }],
            })
              .then((sensor) => {
                if (sensor) {
                  if (
                    sensor.consumers &&
                    sensor.consumers.some(
                      (consumer) =>
                        sensor.device.userId.toString() +
                          "_" +
                          consumer.id.toString() ===
                        authData.sub
                    )
                  ) {
                    const topic = `${sensor.device.userId}_${sensor.device.id}_${sensor.id}`;
                    let elastic_search_host = `http://${ELASTICSEARCH_LIMITED_USER}:${ELASTICSEARCH_LIMITED_USER_PASSWORD}@${ELASTICSEARCH_HOST}`;
                    let parts = req.url.split("?");
                    let queryString = parts[1];
                    let updatedPath = parts[0].replace(
                      new RegExp(
                        `^/api/consumers/consume/${req.params.sensor_id}`,
                        "i"
                      ),
                      topic
                    );
                    let path =
                      updatedPath + (queryString ? "?" + queryString : "");
                    let data = {};
                    let options = {};
                    if (req.body) {
                      var headersOpt = {
                        "content-type": "application/json",
                      };
                      options = {
                        url: elastic_search_host + "/" + path,
                        method: "PUT",
                        headers: headersOpt,
                        body: req.body,
                        json: true,
                      };
                    } else {
                      options = {
                        url: elastic_search_host + "/" + path,
                        method: "PUT",
                      };
                    }

                    request(options, function (error, response, body) {
                      console.error("error:", error); // Print the error if one occurred
                      console.log(
                        "statusCode:",
                        response && response.statusCode
                      ); // Print the response status code if a response was received
                      console.log("body:", body); // Print the HTML for the Google homepage.
                      if (error) {
                        return res.sendStatus(401);
                      } else {
                        return res.send(body);
                      }
                    });
                  } else {
                    console.log(4);
                    return res.sendStatus(401);
                  }
                } else {
                  return res.sendStatus(401);
                }
              })
              .catch((err) => responseError(res, err));
          } else {
            return res.sendStatus(401);
          }
        }
      );
    } else {
      return res.sendStatus(401);
    }
  }
})();

module.exports = {
  get: controller.get.bind(controller),
  update: controller.update.bind(controller),
  add: controller.add.bind(controller),
  delete: controller.delete.bind(controller),
};
