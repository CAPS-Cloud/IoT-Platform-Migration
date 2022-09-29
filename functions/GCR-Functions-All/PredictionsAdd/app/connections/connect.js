const axios = require('axios')
const request = require('request')

const host = 'http://10.195.5.180:13936' //Iot-connect port
const ELASTICSEARCH_HOST = 'http://10.195.5.180:28242' //Elastic serach port 9200

function addConnectJob (topic) {
    console.log("Adding connector", topic);
    return new Promise(function (resolve, reject) {
        console.log("adding connector");

        let body_data = {
            "name": topic,
                "config": {
            "connector.class": "io.confluent.connect.elasticsearch.ElasticsearchSinkConnector",
            "tasks.max": "1",
            "topics": topic,
            "key.ignore": "true",
            "connection.url": ELASTICSEARCH_HOST,
            "connection.username": 'elastic',
            "connection.password": 'CzJToWAkKYt4R71V7izW',
            "type.name": "test-type",
            "transforms": "TimestampConverter",
            "transforms.TimestampConverter.type": "org.apache.kafka.connect.transforms.TimestampConverter$Value",
            "transforms.TimestampConverter.target.type": "Timestamp",
            "transforms.TimestampConverter.field": "timestamp",
            "name": topic
            }
        };

        request({
            method: 'post',
            url: `${host}connectors/`,
            headers: { "Content-Type": "application/json" },
            json: body_data,
        }, function (err, response, body) {
            if (err) {
                reject(err);
            } else {
                console.log("connector started ", response);
                console.log("Running connector", topic);
                resolve(response);
            }
        });
    });
}

function getAllJobs () {
    return axios.get(`${host}connectors/`)
}

function deleteConnectJob (name) {
    console.log("Canceling connect job", name);
    return new Promise(function (resolve, reject) {
        getAllJobs().then(res => {
            const jobs = res;

            for (var i = 0; i < jobs.length; i++) {
                const job = jobs[i];

                if (job === name) {
                    axios.delete(`${host}connectors/${job}`).then(res => {
                        console.log("Done canceling connect job", name);
                        resolve(res);
                    }).catch(err => reject(err));
                    return;
                }
            }
            resolve(null);
        }).catch(err => reject(err));
    });
}


module.exports = {
    host,
    addConnectJob,
    getAllJobs,
    deleteConnectJob
};
