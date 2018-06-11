var client = require('./connection.js');

client.indices.create({
    index: 'db'
},function(err,resp,status){
    if(err){
        console.log(err);
    }
    else {
        console.log("creat",resp);
    }
});