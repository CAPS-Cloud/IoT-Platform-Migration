const express = require('express');
const mqtt = require('mqtt');
const app = express();

const args = process.argv;
const MQTT_GATEWAY = args[2];
const MQTT_GATEWAY_HOST = MQTT_GATEWAY.split(":")[0];
const MQTT_GATEWAY_PORT = parseInt(MQTT_GATEWAY.split(":")[1]);
const IOTCORE_BACKEND = args[3];
const DEVICE_ID = args[4]
const SENSOR_ID = args[5]
const TOKEN = args[9]
var sign = args[8]
var count = 0;
var num = parseInt(args[6]);
var change = parseInt(args[7]);
var client  = mqtt.connect({
    host: MQTT_GATEWAY_HOST,
    port: MQTT_GATEWAY_PORT,
    username: 'JWT',
    password: TOKEN,
    keepalive: 1000,
    settings: {
        protocolId: 'MQIsdp',
        protocolVersion: 3
    }
});

client.on('connect', function () {
    console.log("Connected to Mosca!")

    setInterval(() => {
        produceMessage()
    }, 1000);
})

function generateMessage(num) {
	count = count + 1;
	console.log(count + ',' + num);
    return {
        "sensor_id" : "" + SENSOR_ID,
        "timestamp" : Number("" + (new Date()).getTime() + "000"),
        "value" : "" + num
    };
}

function produceMessage() {
    let payload

  /*  if(Math.random() > 0.5) {
        payload = [];
        let cnt = Math.ceil(Math.random() * 5);
        let i = 0;
        while(i <= cnt) {
            payload.push(generateMessage());
	    console.log("payload.push");
            i++;
        }
    } else {
        payload = generateMessage();
	console.log("payload");
    }*/
    
    payload = generateMessage(num);
    client.publish("" + DEVICE_ID, JSON.stringify(payload));
    if (sign == "increase") {
	num = num + change;
    }
    if (sign == "decrease") {
    	num = num - change;
    }
}
