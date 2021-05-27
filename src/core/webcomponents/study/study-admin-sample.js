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

import {html, LitElement} from "/web_modules/lit-element.js";
import DetailTabs from "../commons/view/detail-tabs.js";
import "../sample/sample-view.js";
import "../sample/sample-update.js";
import "../sample/sample-create.js";
// import "../phenotype/phenotype-manager.js";
import UtilsNew from "./../../utilsNew.js";
import {construction} from "../commons/under-construction.js";

export default class StudyAdminSample extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
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
        this._prefix = UtilsNew.randomString(8);
        // I can't use this.mode because override the existing mode inside detailsTabs component
        this.editSample = false;
        this.sampleId = "";
        this.sample = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        console.log("Updating component...");
    }

    update(changedProperties) {
        super.update(changedProperties);
    }

    editForm(e) {
        this.editSample = !this.editSample;
        console.log("Editar form", this.editSample, this);
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    clearForm(e) {
        this.sample = {};
        this.sampleId = "";
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    changeSampleId(e) {
        console.log("Value", e.detail.value);
        this.sampleId = e.detail.value;
    }

    getDefaultConfig() {
        return {
            items: [
                {
                    id: "view-sample",
                    name: "Sample Info",
                    // icon: "fas fa-notes-medical",
                    active: true,
                    render: (study, active, opencgaSession) => {
                        return html`
                        <style>
                            .fa-lg:hover {
                                color: red;
                            }
                        </style>
                            <div class="row">
                                <div class="col-md-6" style="margin: 20px 10px">
                                    <div style="float: right">
                                        <span style="padding-right:5px">
                                            <i class="fas fa-times fa-lg" @click="${e => this.clearForm(e)}" ></i>
                                        </span>
                                        <span style="padding-left:5px">
                                            <i class="fa fa-edit fa-lg" @click="${e => this.editForm(e)}"></i>
                                        </span>
                                    </div>
                                    ${this.editSample? html`
                                        <sample-update
                                            .sampleId="${this.sampleId}"
                                            .opencgaSession="${opencgaSession}"
                                            @updateSampleId="${e => this.changeSampleId(e)}">
                                        </sample-update>
                                    ` : html`
                                        <sample-view
                                            .sampleId="${this.sampleId}"
                                            .sample="${this.sample}"
                                            .opencgaSession="${opencgaSession}"
                                            @updateSampleId="${e => this.changeSampleId(e)}">
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
