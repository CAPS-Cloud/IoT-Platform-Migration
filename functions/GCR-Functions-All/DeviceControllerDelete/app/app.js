const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const BaseController = require('./controllers/BaseController')
const testapp = express()
const port = '8092'
const Sequelize = require('sequelize')
const Op = Sequelize.Op

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
        super(Devices);
        this.findAllOptions = {
            include: [{model: Sensors}],
        }
    }

    pre_delete (req, res, callback) {
        Users.findById(req.authenticated_as.id).then(user => {
            if (!user) {
                return res.status(400).json({name: 'UserNotFound', errors: [ {message: 'User not found'}]});
            } else {
                Devices.findOne({
                    where: {
                        userId: { [Op.eq]: user.id},
                        id: { [Op.eq]: req.params.device_id}
                    },
                    include: [{ model: Sensors }]
                }).then(device => {
                    if (device) {
                        console.log('DEvice Delete: Device found', device);
                        const USER_ID = user.id;
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
            }
        }).catch(err => responseError(res, err));
    }

    delete (req, res) {
        this.pre_delete(req, res, () => {
            this.model.destroy({
                where: {
                    userId: {[Op.eq]: req.authenticated_as.id},
                    id: {[Op.eq]: req.params.device_id}
                }
            }).then(data => {
                return res.status(200).json({ result: data });
            }).catch(err => responseError(res, err));
        });
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
