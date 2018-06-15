import { observable, action, autorun } from "mobx";
import axios from "../utils/Axios";

export default new class {
    @observable fetching = false;
    @observable fetched = false;
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
}
