var express = require('express')
var mqtt = require('mqtt')
var kafka = require("kafka-node")

var app = express()

var mqttClient  = mqtt.connect({host: "activemq", port: 1883})

console.log("attempting to initiate ActiveMQ connection...")
mqttClient.on('connect', () => {
  console.log("connected to ActiveMQ")
  mqttClient.subscribe('livedata')
})

mqttClient.on('message', (topic, message) => {
  console.log("received: " + message.toString())
})

mqttClient.on('error', (err) => {
    console.log(err)
    console.log("error...")
})

// ####################################################################################################

console.log("attempting to initiate Kafka connection...")
var kafkaClient = new kafka.Client("kafka:2181")

var kafkaProducer = new kafka.HighLevelProducer(kafkaClient)
kafkaProducer.on("ready", () => {
    console.log("kafka producer is connected and ready")
})
kafkaProducer.on("error", (error) => {
    console.error(error)
})
kafkaProducer.on('ready', () => {
  console.log("initializing kafka ingestion")
  let it = 1
  setInterval(() => {
    let payloads = [
        { topic: 'livedata', messages: 'kafka forwarding: ' + it }
    ]
    kafkaProducer.send(payloads, function (err, data) {
        console.log("forwarding to kafka: ")
        console.log(data)
    })
  },500)
})

// ####################################################################################################
