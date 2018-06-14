import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import Ripple from "../utils/Ripple";
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";

@observer
export default class extends React.Component {
    render() {
        return (
            <div>
                <h3 className="mdc-typography--headline3">
                    Devices
                    <Ripple className="ml-4 mdc-button mdc-button--outlined" style={{ textTransform: "none" }}>Add Device</Ripple>
                    <Ripple className="secondary-button ml-4 mdc-button mdc-button--outlined" style={{ textTransform: "none" }}>Refresh</Ripple>
                </h3>
                <br />

                <table className="mdl-data-table mdl-js-data-table mdl-data-table--selectable mdc-elevation--z1" style={{ minWidth: "90%" }}>
                    <thead>
                        <tr>
                            <th className="mdl-data-table__cell--non-numeric">Name</th>
                            <th className="mdl-data-table__cell--non-numeric">Description</th>
                            <th className="mdl-data-table__cell--non-numeric">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="mdl-data-table__cell--non-numeric font-weight-bold">Building 1</td>
                            <td className="truncate mdl-data-table__cell--non-numeric" style={{maxWidth: "400px"}}>Sensors for room environment</td>
                            <td className="mdl-data-table__cell--non-numeric" style={{ width: "200px" }}>
                                <Link to="/devices/view/1" className="plain-link"><Ripple className="text-primary mdc-button mdc-card__action mdc-card__action--button">View</Ripple></Link>
                                <Ripple className="secondary-button mdc-button mdc-card__action mdc-card__action--button">Credential</Ripple>
                                <Ripple className="text-danger mdc-button mdc-card__action mdc-card__action--button">Delete</Ripple>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="4" className="mdl-data-table__cell--non-numeric" style={{ color: "#777" }}>No entries yet</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}