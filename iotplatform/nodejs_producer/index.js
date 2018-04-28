var express = require('express')
var mqtt = require('mqtt')
var app = express()

var client  = mqtt.connect({host: "activemq", port: 1883})

client.on('connect', function () {
  console.log("Connected to ActiveMQ!!")
  client.subscribe('livedata')

  let it = 1
  setInterval(() => {
    let msg = {
      "iteration" : it,
      "lat" : 59.58,
      "long" : 27.23
    }
    console.log("publish: ", msg)
    client.publish('livedata', JSON.stringify(msg))
    it += 1
  }, 2500)
})

client.on('error', (err) => {
    console.log(err)
    console.log("error...")
})
