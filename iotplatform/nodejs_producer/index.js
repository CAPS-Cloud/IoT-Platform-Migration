var express = require('express')
var mqtt = require('mqtt')
var app = express()

var client  = mqtt.connect({host: "activemq", port: 1883})

client.on('connect', function () {
  console.log("Connected to ActiveMQ!!")
  client.subscribe('livedata')

  let it = 1
  setInterval(() => {
    let msg = 'message #' + it
    console.log("publish: " + msg)
    client.publish('livedata', msg)
    it += 1
  }, 500)
})

client.on('error', (err) => {
    console.log(err)
    console.log("error...")
})

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(8082, function () {
  console.log('app listening on port 8082!')
})
