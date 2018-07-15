var kafka = require("kafka-node");
var WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const fs = require('fs');

var wsPort = 8765

var wsserver, kafkaProducer, kafkaClient

const key = fs.readFileSync('./.keys/jwtRS256.key.pub');  // get public key

const args = process.argv;
const ZOOKEEPER = args[2];
const IOTCORE_BACKEND = args[3];

async function initWebSocket() {
  console.log("attempting to initiate ws server...")
  return new Promise((resolve) => {
    wsserver = new WebSocket.Server({ port: wsPort })
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

function toEvent (message) {
    try {
        console.log(message)
        var event = JSON.parse(message);
        this.emit(event.type, event.payload);
    } catch(err) {
        console.log('not an object' , err);
    }
}

Promise.all([initKafka()]).then(() => {
    initWebSocket().then(() => {
        console.log("ws gateway available")
        wsserver.on('connection', function connection(ws) {
            ws.on('message', toEvent).on('authenticate', function (data) {
                console.log(data)
                jwt.verify(data.token, key, function (err, decoded) {
                    if(!(err != null)) {
                        console.log(decoded);
                        //forwardMsg(JSON.stringify(req.body), decoded.sub);
                        ws.send('OK');
                    } else {
                        console.log("403 - Forbidden");
                        ws.send('Forbidden');
                    }
                    console.log(decoded);
                });
            });
        })
    })
})
