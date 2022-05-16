const fs = require("fs");
const jwt = require("jsonwebtoken");
const { Kafka } = require("kafkajs");
const AUTHENTICATION_PUBLIC = fs.readFileSync(".keys/jwtRS256.key.pub");
const { kafkahost } = require("./connections/common.js");
const kafka = new Kafka({
  clientId: "http-gateway",
  brokers: [kafkahost],
});
const producer = kafka.producer();

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

    let userDeviceId;
    try {
      userDeviceId = jwt.verify(jwtToken, AUTHENTICATION_PUBLIC).sub;
    } catch (error) {
      return reject({
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: { error: "Error in JWT verification" },
      });
    }

    let messages;

    if (params["sensor_id"] && params["timestamp"] && params["value"]) {
      messages = [
        {
          sensor_id: params["sensor_id"],
          timestamp: params["timestamp"],
          value: params["value"],
        },
      ];
    } else {
      if (!params["__ow_body"] && !params["body"]) {
        return reject({
          statusCode: 401,
          headers: { "Content-Type": "application/json" },
          body: { error: "Body is missing!" },
        });
      }

      messages = !params["__ow_body"]
        ? params["body"].body
        : params["__ow_body"];
    }

    if (!Array.isArray(messages)) {
      messages = [messages];
    }

    /* return resolve({
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        sensor_id: messages[0].sensor_id,
        timestamp: messages[0].timestamp,
        value: messages[0].value,
      },
    }); */

    producer
      .connect()
      .then(() => {
        return Promise.all(
          messages.map((message, i) => {
            if (
              !message["sensor_id"] ||
              !message["timestamp"] ||
              !message["value"]
            ) {
              return {
                type: "ERROR",
                message:
                  "Message " +
                  i +
                  " should include keys sensor_id, timestamp and value",
              };
            }

            const stringMessage = JSON.stringify({
              sensor_id: message["sensor_id"],
              timestamp: message["timestamp"],
              value: message["value"],
            });

            return producer
              .send({
                topic: userDeviceId + "_" + message["sensor_id"],
                messages: [{ value: stringMessage }],
              })
              .then(() => {
                return {
                  type: "SUCCESS",
                };
              })
              .catch((error) => {
                console.error(error);
                return {
                  type: "ERROR",
                  message: "Sending message " + i + " failed",
                };
              });
          })
        )
          .then((arr) => {
            let errMessage = arr
              .filter((obj) => obj.type === "ERROR")
              .reduce((acc, obj) => {
                return acc + obj.message + "\n ";
              }, "");

            if (errMessage) {
              return reject({
                statusCode: 401,
                headers: { "Content-Type": "application/json" },
                body: { error: errMessage },
              });
            }

            return resolve({
              statusCode: 200,
              headers: { "Content-Type": "application/json" },
              body: { status: "Messages sent" },
            });
          })
          .catch((error) => {
            return reject({
              statusCode: 401,
              headers: { "Content-Type": "application/json" },
              body: { error: "Sending Kafka messages failed" },
            });
          });
      })
      .catch((error) => {
        return reject({
          statusCode: 401,
          headers: { "Content-Type": "application/json" },
          body: { error: "Kafka producer failed" },
        });
      });
  });
}

module.exports.main = main;
