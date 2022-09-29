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

    update (req) {
        var deferred = Q.defer();
        Users.findById(req.authenticated_as.id).then(user => {
            if (!user) {
                console.log("consumer Update: UserNotFound");
                // return res.status(400).json({name: 'UserNotFound', errors: [{message: 'User not found'}]});
                deferred.reject({
                    statusCode: 400,
                    headers: { "Content-Type": "application/json" },
                    body: {
                            name: 'UserNotFound',
                            errors: [{message: 'User not found'}]
                        }
                });
            } else {
                console.log("consumer Update: User Found");
                Consumers.findOne({
                    where: {
                        userId: {[Op.eq]: user.id},
                        id: {[Op.eq]: req.params.id}
                    }
                }).then(data => {
                    if (data) {
                        console.log("consumer Update: consumer Found");
                        delete req.body.id;
                        Consumers.update(req.body, {where: {id: {[Op.eq]: data.id}}}).then(device => {
                            // return res.status(200).json({result: device})
                            deferred.resolve({
                                statusCode: 200,
                                headers: { "Content-Type": "application/json" },
                                body: { result: device }
                              });
                        }).catch(err => {
                            deferred.reject({
                                statusCode: 400,
                                headers: { "Content-Type": "application/json" },
                                body: { error: err }
                              });
                          })
                    } else {
                        // console.log("Consumer Update: Consumer Not Found");
                        // return res.status(400).json({name: 'ConsumerNotFound', errors: [{message: 'Consumer not found'}]});
                        deferred.reject({
                            statusCode: 400,
                            headers: { "Content-Type": "application/json" },
                            body: {
                                    name: 'ConsumerNotFound',
                                    errors: [{message: 'Consumer not found'}]
                                }
                        });
                    }
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
    const update = controller.update.bind(controller)
    return update(parsedReq)
}

module.exports.main = main
// const update = controller.update.bind(controller)

// testapp.post('/', (req, res) => {
//   const parsedReq = parse(req.body["req"])
//   // console.log(parsedReq)
//   update(parsedReq, res)
// })

// if (require.main === module) {
//   // app.listen(port);
//   http.createServer(testapp).listen(port, function () {
//     console.log(`Server is listening on port ${port}`)
//   })
// }
