const fs = require('fs')
const { parse } = require('flatted')
const jwt = require('jsonwebtoken')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const BaseController = require('./controllers/BaseController')
const ROOT_USERNAME = 'root'
const ROOT_PASSWORD = 'x5KATOHT9zHczR49aPy0'
const AUTHENTICATION_SECRET = fs.readFileSync('.keys/authentication_jwtRS256.key')
const bcrypt = require('bcryptjs')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
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

  signin (req) {
    var deferred = Q.defer();
    if (
      req.body.username &&
      req.body.password &&
      req.body.username === ROOT_USERNAME &&
      req.body.password === ROOT_PASSWORD
    ) {
      jwt.sign(
        {},
        AUTHENTICATION_SECRET,
        {
          algorithm: 'RS256',
          issuer: 'iotplatform',
          subject: '-1',
        },
        (err, token) => {
          // return res.json({ token });
          deferred.resolve({
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: { token },
          });
        }
      )
    } else if (!req.body.username) {
      // return res
      //   .status(400)
      //   .json({
      //     name: 'NoUsernameProvided',
      //     errors: [{ message: 'No username provided' }]
      //   })
      deferred.reject({
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: {
          name: 'NoUsernameProvided',
          errors: [{ message: 'No username provided' }]
        }
      });
    } else if (!req.body.password) {
      // return res
      //   .status(400)
      //   .json({
      //     name: 'NoPasswordProvided',
      //     errors: [{ message: 'No password provided' }]
      //   })
      deferred.reject({
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: {
          name: 'NoPasswordProvided',
          errors: [{ message: 'No password provided' }]
        }
      });
    } else {
      this.model
        .findOne({ where: { username: { [Op.eq]: req.body.username } } })
        .then((data) => {
          if (data && bcrypt.compareSync(req.body.password, data.password)) {
            jwt.sign(
              {},
              AUTHENTICATION_SECRET,
              {
                algorithm: 'RS256',
                issuer: 'iotplatform',
                subject: data.id.toString()
              },
              (err, token) => {
                // return res.json({ token });
                deferred.resolve({
                  statusCode: 200,
                  headers: { "Content-Type": "application/json" },
                  body: {token}
                });
              }
            )
          } else {
            // return res
            //   .status(400)
            //   .json({
            //     name: 'InvalidCredential',
            //     errors: [{ message: 'Invalid credential' }]
            //   })
            deferred.reject({
              statusCode: 400,
              headers: { "Content-Type": "application/json" },
              body: {
                name: 'InvalidCredential',
                errors: [{ message: 'Invalid credential' }]
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
        })
    }
    return deferred.promise;
  }
})()

function main (params) {
  var parsedReq = parse(params['req']);
  const signIn = controller.signin.bind(controller)
  return signIn(parsedReq)
}

module.exports.main = main
