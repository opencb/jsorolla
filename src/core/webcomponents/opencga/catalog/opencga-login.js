/**
 * Copyright 2015-2019 OpenCB
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
import {RestResponse} from "../../../clients/rest-response.js";
import Utils from "./../../../utils.js";
import UtilsNew from "./../../../utilsNew.js";


export default class OpencgaLogin extends LitElement {

    constructor() {
        super();
        this.userName = "";
        this.password = "";
        this.buttonText = "Sign in";
        this.notifyEventMessage = "messageevent";
    }
    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaClient: {
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

    // TODO recheck
    ready() {
        super.ready();
    }

    firstUpdated(changedProperties) {
        $("#formLogin").validator("update");
        $("#formLogin").validator().on("submit", e => this.submitLogin(e));
    }

    submitLogin(e) {
        //console.log("e", e);
        if (e.isDefaultPrevented()) {
            console.error("submitLogin() Error", e);
            // handle the invalid form...
            // this._clearHtmlDom(true);
        } else {
            // everything looks good!
            e.preventDefault();
            const user = document.getElementById("opencgaUser").value;
            const pass = document.getElementById("opencgaPassword").value;
            const _this = this;
            this.opencgaClient.login(user, pass)
                .then( response => {

                    if(response) {
                        this.querySelector("#opencgaUser").value = "";
                        this.querySelector("#opencgaPassword").value = "";
                        console.log("response", response)
                        const token = response.getResult(0).token;
                        const decoded = jwt_decode(token); // TODO expose as module
                        const dateExpired = new Date(decoded.exp * 1000);
                        const validTimeSessionId = moment(dateExpired, "YYYYMMDDHHmmss").format("D MMM YY HH:mm:ss"); // TODO expose as module


                        this.dispatchEvent(new CustomEvent("login", {
                            detail: {
                                userId: user,
                                token: token
                            },
                            bubbles: true,
                            composed: true
                        }));

                        this.dispatchEvent(new CustomEvent(_this.notifyEventMessage, {
                            detail: {
                                message: "Welcome " + user + ". Your session is valid until " + validTimeSessionId,
                                options: {
                                    icon: "fa fa-user-circle"
                                },
                                type: UtilsNew.MESSAGE_SUCCESS
                            },
                            bubbles: true,
                            composed: true
                        }));
                    }
                })
                .catch(function(response) {
                    console.log(response)
                    const _message = this.errorMessage = response.error || "Login error. Please check your credentials.";
                    console.log(response.getEvents())
                    this.dispatchEvent(new CustomEvent(_this.notifyEventMessage, {
                        detail: {
                            message: _message,
                            type: UtilsNew.MESSAGE_ERROR
                        },
                        bubbles: true,
                        composed: true
                    }));
                }.bind(this));
        }

    }

    checkEnterKey(e) {
        if (e.keyCode === 13) {
            // this.login();
        }
    }

    render() {
        return html`
        <style include="jso-styles">
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
            }
            
            .has-error .form-control:focus {
            
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
                                <input id="opencgaUser" value="${this.userName}" type="text" pattern="^[_\\-A-z0-9]+$" maxlength="20" class="form-control input-login"
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
                                <input id="opencgaPassword" value="${this.password}" type="password" maxlength="20" class="form-control input-login"
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
        `;
    }

}

customElements.define("opencga-login", OpencgaLogin);

