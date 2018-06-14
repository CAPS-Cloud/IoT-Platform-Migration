import { observable, action, autorun } from "mobx";
import axios from "axios";

export default new class {
    @observable fetching = false;
    @observable fetched = false;
    @observable data = [];

    fetch() {
        this.fetching = true;

        setTimeout(() => {
            action(() => {
                this.fetching = false;
                this.fetched = true;
                this.data = [
                    {
                        id: "adfsdif9djf9",
                        name: "Peeranut Chindanonda",
                        username: "pcxd",
                        role: "Admin"
                    }
                ];
            })();
        }, 1000);
    }
}
