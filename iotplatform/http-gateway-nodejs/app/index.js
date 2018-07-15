const express = require('express');
const kafka = require("kafka-node");
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const fs = require('fs');

const httpPort = 8083

const key = fs.readFileSync('./.keys/jwtRS256.key.pub');  // get public key

var httpServer, kafkaProducer, kafkaClient

const args = process.argv;
const ZOOKEEPER = args[2];
const IOTCORE_BACKEND = args[3];

async function initRest() {
    console.log("attempting to initiate http server...")
    return new Promise((resolve) => {
        const app = express()
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))

        app.post("/", function (req, res) {
            if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                // verify a token asymmetric
                jwt.verify(req.headers.authorization.split(' ')[1], key, function(err, decoded) {
                    if(!(err != null)) {
                        forwardMsg(JSON.stringify(req.body), decoded.sub);
                        res.status(200).send('OK');
                        res.end();
                    } else {
                        console.log("403 - Forbidden");
                        res.status(403).send('Forbidden');
                        res.end();
                    }
                });
            } else {
                console.log("401 - Unauthorized");
                res.status(401).send('Unauthorized');
                res.end();
            }
        })

        httpServer = app.listen(httpPort, () => {
            console.log("app running on port ", httpServer.address().port)
        })
        resolve()
    })
}

async function initKafka() {
    return new Promise((resolve) => {
        console.log("attempting to initiate Kafka connection...")
        kafkaClient = new kafka.Client(ZOOKEEPER)

        kafkaProducer = new kafka.HighLevelProducer(kafkaClient)
        kafkaProducer.on("ready", () => {
            console.log("kafka producer is connected and ready")
        })
        kafkaProducer.on('ready', () => {
          resolve()
        })
    })
}

function forwardMsg(message, deviceId) {
    let payloads, messageString

    if(typeof(message) === "object") {
        messageString = message.toString()
    } else if(typeof(message) === "string") {
        messageString = message
    } else {
        console.log("invalid type of data - not forwarded to kafka")
        return
    }

    if(Array.isArray(JSON.parse(messageString))) {
        payloads = [
            { topic: deviceId + "_" + JSON.parse(messageString)[0].sensor_id, messages: messageString }
        ]
    } else {
        payloads = [
            { topic: deviceId + "_" + JSON.parse(messageString).sensor_id, messages: messageString }
        ]
    }

    kafkaProducer.send(payloads, (err) => {
        if(err) {
            console.error("couldn't forward message to kafka - ", err);
        } else {
            console.log("forwarded to kafka:")
            console.log(payloads)
        }
    })
}

Promise.all([initKafka()]).then(() => {
    initRest().then(() => {
        console.log("http-gateway available")
    })
})
