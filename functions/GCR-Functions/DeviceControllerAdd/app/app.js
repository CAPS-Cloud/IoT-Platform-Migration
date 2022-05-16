const express = require("express");
const http = require("http");
const Users = require("./models/UsersModel");
const Devices = require("./models/DevicesModel");
const Sensors = require("./models/SensorsModel");
const BaseController = require("./controllers/BaseController");
const testapp = express();
const port = "8078";
const authenticate = require("./authentication");

testapp.use(express.json());

const controller = new (class extends BaseController {
  constructor() {
    super(Devices);
    this.findAllOptions = {
      include: [{ model: Sensors }],
    };
  }

  add(req, res) {
    authenticate(req)
      .then((authUser) => {
        Users.findById(authUser.id).then((user) => {
          if (!user) {
            return res.status(400).json({
              name: "UserNotFound",
              errors: [{ message: "User not found" }],
            });
          }

          Devices.create({
            name: req.body.name,
            description: req.body.description,
            clientId: req.body.clientId,
            password: req.body.password,
            username: req.body.username,
            url: req.body.url,
            ttn_topic_to_subscribe: req.body.ttn_topic_to_subscribe,
            userId: user.id,
          }).then((device) => {
            return res.status(200).json({ result: device });
          });
        });
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
