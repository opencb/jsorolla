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
            organization: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            config: {
                type: Object
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "project-admin-browser";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this.projects = [];
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("organization") ||
            changedProperties.has("config")) {
            this.propertyObserver();
        }
        super.update(changedProperties);
    }

    propertyObserver() {
        // With each property change we must be updated config and create the columns again. No extra checks are needed.
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };

        // Config for the grid toolbar
        this.toolbarSetting = {
            ...this._config,
        };

        this.toolbarConfig = {
            toolId: this.toolId,
            resource: "PROJECTS",
            create: {
                display: {
                    modalTitle: "Project Create",
                    modalDraggable: true,
                    modalCyDataName: "modal-create",
                    modalSize: "modal-lg"
                    // disabled: true,
                    // disabledTooltip: "...",
                },
                render: () => html `
                    <project-create
                        .displayConfig="${{mode: "page", type: "form", buttonsLayout: "top"}}"
                        .opencgaSession="${this.opencgaSession}">
                    </project-create>`
            },
        };

        this.modals = {
            "project-update": {
                label: "Edit Project",
                icon: "fas fa-edit",
                modalId: `${this._prefix}UpdateProjectModal`,
                render: () => this.renderProjectUpdate(),
                permission: OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled",
            },
        };
    }

    // *** EVENTS ***
    async onActionClick(e, project) {
        this.action = e.currentTarget.dataset.action;
        this.projectId = project.id;
        this.requestUpdate();
        await this.updateComplete;
        ModalUtils.show(this.modals[this.action]["modalId"]);
    }

    // *** RENDER ***
    renderProjectUpdate() {
        return ModalUtils.create(this, `${this._prefix}UpdateProjectModal`, {
            display: {
                modalTitle: `Update Project: Project ${this.projectId} in organization ${this.organization.id}`,
                modalDraggable: true,
                modalCyDataName: "modal-project-update",
                modalSize: "modal-lg"
            },
            // @projectUpdate="${e => this.onProjectUpdate(e, `${this._prefix}UpdateDetailsModal`)}"
            render: () => {
                return html`
                    <project-update
                        .projectId="${this.projectId}"
                        .organization="${this.organization}"
                        .displayConfig="${{mode: "page", type: "form", buttonsLayout: "top"}}"
                        .opencgaSession="${this.opencgaSession}">
                    </project-update>
                `;
            },
        });
    }

    renderProjectsToolbar() {
        if (this._config.showToolbar) {
            return html `
                <opencb-grid-toolbar
                    .opencgaSession="${this.opencgaSession}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}">
                </opencb-grid-toolbar>
            `;
        }
    }

    renderProject(project) {
        return html `
            <div class="card" style="margin-bottom: 3em; padding: 1em;">
                <!--1. Header project-->
                <div class="d-flex justify-content-between align-items-center">
                    <!-- 1.1 Render project title -->
                    <div class="d-flex">
                        <h4 class="d-flex">
                            <div class="d-flex align-items-center justify-content-around">
                                <div style="margin-right: 1em">
                                ${project.name || project.id}
                                </div>
                            </div>
                        </h4>
                    </div>
                    <!-- 1.2. Render project Actions -->
                    <div id="actions" class="d-flex">
                        ${
                            Object.keys(this.modals).map(modalKey => {
                                const modal = this.modals[modalKey];
                                return html`
                                    <button class="btn btn-light"
                                            data-action="${modalKey}"
                                            @click="${e => this.onActionClick(e, project)}">
                                        <i class=${modal.icon} aria-hidden="true"></i> ${modal.label}...
                                    </button>
                                `;
                            })
                        }
                    </div>
                </div>
                <!-- TODO Vero: structure the following divs 2 to 4 properly  -->
                <!-- 2. Render project fqn -->
                <div style="font-size: medium; color: #7f7f7f; margin-right: 1em">
                    ${project.fqn}
                </div>
                <!-- 3. Render project fqn and description -->
                <div class="mb-4" style="color: #7f7f7f">
                    ${project.description}
                    <!--Data Release: $project.attributes.release} || nothing -->
                </div>
                <!-- 4. Render organism, assembly and Cellbase info -->
                <div>
                    <div style="align-self: end; font-size: small; margin-right: 1em">
                        ${project.organism?.scientificName.toUpperCase() || "-"} (${project.organism?.assembly || "-"})
                    </div>
                    <div style="align-self: end; font-size: small;; margin-right: 1em">
                        <span class="me-3">Cellbase: ${project.cellbase?.version || "-"}</span>
                        <span class="me-3">Data Release: ${project.cellbase?.dataRelease || "-"}</span>
                        <span class="me-3">
                            URL:
                            <a href="${project.cellbase?.url || "-"}" target="_blank">
                                ${project.cellbase?.url || "-"},
                            </a>
                        </span>
                    </div>
                </div>
                <!-- 5. Render studies grid -->
                <study-admin-grid
                    .toolId="${this.COMPONENT_ID}"
                    .project="${project}"
                    .organization="${this.organization}"
                    .opencgaSession="${this.opencgaSession}"
                    .active="${true}">
                </study-admin-grid>
                <!-- 4. On action click, render action modal -->
                ${this.action ? this.modals[this.action]["render"](): nothing}
            </div>
        `;
    }

    render() {
        return html`
            <!-- 1. Render toolbar at project browser level if enabled -->
            ${this.renderProjectsToolbar()}
            <!-- 2. Render projects. Each project has each own grid -->
            ${this.organization.projects.map(project => this.renderProject(project))}
        `;
    }

    // *** CONFIG ***
    getDefaultConfig() {
        return {
            showToolbar: true,
            showExport: false,
            showSettings: false,
            showCreate: true,
            createLabel: "New Project...",
            showGraphicFilters: false,
            showProjectToolbar: true,
        };
    }

}

customElements.define("project-admin-browser", ProjectAdminBrowser);
