var mqtt = require('mqtt')
var kafka = require("kafka-node")
var grpc = require('grpc');

var PROTO_PATH = __dirname + './protos/helloworld.proto';
var hello_proto = grpc.load(PROTO_PATH).helloworld;

var mqttClient, kafkaProducer, kafkaClient

const args = process.argv;
const ZOOKEEPER = args[2];
const IOTCORE_BACKEND = args[3];
const ACTIVEMQ_MQTT = args[4];
const ACTIVEMQ_MQTT_HOST = ACTIVEMQ_MQTT.split(":")[0];
const ACTIVEMQ_MQTT_PORT = parseInt(ACTIVEMQ_MQTT.split(":")[1]);

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
      //console.log('Greeting:', response.message)
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
    console.log("attempting to initiate ActiveMQ connection...")
    mqttClient  = mqtt.connect({host: ACTIVEMQ_MQTT_HOST, port: ACTIVEMQ_MQTT_PORT})

    mqttClient.on('connect', () => {
      console.log("connected to ActiveMQ")
      mqttClient.subscribe('livedata')
    })
    resolve()
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
    console.log("forwarded to kafka")
  })
}

Promise.all([initKafka(), initGRPC()]).then(() => {
  initMqtt().then(() => {
    mqttClient.on('message', (topic, message) => {
      console.log("mqtt: ", message.toString())
      forwardMsg(message.toString())
    })
  })
})
