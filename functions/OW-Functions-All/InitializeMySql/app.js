const sequelize = require('./connections/mysql');
// const { async } = require('q');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
// function responseError (res, err) {
//     console.log(err)
//     res.status(400).json(err)
// }
const Sensors = require('./models/SensorsModel');
const Users = require('./models/UsersModel');
const Devices = require('./models/DevicesModel');
const Alerts = require('./models/AlertsModel');
const Consumers = require('./models/ConsumersModel');
const Predictions = require('./models/PredictionsModel')

async function syncDataModels() {
    //await sequelize.drop();
    //await sequelize.sync({ force: true });
    var result = await sequelize.sync()
    return result
}

function main (params) {
  try {
      syncDataModels().then((response) => {
      console.log("response:", response)
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: { result: response },
      }
    });
  } catch (err) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: { result: err },
    }
  }

  // return {"execution" : "done"}
}

// async function main (params) {
//     try {
//         const result = await sequelize.sync()
//         return {
//             statusCode: 200,
//             headers: { 'Content-Type': 'application/json' },
//             body: {result: result}
//         };
//     } catch (err) {
//         return {
//             statusCode: 401,
//             headers: { 'Content-Type': 'application/json' },
//             body: {error: err}
//         };
//     }
// }


// function main (params) {
//         try {
//             const result = await sequelize.sync()
//             return {
//                 statusCode: 200,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: {result: result}
//             };
//         } catch (err) {
//             return {
//                 statusCode: 401,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: {error: err}
//             };
//         }
// }
module.exports.main = main
// main()

