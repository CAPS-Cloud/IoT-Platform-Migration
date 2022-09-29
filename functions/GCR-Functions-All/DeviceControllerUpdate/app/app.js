const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const BaseController = require('./controllers/BaseController')
const testapp = express()
const port = '8090'
const Sequelize = require('sequelize')
const Op = Sequelize.Op

testapp.use(express.json())

function responseError (res, err) {
    console.log(err)
    res.status(400).json(err)
}


const controller = new (class extends BaseController {

    constructor () {
        super (Devices)
        this.findAllOptions = {
          include: [{ model: Sensors }],
        };
      }

      update (req, res) {
        Users.findById(req.authenticated_as.id).then(user => {
            if (!user) {
                console.log("Device Update: UserNotFound");
                return res.status(400).json({name: 'UserNotFound', errors: [{message: 'User not found'}]});
            } else {
                console.log("Device Update: User Found");
                Devices.findOne({
                    where: {
                        userId: {[Op.eq]: user.id},
                        id: {[Op.eq]: req.params.device_id}
                    }
                }).then(data => {
                    if (data) {
                        console.log("Device Update: Device Found");
                        delete req.body.id;
                        Devices.update(req.body, {where: {id: {[Op.eq]: data.id}}}).then(device => {
                            return res.status(200).json({result: device});
                        }).catch(err => responseError(res, err));
                    } else {
                        console.log("Device Update: Device Not Found");
                        return res.status(400).json({name: 'DeviceNotFound', errors: [{message: 'Device not found'}]});
                    }
                });
            }
        }).catch(err => responseError(res, err));
    }

})()

const update = controller.update.bind(controller)

testapp.post('/', (req, res) => {
  const parsedReq = parse(req.body["req"])
  // console.log(parsedReq)
  update(parsedReq, res)
})

if (require.main === module) {
  // app.listen(port);
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`)
  })
}
