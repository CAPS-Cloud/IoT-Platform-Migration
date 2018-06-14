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

        axios.get("http://some.url").then((res) => {
            console.log(res);
            action(() => {
                this.checked = true;
                this.checking = false;
                this.authenticated = true;
                this.authToken = "abc";
            })();
        }).catch((err) => {
            console.log(err);
            action(() => {
                if(this.authToken) {
                    this.checked = true;
                    this.checking = false;
                    this.authenticated = true;
                } else {
                    this.checked = true;
                    this.checking = false;
                    this.authenticated = false;
                    this.authToken = "";
                }
            })();
        });
    }

    signIn(username, password) {
        action(() => {
            this.justSignedOut = false;
            this.signingIn = true;
        })();

        action(() => {
            this.signingIn = false;
            this.authenticated = true;
            this.authToken = "abc";
        })();
    }

    signOut() {
        action(() => {
            this.authenticated = false;
            this.authToken = "";
            this.justSignedOut = true;
        })();
    }
}
