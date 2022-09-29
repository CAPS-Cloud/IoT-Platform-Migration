const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const BaseController = require('./controllers/BaseController')
const Consumers = require('./models/ConsumersModel')
const fs = require('fs')
const CONSUMER_PUBLIC = fs.readFileSync('.keys/consumer_jwtRS256.key.pub')
const ELASTICSEARCH_HOST = require('./connections/elasticsearch').host;
const jwt = require('jsonwebtoken');
const request = require('request');
const ELASTICSEARCH_LIMITED_USER='elastic';
const ELASTICSEARCH_LIMITED_USER_PASSWORD='CzJToWAkKYt4R71V7izW';
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const connection = require('./connections/mysql');
const Q = require('q');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


// function responseSystemError (res, err) {
//     console.error(err);
//     res.status(500).json({ message: "Something went wrong" });
// }

const controller = new (class {

    update (req) {
        var deferred = Q.defer()
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            if (bearer.length != 2) {
                // return res.sendStatus(401);
                deferred.reject({
                    statusCode: 401,
                    headers: { "Content-Type": "application/json" },
                    body: { error: "Bearer length not equal to 2" }
                  });
            }
            const bearerToken = bearer[1];

            jwt.verify(bearerToken, CONSUMER_PUBLIC, { algorithms: ['RS256'], issuer: 'iotplatform' }, (err, authData) => {
                if (!err) {
                    Sensors.findOne({ where: { id: { [Op.eq]: req.params.sensor_id } }, include: [{ model: Consumers }, { model: Devices }] }).then(sensor => {
                        if (sensor) {
                            if (sensor.consumers && sensor.consumers.some(consumer => (sensor.device.userId.toString() + "_" + consumer.id.toString()) === authData.sub)) {
                                const topic = `${sensor.device.userId}_${sensor.device.id}_${sensor.id}`;
                                let elastic_search_host = `http://${ELASTICSEARCH_LIMITED_USER}:${ELASTICSEARCH_LIMITED_USER_PASSWORD}@${ELASTICSEARCH_HOST}`;
                                let parts = req.url.split('?');
                                let queryString = parts[1];
                                let updatedPath = parts[0].replace(new RegExp(`^/api/consumers/consume/${req.params.sensor_id}`, 'i'), topic);
                                let path =  updatedPath + (queryString ? '?' + queryString : '');
                                let data = {};
                                let options = {};
                                if (req.body){
                                    var headersOpt = {
                                        "content-type": "application/json",
                                    };
                                    options = {
                                        url: elastic_search_host + '/' + path,
                                        method: 'PUT',
                                        headers: headersOpt,
                                        body:req.body,
                                        json: true,
                                    };
                                } else {
                                    options = {
                                        url: elastic_search_host + '/' + path,
                                        method: 'PUT'
                                    };
                                }

                                request(options, function (error, response, body) {
                                    console.error('error:', error); // Print the error if one occurred
                                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                                    console.log('body:', body); // Print the HTML for the Google homepage.
                                    if (error){
                                        // return res.sendStatus(401);
                                        deferred.reject({
                                            statusCode: 401,
                                            headers: { "Content-Type": "application/json" },
                                            body: { error: "Error occured in sending request" }
                                        });
                                    }else{
                                        // return res.send(body);
                                        deferred.resolve({
                                            statusCode: 200,
                                            headers: { "Content-Type": "application/json" },
                                            body: { body: body }
                                          });
                                    }

                                });
                            } else {
                                console.log(4);
                                // return res.sendStatus(401);
                                deferred.reject({
                                    statusCode: 401,
                                    headers: { "Content-Type": "application/json" },
                                    body: { error: "Sensor authirization failed" }
                                });
                            }
                        } else {
                            // return res.sendStatus(401);
                            deferred.reject({
                                statusCode: 401,
                                headers: { "Content-Type": "application/json" },
                                body: { error: "No sensor present" }
                            });
                        }
                    }).catch(err => {
                        deferred.reject({
                            statusCode: 400,
                            headers: { "Content-Type": "application/json" },
                            body: { error: err }
                          });
                    });
                } else {
                    // return res.sendStatus(401);
                    deferred.reject({
                        statusCode: 401,
                        headers: { "Content-Type": "application/json" },
                        body: { error: "Error occured in token verification" }
                    });
                }
            })
        } else {
            // return res.sendStatus(401);
            deferred.reject({
                statusCode: 401,
                headers: { "Content-Type": "application/json" },
                body: { error: "Bearer header undefined" }
            });
        }
        return deferred.promise;
    }
})()

function main (params) {
    var parsedReq = parse(params['req']);
    const update = controller.update.bind(controller)
    return update(parsedReq)
}
  
  
module.exports.main = main
  

// const update = controller.update.bind(controller);

// testapp.post("/", (req, res) => {
//   const parsedReq = parse(req.body["req"]);
//   // console.log(parsedReq)
//   update(parsedReq, res);
// });

// if (require.main === module) {
//   // app.listen(port);
//   http.createServer(testapp).listen(port, function () {
//     console.log(`Server is listening on port ${port}`);
//   });
// }