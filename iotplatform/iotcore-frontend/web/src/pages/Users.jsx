import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import Ripple from "../utils/Ripple";
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";
import { MDCDialog } from '@material/dialog';
import UsersModel from "../models/UsersModel";

@observer
export default class extends React.Component {

    componentWillMount() {
        UsersModel.fetch();
    }

    componentDidMount() {
        this.dialog = new MDCDialog(document.querySelector('#my-mdc-dialog'));
    }

    deleteClick(id) {
        this.dialog.show();
        this.dialog.listen('MDCDialog:accept', function () {
            console.log('accepted');
        })

        this.dialog.listen('MDCDialog:cancel', function () {
            console.log('canceled');
        })
    }

    render() {
        return (
            <div>
                <h3 className="mdc-typography--headline3">
                    Users
                    <Link to="/users/add" className="plain-link"><Ripple className="ml-4 mdc-button mdc-button--outlined" style={{ textTransform: "none" }}>Add User</Ripple></Link>
                    <Ripple onClick={UsersModel.fetch.bind(UsersModel)} className={"secondary-button ml-4 mdc-button mdc-button--outlined" + (UsersModel.fetching ? " disabled" : "")} style={{ textTransform: "none" }}>Refresh</Ripple>
                </h3>
                <br />

                <aside id="my-mdc-dialog"
                    className="mdc-dialog"
                    role="alertdialog"
                    aria-labelledby="my-mdc-dialog-label"
                    aria-describedby="my-mdc-dialog-description">
                    <div className="mdc-dialog__surface" style={{ width: "unset" }}>
                        <header className="mdc-dialog__header">
                            <h2 id="my-mdc-dialog-label" className="mdc-dialog__header__title">
                                Delete User "Peeranut Chindanonda"
                            </h2>
                        </header>
                        <section id="my-mdc-dialog-description" className="mdc-dialog__body">
                            Are you sure you want to delete this user?
                        </section>
                        <footer className="mdc-dialog__footer">
                            <button type="button" className="mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--cancel">Cancel</button>
                            <button type="button" className="danger-button mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--accept">Delete</button>
                        </footer>
                    </div>
                    <div className="mdc-dialog__backdrop"></div>
                </aside>

                <table className="mdl-data-table mdl-js-data-table mdl-data-table--selectable mdc-elevation--z1" style={{ minWidth: "90%" }}>
                    <thead>
                        <tr>
                            <th className="mdl-data-table__cell--non-numeric">Name</th>
                            <th className="mdl-data-table__cell--non-numeric">Username</th>
                            <th className="mdl-data-table__cell--non-numeric">Role</th>
                            <th className="mdl-data-table__cell--non-numeric">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            UsersModel.fetching ? (
                                <tr>
                                    <td colSpan="4" className="mdl-data-table__cell--non-numeric" style={{ color: "#777" }}>Fetching</td>
                                </tr>
                            ): (
                                UsersModel.fetched ? (
                                    UsersModel.data.length > 0 ? (
                                        UsersModel.data.map((user) => (
                                            <tr key={user.id}>
                                                <td className="mdl-data-table__cell--non-numeric font-weight-bold">{user.name}</td>
                                                <td className="mdl-data-table__cell--non-numeric">{user.username}</td>
                                                <td className="mdl-data-table__cell--non-numeric">{user.role}</td>
                                                <td className="mdl-data-table__cell--non-numeric" style={{ width: "200px" }}>
                                                    <Link to={"/users/edit/" + user.id} className="plain-link"><Ripple className="secondary-button mdc-button mdc-card__action mdc-card__action--button">Edit</Ripple></Link>
                                                    <Ripple onClick={this.deleteClick.bind(this, user.id)} className="text-danger mdc-button mdc-card__action mdc-card__action--button">Delete</Ripple>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="mdl-data-table__cell--non-numeric" style={{ color: "#777" }}>No entries yet</td>
                                        </tr>
                                    )
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="mdl-data-table__cell--non-numeric text-danger">Can not fetch data</td>
                                    </tr>
                                )
                            )
                        }
                        {
                            !UsersModel.fetching && UsersModel.fetched && UsersModel.data.length > 0 && (
                                <tr>
                                    <td colSpan="4" className="mdl-data-table__cell--non-numeric">Total of {UsersModel.data.length} {UsersModel.data.length > 1 ? "users": "user"}</td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>
        )
    }
}