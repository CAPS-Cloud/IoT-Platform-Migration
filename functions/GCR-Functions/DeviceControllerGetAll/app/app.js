const express = require("express");
const http = require("http");
const Users = require("./models/UsersModel");
const Devices = require("./models/DevicesModel");
const Sensors = require("./models/SensorsModel");
const BaseController = require("./controllers/BaseController");
const testapp = express();
const port = "8077";
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const authenticate = require("./authentication");

testapp.use(express.json());

const controller = new (class extends BaseController {
  constructor() {
    super(Devices);
    this.findAllOptions = {
      include: [{ model: Sensors }],
    };
  }

  getAll(req, res) {
    authenticate(req)
      .then((authUser) => {
        if (authUser.id === -1) {
          Devices.findAll({}).then((devices) => {
            return res.status(200).json({ result: devices });
          });
        } else {
          Users.findById(authUser.id).then((user) => {
            if (!user) {
              return res.status(400).json({
                name: "UserNotFound",
                errors: [{ message: "User not found" }],
              });
            }

            Devices.findAll({
              where: { userId: { [Op.eq]: user.id } },
              include: [{ model: Sensors }],
            }).then((devices) => {
              return res.status(200).json({ result: devices });
            });
          });
        }
      })
      .catch((error) => {
        return res.status(400).json(error);
      });
  }
})();

const getAll = controller.getAll.bind(controller);

testapp.get("/", (req, res) => {
  getAll(req, res);
});

if (require.main === module) {
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`);
  });
}
