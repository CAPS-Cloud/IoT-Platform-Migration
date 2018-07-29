const kafka = require("kafka-node")
const mosca = require('mosca')
const jwt = require('jsonwebtoken');
const fs = require('fs');

const key = fs.readFileSync('./.keys/jwtRS256.key.pub');  // get public key

const MQTT_PORT = 1883;
const args = process.argv;
const ZOOKEEPER = args[2];
const IOTCORE_BACKEND = args[3];
const REDIS = args[4];
const REDIS_HOST = REDIS.split(":")[0];
const REDIS_PORT = parseInt(REDIS.split(":")[1]);

var server, kafkaProducer, kafkaClient

/**
 * Create a high level producer using the zookeeper from command line arguments.
 */
async function initKafka() {
    return new Promise((resolve) => {
        // console.log("attempting to initiate Kafka connection...")
        kafkaClient = new kafka.Client(ZOOKEEPER)

        kafkaProducer = new kafka.HighLevelProducer(kafkaClient)
        kafkaProducer.on("ready", () => {
            // console.log("kafka producer is connected and ready")
        })
        kafkaProducer.on('ready', () => {
          resolve()
        })
    })
}

/**
 * Create a MQTT broker using mosca and redis as the backend.
 */
async function initMqtt() {
    return new Promise((resolve) => {
        let ascoltatore = {
            type: 'redis',
            redis: require('redis'),
            db: 12,
            port: REDIS_PORT,
            return_buffers: true,
            host: REDIS_HOST
        }

        let moscaSettings = {
            port: MQTT_PORT,
            backend: ascoltatore,
            persistence: {
                factory: mosca.persistence.Redis,
                host: REDIS_HOST,
                port: REDIS_PORT
            }
        }

        server = new mosca.Server(moscaSettings)

        server.on('ready', setup)

        server.on('clientConnected', (client) => {
        	 console.log('client connected', client.id)
        })

        // fired when the mqtt server is ready
        function setup() {
            // The MQTT client authenticates by sending 'JWT' as the username
            // and the JWT token as the password
            server.authenticate = (client, username, password, callback) => {
                if( username !== 'JWT' ) {
                    return callback("Invalid Credentials", false);
                }

                jwt.verify(password.toString(), key, (err, profile) => {
                    console.log(err)
                    if( err ) {
                        return callback("Error getting UserInfo", false);
                    }
                    console.log("Authenticated client " + profile.sub);
                    // Memorize the verified JWT for the current client
                    client.deviceProfile = profile;
                    return callback(null, true);
                });
            }

            server.authorizePublish = (client, topic, payload, callback) => {
                // The JWT's 'sub' field contains the device id
                if(client.deviceProfile.sub === topic) {
                    callback(null, true);
                } else {
                    // console.log("Not authorized to publish on this topic");
                    callback(null, false);
                }
            }

            server.authorizeSubscribe = (client, topic, callback) => {
                // Subscription is not allowed on the gateway
                callback(null, false);
            }

            // console.log('Mosca server is up and running')
            resolve()
        }
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
    initMqtt().then(() => {
        // fired when a message is received
        server.on('published', function(packet, client) {
            // TODO Why are checking for 'mqttjs_' ?
            if(!(packet.payload.toString().includes('mqttjs_'))) {
                forwardMsg(packet.payload.toString(), packet.topic);
            }
        });
    })
})
