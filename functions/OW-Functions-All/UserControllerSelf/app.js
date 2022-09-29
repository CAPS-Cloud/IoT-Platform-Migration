const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const BaseController = require('./controllers/BaseController')
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const Q = require('q');

const controller = new (class extends BaseController {
  constructor () {
    super(Users)
    this.findAllOptions = {
      exclude: ['password'],
      include: [{ model: Devices }]
    }
  }

  self (req) {
    var deferred = Q.defer();
    if (req)
    {
      var result = req.authenticated_as
      delete result.password
      // res.json({ result })
      deferred.resolve({
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: { result }
      });
    }
    return deferred.promise;
  }
})()

function main (params) {
  var parsedReq = parse(params['req']);
  const self = controller.self.bind(controller)
  return self(parsedReq)
}


// const self = controller.self.bind(controller)

// testapp.post('/', (req, res) => {
//   var parsedReq = parse(req.body['req'])
//   // console.log(parsedReq)
//   self(parsedReq, res)
// })

// if (require.main === module) {
//   // app.listen(port);
//   http.createServer(testapp).listen(port, function () {
//     console.log(`Server is listening on port ${port}`)
//   })
// }
module.exports.main = main
