const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const BaseController = require('./controllers/BaseController')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const Q = require('q');

const { deleteTopic } = require('./connections/kafka')
const { deleteConnectJob } = require('./connections/connect')
const { deleteElasticsearchIndex } = require('./connections/elasticsearch')

const controller = new (class extends BaseController {
  constructor() {
    super(Devices);
    this.findAllOptions = {
      include: [{ model: Sensors }],
    };
  }

  pre_delete (req, deferred, callback) {
    Users.findById(req.authenticated_as.id)
      .then((user) => {
        if (!user) {
          // return res.status(400).json({name: 'UserNotFound', errors: [ {message: 'User not found'}]});
          deferred.reject({
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: {
              name: "UserNotFound",
              errors: [{ message: "User not found" }],
            },
          });
        } else {
          Devices.findOne({
            where: {
              userId: { [Op.eq]: user.id },
              id: { [Op.eq]: req.params.device_id },
            },
            include: [{ model: Sensors }],
          })
            .then((device) => {
              if (device) {
                console.log("Device Delete: Device found", device);
                const USER_ID = user.id;
                const DEVICE_ID = device.id;
                const SENSORS_ID = device.sensors.map((sensor) => sensor.id);

                SENSORS_ID.forEach((sensor_id) => {
                  Sensors.destroy({ where: { id: { [Op.eq]: sensor_id } } })
                    .then((sensor) => {
                      const topic = `${USER_ID}_${DEVICE_ID}_${sensor_id}`;

                      // Delete Flink Job, then Kafka Topic, then Elasticsearch Index asynchronously.
                      deleteConnectJob(topic)
                        .then(() => {
                          deleteTopic(topic)
                            .then(() => {
                              deleteElasticsearchIndex(topic).catch((err) =>
                                console.error(err)
                              );
                            })
                            .catch((err) =>
                              console.error(
                                `Kafka topic deletion error with exit code: ${err}`
                              )
                            );
                        })
                        .catch((err) => console.error(err));
                    })
                    .catch((err) => {
                      deferred.reject({
                        statusCode: 400,
                        headers: { "Content-Type": "application/json" },
                        body: { error: err },
                      });
                    });
                });
                callback();
              } else {
                callback();
              }
            })
            .catch((err) => {
              deferred.reject({
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: { error: err },
              });
            });
        }
      })
      .catch((err) => {
        deferred.reject({
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: { error: err },
        });
      });
  }

  delete (req) {
    var deferred = Q.defer();
    this.pre_delete(req, deferred, () => {
      this.model
        .destroy({
          where: {
            userId: { [Op.eq]: req.authenticated_as.id },
            id: { [Op.eq]: req.params.device_id },
          },
        })
        .then((data) => {
          // return res.status(200).json({ result: data });
          deferred.resolve({
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: { result: data },
          });
        })
        .catch((err) => {
          deferred.reject({
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: { error: err },
          });
        });
    });
    return deferred.promise;
  }
})();

// let deletefunc = controller.delete.bind(controller)

// testapp.post('/', (req, res) => {
//     var parsedReq = parse(req.body['req'])
//     deletefunc(parsedReq, res)
// })
  
// if (require.main === module) {
//     // app.listen(port);
//     http.createServer(testapp).listen(port, function () {
//       console.log(`Server is listening on port ${port}`)
//     })
// }

// module.exports = testapp

function main (params) {
  var parsedReq = parse(params["req"]);
  const deletefunc = controller.delete.bind(controller);
  return deletefunc(parsedReq);
}

module.exports.main = main