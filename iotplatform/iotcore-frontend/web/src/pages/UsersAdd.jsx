import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import Ripple from "../utils/Ripple";
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";
import { MDCTextField } from '@material/textfield';
import { MDCSelect } from '@material/select';
import { Container, Row, Col } from 'reactstrap';

@observer
export default class extends React.Component {

    componentDidMount() {
        document.querySelectorAll('.mdc-text-field').forEach((node) => {
            MDCTextField.attachTo(node);
        });
        document.querySelectorAll('.mdc-select').forEach((node) => {
            MDCSelect.attachTo(node);
        });
    }

    render() {
        return (
            <div>
                <h3 className="mdc-typography--headline3">Add User</h3>
                <br />

                <Row className="mb-1">
                    <Col md="6">
                        <div className="mdc-text-field" style={{width: "100%"}}>
                            <input type="text" id="user-add-name" className="mdc-text-field__input" />
                            <label htmlFor="user-add-name" className="mdc-floating-label">Name</label>
                            <div className="mdc-line-ripple"></div>
                        </div>
                    </Col>
                </Row>
                <Row className="mb-1">
                    <Col md="6">
                        <div className="mdc-text-field" style={{ width: "100%" }}>
                            <input type="text" id="user-add-username" className="mdc-text-field__input" />
                            <label htmlFor="user-add-username" className="mdc-floating-label">Username</label>
                            <div className="mdc-line-ripple"></div>
                        </div>
                    </Col>
                </Row>
                <Row className="mb-1">
                    <Col md="6">
                        <div className="mdc-text-field" style={{ width: "100%" }}>
                            <input type="password" id="user-add-password" className="mdc-text-field__input" />
                            <label htmlFor="user-add-password" className="mdc-floating-label">Password</label>
                            <div className="mdc-line-ripple"></div>
                        </div>
                    </Col>
                </Row>
                <Row className="mb-1">
                    <Col md="3">
                        <div className="mdc-select" style={{ width: "100%", marginTop: "16px", marginBottom: "8px" }}>
                            <select className="mdc-select__native-control" defaultValue="">
                                <option value="" disabled></option>
                                <option value="admin">
                                    Admin
                                </option>
                                <option value="read-only">
                                    Read-Only
                                </option>
                            </select>
                            <label className="mdc-floating-label">Pick a Role</label>
                            <div className="mdc-line-ripple"></div>
                        </div>
                    </Col>
                </Row>
                <div className="mt-5">
                    <Link to="/users" className="plain-link"><Ripple className="mdc-button" style={{ textTransform: "none" }}>Back</Ripple></Link>
                    <Ripple className="ml-4 mdc-button mdc-button--unelevated" style={{ textTransform: "none" }}>Add</Ripple>
                </div>
            </div>
        )
    }
}