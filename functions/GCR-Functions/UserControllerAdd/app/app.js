const express = require("express");
const http = require("http");
const Users = require("./models/UsersModel");
const Devices = require("./models/DevicesModel");
const BaseController = require("./controllers/BaseController");
const ROOT_USERNAME = "root";
const bcrypt = require("bcryptjs");
const authenticate = require("./authentication");

const testapp = express();
const port = "8072";

testapp.use(express.json());

const controller = new (class extends BaseController {
  constructor() {
    super(Users);
    this.findAllOptions = {
      exclude: ["password"],
      include: [{ model: Devices }],
    };
  }

  add(req, res) {
    authenticate(req)
      .then((authUser) => {
        if (req.body?.username === ROOT_USERNAME) {
          return res
            .status(400)
            .json({ error: "'root' is restricted username" });
        }

        if (req.body?.password) {
          var salt = bcrypt.genSaltSync(10);
          var hash = bcrypt.hashSync(req["body"].password, salt);
          req["body"].password = hash;
        }

        this.model.create(req["body"]).then((user) => {
          let returnUser = JSON.parse(JSON.stringify(user));
          delete returnUser.password;
          return res.status(200).json({ result: returnUser });
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
