const kafka = require("kafka-node")
const { kafkahost } = require('./connections/common')
const Q = require('q');

// const testapp = express()
// const port = '8071'


const Devices = require('./models/DevicesModel');
const Sensors = require('./models/SensorsModel');
const Users = require('./models/UsersModel');
var kafkaProducer, kafkaClient;

// testapp.use(express.json())

// async function initKafka () {
//   return new Promise((resolve) => {
//     console.log("attempting to initiate Kafka connection...");
//     kafkaClient = new kafka.KafkaClient({kafkaHost: kafkahost});
//     kafkaClient.on('error', function(error) {
//       console.error(error);
//     });
//     kafkaProducer = new kafka.HighLevelProducer(kafkaClient);
//     kafkaProducer.on("ready", () => {
//       console.log("kafka producer is connected and ready");
//       resolve();
//     });
//     // kafkaProducer.on("ready", () => {
//     //   resolve();
//     // });
//   }).catch(err => {
//     console.log(err)
//   });
// }
function initKafka () {
  var deferredinit = Q.defer()
  kafkaClient = new kafka.KafkaClient({kafkaHost: kafkahost});
  // kafkaClient.on('error', function(error) {
  //         // console.error(error);
  //         deferredinit.reject({
  //           statusCode: 400,
  //           headers: { "Content-Type": "application/json" },
  //           body: { error: error }
  //         });
  // });
  kafkaClient.on('error', function(error) {
    deferredinit.reject({
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: { error: error },
    });
  });

  kafkaProducer = new kafka.HighLevelProducer(kafkaClient);
  kafkaProducer.on('ready', function(message) {
    deferredinit.resolve({
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: {result: "Kafka client successfully initialized"}
    })
  })
  kafkaProducer.on('error', function (error) {
    deferredinit.reject({
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: { error: error }
    });
  })
  return deferredinit.promise
}


function ingestMsgInKafka(payloads) {
  kafkaProducer.send(payloads, (err) => {
    if (err) {
      console.error(
        "couldn't forward message to kafka, topic: ",
        payloads[0].topic,
        " - error: ",
        err
      );
    } else {
      console.log("forwarded to kafka:");
      console.log(payloads);
      // console.log((new Date()).getTime() + "-----" + JSON.stringify(payloads))
    }
  });
}

function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}


// function get_message (messageString, topic) {
//    var deferred = Q.defer();
//   if (IsJsonString(messageString)) {
//     console.log("valid JSON string", messageString);
//     let message_object = JSON.parse(messageString);
//     if (
//       message_object !== undefined &&
//       message_object.hasOwnProperty("username") &&
//       message_object.hasOwnProperty("device_id") &&
//       message_object.hasOwnProperty("timestamp")
//     ) {
//       Users.findOne({
//         where: { username: message_object.username },
//       }).then((user) => {
//         if (user) {
//           Devices.findOne({
//             where: { id: message_object.device_id, userId: user.id },
//             include: [{ model: Sensors }],
//           }).then((device) => {
//             //console.log(device);
//             if (device) {
//               let DEVICE_ID = device.id;
//               let USER_ID = user.id;
//               let found = false;

//               let sensor_names = Object.keys(message_object);
//               for (let i = sensor_names.length - 1; i >= 0; i--) {
//                 if (sensor_names[i] === "username") {
//                   sensor_names.splice(i, 1);
//                 }
//                 if (sensor_names[i] === "device_id") {
//                   sensor_names.splice(i, 1);
//                 }
//                 if (sensor_names[i] === "timestamp") {
//                   sensor_names.splice(i, 1);
//                 }
//               }
//               console.log("Sensor Names", sensor_names);
//               for (let i = 0; i < sensor_names.length; i++) {
//                 for (let j = 0; j < device.sensors.length; j++) {
//                   if (sensor_names[i] === device.sensors[j].name) {
//                     let sensor_id = device.sensors[j].id;
//                     let payload = {
//                       schema: {
//                         type: "struct",
//                         fields: [
//                           {
//                             type: "string",
//                             optional: false,
//                             field: "sensor_id",
//                           },
//                           {
//                             type: "string",
//                             optional: false,
//                             field: "sensor_name",
//                           },
//                           {
//                             type: "string",
//                             optional: false,
//                             field: "device_id",
//                           },
//                           {
//                             type: "int64",
//                             optional: false,
//                             field: "timestamp",
//                           },
//                           {
//                             type: "double",
//                             optional: false,
//                             field: "value",
//                           },
//                           {
//                             type: "string",
//                             optional: false,
//                             field: "mqtt_gateway",
//                           },
//                         ],
//                         optional: false,
//                         name: "total data",
//                       },
//                       payload: {
//                         sensor_id: "" + sensor_id, // 0th sensor is count of people,,
//                         sensor_name: "" + device.sensors[j].name, // 0th sensor is count of people,,
//                         device_id: "" + DEVICE_ID, // 0th sensor is count of people
//                         timestamp: parseInt(message_object.timestamp),
//                         value: Number(message_object["" + sensor_names[i]]),
//                         mqtt_gateway: "iot_platform",
//                       },
//                     };
//                     // let msgStr = JSON.stringify(payload);
//                     // forwardMsg(msgStr, "" + USER_ID + "_" + DEVICE_ID)
//                     var user_deviceId = "" + USER_ID + "_" + DEVICE_ID
                    
//                       let parsedMsg = payload;
                  
//                       // if (typeof msgStr === "string") {
//                       //   messageString = msgStr;
//                       // } else {
//                       //   // console.log("invalid type of data - not forwarded to kafka")
//                       //   deferred.reject({
//                       //     statusCode: 401,
//                       //     headers: { "Content-Type": "application/json" },
//                       //     body: { error: "Incorrect message type" },
//                       //   });
//                       // }
                      
//                       // let parsedMsg = JSON.parse(messageString);
//                       if (Array.isArray(parsedMsg)) {
//                         for (var index = 0, len = parsedMsg.length; index < len; index++) {
//                           console.log(
//                             "topic",
//                             user_deviceId + "_" + parsedMsg[index].payload.sensor_id
//                           );
//                           // ingestMsgInKafka([
//                           //   {
//                           //     topic: user_deviceId + "_" + parsedMsg[index].payload.sensor_id,
//                           //     messages: JSON.stringify(parsedMsg[index]),
//                           //   },
//                           // ]);
//                           let payloads = [{
//                               topic: user_deviceId + "_" + parsedMsg[index].payload.sensor_id,
//                               messages: JSON.stringify(parsedMsg[index]),
//                           }]
//                           kafkaProducer.send(payloads, (err) => {
//                             if (err) {
//                               deferred.reject({
//                                 statusCode: 401,
//                                 headers: { "Content-Type": "application/json" },
//                                 body: { error: "couldn't forward message to kafka" },
//                               });
//                             } else {
//                               deferred.resolve({
//                                 statusCode: 200,
//                                 headers: { "Content-Type": "application/json" },
//                                 body: { result: "Forwaded message to kafka" }
//                               });
//                             }
//                           });
//                         }
//                       } else {
//                         console.log("topic", user_deviceId + "_" + parsedMsg.payload.sensor_id);
                  
//                         // ingestMsgInKafka([
//                         //   {
//                         //     topic: user_deviceId + "_" + parsedMsg.payload.sensor_id,
//                         //     messages: messageString,
//                         //   },
//                         // ]);
//                         let payloads = [{
//                           topic: user_deviceId + "_" + parsedMsg.payload.sensor_id,
//                           messages: parsedMsg,
//                         }]
//                         console.log()
//                         kafkaProducer.send(payloads, (err) => {
//                           if (err) {
//                             deferred.reject({
//                               statusCode: 401,
//                               headers: { "Content-Type": "application/json" },
//                               body: { error: "couldn't forward message to kafka" },
//                             });
//                           } else {
//                             deferred.resolve({
//                               statusCode: 200,
//                               headers: { "Content-Type": "application/json" },
//                               body: { result: "Forwaded message to kafka" }
//                             });
//                           }
//                         });

//                       }
                      
               

//                     found = true;
//                     break;
//                   }
//                 }
//               }
//               if (!found) {
//                 // console.log("No Sensors found in the device");
//                 deferred.reject({
//                   statusCode: 401,
//                   headers: { "Content-Type": "application/json" },
//                   body: { error: "No Sensors found in the device" },
//                 });
//               }
//             } else {
//               // console.log("Device not found");
//               deferred.reject({
//                 statusCode: 401,
//                 headers: { "Content-Type": "application/json" },
//                 body: { error: "Device not found" },
//               });
//             }
//           });
//         } else {
//           // console.log("User not found");
//           deferred.reject({
//             statusCode: 401,
//             headers: { "Content-Type": "application/json" },
//             body: { error: "User not found" },
//           });
//         }
//       });
//     } else {
//       // console.log(
//       //   "object or device_id  is undefined or username is not added as part of it",
//       //   message_object
//       // );
//       deferred.reject({
//         statusCode: 401,
//         headers: { "Content-Type": "application/json" },
//         body: { error: "Object or device_id  is undefined or username is not added as part of it" },
//       });
//     }
//   } else {
//     // console.log("Not a valid json string", messageString);
//     deferred.reject({
//       statusCode: 401,
//       headers: { "Content-Type": "application/json" },
//       body: { error: "Not a valid json string" },
//     });
//   }
//   return deferred.promise;
// }

function get_message(messageString, topic){
  if (IsJsonString(messageString)) {
      console.log("valid JSON string", messageString);
      let message_object = JSON.parse(messageString);
      if (message_object !== undefined && message_object.hasOwnProperty('username') && message_object.hasOwnProperty('device_id')
          && message_object.hasOwnProperty('timestamp')) {

          Users.findOne({
              where: {username: message_object.username}
          }).then(user => {
              if (user) {
                  Devices.findOne({
                      where: {id: message_object.device_id, userId: user.id},
                      include: [{model: Sensors}]
                  }).then(device => {
                      //console.log(device);
                      if (device) {
                          let DEVICE_ID = device.id;
                          let USER_ID = user.id;
                          let found = false;

                          let sensor_names = Object.keys(message_object);
                          for (let i = sensor_names.length - 1; i >= 0; i--) {
                              if (sensor_names[i] === "username") {
                                  sensor_names.splice(i, 1);
                              }
                              if (sensor_names[i] === "device_id") {
                                  sensor_names.splice(i, 1);
                              }
                              if (sensor_names[i] === "timestamp") {
                                  sensor_names.splice(i, 1);
                              }
                          }
                          console.log("Sensor Names", sensor_names);
                          for (let i = 0; i < sensor_names.length; i++) {
                              for (let j = 0; j < device.sensors.length; j++) {
                                  if (sensor_names[i] === device.sensors[j].name) {

                                      let sensor_id = device.sensors[j].id;
                                      let payload = {
                                          "schema": {
                                              "type": "struct",
                                              "fields": [{
                                                  "type": "string",
                                                  "optional": false,
                                                  "field": "sensor_id"
                                              }, {
                                                  "type": "string",
                                                  "optional": false,
                                                  "field": "sensor_name"
                                              },
                                                  {
                                                      "type": "string",
                                                      "optional": false,
                                                      "field": "device_id"
                                                  }, {
                                                      "type": "int64",
                                                      "optional": false,
                                                      "field": "timestamp"
                                                  }, {
                                                      "type": "double",
                                                      "optional": false,
                                                      "field": "value"
                                                  }, {
                                                      "type": "string",
                                                      "optional": false,
                                                      "field": "mqtt_gateway"
                                                  }

                                              ],
                                              "optional": false,
                                              "name": "total data"
                                          },
                                          "payload": {
                                              "sensor_id": "" + sensor_id, // 0th sensor is count of people,,
                                              "sensor_name": "" + device.sensors[j].name, // 0th sensor is count of people,,
                                              "device_id": "" + DEVICE_ID, // 0th sensor is count of people
                                              "timestamp": parseInt(message_object.timestamp),
                                              "value": Number(message_object["" + sensor_names[i]]),
                                              "mqtt_gateway": "iot_platform"
                                          }
                                      };
                                      let msgStr = JSON.stringify(payload);
                                      forwardMsg(msgStr, "" + USER_ID + "_" + DEVICE_ID);
                                      found = true;
                                      break;
                                  }
                              }
                          }
                          if (!found) {
                              console.log("No Sensors found in the device");
                          }


                      } else {
                          console.log("Device not found");
                      }
                  });
              } else {
                  console.log("User not found");
              }
          });
      } else {

          console.log("object or device_id  is undefined or username is not added as part of it", message_object);
      }
  }
  else {

      console.log("Not a valid json string", messageString);
  }
}

function forwardMsg(message, user_deviceId) {
  try {
    let messageString;

    if (typeof message === "string") {
      messageString = message;
    } else {
      // console.log("invalid type of data - not forwarded to kafka")
      return;
    }

    let parsedMsg = JSON.parse(messageString);
    if (Array.isArray(parsedMsg)) {
      for (var i = 0, len = parsedMsg.length; i < len; i++) {
        console.log(
          "topic",
          user_deviceId + "_" + parsedMsg[i].payload.sensor_id
        );
        ingestMsgInKafka([
          {
            topic: user_deviceId + "_" + parsedMsg[i].payload.sensor_id,
            messages: JSON.stringify(parsedMsg[i]),
          },
        ]);
      }
    } else {
      console.log("topic", user_deviceId + "_" + parsedMsg.payload.sensor_id);

      ingestMsgInKafka([
        {
          topic: user_deviceId + "_" + parsedMsg.payload.sensor_id,
          messages: messageString,
        },
      ]);
    }
  } catch (error) {
    console.error(error);
  }
}

// testapp.post('/', (req, res) => {
//     const payload = req.body['payload']
//     const topic = req.body['topic']
//     console.log("payload:", payload)
//     console.log("topic:", topic)
//     // console.log(parsedReq)
//     // deletefunc(parsedReq, res)
//   })
  
//   if (require.main === module) {
//     // app.listen(port);
//     http.createServer(testapp).listen(port, function () {
//       console.log(`Server is listening on port ${port}`)
//     })
// }

function main (params) {
 
  // return {
  //   // statusCode: 200,
  //   // headers: { "Content-Type": "application/json" },
  //   // body: {
  //   //   payload: payload,
  //   //   topic: topic
  //   // }
  //   result:"done"
  // }
  // Promise.all([initKafka()]).then(() => {
  //   const payload = params['payload']
  //   const topic = params['topic']
  //   return get_message(payload, topic)
  // }).catch(error => {
  //   return error
  // })
  const payload = params['payload']
  const topic = params['topic']
  return initKafka()
    .then(function (responseObj) {
      return get_message(payload, topic)
    })
}

module.exports.main = main