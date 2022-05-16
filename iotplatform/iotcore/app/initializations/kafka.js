const kafka = require("../connections/kafka");
const Sensors = require("../models/SensorsModel");
const Users = require("../models/UsersModel");
const Devices = require("../models/DevicesModel");
const Alerts = require("../models/AlertsModel");
const fsp = require("fs").promises;

async function syncKafkaTopics() {
  try {
    const sensors = await Sensors.findAll();

    console.log(sensors.length + " sensors found");

    for (sensor of sensors) {
      console.log("Sensor " + sensor.id + " checked!");
      let device;
      try {
        device = await Devices.findOne({ where: { id: sensor.deviceId } });
      } catch (error) {
        console.error("Search for device " + sensor.deviceId + " failed!");
      }

      console.log("Device " + device.id + " found!");

      if (device) {
        let topic = `${device.userId}_${sensor.deviceId}_${sensor.id}`;
        try {
          await kafka.addTopic(topic);
        } catch (error) {
          console.error(error);
        }
      } else {
        console.log("Device not found");
      }
    }
  } catch (err) {
    console.error(err);
  }
}

syncKafkaTopics();
