const fs = require('fs')
const { parse, stringify } = require('flatted')
const AUTHENTICATION_PUBLIC = fs.readFileSync(
  '.keys/authentication_jwtRS256.key.pub'
)
const ROOT_USERNAME = 'root'
const Q = require('q');
const jwt = require('jsonwebtoken')
const Users = require('./models/UsersModel')
const Sequelize = require('sequelize');
const Op = Sequelize.Op

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

function checkAuthenticationRole(role, reqauthenticatedAs) {
  if (role.localeCompare('SUPER_USER') == 0) {
    if (
      reqauthenticatedAs &&
      ['SUPER_USER'].includes(reqauthenticatedAs.role)
    ) {
      return true;
    } else {
      return false;
    }
  } else if (role.localeCompare('ADMIN') == 0) {
    if (
      reqauthenticatedAs &&
      ['SUPER_USER', 'ADMIN'].includes(reqauthenticatedAs.role)
    ) {
      return true;
    } else {
      return false;
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

function main (params) { 
  var deferred = Q.defer();
  if (params)
  {
    console.log(params)
    var returnObj = {}
    var parsedReq = parse(params['req']);
    // const bearerHeader = parsedReq.headers['authorization']; 
    // Request headers coming as empty, had to use rawHeaders
    // const bearerHeader = parsedReq.rawHeaders[7]
    var rawHeaders = parsedReq.rawHeaders
    var authIndex = rawHeaders.indexOf("Authorization")
    if (authIndex == -1)
    {
      authIndex = rawHeaders.indexOf("authorization")
    }
    const bearerHeader = parsedReq.rawHeaders[authIndex + 1]
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ')
      if (bearer.length != 2) {
        if (params['Role'].localeCompare('SIGNIN') == 0) {
          deferred.resolve({
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: {"sigininreq": "Bearer Length not equal to 2"},
          });
        } else {
          deferred.reject({
            statusCode: 401,
            headers: { "Content-Type": "application/json" },
            body: { error: "Error Bearer Length not equal to 2" },
          })
        }
      } else {
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
                };
                var retval;
                if (params['Role']) {
                  retval = checkAuthenticationRole(
                    params['Role'],
                    reqauthenticatedAs
                  );
                } else {
                  retval = 1;
                }
  
                if (retval) {
                  parsedReq.authenticated_as = reqauthenticatedAs
                  returnObj = parsedReq
                  // Using flatter stringify, since the request has cyclic params
                  deferred.resolve({
                    statusCode: 200,
                    headers: { "Content-Type": "application/json" },
                    body: {"newparams": stringify(returnObj)},
                  });
                } else {
                  deferred.reject({
                    statusCode: 401,
                    headers: { "Content-Type": "application/json" },
                    body: { error: "Error Bearer Length not equal to 2" },
                  });
                }
              } else {
                Users.findOne({ where: { id: { [Op.eq]: authData.sub } } }).then(
                  (data) => {
                    if (data) {
                      var reqauthenticatedAs = data
                      var retval
                      if (retval) {
                        retval = checkAuthenticationRole(
                          params['Role'],
                          reqauthenticatedAs
                        );
                      } else {
                        retval = 1
                      }
  
                      if (retval) {
                        parsedReq.authenticated_as = reqauthenticatedAs
                        returnObj = parsedReq
                        deferred.resolve({
                          statusCode: 200,
                          headers: { "Content-Type": "application/json" },
                          body: {"newparams": stringify(returnObj)},
                        });
                      } else {
                        deferred.reject({
                          statusCode: 401,
                          headers: { "Content-Type": "application/json" },
                          body: { error: "Authentication Failed" },
                        });
                      }
                    } else {
                      deferred.reject({
                        statusCode: 401,
                        headers: { "Content-Type": "application/json" },
                        body: { error: "User data not available" },
                      });
                    }
                  }
                );
              }
            } else {
              deferred.reject({
                statusCode: 401,
                headers: { "Content-Type": "application/json" },
                body: { error: "Error in jwt verification" },
              });
            }
          }
        );
      }
    } else {
      deferred.reject({
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: { error: "Error bearerHeader undefined" },
      });
    }
  } 
  else
  {
    // deferred.reject({error: "Params not defined"})
    deferred.reject({
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: { error: "Params not defined" },
    });
  }

  return deferred.promise;
}

module.exports.main = main

// const express = require('express')
// // const path = require('path')
// const http = require('http')
// const fs = require('fs')
// const { parse, stringify } = require('flatted')
// //  AuthenticationCheckHandler dependencies
// // const { AUTHENTICATION_PUBLIC, ROOT_USERNAME } = require('../secrets');
// const AUTHENTICATION_PUBLIC = fs.readFileSync(
//   '.keys/authentication_jwtRS256.key.pub'
// )
// const ROOT_USERNAME = 'root'

// const jwt = require('jsonwebtoken')
// const Users = require('./models/UsersModel')
// const Sequelize = require('sequelize')
// const Op = Sequelize.Op

// const testapp = express()
// const port = "8045"

// testapp.use(express.json());

// function checkAuthenticationRole(role, reqauthenticatedAs) {
//   if (role.localeCompare('SUPER_USER') == 0) {
//     if (
//       reqauthenticatedAs &&
//       ['SUPER_USER'].includes(reqauthenticatedAs.role)
//     ) {
//       return true;
//     } else {
//       return false;
//     }
//   } else if (role.localeCompare('ADMIN') == 0) {
//     if (
//       reqauthenticatedAs &&
//       ['SUPER_USER', 'ADMIN'].includes(reqauthenticatedAs.role)
//     ) {
//       return true;
//     } else {
//       return false;
//     }
//   } else if (role.localeCompare('USER') == 0) {
//     if (
//       reqauthenticatedAs &&
//       ['SUPER_USER', 'ADMIN', 'USER'].includes(reqauthenticatedAs.role)
//     ) {
//       return true
//     } else {
//       return false
//     }
//   }
// }

// testapp.post('/', (req, res) => {
//   var returnObj = {}
//   var parsedReq = parse(req.body['req']);
//   // console.log("parsedReq:", parsedReq)
//   // console.log(parsedReq.rawHeaders[7])
//   // console.log(parsedReq.headers)
//   // const bearerHeader = parsedReq.rawHeaders['authorization']
//   //Request headers coming as empty, had to use rawHeaders
//   var rawHeaders = parsedReq.rawHeaders
//   var authIndex = rawHeaders.indexOf("Authorization")
//   if (authIndex == -1)
//   {
//     authIndex = rawHeaders.indexOf("authorization")
//   }
//   console.log(authIndex)
//   const bearerHeader = parsedReq.rawHeaders[authIndex + 1]
//   console.log("bearerHeader:", bearerHeader)
//   console.log("headers:", parsedReq.headers)
//   console.log("parsedReq:", parsedReq)
//   // console.log("Raweaders:", parsedReq.rawHeaders)

//   if (typeof bearerHeader !== 'undefined') {
//     const bearer = bearerHeader.split(' ')
//     if (bearer.length != 2) {
//       // res.status(401).send('Error Bearer Length not equal to 2')
//       res.status(401).send('Error Bearer Length not equal to 2')
//     } else {
//       const bearerToken = bearer[1]
//       jwt.verify(
//         bearerToken,
//         AUTHENTICATION_PUBLIC,
//         { algorithms: ['RS256'], issuer: 'iotplatform' },
//         (err, authData) => {
//           if (!err) {
//             if (authData.sub == '-1') {
//               // req.authenticated_as = { id: -1, name: '<root>', username: ROOT_USERNAME, role: 'SUPER_USER' };
//               var reqauthenticatedAs = {
//                 id: -1,
//                 name: '<root>',
//                 username: ROOT_USERNAME,
//                 role: 'SUPER_USER'
//               };

//               var retval;
//               if (req.query['Role']) {
//                 retval = checkAuthenticationRole(
//                   req.query['Role'],
//                   reqauthenticatedAs
//                 );
//               } else {
//                 retval = 1;
//               }

//               if (retval) {
//                 parsedReq.authenticated_as = reqauthenticatedAs
//                 returnObj = parsedReq
//                 // Using flatter stringify, since the request has cyclic params
//                 res.status(200)
//                 res.json(stringify(returnObj))
//               } else {
//                 res.status(401).send('Authentication Failed')
//               }
//             } else {
//               Users.findOne({ where: { id: { [Op.eq]: authData.sub } } }).then(
//                 (data) => {
//                   if (data) {
//                     var reqauthenticatedAs = data
//                     var retval
//                     if (retval) {
//                       retval = checkAuthenticationRole(
//                         req.query['Role'],
//                         reqauthenticatedAs
//                       );
//                     } else {
//                       retval = 1
//                     }

//                     if (retval) {
//                       parsedReq.authenticated_as = reqauthenticatedAs
//                       returnObj = parsedReq
//                       res.status(200)
//                       res.json(stringify(returnObj))
//                     } else {
//                       res.status(401).send('Authentication Failed');
//                     }
//                   } else {
//                     res.status(401).send('User data not available');
//                   }
//                 }
//               );
//             }
//           } else {
//             // console.log("Executed");
//             res.status(401).end('Error in jwt verification')
//             // res.json({'error': 'Error in jwt verification' })
//           }
//         }
//       );
//     }
//   } else {
//     res.status(401).send('Error bearerHeader undefined')
//   }
// })

// if (require.main === module) {
//   // app.listen(port);
//   http.createServer(testapp).listen(port, function () {
//     console.log(`Server is listening on port ${port}`)
//   })
// }

// module.exports = testapp
