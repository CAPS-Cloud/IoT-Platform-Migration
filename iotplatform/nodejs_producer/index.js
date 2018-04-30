var express = require('express')
var mqtt = require('mqtt')
var app = express()

var client  = mqtt.connect({host: "activemq", port: 1883})

client.on('connect', function () {
  console.log("Connected to ActiveMQ!!")
  client.subscribe('livedata')

  setInterval(() => {
    produceMessage()
  }, 100)

  setInterval(() => {
    var int = setInterval(() => {
      produceMessage()
    },10)
    setTimeout(() => {
      clearInterval(int)
    }, 2000)
  }, 10000)
})

client.on('error', (err) => {
    console.log(err)
    console.log("error...")
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
