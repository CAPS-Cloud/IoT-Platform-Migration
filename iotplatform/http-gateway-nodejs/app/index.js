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

async function initRest() {
    // console.log("attempting to initiate http server...")
    return new Promise((resolve) => {
        const app = express()
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))

        app.post("/", function (req, res) {
            // Look for a HTTP header that looks like: "authorization: Bearer [token]"
            const auth = req.header('authorization');
            const bearer = 'Bearer '; // Prefix
            if(auth === undefined || !auth.startsWith(bearer)) {
                // If the header is missing or has an invalid format
                res.status(401).send('Unauthorized');
                res.end();
                return;
            }
            const jwtToken = auth.substr(bearer.length);

            // Verify the RSA-signed JWT token
            jwt.verify(jwtToken, key, function(err, decoded) {
                if(err) {
                    // JWT verification failed
                    res.status(403).send('Forbidden');
                    res.end();
                    return;
                }

                // Send JSON body to Kafka
                // The decoded JWT token contains the deviceId in the "sub" field
                forwardMsg(JSON.stringify(req.body), decoded.sub);
                res.status(200).send('OK');
                res.end();
            });
        })

        httpServer = app.listen(httpPort, () => {
            // console.log("app running on port ", httpServer.address().port)
        })
        resolve()
    })
}

/**
 * Send a list of messages to kafka.
 * @param {array} payloads must be an array where each element has `topic` and `messages`.
 * @example
 * ingestMsgInKafka([
 *   {
 *     topic: "my_topic_name",
 *     message: ['my_message'] // single messages can be just a string
 *   }
 * ])
 * @see {@link https://github.com/SOHU-Co/kafka-node#sendpayloads-cb}
 */
function ingestMsgInKafka(payloads) {
    kafkaProducer.send(payloads, (err) => {
        if(err) {
            console.error("couldn't forward message to kafka, topic: ", payloads[0].topic ," - error: ", err);
        } else {
            // console.log("forwarded to kafka:")
            // console.log(payloads)
            console.log((new Date()).getTime() + "-----" + JSON.stringify(payloads))
        }
    })
}

/**
 * Create a high level producer using the zookeeper given as command line argument.
 */
async function initKafka() {
    return new Promise((resolve) => {
        // console.log("attempting to initiate Kafka connection...")
        kafkaClient = new kafka.Client(ZOOKEEPER)

        kafkaProducer = new kafka.HighLevelProducer(kafkaClient)
        kafkaProducer.on('ready', () => {
          resolve()
        })
    })
}

/**
 * Send one or multiple sensor messages to kafka using `ingestMsgInKafka`.
 * @param {string} message sensor data to send. Must be a stringified JSON array or JSON object
 * @param {string} deviceId (verified) device indentifier that is concatenated with the sensor id resulting in the kafka topic name
 */
function forwardMsg(message, deviceId) {
    try {
        let messageString

        if(typeof(message) === "string") {
            messageString = message;
        } else {
            // console.log("invalid type of data - not forwarded to kafka")
            return;
        }

        let parsedMsg = JSON.parse(messageString)
        if(Array.isArray(parsedMsg)) {
            for (var i = 0, len = parsedMsg.length; i < len; i++) {
                ingestMsgInKafka([
                    { topic: deviceId + "_" + parsedMsg[i].sensor_id, messages: JSON.stringify(parsedMsg[i]) }
                ]);
            }
        } else {
            ingestMsgInKafka([
                { topic: deviceId + "_" + parsedMsg.sensor_id, messages: messageString }
            ]);
        }
    } catch(error) {
      console.error(error);
    }
}

Promise.all([initKafka()]).then(() => {
    initRest().then(() => {
        // console.log("http-gateway available")
    })
})
