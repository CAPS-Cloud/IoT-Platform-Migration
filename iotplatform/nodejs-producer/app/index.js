const express = require('express');
const mqtt = require('mqtt');
const app = express();

const args = process.argv;
const MQTT_GATEWAY = args[2];
const MQTT_GATEWAY_HOST = MQTT_GATEWAY.split(":")[0];
const MQTT_GATEWAY_PORT = parseInt(MQTT_GATEWAY.split(":")[1]);

const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpb3RwbGF0Zm9ybSIsInN1YiI6IjEyMzQ1IiwibmJmIjoxNTMxMTMyODA4LCJleHAiOjE1NjI2Njg4MDgsImlhdCI6MTUzMTEzMjgwOCwianRpIjoiaWQxMjM0NTYiLCJ0eXAiOiJodHRwczovL2lvdHBsYXRmb3JtLmNvbSJ9.dZoOJcfI2bd32FJtQoTtMt7AxlklFFbzmPdJQ3Q08JSvn82y4eje1MGFOQDa76HfyOUuvhxiw6kzxpH2i5bSP-KrJ-TsXfrlgY0YxX2SqNFVm7ArzYtH3auHpht8q3ZfNch3RbnDHDv2VyUNFeoYOWjBtveGQgk5I9Ox_bbYZ5EuBakTlahuv_PG3OSkq59626Usvzqo77XyWYPuHcsxTa-m3DBSBHufF95sbtDemjxQP5NhYkE_OM6ZZmRItxHEJqBVDEG9JI64ECnwi6XNcq3nk_CzJNXbEnivN42vIPzdodzDECsJr2say9hOJhvpAQMCdh3SYwN063rPMjf9aMIXYmilxh0y0uCo8w2E8RxoRw51gbDlDZiq3D1LXlAL2h6-3Zm21_ip1kKSzaT6DdYsjssns1ofl6xRY5bVZbEi9oNO7WxgWVCnSHQ2Xim8TsXCPvAczsiLehHCW-ZC6xHvU7yZ0n6QLC3Oo4VTA7gAR9R1B4tIpwKcuc6fo0hqZ24lUwtpcnahmC6CBv-WPQ07pED677PguqEk_NVXL6LAZHFcI9fFeQX7ubWAXwjGyv7xKnA88453k6ylczb6KuHGvc9FY351CRiBXDxu0wnl9j9lAJaTs7Mb-52A5UuANUhbaXgAD1uMhIA3xtJJ3wL_yq8LTurSHVOEAS9xFl8"


var client  = mqtt.connect({
    host: MQTT_GATEWAY_HOST,
    port: MQTT_GATEWAY_PORT,
    username: 'JWT',
    password: token,
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

function generateMessage() {
    return {
        "sensor_id" : "91345692",
        "timestamp" : Number("" + (new Date()).getTime() + "000000"),
        "value" : "" + Math.random() * 100
    };
}

function produceMessage() {
    let payload

    if(Math.random() > 0.5) {
        payload = [];
        let cnt = Math.ceil(Math.random() * 5);
        let i = 0;
        while(i <= cnt) {
            payload.push(generateMessage());
            i++;
        }
    } else {
        payload = generateMessage();
    }

    client.publish("12345", JSON.stringify(payload));
}
