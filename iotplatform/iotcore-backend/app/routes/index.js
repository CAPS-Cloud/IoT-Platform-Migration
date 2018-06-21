const AuthenticationRequireRole = require('../handlers/AuthenticationRequireRole');
const express = require('express');
const router = express.Router();

const UsersController = require('../controllers/UsersController');
const DevicesController = require('../controllers/DevicesController');
const SensorsController = require('../controllers/SensorsController');

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

// Consumptions

// Sensors
router.post('/api/sensors/devices/:id', AuthenticationRequireRole.ADMIN, SensorsController.add);


module.exports = router;