const kafka = require("kafka-node")
const mosca = require('mosca')
const jwt = require('jsonwebtoken');
const fs = require('fs');

const key = fs.readFileSync('./.keys/jwtRS256.key.pub');  // get public key

const MQTT_PORT = 1883;
const args = process.argv;
const MARIADB = args[2];
const ZOOKEEPER = args[3];
const REDIS = args[4];
const REDIS_HOST = REDIS.split(":")[0];
const REDIS_PORT = parseInt(REDIS.split(":")[1]);

process.env.MARIADB = MARIADB;

const Devices = require('./models/DevicesModel');
const Sensors = require('./models/SensorsModel');
const Users = require('./models/UsersModel');

var server, kafkaProducer, kafkaClient;

/**
 * Create a high level producer using the zookeeper from command line arguments.
 */
async function initKafka() {
    return new Promise((resolve) => {
         console.log("attempting to initiate Kafka connection...")
        kafkaClient = new kafka.Client(ZOOKEEPER);

        kafkaProducer = new kafka.HighLevelProducer(kafkaClient);
        kafkaProducer.on("ready", () => {
             console.log("kafka producer is connected and ready")
        });
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

        server = new mosca.Server(moscaSettings);

        server.on('ready', setup);

        server.on('clientConnected', (client) => {
            console.log('client connected', client.id)
        });

        // fired when the mqtt server is ready
        function setup() {
            // The MQTT client authenticates by sending 'JWT' as the username
            // and the JWT token as the password
            server.authenticate = (client, username, password, callback) => {
                if( username !== 'JWT' ) {
                    return callback("Invalid Credentials", false);
                }

                jwt.verify(password.toString(), key, (err, profile) => {
                    //console.log(err)
                    if( err ) {
                        return callback("Error getting UserInfo", false);
                    }
                    console.log("Authenticated client " + profile.sub);
                    // Memorize the verified JWT for the current client
                    client.deviceProfile = profile;
                    console.log(profile);
                    return callback(null, true);
                });
            };

            server.authorizePublish = (client, topic, payload, callback) => {
                // The JWT's 'sub' field contains the device id
                if(client.deviceProfile.sub === topic) {
                    callback(null, true);
                } else {
                    console.log("topic: ", topic);
                    console.log("client: ", client);
                     console.log("Not authorized to publish on this topic");
                    callback(null, false);
                }
            };

            server.authorizeSubscribe = (client, topic, callback) => {
                // Subscription is not allowed on the gateway
                callback(null, false);
            };

             console.log('Mosca server is up and running')
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
             console.log("forwarded to kafka:")
             console.log(payloads)
            // console.log((new Date()).getTime() + "-----" + JSON.stringify(payloads))
        }
    })
}
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function get_message(messageString, topic){
    if (IsJsonString(messageString)) {
        console.log("valid JSON string", messageString);
        let message_object = JSON.parse(messageString);
        if (message_object !== undefined && message_object.hasOwnProperty('username') && message_object.hasOwnProperty('device_id')
            && message_object.hasOwnProperty('timestamp')) {

            Users.findOne({
                where: {username: message_object.username}
            }).then(user => {
                if (user) {
                    Devices.findOne({
                        where: {id: message_object.device_id, userId: user.id},
                        include: [{model: Sensors}]
                    }).then(device => {
                        //console.log(device);
                        if (device) {
                            let DEVICE_ID = device.id;
                            let USER_ID = user.id;
                            let found = false;

                            let sensor_names = Object.keys(message_object);
                            for (let i = sensor_names.length - 1; i >= 0; i--) {
                                if (sensor_names[i] === "username") {
                                    sensor_names.splice(i, 1);
                                }
                                if (sensor_names[i] === "device_id") {
                                    sensor_names.splice(i, 1);
                                }
                                if (sensor_names[i] === "timestamp") {
                                    sensor_names.splice(i, 1);
                                }
                            }
                            console.log("Sensor Names", sensor_names);
                            for (let i = 0; i < sensor_names.length; i++) {
                                for (let j = 0; j < device.sensors.length; j++) {
                                    if (sensor_names[i] === device.sensors[j].name) {

                                        let sensor_id = device.sensors[j].id;
                                        let payload = {
                                            "schema": {
                                                "type": "struct",
                                                "fields": [{
                                                    "type": "string",
                                                    "optional": false,
                                                    "field": "sensor_id"
                                                }, {
                                                    "type": "string",
                                                    "optional": false,
                                                    "field": "sensor_name"
                                                },
                                                    {
                                                        "type": "string",
                                                        "optional": false,
                                                        "field": "device_id"
                                                    }, {
                                                        "type": "int64",
                                                        "optional": false,
                                                        "field": "timestamp"
                                                    }, {
                                                        "type": "double",
                                                        "optional": false,
                                                        "field": "value"
                                                    }, {
                                                        "type": "string",
                                                        "optional": false,
                                                        "field": "mqtt_gateway"
                                                    }

                                                ],
                                                "optional": false,
                                                "name": "total data"
                                            },
                                            "payload": {
                                                "sensor_id": "" + sensor_id, // 0th sensor is count of people,,
                                                "sensor_name": "" + device.sensors[j].name, // 0th sensor is count of people,,
                                                "device_id": "" + DEVICE_ID, // 0th sensor is count of people
                                                "timestamp": parseInt(message_object.timestamp),
                                                "value": Number(message_object["" + sensor_names[i]]),
                                                "mqtt_gateway": "iot_platform"
                                            }
                                        };
                                        let msgStr = JSON.stringify(payload);
                                        forwardMsg(msgStr, "" + USER_ID + "_" + DEVICE_ID);
                                        found = true;
                                        break;
                                    }
                                }
                            }
                            if (!found) {
                                console.log("No Sensors found in the device");
                            }


                        } else {
                            console.log("Device not found");
                        }
                    });
                } else {
                    console.log("User not found");
                }
            });
        } else {

            console.log("object or device_id  is undefined or username is not added as part of it", message_object);
        }
    }
    else {

        console.log("Not a valid json string", messageString);
    }
}

/**
 * Send one or multiple sensor messages to kafka using `ingestMsgInKafka`.
 * @param {string} message sensor data to send. Must be a stringified JSON array or JSON object
 * @param {string} user_deviceId (verified) user and device indentifier that is concatenated with the sensor id resulting in the kafka topic name
 */
function forwardMsg(message, user_deviceId) {
    try {
        let messageString;

        if(typeof(message) === "string") {
            messageString = message;
        } else {
            // console.log("invalid type of data - not forwarded to kafka")
            return;
        }

        let parsedMsg = JSON.parse(messageString);
        if(Array.isArray(parsedMsg)) {
            for (var i = 0, len = parsedMsg.length; i < len; i++) {
                console.log('topic', user_deviceId + "_" + parsedMsg[i].payload.sensor_id);
                ingestMsgInKafka([
                    {topic: user_deviceId + "_" + parsedMsg[i].payload.sensor_id, messages: JSON.stringify(parsedMsg[i])}
                ]);
            }
        } else {
            console.log('topic', user_deviceId + "_" + parsedMsg.payload.sensor_id);

            ingestMsgInKafka([
                {topic: user_deviceId + "_" + parsedMsg.payload.sensor_id, messages: messageString}
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
            console.error("received message: "); console.error(packet.payload.toString());
            // TODO Why are checking for 'mqttjs_' ?
            if(!(packet.payload.toString().includes('mqttjs_')) && packet.topic !== undefined) {
                get_message(packet.payload.toString(), packet.topic)
            }
        });
    })
})
