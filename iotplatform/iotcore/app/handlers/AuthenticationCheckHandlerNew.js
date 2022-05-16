const express = require('express')
// const path = require('path')
const http = require('http')
const fs = require('fs')
const { parse, stringify } = require('flatted')
//  AuthenticationCheckHandler dependencies
// const { AUTHENTICATION_PUBLIC, ROOT_USERNAME } = require('../secrets');
var AUTHENTICATION_PUBLIC = fs.readFileSync(
  '../.keys/authentication_jwtRS256.key.pub'
)
var ROOT_USERNAME = 'root'

const jwt = require('jsonwebtoken')
const Users = require('../models/UsersModel')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const testapp = express()
const port = '8045'

testapp.use(express.json())

function checkAuthenticationRole (role, reqauthenticatedAs) {
  if (role.localeCompare('SUPER_USER') == 0) {
    if (
      reqauthenticatedAs &&
      ['SUPER_USER'].includes(reqauthenticatedAs.role)
    ) {
      return true
    } else {
      return false
    }
  } else if (role.localeCompare('ADMIN') == 0) {
    if (
      reqauthenticatedAs &&
      ['SUPER_USER', 'ADMIN'].includes(reqauthenticatedAs.role)
    ) {
      return true
    } else {
      return false
    }
  } else if (role.localeCompare('USER') == 0) {
    if (
      reqauthenticatedAs &&
      ['SUPER_USER', 'ADMIN', 'USER'].includes(reqauthenticatedAs.role)
    ) {
      return true
    } else {
      return false
    }
  }
}

testapp.get('/', (req, res) => {
  var returnObj = {}
  var parsedReq = parse(req.query['req'])
  const bearerHeader = parsedReq.headers['authorization']

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ')
    if (bearer.length != 2) {
      res.status(401).send('Error')
    }
    const bearerToken = bearer[1]
    jwt.verify(
      bearerToken,
      AUTHENTICATION_PUBLIC,
      { algorithms: ['RS256'], issuer: 'iotplatform' },
      (err, authData) => {
        if (!err) {
          if (authData.sub == '-1') {
            // req.authenticated_as = { id: -1, name: '<root>', username: ROOT_USERNAME, role: 'SUPER_USER' };
            var reqauthenticatedAs = {
              id: -1,
              name: '<root>',
              username: ROOT_USERNAME,
              role: 'SUPER_USER'
            }

            var retval
            if (req.query['Role']) {
              retval = checkAuthenticationRole(
                req.query['Role'],
                reqauthenticatedAs
              )
            } else {
              retval = 1
            }

            if (retval) {
              parsedReq.authenticated_as = reqauthenticatedAs
              returnObj = parsedReq
              // Using flatter stringify, since the request has cyclic params
              res.status(200)
              res.json(stringify(returnObj))
            } else {
              res.status(401).send('Error')
            }
          } else {
            Users.findOne({ where: { id: { [Op.eq]: authData.sub } } }).then(
              (data) => {
                if (data) {
                  var reqauthenticatedAs = data
                  var retval;
                  if (retval) {
                    retval = checkAuthenticationRole(
                      req.query['Role'],
                      reqauthenticatedAs
                    )
                  } else {
                    retval = 1
                  }

                  if (retval) {
                    parsedReq.authenticated_as = reqauthenticatedAs
                    returnObj = parsedReq
                    res.status(200)
                    res.json(stringify(returnObj))
                  } else {
                    res.status(401).send('Error')
                  }
                } else {
                  res.status(401).send('Error')
                }
              }
            )
          }
        } else {
          res.status(401).send('Error')
        }
      }
    );
  } else {
    res.status(401).send('Error')
  }
});

testapp.post('/', (req, res) => {
  var returnObj = {}
  var parsedReq = parse(req.body['req'])
  const bearerHeader = parsedReq.headers['authorization']

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ')
    if (bearer.length != 2) {
      res.status(401).send('Error Bearer Length not equal to 2')
    }
    const bearerToken = bearer[1]
    jwt.verify(
      bearerToken,
      AUTHENTICATION_PUBLIC,
      { algorithms: ['RS256'], issuer: 'iotplatform' },
      (err, authData) => {
        if (!err) {
          if (authData.sub == '-1') {
            // req.authenticated_as = { id: -1, name: '<root>', username: ROOT_USERNAME, role: 'SUPER_USER' };
            var reqauthenticatedAs = {
              id: -1,
              name: '<root>',
              username: ROOT_USERNAME,
              role: 'SUPER_USER'
            }

            var retval
            if (req.query['Role']) {
              retval = checkAuthenticationRole(
                req.query['Role'],
                reqauthenticatedAs
              )
            } else {
              retval = 1
            }

            if (retval) {
              parsedReq.authenticated_as = reqauthenticatedAs
              returnObj = parsedReq
              // Using flatter stringify, since the request has cyclic params
              res.status(200)
              res.json(stringify(returnObj))
            } else {
              res.status(401).send('Authentication Failed')
            }
          } else {
            Users.findOne({ where: { id: { [Op.eq]: authData.sub } } }).then(
              (data) => {
                if (data) {
                  var reqauthenticatedAs = data
                  var retval
                  if (retval) {
                    retval = checkAuthenticationRole(
                      req.query['Role'],
                      reqauthenticatedAs
                    )
                  } else {
                    retval = 1
                  }

                  if (retval) {
                    parsedReq.authenticated_as = reqauthenticatedAs
                    returnObj = parsedReq
                    res.status(200)
                    res.json(stringify(returnObj))
                  } else {
                    res.status(401).send('Authentication Failed')
                  }
                } else {
                  res.status(401).send('User data not available')
                }
              }
            );
          }
        } else {
          res.status(401).send('Error in jwt verification')
        }
      }
    )
  } else {
    res.status(401).send('Error bearerHeader undefined')
  }
})

if (require.main === module) {
  // app.listen(port);
  http.createServer(testapp).listen(port, function () {
    console.log(`Server is listening on port ${port}`)
  })
}

module.exports = testapp
