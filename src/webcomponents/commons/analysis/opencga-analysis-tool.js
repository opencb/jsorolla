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
import UtilsNew from "../../../core/utils-new.js";
import {guardPage} from "../html-utils.js";
import "../../text-icon.js";
import "./opencga-analysis-tool-form.js";

export default class OpencgaAnalysisTool extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "oat-" + UtilsNew.randomString(6);
    }

    connectedCallback() {
        super.connectedCallback();
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.config};
            this.requestUpdate();
        }
    }

    openModal(e) {
        // $(`#${this._prefix}analysis_description_modal`, this).modal("show");
        const analysisModal = new bootstrap.Modal(`#${this._prefix}analysis_description_modal`);
        analysisModal.show();
    }

    onAnalysisRun(e) {
        // Execute function provided in the configuration
        /* if (this.analysisClass.execute) {
            this.analysisClass.execute(this.opencgaSession, e.detail.data, e.detail.params);
        } else {
            console.error(`No execute() function provided for analysis: ${this._config.id}`)
        }*/

        // TODO NOTE onAnalysisRun at the moment just forwards the `analysisRun` event fired in opencga-analysis-tool-form
        this.dispatchEvent(new CustomEvent("execute", {
            detail: e.detail
        }));
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession || !this.opencgaSession.study) {
            return guardPage("No OpenCGA study available to run an analysis. Please login to continue.");
        }

        // Check Analysis tool configuration
        if (!this._config || !this._config.id || !this._config.form) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-exclamation fa-5x"></i>
                    <h3>No valid Analysis tool configuration provided. Please check configuration:</h3>
                    <div style="padding: 10px">
                        <pre>${JSON.stringify(this._config, null, 2)}</pre>
                    </div>
                </div>
            `;
        }

        return html`
            <div class="opencga-analysis-tool">
                ${this._config.title ? html`
                    <tool-header
                        title="${this._config.title}"
                        icon="${this._config.icon}"
                        .rhs="${html`
                            <button class="btn btn-light"
                                    @click="${e => this.openModal()}">
                                <i class="fas fa-info-circle"></i> Info
                            </button>
                        `}">
                    </tool-header>` : null
                }

                <div class="container">
                    <opencga-analysis-tool-form
                        .opencgaSession=${this.opencgaSession}
                        .cellbaseClient="${this.cellbaseClient}"
                        .config="${this._config.form}"
                        @analysisRun="${this.onAnalysisRun}">
                    </opencga-analysis-tool-form>
                </div>

                <div class="modal fade" id="${this._prefix}analysis_description_modal" tabindex="-1" role="dialog">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                <h4 class="modal-title">${this._config.title}</h4>
                            </div>
                            <div class="modal-body">
                                ${this._config.description}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("opencga-analysis-tool", OpencgaAnalysisTool);
