import { observable, action, autorun } from "mobx";
import axios from "axios";
import Cookies from "../utils/Cookies";

export default new class {
    @observable checked = false;
    @observable checking = false;
    @observable signingIn = false;
    @observable authenticated = false;
    @observable authToken = typeof Cookies.get("auth_token") == "undefined" ? "" : Cookies.get("auth_token");
    @observable justSignedOut = false;

    constructor() {
        autorun(() => {
            Cookies.set("auth_token", this.authToken);
        })

        axios.interceptors.response.use(response => response, error => {
            if (error.response.status === 401) {
                this.checked = true;
                this.checking = false;
                this.authenticated = true;
            }
            return error;
        });
    }

    checkAuth() {
        if(!this.authToken)
        {
            action(() => {
                this.checked = true;
                this.authenticated = false;
            })();
            return;
        }

        this.checking = true;

        axios.get("http://iot.pcxd.me:3000/api/users/self").then((res) => {
            console.log(res);
            action(() => {
                this.checked = true;
                this.checking = false;
                this.authenticated = true;
            })();
        }).catch((err) => {
            console.log(err);
            action(() => {
                this.checked = true;
                this.checking = false;
                this.authenticated = false;
                this.authToken = "";
            })();
        });
    }

    signIn(username, password) {
        action(() => {
            this.justSignedOut = false;
            this.signingIn = true;
        })();

        axios.post("http://iot.pcxd.me:3000/api/users/signin", { username, password }).then((res) => {
            action(() => {
                this.signingIn = false;
                this.authenticated = true;
                this.authToken = res.data.token;
            })();
        }).catch((err) => {
            action(() => {
                this.signingIn = false;
                this.authenticated = false;
                this.authToken = "";
            })();
        });
    }

    signOut() {
        action(() => {
            this.authenticated = false;
            this.authToken = "";
            this.justSignedOut = true;
        })();
    }
}
