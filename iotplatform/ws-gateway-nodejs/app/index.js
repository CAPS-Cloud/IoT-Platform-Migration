const kafka = require("kafka-node");
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const fs = require('fs');

var wsserver, kafkaProducer, kafkaClient

const key = fs.readFileSync('./.keys/jwtRS256.key.pub');  // get public key
const wsPort = 8765;

const args = process.argv;
const ZOOKEEPER = args[2];
const IOTCORE_BACKEND = args[3];

async function initWebSocket() {
    // console.log("attempting to initiate ws server...");
    return new Promise((resolve) => {
        wsserver = new WebSocket.Server({
            port: wsPort,
            verifyClient: (info, cb) => {
                if(info.req.headers.authorization && info.req.headers.authorization.split(' ')[0] === 'Bearer') {
                    jwt.verify(info.req.headers.authorization.split(' ')[1], key, function(err, decoded) {
                        if(!(err != null)) {
                            info.req.user = decoded;
                            // console.log("200 - OK");
                            cb(true);
                        } else {
                            // console.log("403 - Forbidden");
                            cb(false, 403, 'Forbidden');
                        }
                    });
                } else {
                    // console.log("401 - Unauthorized");
                    cb(false, 401, 'Unauthorized');
                }
            }
        });
        resolve();
    })
}

async function initKafka() {
    return new Promise((resolve) => {
        // console.log("attempting to initiate Kafka connection...");
        kafkaClient = new kafka.Client(ZOOKEEPER);

        kafkaProducer = new kafka.HighLevelProducer(kafkaClient);
        kafkaProducer.on("ready", () => {
            // console.log("kafka producer is connected and ready");
        })
        kafkaProducer.on('ready', () => {
            resolve();
        })
    })
}

function ingestMsgInKafka(payloads) {
    kafkaProducer.send(payloads, (err) => {
        if(err) {
            // console.error("couldn't forward message to kafka, topic: ", payloads[0].topic ," - error: ", err);
        } else {
            // console.log("forwarded to kafka:")
            // console.log(payloads)
        }
    })
}

function forwardMsg(message, deviceId) {
    let payloads, messageString;

    if(typeof(message) === "object") {
        messageString = message.toString();
    } else if(typeof(message) === "string") {
        messageString = message;
    } else {
        // console.log("invalid type of data - not forwarded to kafka");
        return;
    }

    let parsedMsg = JSON.parse(messageString)
    if(Array.isArray(parsedMsg)) {
        parsedMsg.forEach((elem) => {
            payloads = [
                { topic: deviceId + "_" + elem.sensor_id, messages: JSON.stringify(elem) }
            ];
            ingestMsgInKafka(payloads);
        });
    } else {
        payloads = [
            { topic: deviceId + "_" + parsedMsg.sensor_id, messages: messageString }
        ];
        ingestMsgInKafka(payloads);
    }
}

Promise.all([initKafka()]).then(() => {
    initWebSocket().then(() => {
        // console.log("ws gateway available");
        wsserver.on('connection', (conn, req) => {
            conn.on('message', (data) => {
                forwardMsg(data, req.user.sub);
            });
        });
    });
})
