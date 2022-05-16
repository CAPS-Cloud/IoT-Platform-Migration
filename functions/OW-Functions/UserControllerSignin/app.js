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
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const controller = new (class extends BaseController {
  constructor() {
    super(Users);
    this.findAllOptions = {
      exclude: ["password"],
      include: [{ model: Devices }],
    };
  }

  signin(req) {
    return new Promise((resolve, reject) => {
      if (!req.username || !req.password) {
        return reject({
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: {
            error: { message: "username or password missing" },
          },
        });
      }

      if (req.username === ROOT_USERNAME && req.password === ROOT_PASSWORD) {
        let token = jwt.sign({}, AUTHENTICATION_SECRET, {
          algorithm: "RS256",
          issuer: "iotplatform",
          subject: "-1",
        });

        return resolve({
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: { token },
        });
      }

      this.model
        .findOne({ where: { username: { [Op.eq]: req.username } } })
        .then((user) => {
          if (!user) {
            return reject({
              statusCode: 400,
              headers: { "Content-Type": "application/json" },
              body: {
                errors: { message: "Invalid user" },
              },
            });
          }

          if (!bcrypt.compareSync(req.password, user.password)) {
            return reject({
              statusCode: 400,
              headers: { "Content-Type": "application/json" },
              body: {
                errors: { message: "Invalid password" },
              },
            });
          }

          const token = jwt.sign({}, AUTHENTICATION_SECRET, {
            algorithm: "RS256",
            issuer: "iotplatform",
            subject: user.id.toString(),
          });

          return resolve({
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: { token },
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
  const signIn = controller.signin.bind(controller);
  return signIn(params);
}

module.exports.main = main;
