const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const BaseController = require('./controllers/BaseController')
const Consumers = require('./models/ConsumersModel')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const Q = require('q');


// function responseError (res, err) {
//   console.log(err)
//   res.status(400).json(err)
// }

const controller = new (class extends BaseController {
    constructor () {
        super(Consumers);
        this.findAllOptions = {
            include: [{ model: Sensors, include: [{ model: Devices }] }],
        }
    }

    getAll (req) {
        var deferred = Q.defer();
        console.log(req.authenticated_as);
        if (req.authenticated_as.id === -1){
            Consumers.findAll({}).then(datas => {
                // return res.status(200).json({result: datas});
                deferred.resolve({
                    statusCode: 200,
                    headers: { "Content-Type": "application/json" },
                    body: { result: datas }
                  });
            }).catch(err => {
                deferred.reject({
                    statusCode: 400,
                    headers: { "Content-Type": "application/json" },
                    body: { error: err }
                  });
            });

        }else{
            Users.findById(req.authenticated_as.id).then(user => {
                if (!user) {
                    // return res.status(400).json({name: 'UserNotFound', errors: [{message: 'User not found'}]});
                    deferred.reject({
                        statusCode: 400,
                        headers: { "Content-Type": "application/json" },
                        body: {
                              name: 'UserNotFound',
                              errors: [{ message: 'User not found' }]
                          }
                      });
                } else {
                    console.log("Finding consumers for user : ", user.id)
                    Consumers.findAll({where: {userId: {[Op.eq]: user.id}}, include: [{ model: Sensors, include: [{ model: Devices }] }]}).then(datas => {
                        console.log("Consumers found: ", datas)
                        // return res.status(200).json({result: datas});
                        deferred.resolve({
                            statusCode: 200,
                            headers: { "Content-Type": "application/json" },
                            body: { result: datas }
                        });
                    }).catch(err => {
                        deferred.reject({
                            statusCode: 400,
                            headers: { "Content-Type": "application/json" },
                            body: {
                                  name: 'UserNotFound',
                                  errors: [{ message: 'User not found' }]
                              }
                          });
                    });
                }
            }).catch(err => {
                deferred.reject({
                    statusCode: 400,
                    headers: { "Content-Type": "application/json" },
                    body: {
                          name: 'UserNotFound',
                          errors: [{ message: 'User not found' }]
                      }
                  });
            });
        }
        return deferred.promise;
    }
})()

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