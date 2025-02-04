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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/data-list.js";
import "./workflow-summary.js";
import "./workflow-view.js";
import "./workflow-create.js";
import "./workflow-update.js";
import "./workflow-import.js";
import "./workflow-delete.js";
import "./analysis/workflow-analysis.js";
import ModalUtils from "../commons/modal/modal-utils";
import GridCommons from "../commons/grid-commons";

export default class WorkflowManager extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            workflows: {
                type: Array
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        // this._prefix = UtilsNew.randomString(8);
        // this.WORKFLOW_TYPES = [
        //     {id: "SECONDARY_ANALYSIS", name: "Secondary Analysis"},
        //     {id: "RESEARCH_ANALYSIS", name: "Research Analysis"},
        //     {id: "CLINICAL_INTERPRETATION_ANALYSIS", name: "Clinical Interpretation Analysis"},
        //     {id: "OTHER", name: "Other"},
        // ];
        this.COMPONENT_ID = "file-manager";
        this._prefix = UtilsNew.randomString(8);
        this.resource = "WORKFLOW";


        this.WORKFLOW_TYPES_COLOR_MAP = {
            SECONDARY_ANALYSIS: "blue",
            RESEARCH_ANALYSIS: "orange",
            CLINICAL_INTERPRETATION_ANALYSIS: "red",
            OTHER: "black",
        };

        const entityActions = [
            {
                id: "workflow-create",
                tooltip: "New Workflow",
                icon: "fas fa-plus",
                title: "Create Workflow",
                modalId: `${this._prefix}WorkflowCreateModal`,
                render: () => this.renderWorkflowCreate(),
                // permission: this.permissions["organization"](),
            },
            {
                id: "workflow-import",
                tooltip: "Import Workflow",
                icon: "fas fa-file-import",
                title: "Import workflow",
                modalId: `${this._prefix}WorkflowImportModal`,
                render: () => this.renderWorkflowImport(),
                // permission: this.permissions["organization"](),
            },
        ];
        const instanceActions = [
            {
                id: "workflow-view",
                title: "View",
                icon: "fas fa-file-alt",
                modalTitle: "View Workflow",
                modalId: `${this._prefix}WorkflowViewModal`,
                render: () => this.renderWorkflowView(),
                // permission: this.permissions["organization"](),
            },
            {
                id: "workflow-copy",
                title: "Copy JSON",
                icon: "fas fa-copy",
                render: () => this.renderWorkflowCopy(),
                divider: true,
            },
            {
                id: "workflow-execute",
                title: "Execute...",
                icon: "fas fa-play",
                modalTitle: "Execute",
                modalId: `${this._prefix}WorkflowExecuteModal`,
                render: () => this.renderWorkflowExecute(),
                // permission: this.permissions["organization"](),
                divider: true,
            },
            {
                id: "workflow-update",
                title: "Edit...",
                icon: "fas fa-edit",
                modalTitle: "Update",
                modalId: `${this._prefix}WorkflowUpdateModal`,
                render: () => this.renderWorkflowUpdate(),
                // permission: this.permissions["organization"](),
                divider: true,
            },
            {
                id: "workflow-delete",
                title: "Delete...",
                icon: "far fa-trash-alt",
                render: () => this.renderWorkflowDelete(),
            },

        ];

        this.actions = {
            "entity": entityActions,
            "instance": instanceActions,
        };

        this.currentAction = {};

        this._config = this.getDefaultConfig();
    }

    #initOriginalObjects() {
        this.currentAction = {};
        this.workflowId = "";
        this.workflow = {};
    }

    update(changedProperties) {
        // Set workflows from the active study
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        // Merge the default config with the received config
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this.workflows = this.opencgaSession?.study?.workflows;
        if (this.opencgaSession) {
            if (this.workflows?.length === 0) {
                this.opencgaSession.opencgaClient.workflows()
                    .search(
                        {
                            study: this.opencgaSession.study.fqn,
                            limit: 100,
                            count: true
                        })
                    .then(response => {
                        this.workflows = response.getResults();
                    })
                    .catch(error => {
                        console.error(error);
                        params.error(error);
                    }).finally(() => {
                    this.requestUpdate();
                });
            }
        }
    }

    async onActionClick(e, value, workflow) {
        this.currentAction = this.actions[e.currentTarget.dataset.type].find(action => action.id === e.currentTarget.dataset.action);
        debugger
        this.workflowId = workflow?.id ?? "";
        this.workflow = workflow ?? {};
        this.requestUpdate();
        await this.updateComplete;
        ModalUtils.show(this.currentAction["modalId"]);
    }

    onActionClick2(e, value, workflow) {
        e.preventDefault();

        const action = e.currentTarget.dataset.action;
        switch (action) {
            case "view":
                this.workflowUpdateId = workflow.id;
                this.requestUpdate();
                // await this.updateComplete;
                ModalUtils.show(`${this._prefix}ViewModal`);
                break;
            case "copy":
                UtilsNew.copyToClipboard(JSON.stringify(workflow, null, "\t"));
                break;
            case "execute":
                this.workflowUpdateId = workflow.id;
                this.requestUpdate();
                // await this.updateComplete;
                ModalUtils.show(`${this._prefix}ExecuteModal`);
                break;
            case "edit":
                this.workflowUpdateId = workflow.id;
                this.requestUpdate();
                // await this.updateComplete;
                ModalUtils.show(`${this._prefix}UpdateModal`);
                break;
            case "delete":
                this.workflowId = workflow.id;
                debugger
                this.renderWorkflowDelete();
                break;
        }
    }

    onWorkflowAction(e,id) {
        ModalUtils.close(id);
        this.#initOriginalObjects();
    }

    onCloseNotification() {
        this.#initOriginalObjects();
    }

    renderWorkflowCreate() {
        return ModalUtils.create(this, `${this.currentAction["modalId"]}`, {
            display: {
                modalTitle: this.currentAction["modalTitle"],
                modalDraggable: true,
                modalCyDataName: "modal-workflow-create",
                modalSize: "modal-lg",
            },
            render: () => html`
                <workflow-create
                    .opencgaSession="${this.opencgaSession}"
                    .displayConfig="${{
                        buttonClearText: "Cancel",
                        type: "tabs",
                        buttonsLayout: "upper"
                    }}"
                    .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                    @workflowCreate="${e => this.onWorkflowAction(e, `${this.currentAction["modalId"]}`)}">
                </workflow-create>
            `,
        });
    }

    onWorkflowImport(e) {
        this.opencgaSession.opencgaClient.workflows()
            .search(
                {
                    study: this.opencgaSession.study.fqn,
                    limit: 100,
                    count: true
                })
            .then(response => {
                this.workflows = response.getResults();
            })
            .catch(error => {
                console.error(error);
                params.error(error);
            }).finally(() => {
            this.requestUpdate();
        });
    }

    renderWorkflowImport() {
        return ModalUtils.create(this, `${this.currentAction["modalId"]}`, {
            display: {
                modalTitle: this.currentAction["modalTitle"],
                modalDraggable: true,
                modalCyDataName: `modal-${this.currentAction["id"]}`,
                modalSize: "modal-lg",
            },
            render: () => html`
                <workflow-import
                    .opencgaSession="${this.opencgaSession}"
                    @workflowImport="${this.onWorkflowImport}">
                </workflow-import>
            `,
        });
    }

    renderWorkflowView() {
        return ModalUtils.create(this, `${this.currentAction["modalId"]}`, {
            display: {
                modalTitle: this.currentAction["modalTitle"],
                modalDraggable: true,
                modalCyDataName: `modal-${this.currentAction["id"]}`,
                modalSize: "modal-lg",
            },
            render: () => html`
                <workflow-view
                    .workflowId="${this.workflowId}"
                    .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "bottom"}}"
                    .opencgaSession="${this.opencgaSession}">
                </workflow-view>
            `,
        });
    }

    renderWorkflowExecute() {
        return ModalUtils.create(this, `${this.currentAction["modalId"]}`, {
            display: {
                modalTitle: this.currentAction["modalTitle"],
                modalDraggable: true,
                modalCyDataName: `modal-${this.currentAction["id"]}`,
                modalSize: "modal-lg",
            },
            render: () => html`
                <workflow-analysis
                    .toolParams="${{id: this.workflowId}}"
                    .search="${false}"
                    .opencgaSession="${this.opencgaSession}">
                </workflow-analysis>
            `,
        });
    }

    renderWorkflowUpdate() {
        return ModalUtils.create(this, `${this.currentAction["modalId"]}`, {
            display: {
                modalTitle: this.currentAction["modalTitle"],
                modalDraggable: true,
                modalCyDataName: `modal-${this.currentAction["id"]}`,
                modalSize: "modal-lg",
            },
            render: active => html`
                <workflow-update
                    .workflowId="${this.workflowId}"
                    .active="${active}"
                    .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                    .opencgaSession="${this.opencgaSession}">
                </workflow-update>
            `,
        });
    }

    renderWorkflowCopy() {
        UtilsNew.copyToClipboard(JSON.stringify(this.workflow, null, "\t"));
    }


    renderWorkflowDelete() {
        debugger
        return html`
            <workflow-delete
                .opencgaSession="${this.opencgaSession}"
                .workflowId="${this.workflowId}"
                @closeNotification="${e => this.onCloseNotification(e)}">
            </workflow-delete>
        `;
    }

    renderEntityToolbar() {
        return html`
            <div class="d-flex gap-1 justify-content-end" data-cy="manager-toolbar-actions">
                ${
                    this.actions["entity"].map(action => {
                        return html`
                            <div class="btn-group">
                                <button
                                    type="button"
                                    class="btn btn-light ${action.permission}"
                                    data-action="${action.id}"
                                    data-type="entity"
                                    @click="${ (e, value, row) => this.onActionClick(e, value, row)}">
                                        ${action.icon ? html`<span><i class="${action.icon} fa-lg pe-1"></i></span>` : nothing}
                                        ${action.title ? html`${action.title}` : nothing}
                                </button>
                            </div>
                        `;
                    })
                }
            </div>
        `;
    }


    render() {
        return html`
            <div class="interpreter-content-tab">
                <div class="row">
                    <!-- ENTITY ACTIONS TOOLBAR -->
                    <div class="d-flex align-items-center justify-content-between pb-2 border-bottom border-black" data-cy="manager-toolbar">
                        <div class="d-flex align-items-center" data-cy="manager-toolbar-leftcontent">
                            ${this._leftContent || nothing}
                        </div>
                        ${this.renderEntityToolbar()}
                    </div>
                    ${this.workflows?.length === 0 ? html`
                    <div class="alert alert-info">
                        <i class="fas fa-3x fa-info-circle align-middle me-2"></i>
                        No workflows available.
                    </div>
                    ` : html`
                        <div>
                            <data-list
                                .data="${this.workflows}"
                                .config="${this._config}">
                            </data-list>
                        </div>
                    `}
                </div>
            </div>
            <!-- 3. On entity action click, render the respective modal -->
            ${UtilsNew.isNotEmpty(this.currentAction) ? this.currentAction["render"](): nothing}
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                float: "right",
            },
            search: {
                fields: ["id", "name", "description"],
                ignoreCase: true
            },
            sortBy: {
                options: [
                    {
                        id: "name",
                        name: "Name",
                        // order: "asc"
                    },
                    {
                        id: "modificationDate",
                        name: "Recently updated",
                        order: "desc"
                    },
                    {
                        id: "creationDate",
                        name: "Created",
                        order: "desc"
                    },
                ]
            },
            groupBy: {
                options: [
                    {
                        id: "type",
                        name: "Workflow Type",
                        values: ["SECONDARY_ANALYSIS", "RESEARCH_ANALYSIS", "CLINICAL_INTERPRETATION_ANALYSIS", "OTHER"]
                    },
                    {
                        id: "tags",
                        name: "Tags",
                    }
                ]
            },
            table: {
                uniqueId: "id",
                showHeader: true,
                checkbox: false,
                checkboxIndex: 0,
                options: {
                    classes: "table table-hover table-borderless",
                    theadClasses: "table-light",
                    buttonsClass: "light",
                    iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                    icons: GridCommons.GRID_ICONS,
                    pagination: false,
                    pageSize: 100,
                    pageList: [100],
                    detailView: false,
                    rowStyle: ""
                },
                columns: [
                    {
                        title: "ID",
                        field: "id",
                        rowspan: 1,
                        colspan: 1,
                        formatter: (value, row) => {
                            return `
                            <div style="border-left: 2px solid ${this.WORKFLOW_TYPES_COLOR_MAP[row.type]}; padding: 10px">
                                <label>${value}</label>
                                <div class="d-block text-secondary my-1">Version ${row.version}</div>
                            </div>
                        `;
                        }
                    },
                    {
                        title: "Name",
                        field: "name",
                        rowspan: 1,
                        colspan: 1,
                        formatter: (value, row) => {
                            return `
                            <div>
                                <label>${value}</label>
                                <div class="d-block text-secondary my-1">${row.description}</div>
                            </div>
                        `;
                        }
                    },
                    {
                        title: "Scripts",
                        field: "scripts",
                        rowspan: 1,
                        colspan: 1,
                        formatter: (value, row) => {
                            if (value.length > 0) {
                                return `
                                <div>
                                    ${value?.map(script => `${script.fileName}`).join("<br>")}
                                </div>
                            `;
                            } else {
                                return `
                                <div>
                                    <label>Repository ${row.repository?.id || ""}</label>
                                    <div class="d-block text-secondary my-1">${row.repository?.version || ""}</div>
                                </div>
                            `;
                            }
                        }
                    },
                    {
                        title: "Tags",
                        field: "tags",
                        rowspan: 1,
                        colspan: 1,
                        formatter: value => {
                            return `
                            <div>
                                ${value.map(tag => `<span class="badge rounded-pill text-bg-light fs-6">${tag}</span>`).join("")}
                            </div>
                        `;
                        }
                    },
                    {
                        title: "Type",
                        field: "type",
                        rowspan: 1,
                        colspan: 1
                    },
                    {
                        title: "Modification Date",
                        field: "modificationDate",
                        rowspan: 1,
                        colspan: 1,
                        formatter: value => {
                            return `
                            <div>
                                <div class="d-block text-secondary">Updated ${UtilsNew.dateFormatter(value)}</div>
                            </div>
                        `;
                        }
                    },
                    {
                        title: "Actions",
                        field: "actions",
                        rowspan: 1,
                        colspan: 1,
                        formatter: () => {
                            return `
                                <div class="dropdown d-flex justify-content-end">
                                    <button type="button" class="btn" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                    <ul class="dropdown-menu">
                                    ${this.actions["instance"].map(action => {
                                        return `
                                            <li>
                                                <a
                                                class="dropdown-item ${action.permission}"
                                                data-action="${action.id}"
                                                data-type="instance"
                                                style="cursor:pointer;">
                                                    ${action.icon ? `<span><i class="${action.icon} pe-2"></i></span>` : ""}
                                                    ${action.title ? `${action.title}` : ""}
                                                </a>
                                            </li>
                                            ${action.divider ? `<li><hr class="dropdown-divider"></li>` : ""}
                                        `;
                                    }).join("")}
                                    </ul>
                                </div>
                            <!--<div class="dropdown">
                                <button type="button" class="btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fas fa-toolbox pe-2"></i>Actions
                                </button>
                                <ul class="dropdown-menu">
                                    <li>
                                        <a class="dropdown-item" data-action="view">
                                        <i class="fas fa-copy pe-2" aria-hidden="true"></i>View</a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item" data-action="copy">
                                        <i class="fas fa-copy pe-2" aria-hidden="true"></i>Copy JSON</a>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li>
                                        <a class="dropdown-item" data-action="execute">
                                        <i class="fas fa-download pe-2" aria-hidden="true"></i>Execute ...</a>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li>
                                        <a class="dropdown-item" data-action="edit">
                                        <i class="fas fa-eraser pe-2" aria-hidden="true"></i>Edit ...</a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item" data-action="delete">
                                        <i class="fas fa-trash pe-2" aria-hidden="true"></i>Delete</a>
                                    </li>
                                </ul>
                            </div>-->
                            `;
                        },
                        events: {
                            "click a": (e, value, row) => this.onActionClick(e, value, row)
                        },
                    }
                ],
            },
            grid: {
                options: {
                    columns: 3,
                    rowClass: "g-2",
                    cellClass: "p-2"
                },
                render: data => {
                    return html`
                        <div class="card">
                            <div class="card-header">
                                <h4 class="card-title">
                                    ${data.id}
                                </h4>
                            </div>
                            <div class="card-body">
                                ${data.description}
                            </div>
                        </div>
                    `;
                }
            }
        };
    }

}

customElements.define("workflow-manager", WorkflowManager);
