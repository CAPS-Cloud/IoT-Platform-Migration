const axios = require("axios");
const request = require("request");

const host = "http://" + process.env.CONNECT + "/";

const ELASTICSEARCH_HOST = "http://" + process.env.ELASTICSEARCH;

function addConnectJob(topic) {
  console.log("Adding connector", topic);
  return new Promise(function (resolve, reject) {
    console.log("adding connector");

    let body_data = {
      name: topic,
      config: {
        "connector.class":
          "io.confluent.connect.elasticsearch.ElasticsearchSinkConnector",
        "tasks.max": "1",
        topics: topic,
        "connection.url": ELASTICSEARCH_HOST,
        "connection.username": process.env.ELASTICSEARCH_USER,
        "connection.password": process.env.ELASTICSEARCH_PASSWORD,
        name: topic,
        "type.name": "_doc",
        "value.converter": "org.apache.kafka.connect.json.JsonConverter",
        "value.converter.schemas.enable": "false",
        "schema.ignore": "true",
        "key.ignore": "true",
      },
    };

    request(
      {
        method: "post",
        url: `${host}connectors/`,
        headers: { "Content-Type": "application/json" },
        json: body_data,
      },
      function (err, response, body) {
        if (err) {
          reject(err);
        } else {
          console.log("Running connector", topic);
          resolve(response);
        }
      }
    );
  });
}

function getAllJobs() {
  return axios.get(`${host}connectors/`);
}

function deleteConnectJob(name) {
  console.log("Canceling connect job", name);
  return new Promise(function (resolve, reject) {
    getAllJobs()
      .then((res) => {
        const jobs = res;

        for (var i = 0; i < jobs.length; i++) {
          const job = jobs[i];

          if (job === name) {
            axios
              .delete(`${host}connectors/${job}`)
              .then((res) => {
                console.log("Done canceling connect job", name);
                resolve(res);
              })
              .catch((err) => reject(err));
            return;
          }
        }
        resolve(null);
      })
      .catch((err) => reject(err));
  });
}

module.exports = {
  host,
  addConnectJob,
  getAllJobs,
  deleteConnectJob,
};
