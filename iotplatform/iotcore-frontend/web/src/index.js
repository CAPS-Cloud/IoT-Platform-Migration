import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/app.scss';
import './styles/mdl-data-table.css'

import React from "react";
import { render } from "react-dom";
import DevTools from "mobx-react-devtools";

import { BrowserRouter as Router, Route, Link, Redirect, Switch } from "react-router-dom";

import Devices from "./pages/Devices";
import Users from "./pages/Users";
import UsersAdd from "./pages/UsersAdd";
import DevicesView from "./pages/DevicesView";
import UsersEdit from "./pages/UsersEdit";
import SignIn from "./pages/SignIn";

import Ripple from "./utils/Ripple";

import AuthModel from "./models/AuthModel";
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import Snackbar from './utils/Snackbar';

@observer
class Dashboard extends React.Component {

  signOut() {
    AuthModel.signOut();
  }
  
  render() {
    return (
      <div>
        <header className="top-app-bar mdc-top-app-bar" style={{ position: "absolute" }}>
          <div className="mdc-top-app-bar__row">
            <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
              <Link to="/" className="plain-link"><span className="mdc-top-app-bar__title" style={{ cursor: "pointer" }}>IoT Platform Admin Dashboard</span></Link>
            </section>
            <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end">
              <button className="top-bar-button mdc-button" aria-label="Sign out" onClick={this.signOut.bind(this)}>Sign out</button>
            </section>
          </div>
        </header>
        <div className="full-height mdc-top-app-bar--fixed-adjust">
          <div className="drawer-container-flex">
            <aside className="mdc-drawer mdc-drawer--permanent">
              <nav className="mdc-drawer__drawer">
                <header className="name-drawer-header mdc-drawer__header">
                  <div className="mdc-drawer__header-content" style={{ display: "block" }}>
                    <div className="d-flex justify-content-left mb-3">
                      <i className="material-icons" style={{ fontSize: "70px", color: "#666" }}>account_circle</i>
                    </div>
                    <h5 className="mdc-typography--headline5">{AuthModel.userInfo.has("name") && AuthModel.userInfo.get("name")}</h5>
                  </div>
                </header>
                <nav className="mdc-drawer__content mdc-list-group">
                  <hr className="mdc-list-divider" />
                  <div className="mdc-list">
                    <Route
                      path="/devices"
                      children={({ match }) => (
                        <Link to="/devices" className="plain-link">
                          <Ripple className={"drawer-list-item mdc-list-item" + (match ? " mdc-list-item--selected" : "")} data-mdc-tabindex-handled="true" tabIndex={-1}>
                            <i className="material-icons mdc-list-item__graphic" aria-hidden="true">developer_board</i>Devices
                        </Ripple>
                        </Link>
                      )}
                    />
                    <Route
                      path="/consumers"
                      children={({ match }) => (
                        <Link to="/consumers" className="plain-link">
                          <Ripple className={"drawer-list-item mdc-list-item" + (match ? " mdc-list-item--selected" : "")} data-mdc-tabindex-handled="true" tabIndex={-1}>
                            <i className="material-icons mdc-list-item__graphic" aria-hidden="true">cloud_download</i>Consumers
                          </Ripple>
                        </Link>
                      )
                      }
                    />
                    <Route
                      path="/users"
                      children={({ match }) => (
                        <Link to="/users" className="plain-link">
                          <Ripple className={"drawer-list-item mdc-list-item" + (match ? " mdc-list-item--selected" : "")} data-mdc-tabindex-handled="true" tabIndex={-1}>
                            <i className="material-icons mdc-list-item__graphic" aria-hidden="true">supervisor_account</i>Users
                          </Ripple>
                        </Link>
                      )
                      }
                    />
                  </div>
                  <hr className="mdc-list-divider" />
                  <div className="mdc-list">
                    <Ripple onClick={this.signOut.bind(this)} className="drawer-list-item mdc-list-item" data-mdc-tabindex-handled="true" tabIndex={-1}>
                      <i className="material-icons mdc-list-item__graphic" aria-hidden="true">arrow_forward</i>Sign out
                    </Ripple>
                  </div>
                </nav>
              </nav>
            </aside>
            <div style={{ padding: "2rem 4rem", flex: 1 }}>
              <Switch>
                <Route
                  path="/"
                  exact
                  children={({ match }) => (
                    match ? <Redirect to="/devices" /> : null
                  )
                  }
                />
                <Route exact path="/devices" component={Devices} />
                <Route exact path="/devices/view/:id" component={DevicesView} />
                <Route exact path="/users" component={Users} />
                <Route exact path="/users/add" component={UsersAdd} />
                <Route exact path="/users/edit/:id" component={UsersEdit} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

@observer
class AuthCheckIndex extends React.Component {

  componentWillMount() {
    AuthModel.checkAuth();
  }

  render() {
    if (!AuthModel.checked && AuthModel.checking) {
      // Checking for auth key validity
      return (
        <span>Checking authentication key for validity</span>
      );
    } else if (!AuthModel.checked && !AuthModel.checking) {
      // Checking failed
      return (
        <span>Authenticatiton failed, try again later</span>
      );
    } else if (AuthModel.authenticated) {
      // Auth key valid
      return (
        <Switch>
          <Route exact path="/signin" component={SignIn} />
          <Route component={Dashboard} />
        </Switch>
      );
    } else {
      // Auth key invalid
      return (
        <div>
          <Route
            path="/signin"
            exact
            children={({ match }) => (
              !match ? <Redirect to={"/signin" + ((!AuthModel.justSignedOut && this.props.location.pathname) ? ("?redirect=" + this.props.location.pathname) : "")} /> : null
            )
            }
          />
          <Route exact path="/signin" component={SignIn} />
        </div>
      );
    }
  }
}

@observer
class Index extends React.Component {

  render() {
    return (
      <Router onUpdate={() => window.scrollTo(0, 0)}>
        <div>
          <Route component={AuthCheckIndex} />
          { Snackbar.getElement() }
        </div>
      </Router>
    );
  }
}

render(
  <Index />,
  document.getElementById("root")
);
