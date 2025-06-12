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
        this._enter = false;
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
        this._enter = true;
        this.requestUpdate();
    }

    renderWelcomeView() {
        return html`
            <div class="card">
                <div class="card-body d-flex flex-column align-items-center justify-content-between py-5 my-5">
                    ${this._config?.logo ? html`
                        <div class="d-flex text-gray-600 mb-4">
                            <img src="${this._config.logo}" class="${this._config?.display?.logoClass || ""}" style="${this._config?.display?.logoStyle || ""}">
                        </div>
                    ` : nothing}
                    <div class="d-flex flex-column text-center text-gray-700 mb-4" style="max-width:560px;">
                        <p class="mb-4 fs-4"><span class="highlight">Create and execute Jupyter Notebooks</span> directly within this XetaBase instance to analyze your data efficiently.</p>
                        <p> <span class="fw-bold mb-2 fs-6">Please note that using Jupyter Lab may incur additional costs, estimated at around $1 per hour.</span></p>
                    </div>
                    <div class="d-flex flex-column fs-7 text-gray-700 mb-4">
                        <h5>Key features:</h5>
                            <ul>
                                <li><span class="fw-bold">Specs:</span> Each instance is allocated 2 cores, 4 GB memory, and 10 GB disk storage.</li>
                                <li><span class="fw-bold">Preconfigured environment:</span>The Jupyter Notebook image used is Scientific Python, with PyOpenCGA already installed.</li>
                                <li><span class="fw-bold">Privacy and Security:</span> Each user operates in a separate session and instance, completely isolated from the others.</li>
                            </ul>
                    </div>
                    <div class="d-flex">
                        <button type="button" class="btn btn-lg btn-primary" @click="${this.onEnterClick}">
                            <span>Run Jupyter Lab Notebooks</span>
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
            <div class="card overflow-hidden">
                <div class="card-body p-0 overflow-hidden">
                    <iframe
                        src="${jupyterLoginUrl}?userId=${userId}&organizationId=${organizationId}&opencgaUrl=${serverUrl}&logoutUrl=https:%2F%2Fwww.google.com&token=${token}"
                        class="${this._config?.display?.frameClass || ""}"
                        style="${this._config?.display?.frameStyle || ""}"
                        width="${this._config?.display?.frameWidth || "100%"}"
                        height="${this._config?.display?.frameHeight || "720px"}">
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
                title="Jupyter Lab Notebooks"
                icon="https://jupyter.org/assets/homepage/main-logo.svg"
                iconSize="36">
            </tool-header>
            ${this._enter ? this.renderJupyterFrame() : this.renderWelcomeView()}
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                logoClass: "",
                logoStyle: "width:200px;opacity:0.75;",
                frameClass: "",
                frameStyle: "border:0",
                frameWidth: "100%",
                frameHeight: "720px",
            },
            logo: "https://raw.githubusercontent.com/jupyter/design/refs/heads/main/logos/Rectangle%20Logo/rectanglelogo-blacktext-blackbody-blackplanets/rectanglelogo-blacktext-blackbody-blackplanets.svg",
        };
    }

}

customElements.define("jupyter-notebook", JupyterNotebook);
