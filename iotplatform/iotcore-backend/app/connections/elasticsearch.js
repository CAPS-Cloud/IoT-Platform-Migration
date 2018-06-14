const elasticsearch = require('elasticsearch');

module.exports = new elasticsearch.Client({
  hosts: [
    'http://' + process.env.ELASTICSEARCH + '/']
});
