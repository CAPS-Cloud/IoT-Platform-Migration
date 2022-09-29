const { parse } = require('flatted')
const fs = require('fs')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const BaseController = require('./controllers/BaseController')
const jwt = require('jsonwebtoken')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const Q = require('q');
const DEVICE_SECRET = fs.readFileSync('.keys/jwtRS256.key')

const controller = new (class extends BaseController {
  constructor () {
    super(Devices);
    this.findAllOptions = {
      include: [{ model: Sensors }],
    };
  }

  key (req) {
    var deferred = Q.defer();
    Users.findById(req.authenticated_as.id)
      .then((user) => {
        if (!user) {
          deferred.reject({
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: { 
              name: "UserNotFound", 
              errors: [{ message: "User not found" }]
            }
          })
        } else {
          Devices.findOne({
            where: {
              userId: { [Op.eq]: user.id },
              id: { [Op.eq]: req.params.device_id },
            },
          })
            .then((device) => {
              if (device) {
                jwt.sign(
                  {},
                  DEVICE_SECRET,
                  {
                    algorithm: "RS256",
                    issuer: "iotplatform",
                    subject:
                      "" + user.id.toString() + "_" + device.id.toString(),
                  },
                  (err, token) => {
                    // return res.json({
                    //   token,
                    //   user_id: user.id,
                    //   device_id: device.id,
                    // });
                    deferred.resolve({ 
                      statusCode: 200,
                      headers: { "Content-Type": "application/json" },
                      body : {
                        token : token,
                        user_id: user.id,
                        device_id: device.id
                      }
                    })
                  }
                );
              } else {
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
                    name: "DeviceNotFound", 
                    errors: [{ message: "Device not found" }]
                  }
                })
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

})()


function main (params) {
  var parsedReq = parse(params['req']);
  const key = controller.key.bind(controller)
  return key(parsedReq)
}

module.exports.main = main
