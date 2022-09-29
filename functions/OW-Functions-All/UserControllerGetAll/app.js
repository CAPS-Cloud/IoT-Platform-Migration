const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const BaseController = require('./controllers/BaseController')
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const Q = require('q');

const controller = new (class extends BaseController {
    constructor () {
      super(Users)
      this.findAllOptions = {
        exclude: ['password'],
        include: [{ model: Devices }]
      }
    }

    getAll (req) {
      var deferred = Q.defer();
      // console.log(req);
      if (req.authenticated_as.id === -1) {
        Users.findAll(this.findAllOptions)
          .then((datas) => {
            // return res.status(200).json({ result: datas })
            deferred.resolve({
              statusCode: 200,
              headers: { "Content-Type": "application/json" },
              body: {result: datas}
            });
          })
          .catch((err) => {
            deferred.reject({
              statusCode: 400,
              headers: { "Content-Type": "application/json" },
              body: { error: err }
            });
          })
      } else {
        Users.findById(req.authenticated_as.id)
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
              // return res.status(200).json({ result: user })
              deferred.resolve({
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: { result: user }
              });
            }
          })
          .catch((err) => {
            deferred.reject({
              statusCode: 400,
              headers: { "Content-Type": "application/json" },
              body: { error: err }
            });
          })
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
