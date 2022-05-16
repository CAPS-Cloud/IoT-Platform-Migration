const express = require("express");
const http = require("http");
const Users = require("./models/UsersModel");
const Devices = require("./models/DevicesModel");
const BaseController = require("./controllers/BaseController");
const authenticate = require("./authentication");

const testapp = express();
const port = "8071";

testapp.use(express.json());

const controller = new (class extends BaseController {
  constructor() {
    super(Users);
    this.findAllOptions = {
      exclude: ["password"],
      include: [{ model: Devices }],
    };
  }

  getAll(req, res) {
    authenticate(req)
      .then((authUser) => {
        if (authUser.id === -1) {
          Users.findAll(this.findAllOptions)
            .then((users) => {
              return res.status(200).json({ result: users });
            })
            .catch((err) => {
              return res.status(400).json(err);
            });
        } else {
          return res.status(200).json({ result: authUser });
        }
      })
      .catch((error) => {
        return res.status(400).json(error);
      });
  }
})();

let getAll = controller.getAll.bind(controller);

testapp.get("/", (req, res) => {
  getAll(req, res);
});

if (require.main === module) {
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`);
  });
}

module.exports = testapp;
