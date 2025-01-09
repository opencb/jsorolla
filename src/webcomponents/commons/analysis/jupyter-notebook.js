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

import {LitElement, html} from "lit";
import {guardPage} from "../html-utils.js";
import "../../text-icon.js";
import "./opencga-analysis-tool-form.js";
import "../tool-header.js";

export default class JupyterNotebook extends LitElement {

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

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.enter = false;
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.config
            };
        }
        super.update(changedProperties);
    }

    onEnterClick(e) {
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

    renderContent() {
        // Check Project exists
        if (!this.opencgaSession.study) {
            return guardPage("No OpenCGA study available to run an analysis. Please login to continue.");
        }

        if (!this.enter) {
            return html`
                <div class="card">
                    <div class="card-body d-flex flex-column align-items-center justify-content-center py-5">
                        <div class="d-flex text-gray-600 mb-3 mt-5" style="font-size:3rem;">
                            <i class="fas fa-rocket"></i>
                        </div>
                        <div class="text-center fs-5 text-gray-700 mb-4" style="max-width:560px;">
                            <span>Create and execute Jupyter Notebooks to analyze your data on this OpenCGA instance. </span>
                            <span class="fw-bold">Please note that this may involve additional costs.</span>
                        </div>
                        <div class="mb-5">
                            <button type="button" class="btn btn-lg btn-primary" @click="${this.onEnterClick}">
                                <span>Run Jupyter Notebook</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
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
    }

    render() {
        return html`
            <tool-header title="Jupyter Notebook"></tool-header>
            ${this.renderContent()}
        `;
    }

}

customElements.define("jupyter-notebook", JupyterNotebook);
