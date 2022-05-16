const express = require("express");
const http = require("http");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Users = require("./models/UsersModel");
const Devices = require("./models/DevicesModel");
const BaseController = require("./controllers/BaseController");
const ROOT_USERNAME = "root";
const ROOT_PASSWORD = "x5KATOHT9zHczR49aPy0";
const AUTHENTICATION_SECRET = fs.readFileSync(
  ".keys/authentication_jwtRS256.key"
);
const bcrypt = require("bcryptjs");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const testapp = express();
const port = "8073";

testapp.use(express.json());

function responseError(res, err) {
  res.status(400).json(err);
}

const controller = new (class extends BaseController {
  constructor() {
    super(Users);
    this.findAllOptions = {
      exclude: ["password"],
      include: [{ model: Devices }],
    };
  }

  signin(req, res) {
    console.log("Req inside function:");
    console.log(req);

    if (!req.body?.username || !req.body?.password) {
      return res.status(400).json({
        name: "NoUsernameProvided",
        errors: [{ message: "username or password missing" }],
      });
    }

    if (
      req.body?.username == ROOT_USERNAME &&
      req.body?.password == ROOT_PASSWORD
    ) {
      let token = jwt.sign({}, AUTHENTICATION_SECRET, {
        algorithm: "RS256",
        issuer: "iotplatform",
        subject: "-1",
      });
      return res.json({ token });
    }

    this.model
      .findOne({ where: { username: { [Op.eq]: req.body.username } } })
      .then((user) => {
        if (!user) {
          return res.status(400).json({
            name: "Invalid User",
            errors: [{ message: "Invalid username" }],
          });
        }

        if (!bcrypt.compareSync(req.body.password, user.password)) {
          return res.status(400).json({
            name: "Invalid Password",
            errors: [{ message: "Invalid password" }],
          });
        }

        jwt.sign(
          {},
          AUTHENTICATION_SECRET,
          {
            algorithm: "RS256",
            issuer: "iotplatform",
            subject: user.id.toString(),
          },
          (err, token) => {
            return res.json({ token });
          }
        );
      })
      .catch((err) => responseError(res, err));
  }
})();

const signIn = controller.signin.bind(controller);

testapp.post("/", (req, res) => {
  signIn(req, res);
});

if (require.main === module) {
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`);
  });
}
