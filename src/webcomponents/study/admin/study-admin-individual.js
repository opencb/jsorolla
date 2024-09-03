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
import "../../individual/individual-update.js";
import "../../individual/individual-create.js";
import "../../individual/individual-view.js";

export default class StudyAdminIndividual extends LitElement {

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
        this.editIndividual = false;
        this.individualId = "";
        this.individual = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        super.update(changedProperties);
    }

    editForm(e) {
        this.editIndividual = !this.editIndividual;
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    clearForm(e) {
        this.editIndividual = false;
        this.fetchIndividualId("");
    }

    changeIndividualId(e) {
        this.fetchIndividualId(e.detail.value);
    }

    fetchIndividualId(individualId) {
        if (this.opencgaSession) {
            if (individualId) {
                const query = {
                    study: this.opencgaSession.study.fqn
                };
                this.opencgaSession.opencgaClient.individuals().info(individualId, query)
                    .then(response => {
                        this.individual = response.responses[0].results[0];
                    })
                    .catch(reason => {
                        this.individual = {};
                        console.error(reason);
                    })
                    .finally(() => {
                        this._config = {...this.getDefaultConfig(), ...this.config};
                        this.requestUpdate();
                    });
            } else {
                this.individual = {};
                this._config = {...this.getDefaultConfig(), ...this.config};
                this.requestUpdate();
            }
        }
    }

    onIndividualSearch(e) {
        if (e.detail?.status?.error) {
            console.log(this, "error:", e.detail.status.error);
        } else {
            this.individual = e.detail.value;
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    getDefaultConfig() {
        return {
            items: [
                {
                    id: "view-individual",
                    name: "Individual Info",
                    active: true,
                    render: (study, active, opencgaSession) => {
                        return html`
                            <div class="row">
                                <div class="col-md-6 mx-3 my-4">
                                    <div class="d-flex justify-content-end">
                                        <div class="btn-group">
                                            ${UtilsNew.isNotEmpty(this.individual) ? html `
                                                <button class="btn btn-light" type="button" @click="${e => this.clearForm(e)}">
                                                    <i class="fas fa-arrow-left"></i>  Back
                                                </button>
                                                <button class="btn btn-light" type="button" @click="${e => this.editForm(e)}">
                                                    <i class="${this.editIndividual? "far fa-eye": "fa fa-edit"}"></i> ${this.editIndividual? "View" : "Edit"}
                                                </button>`: nothing}
                                        </div>
                                    </div>
                                    ${this.editIndividual? html`
                                        <individual-update
                                            .individual="${this.individual}"
                                            .opencgaSession="${opencgaSession}">
                                        </individual-update>
                                    ` : html`
                                        <individual-view
                                            .individual="${this.individual}"
                                            .search="${true}"
                                            .opencgaSession="${opencgaSession}"
                                            @individualSearch="${e => this.onIndividualSearch(e)}">
                                        </individual-view>`}
                                </div>
                            </div>`;
                    }
                },
                {
                    id: "create-individual",
                    name: "Create Individual",
                    render: (study, active, opencgaSession) => {
                        return html`
                            <div class="row">
                                <div class="col-md-6 mx-3 my-4">
                                    <individual-create
                                        .opencgaSession="${opencgaSession}">
                                    </individual-create>
                                </div>
                            </div>`;
                    }
                }
            ]
        };
    }

    //  TODO: Move for a new component as modal form
    actionModal(modalId, action, individual = {}, mode = "CREATE") {
        // action: show or hide
        // mode: CREATE or UPDATE
        this.mode = mode;
        if (individual && mode === "UPDATE") {
            this.individual = individual;
        } else {
            this.individual = {};
        }
        this.requestUpdate();
        $(`#${modalId}`).modal(action);
    }

    //  TODO: Move for a new component as modal form
    renderModal(modalId, name) {
        return html`
            <div id="${modalId}" class="modal fade" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title">New ${name}</h4>
                        </div>
                        <div class="modal-body">
                            <individual-form
                                .opencgaSession="${this.opencgaSession}"
                                @hide="${() => this.actionModal(modalId, "hide")}">
                            </individual-form>
                        </div>
                    </div>
                </div>
            </div>`;
    }


    render() {
        return html`
            <div style="margin: 25px 40px">
                <detail-tabs
                    .data="${{}}"
                    .config=${this._config}
                    .mode=${DetailTabs.PILLS_MODE}
                    .opencgaSession=${this.opencgaSession}>
                </detail-tabs>
            </div>

            <!-- TODO: Move for a new component as modal form -->
            <!-- <div class="pull-right" style="margin: 10px 0px">
                <div style="display:inline-block; margin: 0px 20px">
                    <button class="btn-custom btn btn-primary"
                        @click="\${() => this.actionModal('newIndividual', "show")}">New Individual
                    </button>
                </div>
            </div> -->
            <!-- \${this.renderModal('newIndividual', 'individual')} -->
        `;
    }

}

customElements.define("study-admin-individual", StudyAdminIndividual);
