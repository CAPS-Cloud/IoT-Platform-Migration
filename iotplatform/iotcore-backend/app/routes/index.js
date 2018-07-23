const AuthenticationRequireRole = require('../handlers/AuthenticationRequireRole');
const express = require('express');
const router = express.Router();

const UsersController = require('../controllers/UsersController');
const DevicesController = require('../controllers/DevicesController');
const ConsumersController = require('../controllers/ConsumersController');
const DeviceSensorsController = require('../controllers/DeviceSensorsController');
const ConsumerSensorsController = require('../controllers/ConsumerSensorsController');
const ConsumerConsumeController = require('../controllers/ConsumerConsumeController');

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
router.get('/api/devices', AuthenticationCheckHandler, AuthenticationRequireRole.USER, DevicesController.getAll);
router.post('/api/devices', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, DevicesController.add);
router.patch('/api/devices/:id', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, DevicesController.update);
router.delete('/api/devices/:id', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, DevicesController.delete);
router.get('/api/devices/:id/key', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, DevicesController.key);

// Consumer
router.get('/api/consumers', AuthenticationCheckHandler, AuthenticationRequireRole.USER, ConsumersController.getAll);
router.post('/api/consumers', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, ConsumersController.add);
router.patch('/api/consumers/:id', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, ConsumersController.update);
router.delete('/api/consumers/:id', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, ConsumersController.delete);
router.get('/api/consumers/:id/key', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, ConsumersController.key);

// Sensors
router.get('/api/devices/:id/sensors', AuthenticationCheckHandler, AuthenticationRequireRole.USER, DeviceSensorsController.getAll);
router.post('/api/devices/:id/sensors', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, upload.single('jar'), DeviceSensorsController.add);
router.patch('/api/devices/:device_id/sensors/:id', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, DeviceSensorsController.update);
router.delete('/api/devices/:device_id/sensors/:id', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, DeviceSensorsController.delete);

//ConsumersSensors
router.post('/api/consumers/:consumer_id/sensors', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, ConsumerSensorsController.enablePermission);
router.delete('/api/consumers/:consumer_id/sensors/:sensor_id', AuthenticationCheckHandler, AuthenticationRequireRole.ADMIN, ConsumerSensorsController.disablePermission);

//ConsumerConsume
router.get('/api/consumers/consume/:sensor_id', ConsumerConsumeController.get);
router.get('/api/consumers/consume/:sensor_id/*', ConsumerConsumeController.get);

module.exports = router;