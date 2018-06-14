import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import Ripple from "../utils/Ripple";
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";
import { Container, Row, Col } from 'reactstrap';

@observer
export default class extends React.Component {

    render() {
        return (
            <div>
                <div className="p-1" style={{ display: "flex", alignItems: "center", backgroundColor: "#e9ecef", borderRadius: ".25rem"}}>
                    <Link to="/devices" className="plain-link">
                        <div className="mdc-button mdc-button--dense" style={{ textTransform: "none", fontSize: "1rem", fontWeight: "300", letterSpacing: "unset" }}>
                            Devices
                        </div>
                    </Link>
                    <i className="text-secondary material-icons">keyboard_arrow_right</i>
                    <div className="disabled mdc-button mdc-button--dense" style={{ textTransform: "none", fontSize: "1rem", fontWeight: "300", letterSpacing: "unset" }}>
                        Building 1
                    </div>
                </div>
                
                <h3 className="mt-3 mdc-typography--headline3">Building 1 <Ripple className="ml-2 mdc-button mdc-button--outlined" style={{ textTransform: "none" }}>Edit Device</Ripple><Ripple className="ml-3 secondary-button mdc-button mdc-button--outlined" style={{ textTransform: "none" }}>Download Credential</Ripple></h3>
                <br />

                <div className="mb-4">
                    <h5 className="mdc-typography--headline5">Description</h5>
                    <span className="mdc-typography--body1">Sensors for room environment</span>
                </div>

                <div className="mb-4">
                    <h5 className="mdc-typography--headline5">Sensors <Ripple className="mdc-button" style={{ textTransform: "none" }}>Add Sensor</Ripple></h5>
                    
                    <div className="tree">
                        <ul>
                            <li><div>Wheels</div>
                                <ul>
                                    <li><div>Front wheels</div>
                                        <ul>
                                            <li>
                                                <div>
                                                    Pressure Sensor
                                                    <Ripple className="p-0 mdc-button mdc-button--dense" style={{ textTransform: "none", width: "50px", height: "24px" }}>Edit</Ripple>
                                                    <Ripple className="danger-button p-0 mdc-button mdc-button--dense" style={{ textTransform: "none", width: "50px", height: "24px" }}>Delete</Ripple>
                                                </div>
                                            </li>
                                        </ul>
                                    </li>
                                        <li><div>Rear wheels</div>
                                        <ul>
                                            <li>
                                                <div>
                                                    Pressure Sensor
                                                    <Ripple className="p-0 mdc-button mdc-button--dense" style={{ textTransform: "none", width: "50px", height: "24px" }}>Edit</Ripple>
                                                    <Ripple className="danger-button p-0 mdc-button mdc-button--dense" style={{ textTransform: "none", width: "50px", height: "24px" }}>Delete</Ripple>
                                                </div>
                                            </li>
                                            <li>
                                                <div>
                                                    Temperature Sensor
                                                    <Ripple className="p-0 mdc-button mdc-button--dense" style={{ textTransform: "none", width: "50px", height: "24px" }}>Edit</Ripple>
                                                    <Ripple className="danger-button p-0 mdc-button mdc-button--dense" style={{ textTransform: "none", width: "50px", height: "24px" }}>Delete</Ripple>
                                                </div>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                            <li><div>Engine</div>
                                <ul>
                                    <li>
                                        <div>
                                            Consumption Sensor
                                            <Ripple className="p-0 mdc-button mdc-button--dense" style={{ textTransform: "none", width: "50px", height: "24px" }}>Edit</Ripple>
                                            <Ripple className="danger-button p-0 mdc-button mdc-button--dense" style={{ textTransform: "none", width: "50px", height: "24px" }}>Delete</Ripple>
                                        </div>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>

                    <span className="mdc-typography--caption">No sensors</span>
                </div>

                <div className="mt-5">
                    
                </div>
            </div>
        )
    }
}