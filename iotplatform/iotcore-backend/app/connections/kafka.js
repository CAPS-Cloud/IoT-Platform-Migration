const { spawn } = require('child_process');
const ZOOKEEPER = require('./zookeeper');
const KAFKA_PATH = "kafka_2.11-1.1.0";
const KAFKA_TOPIC_PATH = `${KAFKA_PATH}/bin/kafka-topics.sh`;

function addTopic(topic) {
    return new Promise(function (resolve, reject) {
        const child = spawn('ls', [KAFKA_TOPIC_PATH, '--create', '--zookeeper', ZOOKEEPER, '--topic', topic]);

        child.on('close', (code) => {
            if (code == 0) {
                resolve(code);
            } else {
                reject(code);
            }
        });
    });
}

function deleteTopic(topic) {
    return new Promise(function (resolve, reject) {
        const child = spawn('ls', [KAFKA_TOPIC_PATH, '--delete', '--zookeeper', ZOOKEEPER, '--topic', topic]);

        child.on('close', (code) => {
            if (code == 0) {
                resolve(code);
            } else {
                reject(code);
            }
        });
    });
}

module.exports = {
    addTopic,
    deleteTopic,
    host: process.env.KAFKA,
};
