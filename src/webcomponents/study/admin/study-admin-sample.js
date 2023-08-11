/**
 * Copyright 2015-2021 OpenCB
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
import DetailTabs from "../../commons/view/detail-tabs.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../sample/sample-view.js";
import "../../sample/sample-update.js";
import "../../sample/sample-create.js";

export default class StudyAdminSample extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            studyId: {
                type: String
            },
            study: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.editSample = false;
        this.sampleId = "";
        this.sample = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        super.update(changedProperties);
    }

    editForm(e) {
        this.editSample = !this.editSample;
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    clearForm(e) {
        this.editSample = false;
        this.sample = {};
        this.sampleId = "";
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    changeSampleId(e) {
        this.fetchSampleId(e.detail.value);
    }

    fetchSampleId(sampleId) {
        if (this.opencgaSession) {
            if (sampleId) {
                const query = {
                    study: this.opencgaSession.study.fqn,
                    includeIndividual: true
                };
                this.opencgaSession.opencgaClient.samples().info(sampleId, query)
                    .then(response => {
                        this.sample = response.responses[0].results[0];
                    })
                    .catch(reason => {
                        this.sample = {};
                        console.error(reason);
                    })
                    .finally(() => {
                        this._config = {...this.getDefaultConfig(), ...this.config};
                        this.requestUpdate();
                    });
            }
        }
    }

    onSampleSearch(e) {
        if (e.detail.status?.error) {
            console.log(this, "error:", e.detail.status.error);
        } else {
            this.sample = e.detail.value;
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    getDefaultConfig() {
        return {
            items: [
                {
                    id: "view-sample",
                    name: "Sample Info",
                    active: true,
                    render: (study, active, opencgaSession) => {
                        return html`
                            <div class="row">
                                <div class="col-md-6 mx-3 my-4">
                                    <div class="d-flex justify-content-end">
                                        <div class="btn-group">
                                        ${UtilsNew.isNotEmpty(this.sample) ? html `
                                            <button class="btn btn-light" type="button" @click="${e => this.clearForm(e)}">
                                                <i class="fas fa-arrow-left icon-hover"></i>  Back
                                            </button>
                                            <button class="btn btn-light" type="button" @click="${e => this.editForm(e)}">
                                                <i class="${this.editSample? "far fa-eye": "fa fa-edit"} icon-hover"></i> ${this.editSample? "View" : "Edit"}
                                            </button>`: nothing}
                                        </div>
                                    </div>
                                    ${this.editSample? html`
                                        <sample-update
                                            .sample="${this.sample}"
                                            .opencgaSession="${opencgaSession}"
                                            @updateSampleId="${e => this.changeSampleId(e)}">
                                        </sample-update>
                                    ` : html`
                                        <sample-view
                                            .sample="${this.sample}"
                                            .search="${true}"
                                            .opencgaSession="${opencgaSession}"
                                            @sampleSearch="${e => this.onSampleSearch(e)}">
                                        </sample-view>`}
                                </div>
                            </div>`;
                    }
                },
                {
                    id: "create-sample",
                    name: "Create Sample",
                    render: (study, active, opencgaSession) => {
                        return html`
                            <div class="row">
                                <div class="col-md-6 mx-3 my-4">
                                    <sample-create
                                        .opencgaSession="${opencgaSession}">
                                    </sample-create>
                                </div>
                            </div>`;
                    }
                }
            ]
        };
    }

    render() {
        return html`
            <div style="margin: 25px 40px">
                <detail-tabs
                    .data="${{}}"
                    .config="${this._config}"
                    .mode="${DetailTabs.PILLS_MODE}"
                    .opencgaSession="${this.opencgaSession}">
                </detail-tabs>
            </div>`;
    }

}

customElements.define("study-admin-sample", StudyAdminSample);
