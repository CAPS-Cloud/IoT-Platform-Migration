const elasticsearch = require("elasticsearch");
const { elasticsearchhost, elasticserachbinport } = require("./common");

const host = elasticsearchhost; //Elastic serach 9200 port
const bin_port = elasticserachbinport; //Elastic serach 9200 port

const elasticClient = new elasticsearch.Client({
  hosts: [host],
  httpAuth: "elastic:CzJToWAkKYt4R71V7izW",
});

function addElasticsearchIndex(topic, valueMapping) {
  console.log("Adding elasticsearch index", topic);
  return new Promise(function (resolve, reject) {
    try {
      elasticClient.indices.create(
        {
          index: topic,
        },
        function (err, resp, status) {
          if (err) {
            reject(err);
          } else {
            console.log("Done adding elasticsearch index", topic);
            resolve(resp);
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

function deleteElasticsearchIndex(topic) {
  console.log("Deleting elasticsearch index", topic);
  return new Promise(function (resolve, reject) {
    elasticClient.indices.delete(
      {
        index: topic,
      },
      function (err, resp, status) {
        if (err) {
          console.log(err);
          reject({
            location: "Elasticsearch",
            error: err,
          });
        } else {
          console.log("Done deleting elasticsearch index", topic);
          resolve(resp);
        }
      }
    );
  });
}

module.exports = {
  host,
  bin_port,
  elasticClient,
  addElasticsearchIndex,
  deleteElasticsearchIndex,
};
