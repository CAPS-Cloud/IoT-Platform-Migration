var express = require('express')
var mqtt = require('mqtt')
var kafka = require("kafka-node")
var WebSocket = require('ws');

var port = 8083
var wsPort = 8765

var app = express()
var wsserver, ws, mqttClient, kafkaProducer, kafkaClient


async function initWebSocket() {
  return new Promise((resolve) => {
    wsserver = new WebSocket.Server({ port: wsPort })
    wsserver.on('connection', function connection(ws) {
      ws = ws
      resolve()
    })
  })
}

async function initRest() {
  return new Promise((resolve) => {
    resolve()
  })
}

async function initKafka() {
  return new Promise((resolve) => {
    console.log("attempting to initiate Kafka connection...")
    kafkaClient = new kafka.Client("kafka:2181")

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

Promise.all([initMqtt(), initKafka(), initWebSocket()]).then(() => {
  mqttClient.on('message', (topic, message) => {
    forwardMsg(message)
  })
  ws.on('message', function incoming(message) {
    forwardMsg(message)
  })
})
