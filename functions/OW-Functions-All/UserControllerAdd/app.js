const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const BaseController = require('./controllers/BaseController')
const ROOT_USERNAME = 'root'
const bcrypt = require('bcryptjs')
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const Q = require('q');

const controller = new (class extends BaseController {
  constructor () {
    super(Users)
    this.findAllOptions = {
      exclude: ['password'],
      include: [{ model: Devices }]
    };
  }

  pre_add (req, deferred, callback) {
    var toAdd = req.body

    if (toAdd.username == ROOT_USERNAME) {
      // return res.status(400).json({
      //   name: 'RestrictedUsername',
      //   errors: [{ message: '"root" is restricted username' }]
      // })
      deferred.reject({
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: {
              name: 'RestrictedUsername',
              errors: [{ message: '"root" is restricted username' }]
          }
      });
    }

    if (toAdd.password) {
      var salt = bcrypt.genSaltSync(10)
      var hash = bcrypt.hashSync(toAdd.password, salt)
      toAdd.password = hash
    }

    callback(toAdd)
  }

  add (req) {
    var deferred = Q.defer();
    this.pre_add(req, deferred, toAdd => {
        this.model.create(toAdd).then(data => {
            this.post_add(data, result_data => {
                // return res.status(200).json({ result: result_data });
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
    });
    return deferred.promise;
  }

  post_add (data, callback) {
    delete data.password
    callback(data)
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
//   var parsedReq = parse(req.body['req'])
//   console.log(parsedReq)
//   add(parsedReq, res)
// })

// if (require.main === module) {
//   // app.listen(port);
//   http.createServer(testapp).listen(port, function () {
//     console.log(`Server is listening on port ${port}`)
//   })
// }
