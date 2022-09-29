const kafka = require('./connections/kafka');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const Sensors = require('./models/SensorsModel');
const Users = require('./models/UsersModel');
const Devices = require('./models/DevicesModel');
const Alerts = require('./models/AlertsModel');
const Consumers = require('./models/ConsumersModel');
const Predictions = require('./models/PredictionsModel')

async function syncKafkaTopics () {
  try {
      const sensors = await Sensors.findAll();

      for (let sensor of sensors) {
          const device = await Devices.findOne({where: {id: sensor.deviceId}});
          if(device){
              let topic = `${device.userId}_${sensor.deviceId}_${sensor.id}`;
              await kafka.addTopic(topic);
          } else {
              console.log("Device not found");
          }
      }
  } catch (err) {
      console.error(err);
  }
}

function main (params) {
  try {
      syncKafkaTopics().then((response) => {
      console.log("response:", response)
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: { result: response },
      }
    });
  } catch (err) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: { result: err },
    }
  }
}

module.exports.main = main
// main()

