import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import Ripple from "../utils/Ripple";
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";
import { Container, Row, Col } from 'reactstrap';
import { MDCTextField } from '@material/textfield';
import AuthModel from "../models/AuthModel";
import qs from "query-string";
import Snackbar from "../utils/Snackbar";

@observer
export default class extends React.Component {
    @observable signingIn = false;

    componentDidMount() {
        document.querySelectorAll('.mdc-text-field').forEach((node) => {
            MDCTextField.attachTo(node);
        });
    }

    signIn() {
        AuthModel.signIn(null, null);
    }

    render() {
        if(AuthModel.authenticated) {
            const redirectTo = qs.parse(this.props.location.search).redirect || "/";
            return <Redirect to={redirectTo}/>
        }
        return (
            <div style={{ width: "100%", height: "100%", backgroundColor: "#eee" }}>
                <div className="d-flex justify-content-center mb-3 pt-5">
                    <div className="flex-fill flex-md-grow-0 mdc-card">
                        <div className="p-5">
                            <hgroup style={{ textAlign: "center" }}>
                                <h3 className="pb-3 mdc-typography--headline3">Sign In</h3>
                                <h4 className="mdc-typography--headline4">IoT Platform<br/>Admin Dashboard</h4>
                            </hgroup>
                            <div className="mdc-text-field" style={{ width: "100%" }}>
                                <input type="text" id="user-add-username" className="mdc-text-field__input" />
                                <label htmlFor="user-add-username" className="mdc-floating-label">Username</label>
                                <div className="mdc-line-ripple"></div>
                            </div>
                            <div className="mdc-text-field" style={{ width: "100%" }}>
                                <input type="password" id="user-add-password" className="mdc-text-field__input" />
                                <label htmlFor="user-add-password" className="mdc-floating-label">Password</label>
                                <div className="mdc-line-ripple"></div>
                            </div>
                            <Ripple onClick={this.signIn.bind(this)} className="mt-5 mdc-button mdc-button--raised">Sign In</Ripple>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}