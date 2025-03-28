/**
 * Copyright 2015-2024 OpenCB *
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
 *
 */

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import ModalUtils from "../../commons/modal/modal-utils.js";
import "../../commons/empty-state.js";
import "../../project/project-create.js";
import "../../project/project-update.js";
import "./study-admin-grid.js";

export default class ProjectAdminBrowser extends LitElement {

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
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "project-admin-browser";
        this._prefix = UtilsNew.randomString(8);

        this._projectId = null;
        this._activeActionModal = "";
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    changeActiveActionModal(actionModal) {
        // 1. check if there is a modal rendered
        if (this._activeActionModal) {
            ModalUtils.close(`${this._prefix}Modal${this._activeActionModal}`);
        }

        // 2. set the new active action modal
        this._activeActionModal = actionModal;
        this.requestUpdate();

        // 3. show the new active action modal (if provided)
        this.updateComplete.then(() => {
            if (this._activeActionModal) {
                ModalUtils.show(`${this._prefix}Modal${this._activeActionModal}`);
            }
        });
    }

    onUpdateProjectClick(project) {
        this._projectId = project.id;
        this.changeActiveActionModal("project-update");
    }

    renderProjects() {
        const isOrganizationAdmin = OpencgaCatalogUtils.isOrganizationAdmin(this.opencgaSession.organization, this.opencgaSession.user.id);
        const projects = this.opencgaSession?.organization?.projects || [];

        // if no projects are available, display an empty state
        if (projects.length === 0) {
            return html`
                <empty-state
                    title="No projects found"
                    icon="fas fa-folder-open"
                    description="No projects found in this organization. Click on 'Create Project' to create a new project.">
                </empty-state>
            `;
        }
        
        return projects.map(project => html`
            <div class="card mb-5">
                <div class="px-3 py-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <!-- Project title -->
                        <h4 class="d-flex align-items-center">
                            <div class="d-flex me-4">${project.name || project.id}</div>
                            <div class="text-muted">[ ${project.fqn} ]</div>
                        </h4>
                        <!-- Project actions -->
                        ${this._config.showProjectToolbar ? html`
                            <div class="d-flex">
                                <button class="btn btn-light ${isOrganizationAdmin ? "" : "disabled"}" @click="${() => this.onUpdateProjectClick(project)}">
                                    <i class="fas fa-edit me-1"></i>
                                    <span>Edit Project</span>
                                </button>
                            </div>
                        ` : nothing}
                    </div>
                     <!-- Project info: organism, assembly, cellbase -->
                    <div class="d-flex mb-2">
                        <div class="fs-6 me-4">
                            ${project.organism?.scientificName.toUpperCase() || "-"} (${project.organism?.assembly || "-"})
                        </div>
                        <div class="fs-6 me-4">
                            CellBase: ${project.cellbase?.version || "-"}
                        </div>
                        <div class="fs-6 me-4">
                            Data Release: ${project.cellbase?.dataRelease || "-"}
                        </div>
                        <div class="fs-6 me-4">
                            URL:
                            <a href="${project.cellbase?.url || "-"}" target="_blank">
                                ${project.cellbase?.url || "-"}
                            </a>
                        </div>
                    </div>
                    <!-- Project description -->
                    <div class="card-subtitle text-muted">
                        ${project.description}
                    </div>
                </div>
                <!-- List of all studies on this project -->
                <div class="card-body">
                    <study-admin-grid
                        .toolId="${this.COMPONENT_ID || ""}"
                        .project="${project}"
                        .organization="${this.opencgaSession.organization}"
                        .opencgaSession="${this.opencgaSession}"
                        .active="${true}">
                    </study-admin-grid>
                </div>
            </div>
        `);
    }

    renderActionModal() {
        let config = null;

        switch (this._activeActionModal) {
            case "project-create":
                config = {
                    display: {
                        modalTitle: "Create Project",
                        modalSize: "modal-lg",
                    },
                    render: () => html`
                        <project-create
                            .displayConfig="${{
                                buttonsLayout: "bottom",
                            }}"
                            .opencgaSession="${this.opencgaSession}"
                            @projectCreate="${() => this.changeActiveActionModal("")}">
                        </project-create>
                    `,
                };
                break;
            case "project-update":
                config = {
                    display: {
                        modalTitle: `Update Project ${this._projectId}`,
                        modalSize: "modal-lg",
                    },
                    render: () => html`
                        <project-update
                            .projectId="${this._projectId}"
                            .organization="${this.opencgaSession.organization}"
                            .displayConfig="${{
                                buttonsLayout: "bottom",
                            }}"
                            .opencgaSession="${this.opencgaSession}"
                            @projectUpdate="${() => this.changeActiveActionModal("")}">
                        </project-update>
                    `,
                };
                break;
        }
        return config ? ModalUtils.create(this, `${this._prefix}Modal${this._activeActionModal}`, config) : nothing;
    }

    render() {
        // check if the user is organization admin, so he can create new projects
        const isOrganizationAdmin = OpencgaCatalogUtils.isOrganizationAdmin(this.opencgaSession.organization, this.opencgaSession.user.id);

        return html`
            <h2 class="fw-bold mb-0">${this._config.title}</h2>

            ${this._config.showToolbar ? html`
                <div class="d-flex justify-content-end mb-3">
                    <button class="btn btn-light ${isOrganizationAdmin ? "" : "disabled"}" @click="${() => this.changeActiveActionModal("project-create")}">
                        <i class="fas fa-plus me-1"></i>
                        <span>${this._config.buttonCreateText}</span>
                    </button>
                </div>
            ` : nothing}

            ${this.renderProjects()}
            ${this.renderActionModal()}
        `;
    }

    getDefaultConfig() {
        return {
            title: "Manage Projects and Studies",
            showToolbar: true,
            showExport: false,
            showSettings: false,
            showCreate: true,
            buttonCreateText: "Create Project",
            showGraphicFilters: false,
            showProjectToolbar: true,
        };
    }

}

customElements.define("project-admin-browser", ProjectAdminBrowser);
