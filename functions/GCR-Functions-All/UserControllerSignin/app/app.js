const express = require('express')
const http = require('http')
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
const testapp = express()
const port = '8073'

testapp.use(express.json())

function responseError (res, err) {
  res.status(400).json(err)
}

const controller = new (class extends BaseController {
  constructor () {
    super(Users)
    this.findAllOptions = {
      exclude: ['password'],
      include: [{ model: Devices }]
    }
  }

  signin (req, res) {
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
          return res.json({ token });
        }
      )
    } else if (!req.body.username) {
      return res
        .status(400)
        .json({
          name: 'NoUsernameProvided',
          errors: [{ message: 'No username provided' }]
        })
    } else if (!req.body.password) {
      return res
        .status(400)
        .json({
          name: 'NoPasswordProvided',
          errors: [{ message: 'No password provided' }]
        })
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
                return res.json({ token });
              }
            )
          } else {
            return res
              .status(400)
              .json({
                name: 'InvalidCredential',
                errors: [{ message: 'Invalid credential' }]
              })
          }
        })
        .catch((err) => responseError(res, err))
    }
  }
})()

const signIn = controller.signin.bind(controller)

testapp.post('/', (req, res) => {
  var parsedReq = parse(req.body['req'])
  console.log(parsedReq)
  signIn(parsedReq, res)
})

if (require.main === module) {
  // app.listen(port);
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`)
  })
}
