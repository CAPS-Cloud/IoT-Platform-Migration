var client = require('./connection.js');

exports.existed = function (user, callback) {
    client.search({  
        index: 'db',
        type: 'user',
        body: {
          query: {
            match: { "username": user }
          },
        }
      },function (error, response,status) {
          if (error){
            callback(null, error);
          }
          else {
            callback(response.hits.total>=1);
          }
      });
} 
