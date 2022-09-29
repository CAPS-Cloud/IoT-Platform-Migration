const elasticsearch = require('elasticsearch');

const host = '10.195.5.180:28242' //Elastic serach 9200 port
const bin_port = '28242' //Elastic serach 9200 port

const elasticClient = new elasticsearch.Client({
    hosts: [
        host,
    ],
    httpAuth: 'elastic:CzJToWAkKYt4R71V7izW'
});

function addElasticsearchIndex (topic, valueMapping) {
    console.log("Adding elasticsearch index", topic);
    return new Promise(function (resolve, reject) {
      elasticClient.indices.create({
        index: topic,
      }, function (err, resp, status) {
        if (err) {
          reject(err);
        }
        else {
          console.log("Done adding elasticsearch index", topic);
          resolve(resp);
        }
      });
    });
}

function deleteElasticsearchIndex (topic) {
    console.log("Deleting elasticsearch index", topic);
    return new Promise(function (resolve, reject) {
      elasticClient.indices.delete({
        index: topic,
      }, function (err, resp, status) {
        if (err) {
          reject(err);
        }
        else {
          console.log("Done deleting elasticsearch index", topic);
          resolve(resp);
        }
      });
    });
}

module.exports = {
    host,
    bin_port,
    elasticClient,
    addElasticsearchIndex,
    deleteElasticsearchIndex
}

  