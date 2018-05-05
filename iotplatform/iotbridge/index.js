var express = require('express')
var mqtt = require('mqtt')
var kafka = require("kafka-node")
var bodyParser = require("body-parser")
var WebSocket = require('ws')

var httpPort = 8083
var wsPort = 8765
var zookeeperPort = 2181

var wsserver, httpServer, mqttClient, kafkaProducer, kafkaClient

async function initWebSocket() {
  console.log("attempting to initiate ws server...")
  return new Promise((resolve) => {
    wsserver = new WebSocket.Server({ port: wsPort })
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
      console.log("http: ", JSON.stringify(req.body))
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

Promise.all([initKafka()]).then(() => {
  initMqtt().then(() => {
    mqttClient.on('message', (topic, message) => {
      console.log("mqtt: ", message.toString())
      forwardMsg(message.toString())
    })
  })

  initWebSocket().then(() => {
    wsserver.on('connection', function connection(ws) {
      ws.on('message', function incoming(message) {
        console.log("wsserver: ", message)
        forwardMsg(message)
      })
    })
  })

  initRest().then(() => {

  })
})
