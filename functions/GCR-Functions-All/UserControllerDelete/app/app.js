const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const BaseController = require('./controllers/BaseController')
const Sensors = require('./models/SensorsModel')
const testapp = express()
const port = '8074'
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { deleteTopic } = require('./connections/kafka')
const { deleteConnectJob } = require('./connections/connect')
const { deleteElasticsearchIndex } = require('./connections/elasticsearch')

testapp.use(express.json())

function responseError (res, err) {
    console.log(err)
    res.status(400).json(err)
  
}

const controller = new (class extends BaseController {
    constructor () {
        super(Users)
        this.findAllOptions = {
          exclude: ['password'],
          include: [{ model: Devices }]
        }
      }

        pre_delete (req, res, callback) {
        Users.findOne({where: {id: {[Op.eq]: req.params.id}},
            include: [{ model: Devices }]
        }).then(user => {
            if (user) {
                console.log(user);
                const USER_ID = user.id;
                const DEVICES_ID = user.devices.map(device => device.id);

                DEVICES_ID.forEach(device_id => {
                    Devices.findOne({where: {userId: {[Op.eq]: USER_ID}, id: {[Op.eq]: device_id}},
                        include: [{ model: Sensors }]
                    }).then(device => {
                        if (device) {
                            const USER_ID = device.userId;
                            const DEVICE_ID = device.id;
                            const SENSORS_ID = device.sensors.map(sensor => sensor.id);

                            SENSORS_ID.forEach(sensor_id => {
                                Sensors.destroy({where: {id: {[Op.eq]: sensor_id}}}).then(sensor => {

                                    const topic = `${USER_ID}_${DEVICE_ID}_${sensor_id}`;

                                    // Delete Flink Job, then Kafka Topic, then Elasticsearch Index asynchronously.
                                    deleteConnectJob(topic).then(() => {
                                        deleteTopic(topic).then(() => {
                                            deleteElasticsearchIndex(topic).catch(err => console.error(err));
                                        }).catch(err => console.error(`Kafka topic deletion error with exit code: ${err}`));
                                    }).catch(err => console.error(err));
                                }).catch(err => responseError(res, err));
                            });
                            callback();
                        } else {
                            callback();
                        }
                    }).catch(err => responseError(res, err));
                });
                callback();
            } else {
                callback();
            }
        }).catch(err => responseError(res, err));
    }

})()

let deletefunc = controller.delete.bind(controller)

testapp.post('/', (req, res) => {
    var parsedReq = parse(req.body['req'])
    deletefunc(parsedReq, res)
})
  
if (require.main === module) {
    // app.listen(port);
    http.createServer(testapp).listen(port, function () {
      console.log(`Server is listening on port ${port}`)
    })
}
  
module.exports = testapp
  
