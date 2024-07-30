/*
 * Copyright 2015-2024 OpenCB
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
import UtilsNew from "../../core/utils-new.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import {guardPage} from "../commons/html-utils.js";
import "../commons/tool-header.js";
import "../study/study-form.js";
import "../study/study-create.js";
import "./project-create.js";
import "./project-update.js";

export default class ProjectsAdmin extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
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
        this.projectId = "";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.owners = OpencgaCatalogUtils.getProjectOwners(this.opencgaSession.projects);
        }
        super.update(changedProperties);
    }

    getDefaultConfig() {
        return {};
    }

    actionModal(modalId, action, project) {
        const _project = {...project};
        // action: show or hide
        switch (modalId) {
            case "createProject":
                break;
            case "createStudy":
                this.project = {..._project};
                break;
            case "updateProject":
                this.projectId = _project?.id;
                break;
        }
        $(`#${modalId}`).modal(action);
        this.requestUpdate();
    }

    renderVerticalDotAction(user, project) {
        const isAdmin = OpencgaCatalogUtils.checkUserAccountView(user, this.opencgaSession?.user?.id);
        return html`
            <div class="float-end p-2">
                <div class="dropdown">
                    <a id="dLabel" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="fas fa-ellipsis-v fa-lg" style="color:#fff"></i>
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="dLabel" role="menu">
                        <li>
                            <a class="dropdown-item ${!isAdmin ? "disabled" : "item-pointer"}"
                                @click="${() => this.actionModal("createStudy", "show", project)}">
                                <i class="fas fa-file pe-1"></i> New Study
                            </a>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                            <a class="dropdown-item ${!isAdmin ? "disabled" : "item-pointer"}"
                                @click="${() => this.actionModal("updateProject", "show", project)}">
                                <i class="fas fa-edit pe-1"></i>Edit
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item disabled ${!isAdmin ? "disabled" : "item-pointer"}">
                                <i class="fas fa-copy pe-1"></i>
                                Duplicate
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item disabled ${!isAdmin ? "disabled" : "item-pointer"}">
                                <i class="fas fa-trash pe-1"></i>
                                    Delete
                            </a>
                        </li>
                    </ul>
                </div>
            </div>`;
    }

    // Project and Studies Style Alternative
    renderProjectAndStudies(project, user) {
        return html`
            <style>
                .border-dotted-right {
                    border:2px solid #000;
                    outline: 1px dashed #fff;
                    outline-offset: -1px;
                    background-color:var(--main-bg-color);
                    height:220px;
                    color:#fff;
                    padding: 0px;
                }
            </style>

            <div class="card border border-0 shadow">
                <div class="row">
                    <div class="col-md-2 border-dotted-right">
                        <!-- Vertical dots   -->
                        ${this.renderVerticalDotAction(user, project)}
                        <h3 class="m-1">Project</h3>
                        <div class="text-center pt-2">
                            <h4>${project.name}</h4>
                            <div>
                                ${project.description ? html`
                                    <span>
                                        ${project.description}
                                    </span>
                                ` : html`
                                    <span class="fst-italic">
                                        No description available
                                    </span>`
                                }
                            </div>
                            <div>
                                <span>${project.organism.scientificName} ${project.organism.assembly}</span>
                            </div>
                            <div>
                                <span>${project.fqn}</span>
                            </div>
                            <div>
                                <span>Created on ${UtilsNew.dateFormatter(project.creationDate)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-10">
                        <h4 class="m-2 mb-3">Studies</h4>
                        <!-- Show Study by project -->
                        <div class="d-flex flex-wrap gap-3">
                            ${project.studies.map(study => this.renderStudy(study))}
                        </div>
                    </div>
                </div>
            </div>
            `;
    }

    renderStudy(study) {
        return html`
            <div class="col-md-3">
                <!-- TODO: Pass Info Study to the Study admin -->
                <a class="text-decoration-none" href="#study-admin/${study.fqn}">
                    <div class="card shadow-sm">
                        <div class="card-body studies" style="color: black">
                            ${this.opencgaSession.study.fqn === study.fqn ?
                                html`<span class="badge text-bg-success position-absolute top-0 end-0 me-1 mt-1">Current</span>` : nothing}
                            <div class="text-block text-center pt-2">
                                <div>
                                    <h4>${study.name}</h4>
                                </div>
                                <div>
                                    <span class="text-body-secondary">
                                        ${study.description || "No description available"}
                                    </span>
                                </div>
                                <div>
                                    <span>
                                        ${study.fqn}
                                    </span>
                                </div>
                                <div>
                                    <span>Created on ${UtilsNew.dateFormatter(study.creationDate)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            </div>`;
    }

    renderModal(id, name) {
        let content;
        switch (id) {
            case "createProject":
                content=html`
                    <project-create
                        .opencgaSession="${this.opencgaSession}"
                        .displayConfig="${{modal: true, buttonClearText: "Cancel"}}"
                        @clearProject="${() => this.actionModal("createProject", "hide")}">
                    </project-create>`;
                break;
            case "updateProject":
                content = html`
                    <project-update
                        .projectId=${this.projectId}
                        .opencgaSession="${this.opencgaSession}"
                        .displayConfig="${{modal: true, buttonClearText: "Cancel"}}"
                        @clearProject="${() => this.actionModal("updateProject", "hide")}">
                    </project-update>`;
                break;
            case "createStudy":
                content = html`
                    <study-create
                        .project=${this.project}
                        .opencgaSession="${this.opencgaSession}"
                        .displayConfig="${{modal: true, buttonClearText: "Cancel"}}"
                        @clearStudy="${() => this.actionModal("createStudy", "hide")}">
                    </study-create>`;
                break;
        }
        return html`
            <div id="${id}" class="modal fade" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">${name}</h4>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                    </div>
                </div>
            </div>`;
    }

    render() {
        // Check if there is any project available
        if (!this.opencgaSession?.study) {
            return guardPage();
        }

        return html`
            <style>
                .card-body.studies:hover {
                    background-color: #eee;
                }

                /* Move to global.css */
                /* This prevent to execute a onClick event. */
                .disabled:active{
                    pointer-events:none
                }

                .item-pointer {
                    cursor:pointer
                }
            </style>

            <div class="mx-auto p-2" style="width:90%">
                <!-- Show Project by User-->
                ${
                    this.owners.map(owner => {
                        return html`
                            <div class="d-flex" style="border-bottom: rgba(201, 76, 76, 0.7);}">
                                <div class="p-2">
                                    <h2><i class="fas fa-user fa-sm"></i>${owner}</h2>
                                </div>
                                <div class="p-2 ms-auto">
                                    <button class="btn btn-primary" ?disabled=${!OpencgaCatalogUtils.checkUserAccountView(owner, this.opencgaSession?.user?.id)}
                                        @click="${() => this.actionModal("createProject", "show")}">
                                        New Project
                                    </button>
                                </div>
                            </div>

                            <div class="d-flex flex-column gap-3">
                                <!-- Show Project and Studies -->
                                ${this.opencgaSession.projects.filter(proj => proj.fqn.startsWith(owner + "@")).map(project => this.renderProjectAndStudies(project, owner))}
                            </div>`;
                    })
                }
            </div>

            <!-- TODO: These modals can be a single one, the component will be rendered according to whether you have selected: study or project inside div. modal-body -->
            <!-- Modal New Project , Modal New Study -->
            ${this.renderModal("createProject", "New Project")}
            ${this.renderModal("createStudy", "New Study")}
            ${this.renderModal("updateProject", "Edit Project")}
        `;
    }

}
customElements.define("projects-admin", ProjectsAdmin);
