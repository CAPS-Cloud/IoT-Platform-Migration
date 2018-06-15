import { observable, action, autorun } from "mobx";
import axios from "axios";

export default new class {
    @observable fetching = false;
    @observable fetched = false;
    @observable data = [];

    fetch() {
        this.fetching = true;

        axios.get("http://iot.pcxd.me:3000/api/users").then((res) => {
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
