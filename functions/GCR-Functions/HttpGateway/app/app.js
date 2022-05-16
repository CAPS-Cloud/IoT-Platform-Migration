const express = require("express");
const http = require("http");
const testapp = express();
const port = "8080";
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { Kafka } = require("kafkajs");
const AUTHENTICATION_PUBLIC = fs.readFileSync(".keys/jwtRS256.key.pub");
const { kafkahost } = require("./connections/common");
const kafka = new Kafka({
  clientId: "http-gateway",
  brokers: [kafkahost],
});
const producer = kafka.producer();

testapp.use(express.json());

function main(req, res) {
  if (!req.headers?.authorization) {
    return res.status(401).json({ error: "Error bearerHeader undefined" });
  }

  const jwtToken = req.headers?.authorization.split(" ")[1];
  if (!jwtToken) {
    return res
      .status(401)
      .json({ error: "Syntax error in Authorization Header" });
  }

  let userDeviceId;
  try {
    userDeviceId = jwt.verify(jwtToken, AUTHENTICATION_PUBLIC).sub;
  } catch (error) {
    return res.status(401).json({ error: "Error in JWT verification" });
  }

  if (!req.body) {
    return res.status(401).json({ error: "Body is missing!" });
  }

  messages = req.body;
  if (!Array.isArray(messages)) {
    console.log("Array had to be transformed");
    messages = [messages];
  }

  producer
    .connect()
    .then(() => {
      return Promise.all(
        messages.map((message, i) => {
          console.log(message);

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

          console.log("Stringified JSON: ", stringMessage);

          return producer
            .send({
              topic: userDeviceId + "_" + message["sensor_id"],
              messages: [{ value: stringMessage }],
            })
            .then(() => {
              console.log("Message " + i + " sent!");
              return {
                type: "SUCCESS",
              };
            })
            .catch((error) => {
              console.log(error);
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
            return res.status(401).json({ error: errMessage });
          }

          console.log("All messages sent");
          return res.status(200).json({ status: "Messages sent" });
        })
        .catch((error) => {
          console.error(error);
          return res
            .status(401)
            .json({ error: "Sending Kafka messages failed" });
        });
    })
    .catch((error) => {
      console.error(error);
      return res.status(401).json({ error: "Kafka producer failed" });
    });
}

testapp.post("/", (req, res) => {
  main(req, res);
});

if (require.main === module) {
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`);
  });
}
