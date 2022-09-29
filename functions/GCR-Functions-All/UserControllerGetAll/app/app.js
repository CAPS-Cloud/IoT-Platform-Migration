const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const BaseController = require('./controllers/BaseController')

const testapp = express()
const port = '8071'

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

  getAll (req, res) {
    // console.log(req);
    if (req.authenticated_as.id === -1) {
      Users.findAll(this.findAllOptions)
        .then((datas) => {
          console.log(datas)
          return res.status(200).json({ result: datas })
        })
        .catch((err) => {
        console.log(err)
        responseError(res, err)
      })
    } else {
      Users.findById(req.authenticated_as.id)
        .then((user) => {
          if (!user) {
            return res
              .status(400)
              .json({
                name: 'UserNotFound',
                errors: [{ message: 'User not found' }]
              })
          } else {
            return res.status(200).json({ result: user })
          }
        })
        .catch((err) => responseError(res, err))
    }
  }
})()

let getAll = controller.getAll.bind(controller)

testapp.post('/', (req, res) => {
  var parsedReq = parse(req.body['req'])
  getAll(parsedReq, res)
})

if (require.main === module) {
  // app.listen(port);
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`)
  })
}

module.exports = testapp
