const { spawn } = require('child_process');
const ZOOKEEPER = require('./zookeeper');
const KAFKA_PATH = "kafka_2.12-2.4.1";
const KAFKA_TOPIC_PATH = `${KAFKA_PATH}/bin/kafka-topics.sh`;
const { kafkahost } = require('./common')


function addTopic(topic) {
    console.log("Adding kafka topic", topic);
    return new Promise(function (resolve, reject) {
        const child = spawn(KAFKA_TOPIC_PATH, ['--create', '--partitions', '1', '--replication-factor', '1', '--topic', topic, '--zookeeper', ZOOKEEPER]);
        console.log(KAFKA_TOPIC_PATH, ['--create', '--partitions', '1', '--replication-factor', '1', '--topic', topic, '--zookeeper', ZOOKEEPER]);

        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);

        child.on('close', (code) => {
            if (code == 0) {
                console.log("Done adding kafka topic", topic);
                resolve(code);
            } else {
                reject(code);
            }
        });
    });
}

function deleteTopic (topic) {
    console.log("Deleting kafka topic", topic);
    return new Promise(function (resolve, reject) {
        const child = spawn(KAFKA_TOPIC_PATH, ['--delete', '--zookeeper', ZOOKEEPER, '--topic', topic]);
        console.log(KAFKA_TOPIC_PATH, ['--delete', '--zookeeper', ZOOKEEPER, '--topic', topic]);

        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);

        child.on('close', (code) => {
            if (code == 0) {
                console.log("Done deleting kafka topic", topic);
                resolve(code);
            } else {
                reject(code);
            }
        });
    });
}

//Kafka port corresponding to 9092
module.exports = {
    addTopic,
    deleteTopic,
    host: kafkahost
};
