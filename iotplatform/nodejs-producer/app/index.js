const express = require('express');
const mqtt = require('mqtt');
const app = express();

const args = process.argv;
const MQTT_GATEWAY = args[2];
const MQTT_GATEWAY_HOST = MQTT_GATEWAY.split(":")[0];
const MQTT_GATEWAY_PORT = parseInt(MQTT_GATEWAY.split(":")[1]);

var client  = mqtt.connect({host: MQTT_GATEWAY_HOST, port: MQTT_GATEWAY_PORT});

client.on('connect', function () {
    console.log("Connected to Mosca!")
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
        "sensor_id" : "915692",
        "timestamp" : (new Date()).getTime(),
        "reading" : "" + Math.random() * 100
    }
    //console.log("publish: ", JSON.stringify(msg))
    client.publish('livedata', JSON.stringify(msg))
}
