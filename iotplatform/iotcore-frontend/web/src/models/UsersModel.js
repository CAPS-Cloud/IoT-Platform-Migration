import { observable, action, autorun } from "mobx";
import axios from "../utils/Axios";

export default new class {
    @observable fetching = false;
    @observable fetched = false;
    @observable adding = false;
    @observable deleting = false;
    @observable updating = false;
    @observable data = [];

    fetch() {
        this.fetching = true;

        axios.get("users").then((res) => {
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

    add(data) {
        this.adding = true;

        return axios.post("users", data).then((response) => {
            this.adding = false;
            return response;
        }).catch((error) => {
            this.adding = false;
            throw error;
        });
    }

    delete(id) {
        this.deleting = true;

        return axios.delete("users/" + id).then((response) => {
            this.deleting = false;
            return response;
        }).catch((error) => {
            this.deleting = false;
            throw error;
        });
    }

    update(id, toUpdate) {
        this.updating = true;

        return axios.patch("users/" + id, toUpdate).then((response) => {
            this.updating = false;
            return response;
        }).catch((error) => {
            this.updating = false;
            throw error;
        });
    }
}
