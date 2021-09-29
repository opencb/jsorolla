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
import "../../webcomponents/commons/layouts/welcome-app.js";


export default class WelcomeSuite extends LitElement {

    constructor() {
        super();

        // this.checkProjects = false;
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
            return html `
                <welcome-app
                    version="${this.config?.version}"
                    .app="${app}"
                    .opencgaSession="${this.opencgaSession}"
                    .cellbaseClient=${this.cellbaseClient}
                    .config="${this.config}">
                </welcome-app>`;
        }
    }

    renderSuiteWelcome() {
        return html`
            <div>
                    ${UtilsNew.renderHTML(this.config.welcomePage?.title)}
                    ${UtilsNew.renderHTML(this.config.welcomePage?.logo)}
                    ${UtilsNew.renderHTML(this.config.welcomePage?.content)}
                <div class="row hi-icon-wrap hi-icon-effect-9 hi-icon-animation">
                    ${this.config.apps.filter(app => this.isVisible(app)).map(item => html`
                        <a class="icon-wrapper" href="#home" data-id="${item.id}" @click="${this.onChangeApp}">
                            <div class="hi-icon">
                                <img alt="${item.name}" src="${item.icon}"  />
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

                <!--<footer>
                    UtilsNew.renderHTML(this.config.welcomePageFooter)
                    <small>
                        IVA web application makes an intensive use of the HTML5 standard and other cutting-edge web technologies such as
                        Web Components,
                        so only modern web browsers are fully supported, these include Chrome 49+, Firefox 45+, Microsoft Edge 14+,
                        Safari 10+ and Opera 36+.
                    </small>
                </footer>-->
            </div>
        `;
    }

}

customElements.define("welcome-suite", WelcomeSuite);
