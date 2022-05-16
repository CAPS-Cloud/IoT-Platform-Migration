const axios = require('axios');
const { parse, stringify } = require('flatted')
const https = require('https');

const RoleUSER = function (req, res, next) {
  const nparams = {
    Role: 'USER',
    req: stringify(req)
  }

  const agent = new https.Agent({  
    rejectUnauthorized: false
  });
  axios
    .post(
      "https://23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP@10.195.5.180:31001/api/v1/web/guest/default/authenticationapp?blocking=true&result=true",
      nparams,
      { httpsAgent: agent }
    )
    .then((response) => {
      var authenticatedAs = parse(response.data['newparams']).authenticated_as;
      req.authenticated_as = authenticatedAs;
      return next();
    })
    .catch((error) => {
      console.log('Error, User:', error)
      return res.sendStatus(401)
    });

}

const RoleADMIN = function (req, res, next) {
  const nparams = {
    Role: 'ADMIN',
    req: stringify(req)
  }
  const agent = new https.Agent({
    rejectUnauthorized: false
  });

  axios
    .post('https://23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP@10.195.5.180:31001/api/v1/web/guest/default/authenticationapp?blocking=true&result=true', nparams, {httpsAgent: agent})
    .then((response) => {
      var authenticatedAs = parse(response.data['newparams']).authenticated_as;
      req.authenticated_as = authenticatedAs;
      return next();
    })
    .catch((error) => {
      console.log('Error RoleAdmin:', error)
      return res.sendStatus(401)
    })
}

const RoleSIGNIN = function (req, res, next) {
  const nparams = {
    req: stringify(req)
  }

  const agent = new https.Agent({
    rejectUnauthorized: false
  })

  // console.log("nparams:", nparams)
  axios
    .post('https://23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP@10.195.5.180:31001/api/v1/web/guest/default/authenticationapp?blocking=true&result=true', nparams, {httpsAgent: agent})
    .then((response) => {
      req = parse(response.data['newparams'])
      return next()
    })
    .catch((error) => {
      console.log('Error:', error)
      // return next();
      return next()
    })
}

exports.RoleUSER = RoleUSER
exports.RoleADMIN = RoleADMIN
exports.RoleSIGNIN = RoleSIGNIN
