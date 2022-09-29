const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const BaseController = require('./controllers/BaseController')
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const Q = require('q');
const Sequelize = require('sequelize')

const controller = new (class extends BaseController {
    constructor () {
        super(Devices)
        this.findAllOptions = {
          include: [{ model: Sensors }]
        }
      }

    post_add (data, callback) {
        callback(data)
    }

    add (req) {
      var deferred = Q.defer()
      Users.findById(req.authenticated_as.id).then(user => {
            if (!user) {
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
                Devices.create({
                    name: req.body.name,
                    description: req.body.description,
                    clientId: req.body.clientId,
                    password: req.body.password,
                    username: req.body.username,
                    url: req.body.url,
                    ttn_topic_to_subscribe: req.body.ttn_topic_to_subscribe,
                    userId: user.id
                }).then(data => {
                    this.post_add(data, result_data => {
                        // return res.status(200).json({result: result_data});
                        deferred.resolve({
                          statusCode: 200,
                          headers: { "Content-Type": "application/json" },
                          body: { result: result_data }
                        });
                    });
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
  const add = controller.add.bind(controller)
  return add(parsedReq)
}

module.exports.main = main

// const add = controller.add.bind(controller)

// testapp.post('/', (req, res) => {
//   const parsedReq = parse(req.body['req'])
//   // console.log(parsedReq)
//   add(parsedReq, res)
// })

// if (require.main === module) {
//   // app.listen(port);
//   http.createServer(testapp).listen(port, function () {
//     console.log(`Server is listening on port ${port}`)
//   })
// }