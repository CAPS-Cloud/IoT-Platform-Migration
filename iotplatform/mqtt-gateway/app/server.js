var mqtt = require('mqtt')
var kafka = require("kafka-node")
var grpc = require('grpc')
var mosca = require('mosca')

var PROTO_PATH = __dirname + '/protos/helloworld.proto'
var hello_proto = grpc.load(PROTO_PATH).helloworld

var server, kafkaProducer, kafkaClient

const MQTT_PORT = 1883;
const args = process.argv;
const ZOOKEEPER = args[2];
const IOTCORE_BACKEND = args[3];
const REDIS = args[4];
const REDIS_HOST = REDIS.split(":")[0];
const REDIS_PORT = parseInt(REDIS.split(":")[1]);

async function initGRPC() {
  return new Promise((resolve) => {
    let client = new hello_proto.Greeter(IOTCORE_BACKEND,
                                         grpc.credentials.createInsecure())
    let user
    if (process.argv.length >= 3) {
      user = process.argv[2]
    } else {
      user = 'world'
    }
    client.sayHello({name: user}, function(err, response) {
      console.log("client.sayHello")
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

function forwardMsg(message) {
  let payloads
  if(typeof(message) === "object") {
    payloads = [
      { topic: 'livedata', messages: message.toString() }
    ]
  } else if(typeof(message) === "string") {
    payloads = [
      { topic: 'livedata', messages: message }
    ]
  } else {
    console.log("invalid type of data - not forwarded to kafka")
    return
  }

  kafkaProducer.send(payloads, function (err, data) {
    console.log("forwarded to kafka:")
    console.log(payloads)
  })
}

Promise.all([initKafka(), initGRPC()]).then(() => {
    initMqtt().then(() => {
        // fired when a message is received
        server.on('published', function(packet, client) {
            forwardMsg(packet.payload.toString())
        });
    })
})
