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

import { html, LitElement } from "/web_modules/lit-element.js";
import UtilsNew from "./../../utilsNew.js";
import CohortCreate from "../cohort/cohort-create.js"
import CohortUpdate from "../cohort/cohort-update.js"
import DetailTabs from "../commons/view/detail-tabs.js";

export default class StudyAdminCohort extends LitElement {

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
        this._prefix = UtilsNew.randomString(8);
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = { ...this.getDefaultConfig(), ...this.config };
    }

    update(changedProperties) {
        super.update(changedProperties);
    }

    getDefaultConfig() {
        return {
            items: [
                {
                    id: "view-cohort",
                    name: "View Cohort",
                    // icon: "fas fa-notes-medical",
                    active: true,
                    render: (study, active, opencgaSession) => {
                        return html`
                            <div class="row">
                                <div class="col-md-6" style="margin: 20px 10px">
                                    <cohort-update
                                        .cohortId="${"cohortTest"}"
                                        .opencgaSession="${opencgaSession}"></cohort-create>
                                    </cohort-update>
                                </div>
                            </div>`;
                    }
                },
                {
                    id: "create-cohort",
                    name: "Create Cohort",
                    // icon: "fas fa-dna",
                    // active: false,
                    render: (study, active, opencgaSession) => {
                        return html`
                            <div class="row">
                                <div class="col-md-6" style="margin: 20px 10px">
                                    <cohort-create
                                        .opencgaSession="${opencgaSession}">
                                    </cohort-create>
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

customElements.define("study-admin-cohort", StudyAdminCohort);
