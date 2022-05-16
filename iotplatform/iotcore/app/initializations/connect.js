const connect = require('../connections/connect');
const Sensors = require('../models/SensorsModel');
const Users = require('../models/UsersModel');
const Devices = require('../models/DevicesModel');
const Alerts = require('../models/AlertsModel');
const fsp = require('fs').promises;


async function syncConnectJobs() {
    try {
        const jobs = await connect.getAllJobs();
        var job_names = {};

        for (let i=0;i<jobs.length;i++) {
            job_names[jobs[i]] = true;
        }

        const sensors = await Sensors.findAll();

        for (let sensor of sensors) {
            const device = await Devices.findOne({where: {id: sensor.deviceId}});
            if(device){
                let topic = `${device.userId}_${sensor.deviceId}_${sensor.id}`;
                if (!job_names[topic]) {
                    await connect.addConnectJob(topic);
                }
            }else{
                console.log("Device not found");
            }
        }
        
    } catch(err) {
        console.error(err);
    }
}

syncConnectJobs();
// Sync flink jobs every 60 seconds.
//syncFlinkJobsInterval(60000);

// Sync flink jobs after 10 seconds.
//setTimeout(syncFlinkJobs, 10000);
