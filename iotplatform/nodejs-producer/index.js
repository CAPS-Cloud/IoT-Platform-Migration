var express = require('express')
var mqtt = require('mqtt')
var app = express()

const args = process.argv;
const ACTIVEMQ_MQTT = args[2];
const ACTIVEMQ_MQTT_HOST = ACTIVEMQ_MQTT.split(":")[0];
const ACTIVEMQ_MQTT_PORT = parseInt(ACTIVEMQ_MQTT.split(":")[1]);

var client  = mqtt.connect({host: ACTIVEMQ_MQTT_HOST, port: ACTIVEMQ_MQTT_PORT})

client.on('connect', function () {
  console.log("Connected to ActiveMQ!!")
  client.subscribe('livedata')

  setInterval(() => {
    produceMessage()
  }, 1000)

  setInterval(() => {
    var int = setInterval(() => {
      produceMessage()
    },250)
    setTimeout(() => {
      clearInterval(int)
    }, 2500)
  }, 10000)
})

function produceMessage() {
  let msg = {
    "sensorGroup" : "someGroup123",
    "sensorId" : "someId123",
    "timestamp" : (new Date()).getTime(),
    "reading" : "" + Math.random() * 100
  }
  //console.log("publish: ", JSON.stringify(msg))
  client.publish('livedata', JSON.stringify(msg))
}
