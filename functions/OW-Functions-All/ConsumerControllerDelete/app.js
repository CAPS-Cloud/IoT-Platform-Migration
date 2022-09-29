const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const BaseController = require('./controllers/BaseController')
const Consumers = require('./models/ConsumersModel')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const Q = require('q');

// function responseError (res, err) {
//   console.log(err)
//   res.status(400).json(err)
// }

const controller = new (class extends BaseController {
    
    constructor () {
        super(Consumers);
        this.findAllOptions = {
            include: [{ model: Sensors, include: [{ model: Devices }] }],
        }
    }

    pre_delete (req, deferred, callback) {
        callback();
    }

    delete (req) {
        var deferred = Q.defer();
        this.pre_delete(req, deferred, () => {
            this.model.destroy({
                where: {
                    userId: {[Op.eq]: req.authenticated_as.id},
                    id: {[Op.eq]: req.params.id}
                }
            }).then(data => {
                // return res.status(200).json({ result: data });
                deferred.resolve({
                    statusCode: 200,
                    headers: { "Content-Type": "application/json" },
                    body: { result: data }
                  });
            }).catch(err => {
                deferred.reject({
                    statusCode: 400,
                    headers: { "Content-Type": "application/json" },
                    body: { error: err },
                  });
            });
        });
        return deferred.promise;
    }
})()

function main (params) {
    var parsedReq = parse(params["req"]);
    const deletefunc = controller.delete.bind(controller);
    return deletefunc(parsedReq);
  }
  
  module.exports.main = main