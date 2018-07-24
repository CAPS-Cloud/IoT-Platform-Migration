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
            server.authenticate = (client, username, password, callback) => {
                if( username !== 'JWT' ) {
                    return callback("Invalid Credentials", false);
                }

                jwt.verify(password.toString(), key, (err, profile) => {
                    if( err ) {
                        return callback("Error getting UserInfo", false);
                    }
                    console.log("Authenticated client " + profile.sub);
                    client.deviceProfile = profile;
                    return callback(null, true);
                });
            }

            server.authorizePublish = (client, topic, payload, callback) => {
                if(client.deviceProfile.sub === topic) {
                    callback(null, true);
                } else {
                    console.log("Not authorized to publish on this topic");
                    callback(null, false);
                }
            }

            server.authorizeSubscribe = (client, topic, callback) => {
                callback(null, false);
            }

            console.log('Mosca server is up and running')
            resolve()
        }
    })
}

function ingestMsgInKafka(payloads) {
    kafkaProducer.send(payloads, (err) => {
        if(err) {
            console.error("couldn't forward message to kafka, topic: ", payloads[0].topic ," - error: ", err);
        } else {
            console.log("forwarded to kafka:")
            console.log(payloads)
        }
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
        JSON.parse(messageString).forEach((elem) => {
            payloads = [
                { topic: deviceId + "_" + elem.sensor_id, messages: JSON.stringify(elem) }
            ];       
            ingestMsgInKafka(payloads);
        });
    } else {
        payloads = [
            { topic: deviceId + "_" + JSON.parse(messageString).sensor_id, messages: messageString }
        ];
        ingestMsgInKafka(payloads);
    }
}

Promise.all([initKafka()]).then(() => {
    initMqtt().then(() => {
        // fired when a message is received
        server.on('published', function(packet, client) {
            if(!(packet.payload.toString().includes('mqttjs_'))) {
                forwardMsg(packet.payload.toString(), packet.topic);
            }
        });
    })
})
