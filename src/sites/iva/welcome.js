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
import {LitElement, html} from "lit";
import UtilsNew from "./../../core/utilsNew.js";
import "./welcome-iva.js";
import "./welcome-admin.js";
import "./welcome-clinical.js";

export default class WelcomeWeb extends LitElement {

    constructor() {
        super();

        this.checkProjects = false;
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            app: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            version: {
                type: String
            },
            cellbaseClient: {
                type: Object
            },
            // checkProjects: {
            //     type: Boolean
            // },
            config: {
                type: Object
            }
        };
    }

    update(changedProperties) {
        if (changedProperties.has("app")) {
            this._checkProjects();
        }

        if (changedProperties.has("opencgaSession")) {
            this._checkProjects();
        }
        super.update(changedProperties);
    }

    _checkProjects() {
        return !!(UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.project));
    }

    isVisible(item) {
        switch (item.visibility) {
            case "public":
                return true;
            case "private":
                return !!this?.opencgaSession?.token;
            case "none":
            default:
                return false;
        }
    }

    renderWelcome(app) {
        if (!app || app.id === "suite") {
            return this.renderSuiteWelcome();
        } else {
            switch (app.id) {
                case "iva":
                    return html`
                        <welcome-iva
                                .app="${app}"
                                .opencgaSession="${this.opencgaSession}"
                                version="${this.config.version}"
                                .cellbaseClient=${this.cellbaseClient}
                                .config="${this.config}">
                        </welcome-iva>`;
                case "clinical":
                    return html`
                        <welcome-clinical
                                .opencgaSession="${this.opencgaSession}"
                                .config="${this.config}">
                        </welcome-clinical>`;
                case "admin":
                    return html`
                        <welcome-admin
                                .app="${app}"
                                .opencgaSession="${this.opencgaSession}"
                                .config="${this.config}">
                        </welcome-admin>`;
                default:
                    return this.renderSuiteWelcome();
            }
        }
    }

    renderSuiteWelcome() {
        return html`
            <div>
                <h1 style="text-align: center">
                    OpenCB Suite
                </h1>
                <div style="margin: 20px">
                    ${UtilsNew.renderHTML(this.config.welcomePageContent)}
                </div>

                <div class="row hi-icon-wrap hi-icon-effect-9 hi-icon-animation">
                    ${this.config.apps.filter(this.isVisible).map(item => html`
                        <a class="icon-wrapper" href="#home" data-id="${item.id}" @click="${this.onChangeApp}">
                            <div class="hi-icon">
                                <img alt="${item.name}" src="${item.id == 'clinical'? item.logo2 : item.logo}" width=80px height=80px />
                            </div>
                            <div><span style="font-weight: bold">${item.name}</span></div>
                        </a>
                    `)}
                </div>
            </div>`;
    }

    onChangeApp(e) {
        this.dispatchEvent(new CustomEvent("changeApp", {
            detail: {
                id: e.currentTarget.dataset.id,
                e: e
            },
            bubbles: true,
            composed: true
        }));
    }

    // TODO Add Behaviour to select different application and render the selected application
    render() {
        return html`
            <style>
                footer {
                    display: flex;
                    justify-content: center;
                    padding: 5px;
                    background-color: lightgrey;
                    color: #fff;
                }
            </style>

            <div class="col-md-8 col-md-offset-2 col-sm-12 welcome-center text-muted text-justify">
                <div style="margin: 40px">
                    ${this.renderWelcome(this.app)}
                </div>

                <footer>
                    ${UtilsNew.renderHTML(this.config.welcomePageFooter)}
                    <small>
                        IVA web application makes an intensive use of the HTML5 standard and other cutting-edge web technologies such as
                        Web Components,
                        so only modern web browsers are fully supported, these include Chrome 49+, Firefox 45+, Microsoft Edge 14+,
                        Safari 10+ and Opera 36+.
                    </small>-->
                </footer>
            </div>
        `;
    }

}

customElements.define("welcome-web", WelcomeWeb);
