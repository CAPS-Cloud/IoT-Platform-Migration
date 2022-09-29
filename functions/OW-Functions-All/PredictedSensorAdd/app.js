const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Sensors = require('./models/SensorsModel')
const Predictions = require('./models/PredictionsModel')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const Q = require('q');


const controller = new (class {
  addPredictedSensor (req) {
    var deferred = Q.defer();
    Users.findById(req.authenticated_as.id)
      .then((user) => {
        if (!user) {
          // return res
          //   .status(400)
          //   .json({
          //     name: "UserNotFound",
          //     errors: [{ message: "User not found" }],
          //   });
          deferred.reject({
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: {
                  name: 'UserNotFound',
                  errors: [{ message: 'User not found' }]
              }
          });
        } else {
          Predictions.findOne({
            where: { id: { [Op.eq]: req.params.prediction_id } },
          })
            .then((prediction) => {
              if (prediction) {
                Sensors.findOne({
                  where: { id: { [Op.eq]: req.body.sensor_id } },
                }).then((sensor) => {
                  if (sensor) {
                    prediction
                      .getSensors({
                        where: { id: { [Op.eq]: req.body.sensor_id } },
                      })
                      .then((exist) => {
                        if (exist.length > 0) {
                          // return res.status(400).json({
                          //   name: "AlreadyPredicted",
                          //   errors: [{ message: "Already predicted" }],
                          // });
                          deferred.reject({
                            statusCode: 400,
                            headers: { "Content-Type": "application/json" },
                            body: {
                                  name: 'AlreadyPredicted',
                                  errors: [{ message: "Already predicted" }]
                              }
                          });
                        } else {
                          prediction
                            .addSensors(sensor)
                            .then((prediction_sensor) => {
                              deferred.resolve({
                                statusCode: 200,
                                headers: { "Content-Type": "application/json" },
                                body: { result: prediction_sensor }
                              });
                            })
                            .catch((err) => {
                              deferred.reject({
                                statusCode: 400,
                                headers: { "Content-Type": "application/json" },
                                body: { error: err }
                              });
                            });
                        }
                      })
                      .catch((err) => {
                        deferred.reject({
                          statusCode: 400,
                          headers: { "Content-Type": "application/json" },
                          body: { error: err }
                        });
                      });
                  } else {
                    deferred.reject({
                      statusCode: 400,
                      headers: { "Content-Type": "application/json" },
                      body: {
                            name: 'SensorNotFound',
                            errors: [{ message: "Sensor not found" }]
                        }
                    });
                  }
                });
              } else {
                deferred.reject({
                  statusCode: 400,
                  headers: { "Content-Type": "application/json" },
                  body: {
                        name: 'PredictionNotFound',
                        errors: [{ message: "Prediction not found" }]
                    }
                });
              }
            })
            .catch((err) => {
              deferred.reject({
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: { error: err }
              });
            });
        }
      })
      .catch((err) => {
        deferred.reject({
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: { error: err }
        });
      });
      return deferred.promise;
}
})();

// const addPredictedSensor = controller.addPredictedSensor.bind(controller);

// testapp.post('/', (req, res) => {
//   const parsedReq = parse(req.body["req"]);
//   // console.log(parsedReq)
//   addPredictedSensor(parsedReq, res);
// });

// if (require.main === module) {
//   // app.listen(port);
//   http.createServer(testapp).listen(port, function () {
//     console.log(`Server is listening on port ${port}`);
//   });
// }
function main (params) {
  var parsedReq = parse(params['req']);
  const addPredictedSensor = controller.addPredictedSensor.bind(controller)
  return addPredictedSensor(parsedReq)
}

module.exports.main = main
