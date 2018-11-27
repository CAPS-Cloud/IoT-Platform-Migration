import React, { Component } from "react";
import { MDCSnackbar } from '@material/snackbar';

export default new class {

    show(message, colorStyle="danger") {
        const snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));

        const dataObj = {
            message: message,
            actionText: '.',
            actionHandler: function () {

            }
        };

        document.querySelector('.mdc-snackbar').className = "mdc-snackbar mdc-snackbar--align-start bg-" + colorStyle;

        snackbar.show(dataObj);
    }

    getElement() {
        return (
            <div className="mdc-snackbar mdc-snackbar--align-start"
                aria-live="assertive"
                aria-atomic="true"
                aria-hidden="true">
                <div className="mdc-snackbar__text text-white"></div>
                <div className="mdc-snackbar__action-wrapper" style={{ display: "none" }}>
                    <button type="button" className="mdc-snackbar__action-button"></button>
                </div>
            </div>
        )
    }
}