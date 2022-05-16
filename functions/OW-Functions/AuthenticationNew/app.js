const fs = require("fs");
const AUTHENTICATION_PUBLIC = fs.readFileSync(
  ".keys/authentication_jwtRS256.key.pub"
);
const ROOT_USERNAME = "root";
const jwt = require("jsonwebtoken");
const Users = require("./models/UsersModel");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

function checkAuthenticationRole(authLevel, user) {
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

function main(params) {
  return new Promise((resolve, reject) => {
    if (!params["__ow_headers"]["authorization"]) {
      return reject({
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: { error: "Error bearerHeader undefined" },
      });
    }

    const jwtToken = params["__ow_headers"]["authorization"].split(" ")[1];
    if (!jwtToken) {
      return reject({
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: { error: "Syntax error in Authorization Header" },
      });
    }

    const authLevel = params["AuthLevel"];
    if (!authLevel) {
      return reject({
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: { error: "Nessecary auth level not provided" },
      });
    }

    console.log(params);
    let decoded;
    try {
      decoded = jwt.verify(jwtToken, AUTHENTICATION_PUBLIC, {
        algorithms: ["RS256"],
        issuer: "iotplatform",
      });
    } catch (error) {
      return reject({
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: { error: "Error in jwt verification" },
      });
    }

    if (decoded.sub === "-1") {
      params["authUser"] = {
        id: -1,
        name: "<root>",
        username: ROOT_USERNAME,
        role: "SUPER_USER",
      };

      return resolve({
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: params,
      });
    }

    Users.findOne({ where: { id: { [Op.eq]: decoded.sub } } })
      .then((user) => {
        if (!user) {
          return reject({
            statusCode: 401,
            headers: { "Content-Type": "application/json" },
            body: { error: "User not found" },
          });
        }

        if (!checkAuthenticationRole(authLevel, user)) {
          return reject({
            statusCode: 401,
            headers: { "Content-Type": "application/json" },
            body: { error: "User's role is not high enough" },
          });
        }

        params["authUser"] = user;
        return resolve({
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: params,
        });
      })
      .catch((error) => {
        console.error(error);
        return reject({
          statusCode: 401,
          headers: { "Content-Type": "application/json" },
          body: { error: "Query for user failed" },
        });
      });
  });
}

module.exports.main = main;
