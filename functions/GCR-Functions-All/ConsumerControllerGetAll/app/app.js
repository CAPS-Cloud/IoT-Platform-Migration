const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const BaseController = require('./controllers/BaseController')
const Consumers = require('./models/ConsumersModel')
const testapp = express()
const port = '8093'
const Sequelize = require('sequelize')
const Op = Sequelize.Op

testapp.use(express.json())

function responseError (res, err) {
  console.log(err)
  res.status(400).json(err)
}


const controller = new (class extends BaseController {
    constructor () {
        super(Consumers);
        this.findAllOptions = {
            include: [{ model: Sensors, include: [{ model: Devices }] }],
        }
    }

    getAll (req, res) {
        console.log(req.authenticated_as);
        if (req.authenticated_as.id === -1){
            Consumers.findAll({}).then(datas => {
                return res.status(200).json({result: datas});
            }).catch(err => responseError(res, err));

        }else{
            Users.findById(req.authenticated_as.id).then(user => {
                if (!user) {
                    return res.status(400).json({name: 'UserNotFound', errors: [{message: 'User not found'}]});
                } else {
                    console.log("Finding consumers for user : ", user.id)
                    Consumers.findAll({where: {userId: {[Op.eq]: user.id}}, include: [{ model: Sensors, include: [{ model: Devices }] }]}).then(datas => {
                        console.log("Consumers found: ", datas)
                        return res.status(200).json({result: datas});
                    }).catch(err => responseError(res, err));
                }
            }).catch(err => responseError(res, err));

        }

    }

})() 

const getAll = controller.getAll.bind(controller)

testapp.post('/', (req, res) => {
  const parsedReq = parse(req.body["req"]);
  // console.log(parsedReq)
  getAll(parsedReq, res);
});

if (require.main === module) {
  // app.listen(port);
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`);
  });
}
