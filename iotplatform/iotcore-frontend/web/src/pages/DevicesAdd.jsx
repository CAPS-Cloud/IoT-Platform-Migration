import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import Ripple from "../utils/Ripple";
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";
import { MDCTextField } from '@material/textfield';
import { MDCSelect } from '@material/select';
import { Container, Row, Col } from 'reactstrap';
import DevicesModel from '../models/DevicesModel';
import FormModel from '../models/FormModel';
import Snackbar from '../utils/Snackbar';
import RestError from '../utils/RestError';

@observer
export default class extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            back: false,
        }

        this.form = new FormModel();
    }

    componentDidMount() {
        document.querySelectorAll('.mdc-text-field').forEach((node) => {
            MDCTextField.attachTo(node);
        });
    }

    add(e) {
        if (e) {
            e.preventDefault();
        }
        DevicesModel.add(this.form.values).then((response) => {
            this.form.clearForm();
            this.setState({ back: true })
        }).catch((error) => {
            Snackbar.show(new RestError(error).getMessage());
        });
    }

    render() {
        if (this.state.back === true) {
            return <Redirect to='/devices' />
        }

        return (
            <div>
                <h3 className="mdc-typography--headline3">Add Device</h3>
                <br />

                <form onSubmit={this.add.bind(this)} ref={this.form.setRef}>
                    <Row className="mb-1">
                        <Col md="6">
                            <div className="mdc-text-field" style={{width: "100%"}}>
                                <input type="text" id="devices-add-name" name="name" onChange={this.form.handleChange} className="mdc-text-field__input" autoComplete="off" data-lpignore="true" />
                                <label htmlFor="devices-add-name" className="mdc-floating-label">Name</label>
                                <div className="mdc-line-ripple"></div>
                            </div>
                        </Col>
                    </Row>
                    <Row className="mb-1">
                        <Col md="6">
                            <div className="mdc-text-field" style={{ width: "100%" }}>
                                <input type="text" id="devices-add-description" name="description" onChange={this.form.handleChange} className="mdc-text-field__input" autoComplete="off" data-lpignore="true" />
                                <label htmlFor="devices-add-description" className="mdc-floating-label">Description</label>
                                <div className="mdc-line-ripple"></div>
                            </div>
                        </Col>
                    </Row>
                    <div className="mt-5">
                        <Link to="/devices" className="plain-link"><Ripple className="mdc-button" style={{ textTransform: "none" }}>Back</Ripple></Link>
                        <Ripple onClick={this.add.bind(this)} className={"ml-4 mdc-button mdc-button--unelevated" + (DevicesModel.adding ? " disabled" : "")} style={{ textTransform: "none" }}>Add</Ripple>
                    </div>
                </form>
            </div>
        )
    }
}