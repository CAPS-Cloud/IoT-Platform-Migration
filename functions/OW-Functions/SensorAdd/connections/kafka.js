const { spawn } = require("child_process");
const ZOOKEEPER = require("./zookeeper");
const KAFKA_PATH = "kafka_2.12-2.4.1";
const KAFKA_TOPIC_PATH = `${KAFKA_PATH}/bin/kafka-topics.sh`;
const { kafkahost } = require("./common");

const { Kafka } = require("kafkajs");
const kafka = new Kafka({
  clientId: "http-gateway",
  brokers: [kafkahost],
});
const admin = kafka.admin();

function addTopic(topic) {
  console.log("Adding kafka topic", topic);
  return new Promise(function (resolve, reject) {
    admin
      .connect()
      .then(() => {
        admin.listTopics().then((topics) => {
          console.log("Topics: " + topics);
          admin
            .createTopics({
              topics: [{ topic: topic }],
            })
            .then((res) => {
              admin.disconnect().then(() => {
                console.log("Topic created");
                if (res) {
                  resolve("Topic created");
                } else {
                  resolve("Topic already exists");
                }
              });
            });
        });
      })
      .catch((error) => {
        console.log(error);
        reject({
          location: "Kakfa",
          error: error,
        });
      });
  });
}

function deleteTopic(topic) {
  /* console.log("Deleting kafka topic", topic);
  return new Promise(function (resolve, reject) {
    const child = spawn(KAFKA_TOPIC_PATH, [
      "--delete",
      "--zookeeper",
      ZOOKEEPER,
      "--topic",
      topic,
    ]);
    console.log(KAFKA_TOPIC_PATH, [
      "--delete",
      "--zookeeper",
      ZOOKEEPER,
      "--topic",
      topic,
    ]);

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on("close", (code) => {
      if (code == 0) {
        console.log("Done deleting kafka topic", topic);
        resolve(code);
      } else {
        reject(code);
      }
    });
  }); */
}

//Kafka port corresponding to 9092
module.exports = {
  addTopic,
  deleteTopic,
  host: kafkahost,
};
