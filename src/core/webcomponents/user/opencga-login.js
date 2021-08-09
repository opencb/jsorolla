/*
 * Copyright 2015-2016 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
import {NotificationQueue} from "../Notification.js";
import {RestResponse} from "../../clients/rest-response.js";


export default class OpencgaLogin extends LitElement {

    constructor() {
        super();

        this._init();
    }
    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            buttonText: {
                type: String
            },
            userName: {
                type: String
            },
            password: {
                type: String
            },
            notifyEventMessage: {
                type: String
            }
        };
    }

    _init() {
        this.userName = "";
        this.password = "";
        this.buttonText = "Sign in";
        this.signingIn = false;
    }

    firstUpdated(changedProperties) {
        $("#formLogin").validator("update");
        $("#formLogin").validator().on("submit", e => this.submitLogin(e));
        this.redirect();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.redirect();
        }
    }

    redirect() {
        if (this.opencgaSession?.study) {
            // window.location.hash = "#home";
            this.dispatchEvent(new CustomEvent("redirect", {
                detail: {
                    hash: "#home"
                }
            }));
        }
    }

    submitLogin(e) {
        // console.log("e", e);
        if (e.isDefaultPrevented()) {
            console.error("submitLogin() Error", e);
            // handle the invalid form...
            // this._clearHtmlDom(true);
        } else {
            // everything looks good!
            e.preventDefault();
            // this.dispatchEvent(new CustomEvent("signingIn"));

            const user = this.querySelector("#opencgaUser").value;
            const pass = this.querySelector("#opencgaPassword").value;

            try {
                // in case a previous error has prevented the creation of opencgaSession object (in opencgaClient.createSession()), this would be undefined
                if (this.opencgaSession) {
                    this.opencgaSession.opencgaClient.login(user, pass)
                        .then(restResponse => {

                            if (restResponse instanceof RestResponse) {
                                if (restResponse.getEvents?.("ERROR")?.length) {
                                    this.errorState = restResponse.getEvents("ERROR");
                                    new NotificationQueue().push(this.errorState[0].name, this.errorState[0].message, "error");
                                } else if (restResponse) {
                                    this.querySelector("#opencgaUser").value = "";
                                    this.querySelector("#opencgaPassword").value = "";
                                    const token = restResponse.getResult(0).token;
                                    const decoded = jwt_decode(token);
                                    const dateExpired = new Date(decoded.exp * 1000);
                                    const validTimeSessionId = moment(dateExpired, "YYYYMMDDHHmmss").format("D MMM YY HH:mm:ss");
                                    this.dispatchEvent(new CustomEvent("login", {
                                        detail: {
                                            userId: user,
                                            token: token
                                        },
                                        bubbles: true,
                                        composed: true
                                    }));
                                    new NotificationQueue().push("Welcome, " + user, "Your session is valid until " + validTimeSessionId, UtilsNew.MESSAGE_SUCCESS);

                                }
                            } else {
                                this.errorState = [{name: "Generic Server Error", message: "Unexpected response format. Please check your host is up and running."}];
                                new NotificationQueue().push(this.errorState[0].name, this.errorState[0].message, "error");
                            }
                        })
                        .catch(response => {
                            // response isn't necessarily a restResponse instance
                            if (response instanceof RestResponse) {
                                if (response.getEvents?.("ERROR")?.length) {
                                    this.errorState = response.getEvents("ERROR");
                                    this.errorState.forEach(error => new NotificationQueue().push(error.name, error.message, "ERROR"));
                                } else {
                                    this.errorState = [{name: "Generic Server Error", message: JSON.stringify(response)}];
                                    new NotificationQueue().push(this.errorState[0].name, this.errorState[0].message, "error");
                                }
                            } else if (response instanceof Error) {
                                this.errorState = [{name: response.name, message: response.message}];
                                new NotificationQueue().push(this.errorState[0].name, this.errorState[0].message, "error");
                            } else {
                                this.errorState = [{name: "Generic Error", message: JSON.JSON.stringify(response)}];
                                new NotificationQueue().push(this.errorState[0].name, this.errorState[0].message, "error");
                            }
                        }).finally(() => this.requestUpdate());
                } else {
                    new NotificationQueue().push("Error retrieving OpencgaSession", null, "ERROR");
                }
            } catch (e) {
                this.errorState = [{name: "Generic Error", message: "Please contact your administrator."}];

            }

        }

    }

    checkEnterKey(e) {
        if (e.keyCode === 13) {
            // this.login();
        }
    }

    render() {
        return html`
        <style>
            .v-offset {
                margin-top: 90px;
            }

            .input-login {
                border-left: 0;
            }

            #formLogin .input-group-addon{
                background: none;
            }
            
            .login-box {
                padding: 20px;
                margin-bottom: 20px;
            }
            
            .has-error .form-control:focus {
            
            }
            
            opencga-login #error {
                max-width: 316px;
                word-break: break-word;
            }
        </style>
        <div class="container-fluid">
            <div class="login-box row v-offset shadow">
                <div class="col-md-12">
                    <form id="formLogin" data-toggle="validator" class="form-horizontal" role="form">
                        <div class="form-group has-feedback">
                            <label for="opencgaUser" class="control-label label-login">User ID</label>
                            <div class="input-group">
                                <span class="input-group-addon" id="username">
                                    <i class="fa fa-user fa-lg"></i>
                                </span>
                                <input id="opencgaUser" value="${this.userName}" type="text" pattern="^[_\\-A-z0-9@\\.]+$" class="form-control input-login"
                                       placeholder="User ID (case sensitive)" aria-label="Recipient's username" aria-describedby="username" required data-required-error="This field is required">
                            </div>
                            <div class="help-block with-errors"></div>
                        </div>

                        <div class="form-group">
                            <label for="opencgaPassword" class="control-label label-login">Password</label>
                            <div class="input-group">
                                <span class="input-group-addon " id="password">
                                    <i class="fa fa-key"></i>
                                </span>
                                <input id="opencgaPassword" value="${this.password}" type="password" maxlength="256" class="form-control input-login"
                                       placeholder="Password" aria-describedby="password" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-lg btn-primary btn-block ripple">${this.buttonText}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        ${this.errorState?.length ? html`
            <div id="error" class="alert alert-danger" role="alert">
                ${this.errorState.map(error => html`<p><strong>${error.name}</strong></p><p>${error.message}</p>`)}
            </div>
        ` : null}
        `;
    }

}

customElements.define("opencga-login", OpencgaLogin);

