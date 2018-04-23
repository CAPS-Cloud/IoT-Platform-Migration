var express = require('express')
var mqtt = require('mqtt')
var app = express()

var client  = mqtt.connect({host: "activemq", port: 1883})

client.on('connect', () => {
  console.log("Connected to ActiveMQ")
  client.subscribe('livedata')
})

client.on('message', (topic, message) => {
  console.log("received: " + message.toString())
})

client.on('error', (err) => {
    console.log(err)
    console.log("error...")
})

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(8081, function () {
  console.log('app listening on port 8081!')
})
