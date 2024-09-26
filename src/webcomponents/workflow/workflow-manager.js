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
import "./workflow-summary.js";
import "./workflow-view.js";
import "./workflow-create.js";
import "./workflow-update.js";
import "./analysis/workflow-analysis.js";
import ModalUtils from "../commons/modal/modal-utils";

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
        this.WORKFLOW_TYPES = [
            {id: "SECONDARY_ANALYSIS", name: "Secondary Analysis"},
            {id: "RESEARCH_ANALYSIS", name: "Research Analysis"},
            {id: "CLINICAL_INTERPRETATION_ANALYSIS", name: "Clinical Interpretation Analysis"},
            {id: "OTHER", name: "Other"},
        ];

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        // Set workflows from the active study
        if (changedProperties.has("opencgaSession")) {
            this.workflows = this.opencgaSession?.study?.workflows;
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

    onWorkflowUpdate() {
        LitUtils.dispatchCustomEvent(this, "workflowUpdate", null, {
            workflow: this.clinicalAnalysis,
        });
    }

    renderItemAction(workflow, action, icon, name, disabled = false) {
        return html`
            <li>
                <a
                    class="${`dropdown-item`}"
                    ?disabled="${disabled}"
                    data-action="${action}"
                    data-workflow-id="${workflow.id}"
                    data-workflow="${JSON.stringify(workflow)}"
                    style="cursor:pointer;"
                    @click="${this.onActionClick}">
                    <i class="fas ${icon} me-1" aria-hidden="true"></i> ${name}
                </a>
            </li>
        `;
    }

    renderWorkflows(workflows, type) {
        const filteredWorkflows = workflows.filter(workflow => workflow.type === type);
        if (filteredWorkflows.length === 0) {
            return html`
                <div class="">
                    <label>No workflows available.</label>
                </div>
            `;
        } else {
            return html`
                ${filteredWorkflows.map(workflow => html`
                    <div class="py-2">
                        <div class="d-flex py-1">
                            <div class="me-auto">
                                <h5 class="fw-bold">
                                    ${workflow.id} - ${workflow.name}
                                </h5>
                            </div>
                            <div class="">
                                <div class="d-flex gap-2">
                                    <workflow-update
                                        .workflowId="${workflow?.id}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .mode="${"modal"}"
                                        .displayConfig="${
                                            {
                                                modalSize: "modal-lg",
                                                buttonClearText: "Cancel",
                                                buttonOkText: "Update",
                                                modalButtonClassName: "btn-light",
                                                // modalDisabled: this.clinicalAnalysis.locked || interpretation.locked,
                                                modalTitle: `Edit Workflow '${workflow.id}'`,
                                                modalButtonName: "Edit Workflow...",
                                                modalButtonIcon: "fas fa-solid fa-file-medical",
                                                modalButtonsVisible: false,
                                                type: "tabs",
                                                buttonsLayout: "upper",
                                            }
                                        }"
                                        @workflowUpdate="${this.onWorkflowUpdate}">
                                    </workflow-update>

                                    <div class="dropdown">
                                        <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                            <i class="fas fa-toolbox pe-1"></i>
                                            Actions
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-end">
                                            ${this.renderItemAction(workflow, "view", "fa-copy", "View")}
                                            ${this.renderItemAction(workflow, "copy", "fa-copy", "Copy JSON")}
                                            <li><hr class="dropdown-divider"></li>
                                            ${this.renderItemAction(workflow, "execute", "fa-download", "Execute")}
                                            <li><hr class="dropdown-divider"></li>
                                            ${this.renderItemAction(workflow, "edit", "fa-eraser", "Edit")}
                                            ${this.renderItemAction(workflow, "delete", "fa-trash", "Delete", true)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <workflow-summary
                            .workflow="${workflow}">
                        </workflow-summary>
                    </div>`)}
            `;
        }

        // this.requestUpdate();
    }

    onActionClick(e) {
        e.preventDefault();
        const {action, workflowId, workflow} = e.currentTarget.dataset;
        const workflowCallback = () => {
            this.onWorkflowUpdate();
        };

        switch (action) {
            case "view":
                this.workflowUpdateId = workflowId;
                this.requestUpdate();
                // await this.updateComplete;
                ModalUtils.show(`${this._prefix}ViewModal`);
                break;
            case "copy-json":
                const a = JSON.parse(workflow);
                UtilsNew.copyToClipboard(JSON.stringify(a, null, "\t"));
                break;
            case "execute":
                this.workflowUpdateId = workflowId;
                this.requestUpdate();
                // await this.updateComplete;
                ModalUtils.show(`${this._prefix}ExecuteModal`);
                break;
            case "edit":
                this.workflowUpdateId = workflowId;
                this.requestUpdate();
                // await this.updateComplete;
                ModalUtils.show(`${this._prefix}UpdateModal`);
                break;
            case "delete":
                // this.clinicalAnalysisManager.deleteInterpretation(interpretationId, interpretationCallback);
                break;
        }
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
                    .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "bottom"}}"
                    .opencgaSession="${this.opencgaSession}">
                </workflow-analysis>
            `,
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
                    .opencgaSession="${this.opencgaSession}">
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
                    <div class="col-md-8 mb-3">
                        <h2 style="pb-2">Workflows</h2>
                        <div class="float-end">
                            <workflow-create
                                .opencgaSession="${this.opencgaSession}"
                                .mode="${"modal"}"
                                .displayConfig="${{
                                    modalSize: "modal-lg",
                                    modalButtonClassName: "btn-primary",
                                    modalButtonName: "New Workflow...",
                                    modalTitle: "Create Workflow",
                                    modalButtonIcon: "fas fa-solid fa-file-medical",
                                    buttonClearText: "Cancel",
                                    // modalDisabled: this.clinicalAnalysis.locked,
                                    modalButtonsVisible: false,
                                    type: "tabs",
                                    buttonsLayout: "upper"
                                }}">
                            </workflow-create>
                        </div>
                    </div>

                    ${this.WORKFLOW_TYPES.map(type => html`
                        <div class="col-md-8 my-3">
                            <h3>${type.name}</h3>
                            ${this.renderWorkflows(this.workflows, type.id)}
                        </div>
                    `)}
                </div>
            </div>

            ${this.renderViewModal()}
            ${this.renderExecuteModal()}
            ${this.renderUpdateModal()}
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("workflow-manager", WorkflowManager);
