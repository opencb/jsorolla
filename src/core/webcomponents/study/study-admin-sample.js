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

import {html, LitElement} from "/web_modules/lit-element.js";
import DetailTabs from "../commons/view/detail-tabs.js";
import "../sample/sample-view.js";
import "../sample/sample-update.js";
import "../sample/sample-create.js";
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
        // I can't use this.mode because override the existing mode inside detailsTabs component
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
        this.fetchSampleId("");
    }

    changeSampleId(e) {
        // console.log("Value", e.detail.value);
        // this.sampleId = e.detail.value;
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
            } else {
                this.sample = {};
                this._config = {...this.getDefaultConfig(), ...this.config};
                this.requestUpdate();
            }
        }
    }

    onSampleSearch(e) {
        if (e.detail.status?.error) {
            // inform
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
                                <div class="col-md-6" style="margin: 20px 10px">
                                    <div style="float: right">
                                        <span style="padding-right:5px">
                                            <i class="fas fa-times icon-hover" @click="${e => this.clearForm(e)}" ></i>
                                        </span>
                                        <span style="padding-left:5px">
                                            <i class="fa fa-edit icon-hover" @click="${e => this.editForm(e)}"></i>
                                        </span>
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
                    // icon: "fas fa-dna",
                    // active: false,
                    render: (study, active, opencgaSession) => {
                        return html`
                            <div class="row">
                                <div class="col-md-6" style="margin: 20px 10px">
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
                        .config="${this._config}"
                        .mode="${DetailTabs.PILLS_MODE}"
                        .opencgaSession="${this.opencgaSession}">
                </detail-tabs>
            </div>`;
    }

}

customElements.define("study-admin-sample", StudyAdminSample);
