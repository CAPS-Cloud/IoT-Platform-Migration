const express = require('express');
const router = express.Router();

const AuthenticatedHandler = require('../handlers/AuthenticatedHandler');

const UsersController = require('../controllers/UsersController');

// Users
router.get('/api/users', UsersController.getAll);
router.post('/api/users', AuthenticatedHandler, UsersController.add);
router.post('/api/users/login', UsersController.login);

// Devices

// Consumptions


module.exports = router;