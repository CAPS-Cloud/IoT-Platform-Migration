const express = require("express");
const http = require("http");
const Users = require("./models/UsersModel");
const Devices = require("./models/DevicesModel");
const Sensors = require("./models/SensorsModel");
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { addTopic } = require("./connections/kafka");
const { addConnectJob } = require("./connections/connect");
const { addElasticsearchIndex } = require("./connections/elasticsearch");
const authenticate = require("./authentication");

const testapp = express();
const port = "8100";
testapp.use(express.json());

const controller = new (class {
  _isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  add(req, res) {
    if (!req.body?.device_id) {
      return res.status(400).json({
        name: "DeviceIdMissing",
        errors: [{ message: "DeviceID is missing" }],
      });
    }

    if (!req.body?.mapping) {
      return res.status(400).json({
        name: "MappingIsRequired",
        errors: [{ message: "Please enter mapping" }],
      });
    }

    if (!this._isJsonString(req.body?.mapping)) {
      return res.status(400).json({
        name: "MappingIsNotValidJSON",
        errors: [{ message: "Mapping is not valid JSON" }],
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
                id: req.body.device_id,
                userId: { [Op.eq]: user.id },
              },
            }).then((device) => {
              if (!device) {
                return res.status(400).json({
                  name: "DeviceNotFound",
                  errors: [{ message: "Device not found" }],
                });
              }

              Sensors.create({
                name: req.body?.name,
                description: req.body?.description,
                deviceId: device.id,
              }).then((sensor) => {
                var topic = `${user.id}_${device.id}_${sensor.id}`;
                console.log(topic);

                let parallelJobs = [
                  addElasticsearchIndex(topic, req.body.mapping),
                  addTopic(topic),
                ];

                // Add Elasticsearch Index, Kafka Topic in parallel and then Connect Job.
                Promise.all(parallelJobs).then(() => {
                  addConnectJob(topic).then(() => {
                    return res.status(200).json({ result: sensor });
                  });
                });
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

const add = controller.add.bind(controller);

testapp.post("/", (req, res) => {
  add(req, res);
});

if (require.main === module) {
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`);
  });
}
