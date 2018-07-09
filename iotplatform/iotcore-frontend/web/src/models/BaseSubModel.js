import { observable, action, autorun } from "mobx";
import axios from "../utils/Axios";

export default class {
    @observable fetching = false;
    @observable fetched = false;
    @observable adding = false;
    @observable deleting = false;
    @observable updating = false;
    @observable data = [];
    @observable resource;
    @observable secondResource;


    constructor(resource, secondResource) {
        this.resource = resource;
        this.secondResource = secondResource;
    }

    _getBaseLocation(parentId) {
        return `${this.resource}/${parentId}/${this.secondResource}`;
    }

    fetch(parentId) {
        this.fetching = true;

        axios.get(this._getBaseLocation(parentId)).then((res) => {
            action(() => {
                this.fetching = false;
                this.fetched = true;
                this.data = res.data.result;
            })();
        }).catch((err) => {
            action(() => {
                this.fetching = false;
                this.fetched = false;
            })();
        })
    }

    add(parentId, data) {
        this.adding = true;

        return axios.post(this._getBaseLocation(parentId), data).then((response) => {
            this.adding = false;
            return response;
        }).catch((error) => {
            this.adding = false;
            throw error;
        });
    }

    delete(parentId, id) {
        this.deleting = true;

        return axios.delete(`${this._getBaseLocation(parentId)}/${id}`).then((response) => {
            this.deleting = false;
            return response;
        }).catch((error) => {
            this.deleting = false;
            throw error;
        });
    }

    update(parentId, id, toUpdate) {
        this.updating = true;

        return axios.patch(`${this._getBaseLocation(parentId)}/${id}`, toUpdate).then((response) => {
            this.updating = false;
            return response;
        }).catch((error) => {
            this.updating = false;
            throw error;
        });
    }
}
