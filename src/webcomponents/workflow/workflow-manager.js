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

import {html, LitElement} from "lit";
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/data-list.js";
import "./workflow-summary.js";
import "./workflow-view.js";
import "./workflow-create.js";
import "./workflow-update.js";
import "./workflow-import.js";
import "./analysis/workflow-analysis.js";
import ModalUtils from "../commons/modal/modal-utils";
import GridCommons from "../commons/grid-commons";

export default class WorkflowManager extends LitElement {

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

        this.WORKFLOW_TYPES_COLOR_MAP = {
            SECONDARY_ANALYSIS: "blue",
            RESEARCH_ANALYSIS: "orange",
            CLINICAL_INTERPRETATION_ANALYSIS: "red",
            OTHER: "black",
        };

        this._config = this.getDefaultConfig();
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

    onActionClick(e, value, workflow) {
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
                // this.clinicalAnalysisManager.deleteInterpretation(interpretationId, interpretationCallback);
                break;
        }
    }

    onWorkflowCreate(e) {
        ModalUtils.show(`${this._prefix}CreateModal`);
    }

    renderCreateModal() {
        return ModalUtils.create(this, `${this._prefix}CreateModal`, {
            display: {
                modalTitle: `Create a new Workflow`,
                modalDraggable: true,
                modalCyDataName: "modal-execute",
                modalSize: "modal-xl"
            },
            render: () => html`
                <workflow-create
                    .opencgaSession="${this.opencgaSession}"
                    .displayConfig="${{
                        buttonClearText: "Cancel",
                        type: "tabs",
                        buttonsLayout: "upper"
                    }}">
                </workflow-create>
            `,
        });
    }

    onWorkflowImport(e) {
        ModalUtils.show(`${this._prefix}ImportModal`);
    }

    onWorkflowImported(e) {
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

    renderImportModal() {
        return ModalUtils.create(this, `${this._prefix}ImportModal`, {
            display: {
                modalTitle: `Import NextFlow Workflows`,
                modalDraggable: true,
                modalCyDataName: "modal-execute",
                modalSize: "modal-xl"
            },
            render: () => html`
                <workflow-import
                    .opencgaSession="${this.opencgaSession}"
                    @workflowImport="${this.onWorkflowImported}">
                </workflow-import>
            `,
        });
    }

    renderViewModal() {
        return ModalUtils.create(this, `${this._prefix}ViewModal`, {
            display: {
                modalTitle: `Workflow Execute: ${this.workflowUpdateId}`,
                modalDraggable: true,
                modalCyDataName: "modal-execute",
                modalSize: "modal-lg"
            },
            render: () => html`
                <workflow-view
                    .workflow="${{id: this.workflowUpdateId}}"
                    .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "bottom"}}"
                    .opencgaSession="${this.opencgaSession}">
                </workflow-view>
            `,
        });
    }

    renderExecuteModal() {
        return ModalUtils.create(this, `${this._prefix}ExecuteModal`, {
            display: {
                modalTitle: `Workflow Execute: ${this.workflowUpdateId}`,
                modalDraggable: true,
                modalCyDataName: "modal-execute",
                modalSize: "modal-lg"
            },
            render: () => html`
                <workflow-analysis
                    .toolParams="${{id: this.workflowUpdateId}}"
                    .search="${false}"
                    .opencgaSession="${this.opencgaSession}">
                </workflow-analysis>
            `,
        });
    }

    onWorkflowUpdate() {
        LitUtils.dispatchCustomEvent(this, "workflowUpdate", null, {
            workflow: this.clinicalAnalysis,
        });
    }

    renderUpdateModal() {
        return ModalUtils.create(this, `${this._prefix}UpdateModal`, {
            display: {
                modalTitle: `Workflow Update: ${this.workflowUpdateId}`,
                modalDraggable: true,
                modalCyDataName: "modal-update",
                modalSize: "modal-lg"
            },
            render: active => html`
                <workflow-update
                    .workflowId="${this.workflowUpdateId}"
                    .active="${active}"
                    .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                    .opencgaSession="${this.opencgaSession}"
                    @workflowUpdate="${this.onWorkflowUpdate}">
                </workflow-update>
            `,
        });
    }

    render() {
        if (this.workflows?.length === 0) {
            return html`
                <div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i>
                    No workflows available.
                </div>
            `;
        }

        return html`
            <div class="interpreter-content-tab">
                <div class="row">
                    <div class="col-12 mb-3">
                        <h2 style="pb-2">Workflows</h2>
                        <div class="">
                            <button  type="button" class="btn btn-primary" @click="${this.onWorkflowCreate}">
                                <i class="fas fa-solid fa-file-medical pe-2" aria-hidden="true"></i>New Workflow ...
                            </button>
                            <button  type="button" class="btn btn-primary" @click="${this.onWorkflowImport}">
                                <i class="fas fa-solid fa-file-medical pe-2" aria-hidden="true"></i>Import ...
                            </button>
                        </div>
                    </div>

                    <div>
                        <data-list
                            .data="${this.workflows}"
                            .config="${this._config}">
                        </data-list>
                    </div>

                </div>
            </div>

            ${this.renderCreateModal()}
            ${this.renderImportModal()}
            ${this.renderViewModal()}
            ${this.renderExecuteModal()}
            ${this.renderUpdateModal()}
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
                            <div class="dropdown">
                                <button type="button" class="btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fas fa-toolbox pe-2"></i>Actions
                                </button>
                                <ul class="dropdown-menu">
                                    <li>
                                        <a class="dropdown-item" href="#" data-action="view">
                                        <i class="fas fa-copy pe-2" aria-hidden="true"></i>View</a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item" href="#" data-action="copy">
                                        <i class="fas fa-copy pe-2" aria-hidden="true"></i>Copy JSON</a>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li>
                                        <a class="dropdown-item" href="#" data-action="execute">
                                        <i class="fas fa-download pe-2" aria-hidden="true"></i>Execute ...</a>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li>
                                        <a class="dropdown-item" href="#" data-action="edit">
                                        <i class="fas fa-eraser pe-2" aria-hidden="true"></i>Edit ...</a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item disabled" href="#" data-action="delete">
                                        <i class="fas fa-trash pe-2" aria-hidden="true"></i>Delete</a>
                                    </li>
                                </ul>
                            </div>
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
