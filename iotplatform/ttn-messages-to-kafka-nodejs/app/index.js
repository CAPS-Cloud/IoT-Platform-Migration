const kafka = require("kafka-node");
const args = process.argv;
const MARIADB = args[2];
const ZOOKEEPER = args[3];
process.env.MARIADB = MARIADB;

const Devices = require('./models/DevicesModel');
const Sensors = require('./models/SensorsModel');
const Users = require('./models/UsersModel');

var kafkaProducer, kafkaClient;

var mqtt = require('mqtt');

/**
 * Create a high level producer using the zookeeper from command line arguments.
 */
async function initKafka() {
    return new Promise((resolve) => {
        console.log("attempting to initiate Kafka connection...");
        kafkaClient = new kafka.Client(ZOOKEEPER);

        kafkaProducer = new kafka.HighLevelProducer(kafkaClient);
        kafkaProducer.on("ready", () => {
            console.log("kafka producer is connected and ready")
        });
        kafkaProducer.on('ready', () => {
            console.log("kafka producer is connected and ready and resolved");
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
        if (err) {
            console.error("couldn't forward message to kafka, topic: ", payloads[0].topic, " - error: ", err);
        } else {
            console.log("forwarded to kafka:")
            console.log(payloads)
            //console.log((new Date()).getTime() + "-----" + JSON.stringify(payloads))
        }
    })
}

/**
 * Send one or multiple sensor messages to kafka using `ingestMsgInKafka`.
 * @param {string} message sensor data to send. Must be a stringified JSON array or JSON object
 * @param {string} user_deviceId (verified) user and device indentifier that is concatenated with the sensor id resulting in the kafka topic name
 */
function forwardMsg(message, user_deviceId) {
    try {
        let messageString;

        if (typeof (message) === "string") {
            messageString = message;
        } else {
            console.log("invalid type of data - not forwarded to kafka")
            return;
        }

        let parsedMsg = JSON.parse(messageString);
        if (Array.isArray(parsedMsg)) {
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
    } catch (error) {
        console.error(error);
    }
}

function formatNumber(n) {
    var str;
    if (n < 10) {
        str = "0" + n;
    } else {
        str = "" + n;
    }
    return str;
}

var ttnClients = [];
var unique_device_names = [];

function ttnconnect(ttnClient, topic){
    ttnClient.on('connect', function () {
        //console.log(ttnClient);
        ttnClient.subscribe(topic); //replace my application key with yours
        console.log('Connected to MQTT broker of TTN!');
    });
}
function registerTTNDevices() {

    Devices.findAll({include: [{model: Sensors}, {model: Users}]}).then(devices => {
        if (devices) {
            devices.forEach(device => {
                if (device.userId !== '' && device.clientId !== '' && device.username !== '' && device.password !== '' && device.url !== '' && device.ttn_topic_to_subscribe !== '') {
                    var dev_name = "" + device.userId + "_" + device.clientId + "_" + device.username + "_" + device.name;
                    if (unique_device_names.includes(dev_name)) {
                        //In the array! so skip
                        console.log("already in the devices", dev_name)

                    } else {
                        //Not in the array
                        let options = {
                            clientId: device.clientId,
                            username: device.username,
                            password: device.password //your access key for the application (default key)
                        };
                        let ttnClient;
                        if (device.url.includes("mqtt://")) {

                            ttnClient = mqtt.connect(device.url, options);
                        } else {
                            ttnClient = mqtt.connect("mqtt://" + device.url, options);
                        }

                        ttnClients.push(ttnClient);
                        unique_device_names.push(dev_name);
                        console.log("Added ttn client", device.clientId);

                        ttnClient.on("error", function (error) {
                            console.log("MQTT: Can't connect" + error);
                            //process.exit(1);
                        });

                        ttnconnect(ttnClient, device.ttn_topic_to_subscribe);

                        ttnClient.on('message', function (topic, message) {
                            var obj;
                            obj = JSON.parse(message.toString());
                            console.log(obj);
                            if (typeof obj !== 'undefined' && typeof obj.payload_fields !== 'undefined' && typeof obj.payload_fields.username !== 'undefined') {


                                //console.log(day.toString().padStart(2, "0")+"."+month.toString().padStart(2, "0")+"."+year+"  "+hours.toString().padStart(2, "0")+":"+minutes.toString().padStart(2, "0")+":"+seconds.toString().padStart(2, "0")+" MsgNbr: "+obj.counter+" Count: "+obj.payload_fields.Count+" Battery: "+obj.payload_fields.Battery);
                                //console.log(day.toString() +"."+month.toString() +"."+year+"  "+hours.toString() +":"+minutes.toString() +":"+seconds.toString() +" MsgNbr: "+obj.counter+" Count: "+obj.payload_fields.Count+" Battery: "+obj.payload_fields.Battery);

                                Users.findOne({
                                    where: {username: obj.payload_fields.username}
                                }).then(user => {
                                    if (user) {
                                        Devices.findOne({
                                            where: {name: obj.dev_id, userId: user.id},
                                            include: [{model: Sensors}]
                                        }).then(device => {
                                            if (device) {
                                                let DEVICE_ID = device.id;
                                                let USER_ID = user.id;
                                                let found = false;

                                                let sensor_names = Object.keys(obj.payload_fields);
                                                for (let i = sensor_names.length - 1; i >= 0; i--) {
                                                    if (sensor_names[i] === "username") {
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
                                                                    "timestamp": parseInt(Number("" + (new Date()).getTime())),
                                                                    "value": Number(obj.payload_fields["" + sensor_names[i]]),
                                                                    "mqtt_gateway": "ttn"
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

                                console.log("object or payload_fields is undefined or username is not added as part of it", obj);
                            }

                        });
                    }
                }else {

                    console.log("All fileds in device are not filled", device);
                }
            });
        } else {
            console.log("NO DEVICES FOUND")
        }
    });
}


Promise.all([initKafka()]).then(() => {

    registerTTNDevices();
    var intervalID = setInterval(function(){
        console.log("finding for any new device")
        registerTTNDevices();
    }, 300000);



});


