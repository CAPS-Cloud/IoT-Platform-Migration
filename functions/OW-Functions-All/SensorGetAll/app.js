const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const Q = require('q');
const Sequelize = require('sequelize')
const Op = Sequelize.Op


// function responseError (res, err) {
//   console.log(err)
//   res.status(400).json(err)
// }

const controller = new (class {
  getAll (req) {
    var deferred = Q.defer();
    Users.findOne({ where: { id: { [Op.eq]: req.authenticated_as.id } } })
      .then((user) => {
        if (!user) {
          deferred.reject({
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: {
                  name: 'UserNotFound',
                  errors: [{ message: 'User not found' }]
              }
          });
        } else {
          Devices.findOne({
            where: {
              id: req.params.device_id,
              userId: { [Op.eq]: user.id },
            },
          })
            .then((device) => {
              if (!device) {
                // return res
                //   .status(400)
                //   .json({
                //     name: "DeviceNotFound",
                //     errors: [{ message: "Device not found" }],
                //   });
                deferred.reject({
                  statusCode: 400,
                  headers: { "Content-Type": "application/json" },
                  body: {
                        name: 'DeviceNotFound',
                        errors: [{ message: 'Device not found' }]
                    }
                });
              } else {
                Sensors.findAll({ where: { deviceId: { [Op.eq]: device.id } } })
                  .then((datas) => {
                    // return res.status(200).json({ result: datas });
                    deferred.resolve({
                      statusCode: 200,
                      headers: { "Content-Type": "application/json" },
                      body: { result: datas }
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

function main (params) {
  var parsedReq = parse(params['req']);
  const getAll = controller.getAll.bind(controller)
  return getAll(parsedReq)
}

module.exports.main = main


// const getAll = controller.getAll.bind(controller)

// testapp.post('/', (req, res) => {
//   const parsedReq = parse(req.body["req"]);
//   // console.log(parsedReq)
//   getAll(parsedReq, res);
// });

// if (require.main === module) {
//   // app.listen(port);
//   http.createServer(testapp).listen(port, function () {
//     console.log(`Server is listening on port ${port}`);
//   });
// }