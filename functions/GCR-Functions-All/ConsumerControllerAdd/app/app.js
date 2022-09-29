const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const BaseController = require('./controllers/BaseController')
const Consumers = require('./models/ConsumersModel')
const testapp = express()
const port = '8094'

testapp.use(express.json())

function responseError (res, err) {
  // console.log(err)
  res.status(400).json(err)
}

const controller = new (class extends BaseController {
    constructor () {
        super(Consumers)
        this.findAllOptions = {
            include: [{ model: Sensors, include: [{ model: Devices }] }]
        }
    }

    add (req, res) {
        Users.findById(req.authenticated_as.id).then(user => {
            if (!user) {
                return res.status(400).json({name: 'UserNotFound', errors: [{message: 'User not found'}]});
            } else {
                Consumers.create({
                    name: req.body.name,
                    description: req.body.description,
                    userId: user.id
                }).then(data => {
                    this.post_add(data, result_data => {
                        return res.status(200).json({result: result_data});
                    })
                }).catch(err => responseError(res, err))
            }
        }).catch(err => responseError(res, err))
    }
})()

const add = controller.add.bind(controller)

testapp.post('/', (req, res) => {
  const parsedReq = parse(req.body['req'])
  // console.log(parsedReq)
  add(parsedReq, res)
})

if (require.main === module) {
  // app.listen(port);
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`)
  })
}
