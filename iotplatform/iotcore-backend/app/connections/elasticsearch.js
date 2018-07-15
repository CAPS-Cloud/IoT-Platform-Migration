const elasticsearch = require('elasticsearch');

const host = process.env.ELASTICSEARCH;
const bin_port = process.env.ELASTICSEARCH_BIN_PORT;
//const host = 'iot.pcxd.me:9000';

module.exports = {
  elasticClient: new elasticsearch.Client({
    hosts: [
      `http://${host}/`,
    ],
  }),
  host,
  bin_port,
};
