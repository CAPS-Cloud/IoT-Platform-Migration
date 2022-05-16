const express = require("express");
const http = require("http");
const Users = require("./models/UsersModel");
const Devices = require("./models/DevicesModel");
const Sensors = require("./models/SensorsModel");
const Consumers = require("./models/ConsumersModel");
const testapp = express();
const port = "8104";
const fs = require("fs");
const CONSUMER_PUBLIC = fs.readFileSync(".keys/consumer_jwtRS256.key.pub");
const ELASTICSEARCH_HOST = require("./connections/common").elasticsearchhost;
const jwt = require("jsonwebtoken");
const request = require("request");
const ELASTICSEARCH_LIMITED_USER = "elastic";
const ELASTICSEARCH_LIMITED_USER_PASSWORD = "CzJToWAkKYt4R71V7izW";
const elastic_search_host = `http://${ELASTICSEARCH_LIMITED_USER}:${ELASTICSEARCH_LIMITED_USER_PASSWORD}@${ELASTICSEARCH_HOST}`;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

testapp.use(express.json());

function get(req, res) {
  if (!req.headers?.authorization) {
    return res.status(401).json({ error: "Error bearerHeader undefined" });
  }

  const jwtToken = req.headers.authorization.split(" ")[1];
  if (!jwtToken) {
    return res
      .status(401)
      .json({ error: "Syntax error in Authorization Header" });
  }

  let decoded;
  try {
    decoded = jwt.verify(jwtToken, CONSUMER_PUBLIC, {
      algorithms: ["RS256"],
      issuer: "iotplatform",
    });
  } catch (error) {
    return res.status(401).json({ error: "Error in jwt verification" });
  }

  const sensorId = req.query?.sensor_id;
  if (!sensorId) {
    return res.status(401).json({ error: "Sensor ID not provided" });
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
        return res.status(401).json({ error: "Sensor not found" });
      }

      if (
        !(
          sensor.consumers &&
          sensor.consumers.some(
            (consumer) =>
              sensor.device.userId.toString() + "_" + consumer.id.toString() ===
              decoded.sub
          )
        )
      ) {
        return res.status(401).json({ error: "Consumer missing" });
      }

      const topic = `${sensor.device.userId}_${sensor.deviceId}_${sensor.id}`;

      const url = elastic_search_host + "/" + topic + "/_search";

      request.get(url, function (error, response, body) {
        if (error) {
          return res.status(400).json({ error: error });
        } else {
          return res.status(200).json(JSON.parse(body));
        }
      });
    })
    .catch((err) => {
      return res.status(400).json({ error: err });
    });
}

testapp.get("/", (req, res) => {
  get(req, res);
});

if (require.main === module) {
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`);
  });
}
