var express = require('express')
var mqtt = require('mqtt')
var app = express()

var client  = mqtt.connect({host: "activemq", port: 1883})

client.on('connect', function () {
  console.log("Connected to ActiveMQ!!")
  client.subscribe('livedata')

  setInterval(() => {
    produceMessage()
  }, 200)

  setInterval(() => {
    var int = setInterval(() => {
      produceMessage()
    },20)
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
  console.log("publish: ", JSON.stringify(msg))
  client.publish('livedata', JSON.stringify(msg))
}
