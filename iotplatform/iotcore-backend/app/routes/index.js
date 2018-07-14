const AuthenticationRequireRole = require('../handlers/AuthenticationRequireRole');
const express = require('express');
const router = express.Router();

const UsersController = require('../controllers/UsersController');
const DevicesController = require('../controllers/DevicesController');
const ConsumersController = require('../controllers/ConsumersController');
const SensorsController = require('../controllers/SensorsController');
const ConsumersSensorsController = require('../controllers/ConsumersSensorsController')

// Users
router.get('/api/users', AuthenticationRequireRole.USER, UsersController.getAll);
router.post('/api/users', AuthenticationRequireRole.ADMIN, UsersController.add);
router.patch('/api/users/:id', AuthenticationRequireRole.ADMIN, UsersController.update);
router.delete('/api/users/:id', AuthenticationRequireRole.ADMIN, UsersController.delete);
router.post('/api/users/signin', UsersController.signin);
router.get('/api/users/self', AuthenticationRequireRole.USER, UsersController.self);

// Devices
router.get('/api/devices', AuthenticationRequireRole.USER, DevicesController.getAll);
router.post('/api/devices', AuthenticationRequireRole.ADMIN, DevicesController.add);
router.patch('/api/devices/:id', AuthenticationRequireRole.ADMIN, DevicesController.update);
router.delete('/api/devices/:id', AuthenticationRequireRole.ADMIN, DevicesController.delete);
router.get('/api/devices/:id/key', AuthenticationRequireRole.ADMIN, DevicesController.key);

// Consumer
router.get('/api/consumers', AuthenticationRequireRole.USER, ConsumersController.getAll);
router.post('/api/consumers', AuthenticationRequireRole.ADMIN, ConsumersController.add);
router.patch('/api/consumers/:id', AuthenticationRequireRole.ADMIN, ConsumersController.update);
router.delete('/api/consumers/:id', AuthenticationRequireRole.ADMIN, ConsumersController.delete);
router.get('/api/consumers/:id/key', AuthenticationRequireRole.ADMIN, ConsumersController.key);

// Sensors
router.get('/api/devices/:id/sensors', AuthenticationRequireRole.USER, SensorsController.getAll);
router.post('/api/devices/:id/sensors', AuthenticationRequireRole.ADMIN, SensorsController.add);
router.patch('/api/devices/:device_id/sensors/:id', AuthenticationRequireRole.ADMIN, SensorsController.update);
router.delete('/api/devices/:device_id/sensors/:id', AuthenticationRequireRole.ADMIN, SensorsController.delete);

//ConsumersSensors
router.get('/api/devices/consumers/:consumer_id/sensors', AuthenticationRequireRole.ADMIN, ConsumersSensorsController.getAll);
router.post('/api/devices/consumers/:consumer_id/sensors', AuthenticationRequireRole.ADMIN, ConsumersSensorsController.enablePermission);
router.delete('/api/devices/consumers/:consumer_id/sensors/:sensor_id', AuthenticationRequireRole.ADMIN, ConsumersSensorsController.disablePermission);

module.exports = router;