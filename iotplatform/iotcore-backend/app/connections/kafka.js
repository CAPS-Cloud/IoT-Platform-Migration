const kafka = require('kafka-node');

var client = new kafka.Client(process.env.KAFKA);
var producer = new kafka.Producer(client);

client.on("error", (err) => {
    console.error(err);
});

producer.on("error", (err) => {
    console.error(err);
});

module.exports = {
    client,
    producer,
};
