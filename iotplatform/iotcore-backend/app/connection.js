var elasticsearch=require('elasticsearch');

var client = new elasticsearch.Client( {  
  hosts: [
    'http://172.19.0.2:9200/' ]
});

module.exports = client;  