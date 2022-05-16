import React, { Component } from "react";
import { observable, action, computed, autorun } from "mobx";
import { observer } from "mobx-react";
import Ripple from "../utils/Ripple";
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";
import { MDCDialog } from '@material/dialog';
import { Container, Row, Col } from 'reactstrap';
import DevicesModel from '../models/DevicesModel';
import axios from "axios";
import Download from "../utils/Download";
import Snackbar from "../utils/Snackbar";
import SensorsModel from "../models/SensorsModel";
import AuthModel from "../models/AuthModel";

@observer
export default class extends React.Component {
    @observable failedFetching = false;
    @observable notFound = false;
    @observable object;
    @observable to_delete;

    constructor(props) {
        super(props);

        this.state = {
            back: false,
        }

        autorun(() => {
            this.failedFetching = !DevicesModel.fetching && !DevicesModel.fetched;
            var notFound = false;
            var object;
            if (DevicesModel.fetched) {
                const objects = DevicesModel.data.filter((object) => (object.id == this.props.match.params.device_id));
                if (objects.length >= 1) {
                    object = objects[0];
                } else {
                    notFound = true;
                }
            }
            this.notFound = notFound;
            this.object = object;
        });
    }

    downloadKey() {
        axios.get(`/users/${AuthModel.userInfo.get("id")}/devices/${this.props.match.params.device_id}/key`).then(response => {
            Download(JSON.stringify(response.data), `device_${this.props.match.params.device_id}_key.json`, 'application/json');
        }).catch(error => {
            Snackbar.show(new RestError(error).getMessage());
        });
    }

    componentWillMount() {
        DevicesModel.fetch(AuthModel.userInfo.get("id"));
        SensorsModel.fetch(AuthModel.userInfo.get("id"), this.props.match.params.device_id);
    }

    componentDidMount() {
        this.dialog = new MDCDialog(document.querySelector('#my-mdc-dialog'));

        this.dialog.listen('MDCDialog:accept', () => {
            const { id, name } = this.to_delete;
            SensorsModel.delete(AuthModel.userInfo.get("id"), this.props.match.params.device_id, id).then((response) => {
                Snackbar.show("Deleted sensor " + name, "success");
                SensorsModel.fetch(AuthModel.userInfo.get("id"), this.props.match.params.device_id);
            }).catch((error) => {
                Snackbar.show(new RestError(error).getMessage());
            });
            this.to_delete = null;
        });

        this.dialog.listen('MDCDialog:cancel', () => {
            this.to_delete = null;
        });
    }

    deleteClick(object) {
        this.to_delete = object;
        this.dialog.show();
    }

    renderTree(node) {
        return (
            <ul>
                {
                    Object.keys(node.childrens).map((children) => (
                        <li key={children}>
                            <div>{children}</div>
                            {this.renderTree(node.childrens[children])}
                        </li>
                    ))
                }
                {
                    node.sensors.map((sensor) => (
                        <li key={sensor.id}>
                            <div>
                                {sensor.name.split("/")[sensor.name.split("/").length - 1]}
                                <div className="etooltip">
                                    <i className="p-0 pl-1 material-icons" style={{ alignItems: "center", verticalAlign: "middle" }}>info</i>
                                    <span className="etooltiptext">
                                        <h6>Sensor ID: <span style={{ fontWeight: "normal" }}>{sensor.id}</span></h6>
                                        <h6 className="mb-0">Description: <span style={{ fontWeight: "normal" }}>{sensor.description}</span></h6>
                                    </span>
                                </div>
                                <Link to={'/users/' + AuthModel.userInfo.get("id")+ "/devices/" + this.props.match.params.device_id + "/sensors/" + sensor.id + "/edit"} className="plain-link"><Ripple className="p-0 mdc-button mdc-button--dense" style={{ textTransform: "none", width: "50px", height: "24px" }}>Edit</Ripple></Link>
                                <Ripple onClick={this.deleteClick.bind(this, sensor)} style={{ textTransform: "none", width: "50px", height: "24px" }} className={"danger-button p-0 mdc-button mdc-button--dense" + (SensorsModel.deleting ? " disabled" : "")}>Delete</Ripple>
                            </div>
                        </li>
                    ))
                }
            </ul>
        );
    }

    render() {
        var sensorsTree = { sensors: [], childrens: {} };

        if (SensorsModel.fetched) {
            SensorsModel.data.forEach((sensor) => {
                var node = sensorsTree;
                if (sensor.name) {
                    const paths = sensor.name.split('/');
                    for (var i = 0; i < paths.length - 1; i++) {
                        const path = paths[i];
                        if (!(path in node.childrens)) {
                            node.childrens[path] = { sensors: [], childrens: {} };
                        }
                        node = node.childrens[path];
                    }
                }
                node.sensors.push(sensor);
            });
            console.log(sensorsTree);
        }
        
        return (
            <div>
                <div className="p-1" style={{ display: "flex", alignItems: "center", backgroundColor: "#e9ecef", borderRadius: ".25rem"}}>
                    <Link to={'/users/' + AuthModel.userInfo.get("id") + "/devices/"} className="plain-link">
                        <div className="mdc-button mdc-button--dense" style={{ textTransform: "none", fontSize: "1rem", fontWeight: "300", letterSpacing: "unset" }}>
                            Devices
                        </div>
                    </Link>
                    <i className="text-secondary material-icons">keyboard_arrow_right</i>
                    <div className="disabled mdc-button mdc-button--dense" style={{ textTransform: "none", fontSize: "1rem", fontWeight: "300", letterSpacing: "unset" }}>
                        View Device{this.object && ` (${this.object.name})`}
                    </div>
                </div>

                <aside id="my-mdc-dialog"
                    className="mdc-dialog"
                    role="alertdialog"
                    aria-labelledby="my-mdc-dialog-label"
                    aria-describedby="my-mdc-dialog-description">
                    <div className="mdc-dialog__surface" style={{ width: "unset" }}>
                        <header className="mdc-dialog__header">
                            <h2 id="my-mdc-dialog-label" className="mdc-dialog__header__title">
                                Delete sensor "{this.to_delete && this.to_delete.name}"
                            </h2>
                        </header>
                        <section id="my-mdc-dialog-description" className="mdc-dialog__body">
                            Are you sure you want to delete this sensor?
                        </section>
                        <footer className="mdc-dialog__footer">
                            <button type="button" className="mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--cancel">Cancel</button>
                            <button type="button" className="danger-button mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--accept">Delete</button>
                        </footer>
                    </div>
                    <div className="mdc-dialog__backdrop"></div>
                </aside>

                {
                    (this.failedFetching || !DevicesModel.fetched || this.notFound) ? (
                        <div>
                            <h5 className="mdc-typography--headline5">{this.failedFetching ? 'Failed getting device info' : (!DevicesModel.fetched ? 'Fetching device info' : 'Device not found')}</h5>
                        </div>
                    ) : (
                        <div>
                            <h3 className="mt-3 mdc-typography--headline3">
                                {this.object.name}
                                <Link to={'/users/' + AuthModel.userInfo.get("id") + "/devices/" + this.props.match.params.device_id + "/edit"} className="plain-link"><Ripple className="ml-3 mdc-button mdc-button--outlined" style={{ textTransform: "none" }}>Edit Device</Ripple></Link>
                                <Ripple onClick={this.downloadKey.bind(this)} className="ml-3 secondary-button mdc-button mdc-button--outlined" style={{ textTransform: "none" }}>Download Device Key</Ripple>
                            </h3>
                            <br />

                            <div className="mb-4">
                                <h5 className="mdc-typography--headline5">Name</h5>
                                <span className="mdc-typography--body1">{this.object.name}</span>
                            </div>
                            <div className="mb-4">
                                <h5 className="mdc-typography--headline5">Description</h5>
                                <span className="mdc-typography--body1">{this.object.description}</span>
                            </div>
                            <div className="mb-4">
                                <h5 className="mdc-typography--headline5">MQTT ClientId</h5>
                                <span className="mdc-typography--body1">{this.object.clientId}</span>
                            </div>
                            <div className="mb-4">
                                <h5 className="mdc-typography--headline5">MQTT Username</h5>
                                <span className="mdc-typography--body1">{this.object.username}</span>
                            </div>
                            <div className="mb-4">
                                <h5 className="mdc-typography--headline5">MQTT Server</h5>
                                <span className="mdc-typography--body1">{this.object.url}</span>
                            </div>
                            <div className="mb-4">
                                <h5 className="mdc-typography--headline5">MQTT topic to subscribe</h5>
                                <span className="mdc-typography--body1">{this.object.ttn_topic_to_subscribe}</span>
                            </div>

                            <div className="mb-4">
                                <h5 className="mdc-typography--headline5">Sensors <Link to ={'/users/' + AuthModel.userInfo.get("id") + "/devices/" + this.props.match.params.device_id + "/sensors/add"} className="plain-link"><Ripple className="mdc-button" style={{ textTransform: "none" }}>Add Sensor</Ripple></Link></h5>

                                {
                                    SensorsModel.fetching ? (
                                        <span className="mdc-typography--caption">Fetching</span>
                                    ) : (
                                        SensorsModel.fetched ? (
                                            SensorsModel.data.length > 0 ? (
                                                <div className="tree">
                                                    { this.renderTree(sensorsTree) }
                                                </div>
                                            ) : (
                                                <span className="mdc-typography--caption">No sensors</span>
                                            )
                                        ) : (
                                            <span className="mdc-typography--caption">Can not fetch sensors</span>
                                        )
                                    )
                                }
                            </div>
                            <br/><br/><br/><br/>
                        </div>
                    )
                }
            </div>
        )
    }
}
