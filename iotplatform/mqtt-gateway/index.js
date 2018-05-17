var mqtt = require('mqtt')
var kafka = require("kafka-node")
var grpc = require('grpc');

var zookeeperPort = 2181
var PROTO_PATH = __dirname + './protos/helloworld.proto';
var hello_proto = grpc.load(PROTO_PATH).helloworld;

var mqttClient, kafkaProducer, kafkaClient


async function initGRPC() {
  return new Promise((resolve) => {
    let client = new hello_proto.Greeter('iotcore:50051',
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
    kafkaClient = new kafka.Client("zookeeper:" + zookeeperPort)

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
    mqttClient  = mqtt.connect({host: "activemq", port: 1883})

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
