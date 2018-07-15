var mqtt = require('mqtt')
var kafka = require("kafka-node")
var mosca = require('mosca')

var server, kafkaProducer, kafkaClient

const MQTT_PORT = 1883;
const args = process.argv;
const ZOOKEEPER = args[2];
const IOTCORE_BACKEND = args[3];
const REDIS = args[4];
const REDIS_HOST = REDIS.split(":")[0];
const REDIS_PORT = parseInt(REDIS.split(":")[1]);

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
            return_buffers: true, // to handle binary payloads
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

        server.on('clientConnected', function(client) {
        	console.log('client connected', client.id)
        })

        // fired when the mqtt server is ready
        function setup() {
            console.log('Mosca server is up and running')
            resolve()
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
            console.error("couldn't forward message to kafka, topic: ", payloads[0].topic ," - error: ", err);
        } else {
            console.log("forwarded to kafka:")
            console.log(payloads)
        }
    })
}

Promise.all([initKafka()]).then(() => {
    initMqtt().then(() => {
        // fired when a message is received
        server.on('published', function(packet, client) {
            if(!(packet.payload.toString().includes('mqttjs_'))) {
                forwardMsg(packet.payload.toString(), 123);
            }
        });
    })
})
