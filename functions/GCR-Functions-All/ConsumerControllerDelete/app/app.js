const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const BaseController = require('./controllers/BaseController')
const Consumers = require('./models/ConsumersModel')
const testapp = express()
const port = '8097'
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

testapp.use(express.json())

function responseError (res, err) {
  console.log(err)
  res.status(400).json(err)
}

const controller = new (class extends BaseController {
    
    constructor() {
        super(Consumers);
        this.findAllOptions = {
            include: [{ model: Sensors, include: [{ model: Devices }] }],
        }
    }

    pre_delete (req, res, callback) {
        callback();
    }

    delete (req, res) {
        this.pre_delete(req, res, () => {
            this.model.destroy({
                where: {
                    userId: {[Op.eq]: req.authenticated_as.id},
                    id: {[Op.eq]: req.params.id}
                }
            }).then(data => {
                return res.status(200).json({ result: data });
            }).catch(err => responseError(res, err));
        });
    }

})()

const deletefunc = controller.delete.bind(controller)

testapp.post('/', (req, res) => {
    const parsedReq = parse(req.body['req'])
    // console.log(parsedReq)
    deletefunc(parsedReq, res)
  })
  
  if (require.main === module) {
    // app.listen(port);
    http.createServer(testapp).listen(port, function () {
      console.log(`Server is listening on port ${port}`)
    })
  }
