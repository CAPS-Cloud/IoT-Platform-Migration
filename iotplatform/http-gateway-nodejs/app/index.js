var express = require('express')
var kafka = require("kafka-node")
var bodyParser = require("body-parser")
var grpc = require('grpc');

var httpPort = 8083
var PROTO_PATH = __dirname + '/protos/helloworld.proto';
var hello_proto = grpc.load(PROTO_PATH).helloworld;

var httpServer, kafkaProducer, kafkaClient

const args = process.argv;
const ZOOKEEPER = args[2];
const IOTCORE_BACKEND = args[3];

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

async function initRest() {
  console.log("attempting to initiate http server...")
  return new Promise((resolve) => {
    const app = express()
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))

    app.post("/", function (req, res) {
      forwardMsg(JSON.stringify(req.body))
      res.status(200).send('OK')
      res.end()
    })

    httpServer = app.listen(httpPort, () => {
      console.log("app running on port ", httpServer.address().port)
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
  initRest().then(() => {

  })
})
