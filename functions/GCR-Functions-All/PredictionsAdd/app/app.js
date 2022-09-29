const express = require('express')
const http = require('http')
const { parse } = require('flatted')
const Users = require('./models/UsersModel')
const Devices = require('./models/DevicesModel')
const Sensors = require('./models/SensorsModel')
const BaseController = require('./controllers/BaseController')
const Predictions = require('./models/PredictionsModel')
const testapp = express()
const port = '8070'
const Sequelize = require('sequelize')
const Op = Sequelize.Op


