const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const BaseController = require('./controllers/BaseController')
const ROOT_USERNAME = 'root'
const bcrypt = require('bcryptjs')
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


const testapp = express()
const port = '8072'

testapp.use(express.json())

const controller = new (class extends BaseController {
  constructor () {
    super(Users)
    this.findAllOptions = {
      exclude: ['password'],
      include: [{ model: Devices }]
    };
  }

  pre_add (req, res, callback) {
    var toAdd = req.body

    if (toAdd.username == ROOT_USERNAME) {
      return res.status(400).json({
        name: 'RestrictedUsername',
        errors: [{ message: '"root" is restricted username' }]
      })
    }

    if (toAdd.password) {
      var salt = bcrypt.genSaltSync(10)
      var hash = bcrypt.hashSync(toAdd.password, salt)
      toAdd.password = hash
    }

    callback(toAdd)
  }

  post_add (data, callback) {
    delete data.password
    callback(data)
  }
})()

const add = controller.add.bind(controller)

testapp.post('/', (req, res) => {
  var parsedReq = parse(req.body['req'])
  // console.log(parsedReq)
  add(parsedReq, res)
})

if (require.main === module) {
  // app.listen(port);
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`)
  })
}


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
