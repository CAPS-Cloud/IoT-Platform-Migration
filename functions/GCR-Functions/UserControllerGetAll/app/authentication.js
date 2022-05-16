const Users = require("./models/UsersModel");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const jwt = require("jsonwebtoken");
const fs = require("fs");
const AUTHENTICATION_PUBLIC = fs.readFileSync(
  "./.keys/authentication_jwtRS256.key.pub"
);
const authLevel = "USER";
const ROOT_USERNAME = "root";

function checkAuthenticationRole(user) {
  switch (authLevel) {
    case "SUPER_USER":
      return user.role === "SUPER_USER";
    case "ADMIN":
      return user.role === "SUPER_USER" || user.role === "ADMIN";
    case "USER":
      return (
        user.role === "SUPER_USER" ||
        user.role === "ADMIN" ||
        user.role === "USER"
      );
  }
}

function authenticate(req) {
  return new Promise((resolve, reject) => {
    if (!req.headers?.authorization) {
      return reject({ error: "Error bearerHeader undefined" });
    }

    const jwtToken = req.headers.authorization.split(" ")[1];
    if (!jwtToken) {
      return reject({ error: "Syntax error in Authorization Header" });
    }

    let decoded;
    try {
      decoded = jwt.verify(jwtToken, AUTHENTICATION_PUBLIC, {
        algorithms: ["RS256"],
        issuer: "iotplatform",
      });
    } catch (error) {
      return reject({ error: "Error in jwt verification" });
    }

    if (decoded.sub === "-1") {
      return resolve({
        id: -1,
        name: "<root>",
        username: ROOT_USERNAME,
        role: "SUPER_USER",
      });
    }

    Users.findOne({ where: { id: { [Op.eq]: decoded.sub } } })
      .then((user) => {
        if (!user) {
          return reject({ error: "User not found" });
        }

        if (!checkAuthenticationRole(user)) {
          return reject({ error: "User's role is not high enough" });
        }

        return resolve(user);
      })
      .catch(() => {
        return reject({ error: "Query for user failed" });
      });
  });
}

module.exports = authenticate;
