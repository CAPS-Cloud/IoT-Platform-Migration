const connection = require('../connections/mysql');
const { responseError, responseSystemError } = require('../utils/express_utils');


module.exports = class {

    constructor(model) {
        this.findAllOptions = {}
        this.model = model;
    }

    getAll(req, res) {
        this.model.findAll(this.findAllOptions).then(datas => {
            return res.status(200).json({ result: datas });
        }).catch(err => {
            return responseError(res, err);
        });
    }

    getById(req, res) {

    }

    pre_add(req, res, callback) {
        callback(req.body);
    }

    post_add(data, callback) {
        callback(data);
    }

    add(req, res) {
        this.pre_add(req, res, toAdd => {
            this.model.create(toAdd).then(data => {
                this.post_add(data, result_data => {
                    return res.status(200).json({ result: result_data });
                });
            }).catch(err => {
                return responseError(res, err);
            });
        });
    }

    pre_update(data, callback) {
        callback(data);
    }

    update(req, res) {
        this.pre_update(req.body, toUpdate => {
            toUpdate.id = undefined;
            const result = this.model.update(toUpdate, { where: { id: { [Op.eq]: req.params.id } } });
            return res.status(200).json({ result });
        });
    }

    delete(req, res) {
        const result = this.model.destroy({ where: { id: { [Op.eq]: req.params.id } } });
        return res.status(200).json({ result });
    }
}
