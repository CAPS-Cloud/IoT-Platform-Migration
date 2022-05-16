const AuthenticationRequireRole = require('../handlers/AuthenticationRequireRole');
const express = require('express');
const router = express.Router();

const UsersController = require('../controllers/UsersController');
const DevicesController = require('../controllers/DevicesController');
const ConsumersController = require('../controllers/ConsumersController');
const DeviceSensorsController = require('../controllers/DeviceSensorsController');
const ConsumerSensorsController = require('../controllers/ConsumerSensorsController');
const ConsumerConsumeController = require('../controllers/ConsumerConsumeController');
const PredictionsController = require('../controllers/PredictionsController');
const PredictionsSensorsController = require('../controllers/PredictionsSensorsController');
const AlertsController = require('../controllers/AlertsController');

const AuthenticationCheckHandler = require('../handlers/AuthenticationCheckHandler');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Users
router.get('/api/users', AuthenticationCheckHandler, AuthenticationRequireRole.USER, UsersController.getAll);
router.post('/api/users', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, UsersController.add);
router.patch('/api/users/:id', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, UsersController.update);
router.delete('/api/users/:id', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, UsersController.delete);
router.post('/api/users/signin', AuthenticationCheckHandler, UsersController.signin);
router.get('/api/users/self', AuthenticationCheckHandler, AuthenticationRequireRole.USER, UsersController.self);

// Devices
router.get('/api/users/:user_id/devices', AuthenticationCheckHandler, AuthenticationRequireRole.USER, DevicesController.getAll);
router.post('/api/users/:user_id/devices', AuthenticationCheckHandler, AuthenticationRequireRole.USER, DevicesController.add);
router.patch('/api/users/:user_id/devices/:device_id', AuthenticationCheckHandler, AuthenticationRequireRole.USER, DevicesController.update);
router.delete('/api/users/:user_id/devices/:device_id', AuthenticationCheckHandler, AuthenticationRequireRole.USER, DevicesController.delete);
router.get('/api/users/:user_id/devices/:device_id/key', AuthenticationCheckHandler, AuthenticationRequireRole.USER, DevicesController.key);

// Consumer
router.get('/api/consumers', AuthenticationCheckHandler, AuthenticationRequireRole.USER, ConsumersController.getAll);
router.post('/api/consumers', AuthenticationCheckHandler, AuthenticationRequireRole.USER, ConsumersController.add);
router.patch('/api/consumers/:id', AuthenticationCheckHandler, AuthenticationRequireRole.USER, ConsumersController.update);
router.delete('/api/consumers/:id', AuthenticationCheckHandler, AuthenticationRequireRole.USER, ConsumersController.delete);
router.get('/api/consumers/:id/key', AuthenticationCheckHandler, AuthenticationRequireRole.USER, ConsumersController.key);

// Sensors
router.get('/api/users/:user_id/devices/:device_id/sensors', AuthenticationCheckHandler, AuthenticationRequireRole.USER, DeviceSensorsController.getAll);
router.post('/api/users/:user_id/devices/:device_id/sensors', AuthenticationCheckHandler, AuthenticationRequireRole.USER, upload.single('jar'), DeviceSensorsController.add);
router.patch('/api/users/:user_id/devices/:device_id/sensors/:id', AuthenticationCheckHandler, AuthenticationRequireRole.USER, DeviceSensorsController.update);
router.delete('/api/users/:user_id/devices/:device_id/sensors/:id', AuthenticationCheckHandler, AuthenticationRequireRole.USER, DeviceSensorsController.delete);

//ConsumersSensors
router.post('/api/consumers/:consumer_id/sensors', AuthenticationCheckHandler, AuthenticationRequireRole.USER, ConsumerSensorsController.enablePermission);
router.delete('/api/consumers/:consumer_id/sensors/:sensor_id', AuthenticationCheckHandler, AuthenticationRequireRole.USER, ConsumerSensorsController.disablePermission);

//ConsumerConsume
router.get('/api/consumers/consume/:sensor_id', ConsumerConsumeController.get);
router.get('/api/consumers/consume/:sensor_id/*', ConsumerConsumeController.get);
router.put('/api/consumers/consume/:sensor_id', ConsumerConsumeController.update);
router.put('/api/consumers/consume/:sensor_id/*', ConsumerConsumeController.update);
router.post('/api/consumers/consume/:sensor_id', ConsumerConsumeController.add);
router.post('/api/consumers/consume/:sensor_id/*', ConsumerConsumeController.add);
router.delete('/api/consumers/consume/:sensor_id', ConsumerConsumeController.delete);
router.delete('/api/consumers/consume/:sensor_id/*', ConsumerConsumeController.delete);

//Predictions
// router.get('/api/predictions', AuthenticationCheckHandler, AuthenticationRequireRole.USER, PredictionsController.getAll);
// router.post('/api/predictions', AuthenticationCheckHandler, AuthenticationRequireRole.USER, PredictionsController.add);
// router.delete('/api/predictions/:id', AuthenticationCheckHandler, AuthenticationRequireRole.USER, PredictionsController.delete);

// //PredictionsSensors
// router.post('/api/predictions/:prediction_id/sensors', AuthenticationCheckHandler, AuthenticationRequireRole.USER, PredictionsSensorsController.addPredictedSensor);
//Alerts
// router.get('/api/alerts', AuthenticationCheckHandler, AuthenticationRequireRole.USER, AlertsController.getAll);
// router.post('/api/alerts', AuthenticationCheckHandler, AuthenticationRequireRole.USER, AlertsController.add);
// router.delete('/api/alerts/:id', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, AlertsController.delete);

module.exports = router;
