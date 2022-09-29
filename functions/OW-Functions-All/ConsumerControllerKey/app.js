const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const BaseController = require('./controllers/BaseController')
const Consumers = require('./models/ConsumersModel')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const jwt = require('jsonwebtoken')
const fs = require('fs')
const Q = require('q');
const CONSUMER_SECRET = fs.readFileSync('.keys/consumer_jwtRS256.key')



// function responseError(res, err) {
//   console.log(err);
//   res.status(400).json(err);
// }

const controller = new (class extends BaseController {
    constructor () {
        super(Consumers)
        this.findAllOptions = {
            include: [{ model: Sensors, include: [{ model: Devices }] }]
        }
    }

    key (req, res) {
        var deferred = Q.defer();
        Users.findById(req.authenticated_as.id).then(user => {
            if (!user) {
                // return res.status(400).json({name: 'UserNotFound', errors: [{message: 'User not found'}]});
                deferred.reject({
                    statusCode: 400,
                    headers: { "Content-Type": "application/json" },
                    body: { 
                      name: "UserNotFound", 
                      errors: [{ message: "User not found" }]
                    }
                  })
            } else {
                Consumers.findOne({
                    where: {
                        userId: {[Op.eq]: user.id},
                        id: {[Op.eq]: req.params.id}
                    }
                }).then(consumer => {
                    if (consumer) {
                        jwt.sign({}, CONSUMER_SECRET, {
                            algorithm: 'RS256',
                            issuer: 'iotplatform',
                            subject: '' + user.id.toString() + '_' + consumer.id.toString()
                        }, (err, token) => {
                            // return res.json({token, user_id: user.id, consumer_id: consumer.id});
                            deferred.resolve({ 
                                statusCode: 200,
                                headers: { "Content-Type": "application/json" },
                                body : {
                                  token : token,
                                  user_id: user.id,
                                  consumer_id: consumer.id
                                }
                              })
                        });
                    } else {
                        // return res.status(400).json({name: 'ConsumerNotFound', errors: [{message: 'Consumer not found'}]});
                        deferred.reject({
                            statusCode: 400,
                            headers: { "Content-Type": "application/json" },
                            body: {
                              name: "ConsumerNotFound", 
                              errors: [{ message: "Consumer not found" }]
                            }
                          })
                    }
                }).catch(err => {
                    deferred.reject({
                        statusCode: 400,
                        headers: { "Content-Type": "application/json" },
                        body: { error: err }
                      });
                });
            }
        }).catch(err => {
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
  

