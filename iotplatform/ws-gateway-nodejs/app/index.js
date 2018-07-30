const kafka = require("kafka-node");
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const fs = require('fs');

var wsserver, kafkaProducer, kafkaClient

const key = fs.readFileSync('./.keys/jwtRS256.key.pub');  // get public key
const wsPort = 8765;

const args = process.argv;
const ZOOKEEPER = args[2];

/**
 * Create a websocket server verifies its clients using JWT tokens
 *
 * The JWT token must be given as a HTTP header "authorization: Bearer [token]"
 * in the initial HTTP-Upgrade request.
 */
async function initWebSocket() {
    // console.log("attempting to initiate ws server...");
    return new Promise((resolve) => {
        wsserver = new WebSocket.Server({
            port: wsPort,
            verifyClient: (info, cb) => {
                // Look for a HTTP header that looks like: "authorization: Bearer [token]"
                const auth = info.req.headers.authorization;
                const bearer = 'Bearer '; // Prefix
                if(auth === undefined || !auth.startsWith(bearer)) {
                    cb(false, 401, 'Unauthorized');
                    return;
                }
                const jwtToken = auth.substr(bearer.length);

                jwt.verify(jwtToken, key, function(err, decoded) {
                    if(err) {
                        cb(false, 403, 'Forbidden');
                        return;
                    }
                    info.req.user = decoded;
                    cb(true);
                });
            }
        });
        resolve();
    })
}

/**
 * Create a high level producer using the zookeeper given as command line argument.
 */
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
            // console.error("couldn't forward message to kafka, topic: ", payloads[0].topic ," - error: ", err);
        } else {
            // console.log("forwarded to kafka:")
            // console.log(payloads)
            console.log((new Date()).getTime() + "-----" + JSON.stringify(payloads))
        }
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
            // message was an array of message objects
            for (var i = 0, len = parsedMsg.length; i < len; i++) {
                ingestMsgInKafka([
                    { topic: deviceId + "_" + parsedMsg[i].sensor_id, messages: JSON.stringify(parsedMsg[i]) }
                ]);
            }
        } else {
            // message was the message object itself
            ingestMsgInKafka([
                { topic: deviceId + "_" + parsedMsg.sensor_id, messages: messageString }
            ]);
        }
    } catch(error) {
      console.error(error);
    }
}


Promise.all([initKafka()]).then(() => {
    initWebSocket().then(() => {
        // Wait for new clients connecting to the websocket server
        wsserver.on('connection', (conn, req) => {
            conn.on('message', (data) => {
                // Forward all messages and use the 'sub' field of the JWT
                // token as the deviceId
                forwardMsg(data, req.user.sub);
            });
        });
    });
})
