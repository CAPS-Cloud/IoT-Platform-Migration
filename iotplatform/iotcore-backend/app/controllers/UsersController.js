const connection = require('../connections/mysql');
const { responseError, responseSystemError } = require('../utils/express_utils');
const Users = require('../models/UsersModel');
const jwt = require('jsonwebtoken');
const { AUTHENTICATION_SECRET, ROOT_USERNAME, ROOT_PASSWORD } = require('../secrets');
const bcrypt = require('bcryptjs');
const BaseController =  require('./BaseController');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


const controller = new class extends BaseController {

    constructor() {
        super(Users);
        this.findAllOptions = { attributes: { exclude: ['password'] } }
    }

    pre_add(req, res, callback) {
        var toAdd = req.body;

        if (toAdd.username == ROOT_USERNAME) {
            return res.status(400).json({ name: 'RestrictedUsername', errors: [{ message: '"root" is restricted username' }] });
        }

        if (toAdd.password) {
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(toAdd.password, salt);
            toAdd.password = hash;
        }

        callback(toAdd);
    }

    post_add(data, callback) {
        delete data.password;
        callback(data);
    }

    pre_update(data, callback) {
        if (data.username) {
            return res.status(400).json({ name: 'NotAllowUpdate', errors: [{ message: 'You are not allowed to change username' }] });
        }

        if (data.password) {
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(data.password, salt);
            data.password = hash;
        }
        callback(data);
    }

    signin(req, res) {
        if (req.body.username &&
            req.body.password &&
            req.body.username == ROOT_USERNAME &&
            req.body.password == ROOT_PASSWORD
        ) {
            jwt.sign({ id: -1 }, AUTHENTICATION_SECRET, (err, token) => {
                return res.json({ token });
            });
        } else if (!req.body.username) {
            return res.status(400).json({ name: 'NoUsernameProvided', errors: [{ message: 'No username provided' }] });
        } else if (!req.body.password) {
            return res.status(400).json({ name: 'NoPasswordProvided', errors: [{ message: 'No password provided' }] });
        } else {
            this.model.findOne({ where: { username: { [Op.eq]: req.body.username } } }).then(data => {
                if (data && bcrypt.compareSync(req.body.password, data.password)) {
                    jwt.sign({ id: data.id }, AUTHENTICATION_SECRET, { algorithm: 'RS256' }, (err, token) => {
                        return res.json({ token });
                    });
                } else {
                    return res.status(400).json({ name: 'InvalidCredential', errors: [{ message: 'Invalid credential' }] });
                }
            }).catch(err => responseError(res, err));
        }
    }

    self(req, res) {
        var result = req.authenticated_as;
        delete result.password;
        res.json({ result });
    }
}

module.exports = {
    getAll: controller.getAll.bind(controller),
    add: controller.add.bind(controller),
    update: controller.update.bind(controller),
    delete: controller.delete.bind(controller),
    signin: controller.signin.bind(controller),
    self: controller.self.bind(controller),
}
