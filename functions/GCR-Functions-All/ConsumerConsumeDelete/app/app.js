const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const BaseController = require('./controllers/BaseController')
const Consumers = require('./models/ConsumersModel')
const testapp = express()
const port = '8107'
const fs = require('fs')
const CONSUMER_PUBLIC = fs.readFileSync('.keys/consumer_jwtRS256.key.pub')
const ELASTICSEARCH_HOST = require('./connections/elasticsearch').host;
const proxy = require('express-http-proxy');
const jwt = require('jsonwebtoken');
const request = require('request');
const ELASTICSEARCH_LIMITED_USER='elastic';
const ELASTICSEARCH_LIMITED_USER_PASSWORD='CzJToWAkKYt4R71V7izW';
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const connection = require('./connections/mysql');

testapp.use(express.json())

function responseError (res, err) {
  // console.log(err)
  res.status(400).json(err)
}

function responseSystemError (res, err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
}

const controller = new (class {

    delete (req, res, next) {
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            if (bearer.length != 2) {
                return res.sendStatus(401)
            }
            const bearerToken = bearer[1]

            jwt.verify(bearerToken, CONSUMER_PUBLIC, { algorithms: ['RS256'], issuer: 'iotplatform' }, (err, authData) => {
                if (!err) {
                    Sensors.findOne({ where: { id: { [Op.eq]: req.params.sensor_id } }, include: [{ model: Consumers }, { model: Devices }] }).then(sensor => {
                        if (sensor) {
                            if (sensor.consumers && sensor.consumers.some(consumer => (sensor.device.userId.toString() + "_" + consumer.id.toString()) ===  authData.sub)) {
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
                                        method: 'DELETE',
                                        headers: headersOpt,
                                        body:req.body,
                                        json: true,
                                    };
                                } else {
                                    options = {
                                        url: elastic_search_host + '/' + path,
                                        method: 'DELETE'
                                    };
                                }

                                request(options , function (error, response, body) {
                                    console.error('error:', error); // Print the error if one occurred
                                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                                    console.log('body:', body); // Print the HTML for the Google homepage.
                                    if (error){
                                        return res.sendStatus(401);
                                    }else{
                                        return res.send(body);
                                    }
                                });
                            } else {
                                console.log(4);
                                return res.sendStatus(401);
                            }
                        } else {
                            return res.sendStatus(401);
                        }
                    }).catch(err => responseError(res, err));
                } else {
                    return res.sendStatus(401);
                }
            })
        } else {
            return res.sendStatus(401);
        }
    }
})()

const deletefunc = controller.delete.bind(controller);

testapp.post("/", (req, res) => {
  const parsedReq = parse(req.body["req"]);
  // console.log(parsedReq)
  deletefunc(parsedReq, res);
});

if (require.main === module) {
  // app.listen(port);
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`);
  });
}
