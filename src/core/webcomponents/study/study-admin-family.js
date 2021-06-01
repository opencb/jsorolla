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
import UtilsNew from "./../../utilsNew.js";
import FamilyForm from "./../family/family-create.js";
export default class StudyAdminFamily extends LitElement {

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
        this.editFamily = false;
        this.familyId = "";
        this.family = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        super.update(changedProperties);
    }

    editForm(e) {
        this.editFamily = !this.editFamily;
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    clearForm(e) {
        this.editFamily = false;
        this.fetchFamilyId("");
    }

    changeFamilyId(e) {
        this.fetchFamilyId(e.detail.value);
    }

    fetchFamilyId(familyId) {
        if (this.opencgaSession) {
            if (familyId) {
                const query = {
                    study: this.opencgaSession.study.fqn
                };
                this.opencgaSession.opencgaClient.families().info(familyId, query)
                    .then(response => {
                        this.family = response.responses[0].results[0];
                    })
                    .catch(reason => {
                        this.family = {};
                        console.error(reason);
                    })
                    .finally(() => {
                        this._config = {...this.getDefaultConfig(), ...this.config};
                        this.requestUpdate();
                    });
            } else {
                this.family = {};
                this._config = {...this.getDefaultConfig(), ...this.config};
                this.requestUpdate();
            }
        }
    }

    onFamilySearch(e) {
        if (e.detail.status.error) {
            // inform
        } else {
            this.family = e.detail.value;
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    getDefaultConfig() {
        return {
            items: [
                {
                    id: "view-family",
                    name: "View Family",
                    active: true,
                    render: (study, active, opencgaSession) => {
                        return html `
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
                                    ${this.editFamily? html`
                                        <opencga-family-editor
                                            .id="${"corpas"}"
                                            .opencgaSession="${opencgaSession}">
                                        </opencga-family-editor>
                                    ` : html`
                                        <family-view
                                            .family="${this.family}"
                                            .opencgaSession="${opencgaSession}">
                                        </family-view>`}
                                </div>
                            </div>`;
                    }
                },
                {
                    id: "create-family",
                    name: "Create Family",
                    render: (study, active, opencgaSession) => {
                        return html `
                            <div class="row">
                                <div class="col-md-6" style="margin: 20px 10px">
                                    <family-create
                                        .opencgaSession="${opencgaSession}">
                                    </family-create>
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
            </div>
        `;
    }

}

customElements.define("study-admin-family", StudyAdminFamily);
