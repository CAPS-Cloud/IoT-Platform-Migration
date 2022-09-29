const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Sensors = require('./models/SensorsModel')
const Consumers = require('./models/ConsumersModel')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const Q = require('q');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// function responseError (res, err) {
//   console.log(err)
//   res.status(400).json(err)
// }

const controller = new (class {
  disablePermission (req) {
    var deferred = Q.defer()
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
              errors: [{message: 'User not found'}]
            }
          });
        } else {
          Consumers.findOne({
            where: {
              id: {
                [Op.eq]: req.params.consumer_id,
              },
              userId: { [Op.eq]: user.id },
            },
          })
            .then((consumer) => {
              if (consumer) {
                Sensors.findOne({
                  where: { id: { [Op.eq]: req.params.sensor_id } },
                }).then((sensor) => {
                  if (sensor) {
                    consumer
                      .getSensors({
                        where: { id: { [Op.eq]: req.params.sensor_id } },
                      })
                      .then((exist) => {
                        if (exist.length > 0) {
                          consumer
                            .removeSensors(sensor)
                            .then((result) => {
                              // return res.status(200).json({ result });
                              deferred.resolve({
                                statusCode: 200,
                                headers: { "Content-Type": "application/json" },
                                body: { result: result }
                              });
                            })
                            .catch((err) => {
                              deferred.reject({
                                statusCode: 400,
                                headers: { "Content-Type": "application/json" },
                                body: { error: err }
                              });
                            });
                        } else {
                          // return res.status(400).json({
                          //   name: "PermissionNotExist",
                          //   errors: [{ message: "Permission not exist" }],
                          // });
                          deferred.reject({
                            statusCode: 400,
                            headers: { "Content-Type": "application/json" },
                            body: {
                              name: "PermissionNotExist",
                              errors: [{ message: "Permission not exist" }]
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
                  } else {
                    // return res.status(400).json({
                    //   name: "SensorNotFound",
                    //   errors: [{ message: "Sensor not found" }],
                    // });
                    deferred.reject({
                      statusCode: 400,
                      headers: { "Content-Type": "application/json" },
                      body: {
                        name: "SensorNotFound",
                        errors: [{ message: "Sensor not found" }]
                      }
                    });
                  }
                });
              } else {
                // return res.status(400).json({
                //   name: "ConsumerNotFound",
                //   errors: [{ message: "Consumer not found" }],
                // });
                deferred.reject({
                  statusCode: 400,
                  headers: { "Content-Type": "application/json" },
                  body: {
                    name: "ConsumerNotFound",
                    errors: [{ message: "Consumer not found" }]
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

// const disablePermission = controller.disablePermission.bind(controller)

// testapp.post('/', (req, res) => {
//   const parsedReq = parse(req.body['req'])
//   // console.log(parsedReq)
//   disablePermission(parsedReq, res)
// })

// if (require.main === module) {
//   // app.listen(port);
//   http.createServer(testapp).listen(port, function () {
//     console.log(`Server is listening on port ${port}`)
//   })
// }

function main (params) {
  var parsedReq = parse(params['req']);
  const disablePermission = controller.disablePermission.bind(controller)
  return disablePermission(parsedReq)
}

module.exports.main = main
