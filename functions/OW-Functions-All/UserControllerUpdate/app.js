const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const BaseController = require('./controllers/BaseController')
const bcrypt = require('bcryptjs')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
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

    pre_update (data, deferred, callback) {
        if (data.username) {
            deferred.reject({
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: {
                        name: 'NotAllowUpdate',
                        errors: [{ message: 'You are not allowed to change username' }]
                    }
            });
        }
        if (data.password) {
            var salt = bcrypt.genSaltSync(10)
            var hash = bcrypt.hashSync(data.password, salt)
            data.password = hash
        }
        callback(data)
    }

    update (req) {
      var deferred = Q.defer();
      this.pre_update(req.body, deferred, toUpdate => {
          delete toUpdate.id;
          this.model.update(toUpdate, { where: { id: { [Op.eq]: req.params.id } } }).then(data => {
            //   return res.status(200).json({ result: data });
            deferred.resolve({
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: { result: data }
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
})()

function main (params) {
    var parsedReq = parse(params['req']);
    const update = controller.update.bind(controller)
    return update(parsedReq)
}

// const update = controller.update.bind(controller)

// testapp.post('/', (req, res) => {
//   var parsedReq = parse(req.body['req'])
//   console.log(parsedReq)
//   update(parsedReq, res)
// })

// if (require.main === module) {
//   // app.listen(port);
//   http.createServer(testapp).listen(port, function () {
//     console.log(`Server is listening on port ${port}`)
//   })
// }

module.exports.main = main