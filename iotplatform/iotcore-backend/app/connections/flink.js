const axios = require('axios');
const request = require('request');

const host = 'http://' + process.env.FLINK + '/';
//const host = 'http://iot.pcxd.me:8081/';

const ELASTICSEARCH_HOST = require('./elasticsearch').host;
const ELASTICSEARCH_HOST_DOMAIN = ELASTICSEARCH_HOST.split(':')[0];
const ELASTICSEARCH_BIN_PORT = require('./elasticsearch').bin_port;
const KAFKA_HOST = require('./kafka').host;
const ZOOKEEPER_HOST = require('./zookeeper');

function addFlinkJob(topic, fileName, fileBuffer) {
    console.log("Adding flink job", topic);
    return new Promise(function (resolve, reject) {
        console.log("Uploading flink jar");

        const boundary = "xxxxxxxxxx";
        var data = "";
        data += "--" + boundary + "\r\n";
        data += "Content-Disposition: form-data; name=\"jarfile\"; filename=\"" + fileName + "\"\r\n";
        data += "Content-Type:application/octet-stream\r\n\r\n";

        request({
            method: 'post',
            url: `${host}jars/upload`,
            headers: { "Content-Type": "multipart/form-data; boundary=" + boundary },
            body: Buffer.concat([Buffer.from(data, "utf8"), fileBuffer, Buffer.from("\r\n--" + boundary + "\r\n", "utf8")]),
        }, function (err, response, body) {
            if (err) {
                reject(err);
            } else {
                console.log("Uploaded flink jar");
                console.log("Running flink job", topic);
                const body = JSON.parse(response.body);
                const jarId = body.filename.split("/")[body.filename.split("/").length - 1];
                const programArgs = `--elasticsearch "${ELASTICSEARCH_HOST_DOMAIN}" --elasticsearch_port ${ELASTICSEARCH_BIN_PORT} --topic ${topic} --bootstrap.servers "${KAFKA_HOST}" --zookeeper.connect "${ZOOKEEPER_HOST}" --groud.id flink_job`;
                axios.post(`${host}jars/${jarId}/run?program-args=${encodeURIComponent(programArgs)}`).then(response2 => {
                    console.log("Ran flink job", topic);
                    resolve(response2);
                }).catch(err2 => {
                    reject(err2);
                });
            }
        });
    });
}

function deleteFlinkJob(topic) {
    console.log("Canceling flink job", topic);
    return new Promise(function (resolve, reject) {
        axios.get(`${host}jobs/overview/`).then(res => {
            const jobs = res.data["jobs"];

            for (var i = 0; i < jobs.length; i++) {
                const job = jobs[i];

                if (job.name == topic) {
                    axios.delete(`${host}jobs/${job.jid}/cancel/`).then(res => {
                        console.log("Done canceling flink job", topic);
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
    addFlinkJob,
    deleteFlinkJob,
};
