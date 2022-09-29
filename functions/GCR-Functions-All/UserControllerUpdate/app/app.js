const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const BaseController = require('./controllers/BaseController')
const bcrypt = require('bcryptjs')
const testapp = express()
const port = '8076'

testapp.use(express.json())

const controller = new (class extends BaseController {
    constructor () {
        super(Users)
        this.findAllOptions = {
          exclude: ['password'],
          include: [{ model: Devices }]
    }
  }

    pre_update(data, callback) {
        if (data.username) {
            return res.status(400).json({
                name: 'NotAllowUpdate',
                errors: [{ message: 'You are not allowed to change username' }]
            });
        }

        if (data.password) {
            var salt = bcrypt.genSaltSync(10)
            var hash = bcrypt.hashSync(data.password, salt)
            data.password = hash
        }
        callback(data)
    }
})()

const update = controller.update.bind(controller)

testapp.post('/', (req, res) => {
  var parsedReq = parse(req.body['req'])
  console.log(parsedReq)
  update(parsedReq, res)
})

if (require.main === module) {
  // app.listen(port);
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`)
  })
}
