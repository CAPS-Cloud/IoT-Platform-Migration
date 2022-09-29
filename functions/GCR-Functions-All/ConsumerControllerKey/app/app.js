const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const BaseController = require('./controllers/BaseController')
const Consumers = require('./models/ConsumersModel')
const testapp = express()
const port = '8096'
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const jwt = require('jsonwebtoken')
const fs = require('fs')

const CONSUMER_SECRET = fs.readFileSync('.keys/consumer_jwtRS256.key')

testapp.use(express.json())

function responseError(res, err) {
  console.log(err);
  res.status(400).json(err);
}
  

const controller = new (class extends BaseController {
    constructor () {
        super(Consumers)
        this.findAllOptions = {
            include: [{ model: Sensors, include: [{ model: Devices }] }]
        }
    }

    key (req, res) {
        Users.findById(req.authenticated_as.id).then(user => {
            if (!user) {
                return res.status(400).json({name: 'UserNotFound', errors: [{message: 'User not found'}]});
            } else {
                Consumers.findOne({
                    where: {
                        userId: {[Op.eq]: user.id},
                        id: {[Op.eq]: req.params.id}
                    }
                }).then(consumer => {
                    if (consumer) {
                        jwt.sign({}, CONSUMER_SECRET, {
                            algorithm: 'RS256',
                            issuer: 'iotplatform',
                            subject: '' + user.id.toString() + '_' + consumer.id.toString()
                        }, (err, token) => {
                            return res.json({token, user_id: user.id, consumer_id: consumer.id});
                        });
                    } else {
                        return res.status(400).json({name: 'ConsumerNotFound', errors: [{message: 'Consumer not found'}]});
                    }
                }).catch(err => responseError(res, err));
            }
        }).catch(err => responseError(res, err));
    }


})()

const key = controller.key.bind(controller)

testapp.post('/', (req, res) => {
  const parsedReq = parse(req.body["req"])
  // console.log(parsedReq)
  key(parsedReq, res)
})

if (require.main === module) {
  // app.listen(port);
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`)
  })
}


