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

import {LitElement, html, nothing} from "lit";
import {guardPage} from "../html-utils.js";
import "../../text-icon.js";
import "./opencga-analysis-tool-form.js";
import "../tool-header.js";

export default class JupyterNotebook extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.enter = false;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config
            };
        }
        super.update(changedProperties);
    }

    onEnterClick() {
        this.enter = true;
        this.requestUpdate();

        // Execute function provided in the configuration
        /* if (this.analysisClass.execute) {
            this.analysisClass.execute(this.opencgaSession, e.detail.data, e.detail.params);
        } else {
            console.error(`No execute() function provided for analysis: ${this._config.id}`)
        }*/

        // // TODO NOTE onAnalysisRun at the moment just forwards the `analysisRun` event fired in opencga-analysis-tool-form
        // this.dispatchEvent(new CustomEvent("execute", {
        //     detail: e.detail
        // }));
    }

    renderWelcomeView() {
        return html`
            <div class="card">
                <div class="card-body d-flex flex-column align-items-center justify-content-center py-5 my-5">
                    ${this._config?.logo ? html`
                        <div class="d-flex text-gray-600 mb-4">
                            <img src="${this._config.logo}" style="${this._config?.display?.logoStyle}">
                        </div>
                    ` : nothing}
                    <div class="text-center fs-5 text-gray-700 mb-4" style="max-width:560px;">
                        <span>Create and execute Jupyter Notebooks to analyze your data on this OpenCGA instance. </span>
                        <span class="fw-bold">Please note that this may involve additional costs.</span>
                    </div>
                    <div class="">
                        <button type="button" class="btn btn-lg btn-primary" @click="${this.onEnterClick}">
                            <span>Run Jupyter Notebook</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderJupyterFrame() {
        const userId = this.opencgaSession.user.id;
        const organizationId = this.opencgaSession.organization.id;
        const serverUrl = this.opencgaSession.server.host.replace("/opencga", "");
        const jupyterLoginUrl = serverUrl + "/jupyter/hub/login";
        const token = this.opencgaSession.token;

        return html`
            <div class="card">
                <div class="card-body p-0">
                    <iframe
                        src="${jupyterLoginUrl}?userId=${userId}&organizationId=${organizationId}&opencgaUrl=${serverUrl}&logoutUrl=https:%2F%2Fwww.google.com&token=${token}"
                        width="100%"
                        height="720">
                    </iframe>
                </div>
            </div>
        `;
    }

    render() {
        if (!this.opencgaSession.study) {
            return guardPage("No OpenCGA study available to run an analysis. Please login to continue.");
        }

        return html`
            <tool-header
                title="Jupyter Notebook">
            </tool-header>
            ${this.enter ? this.renderJupyterFrame() : this.renderWelcomeView()}
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                logoStyle: "width:200px;opacity:0.75;",
            },
            logo: "https://raw.githubusercontent.com/jupyter/design/refs/heads/main/logos/Rectangle%20Logo/rectanglelogo-blacktext-blackbody-blackplanets/rectanglelogo-blacktext-blackbody-blackplanets.svg",
        };
    }

}

customElements.define("jupyter-notebook", JupyterNotebook);
