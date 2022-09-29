const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const BaseController = require('./controllers/BaseController')
const testapp = express()
const port = '8075'

testapp.use(express.json())

const controller = new (class extends BaseController {
  constructor () {
    super(Users)
    this.findAllOptions = {
      exclude: ['password'],
      include: [{ model: Devices }]
    }
  }

  self (req, res) {
    var result = req.authenticated_as
    delete result.password
    res.json({ result })
  }
})()

const self = controller.self.bind(controller)

testapp.post('/', (req, res) => {
  var parsedReq = parse(req.body['req'])
  // console.log(parsedReq)
  self(parsedReq, res)
})

if (require.main === module) {
  // app.listen(port);
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`)
  })
}
