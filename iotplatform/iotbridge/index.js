var express = require('express')
var mqtt = require('mqtt')
var kafka = require("kafka-node")

var app = express()
var mqttClient, kafkaProducer, kafkaClient

async function initKafka() {
  return new Promise((resolve) => {
    console.log("attempting to initiate Kafka connection...")
    kafkaClient = new kafka.Client("kafka:2181")

    kafkaProducer = new kafka.HighLevelProducer(kafkaClient)
    kafkaProducer.on("ready", () => {
        console.log("kafka producer is connected and ready")
    })
    kafkaProducer.on("error", (error) => {
        console.error(error)
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
    mqttClient.on('error', (err) => {
        console.log(err)
    })
    resolve()
  })
}

Promise.all([initMqtt(), initKafka()]).then(() => {
  mqttClient.on('message', (topic, message) => {
    console.log("received: ",  message.toString())
    let payloads = [
      { topic: 'livedata', messages: message.toString() }
    ]
    kafkaProducer.send(payloads, function (err, data) {
      console.log("forwarded to kafka")
    })
  })
})
