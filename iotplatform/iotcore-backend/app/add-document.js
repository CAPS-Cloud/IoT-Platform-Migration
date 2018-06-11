var search = require("./search");

var client = require('./connection');

exports.add = function(toAdd, callback){
    search.existed(toAdd.username, function(result, err) {
        if(err) {
            callback(null, err);
        } else if(result) {
            callback(null, "existed");
        } else {
            console.log("not existed, adding");
            client.index({
                index: 'db',
                id:'1',
                type:'user',
                body: toAdd
            },function(err,resp,status){
                callback(resp, err);
            });
        }
    });
}
