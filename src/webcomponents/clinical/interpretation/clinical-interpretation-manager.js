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

import {LitElement, html} from "lit";
import {classMap} from "lit/directives/class-map.js";
import ClinicalAnalysisManager from "../clinical-analysis-manager.js";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import GridCommons from "../../commons/grid-commons.js";
import "./clinical-interpretation-summary.js";
import "./clinical-interpretation-create.js";
import "./clinical-interpretation-update.js";

export default class ClinicalInterpretationManager extends LitElement {

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
            clinicalAnalysis: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
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

        this.gridId = this._prefix + "Grid";
        this.interpretationVersions = [];
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
        if (changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
        }
        super.update(changedProperties);
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical()
                .info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    clinicalAnalysisObserver() {
        if (this.clinicalAnalysis && this.clinicalAnalysis.interpretation) {
            this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);

            // this.interpretations = [
            //     {
            //         ...this.clinicalAnalysis.interpretation, primary: true
            //     },
            //     ...this.clinicalAnalysis.secondaryInterpretations
            // ];

            const params = {
                study: this.opencgaSession.study.fqn,
                version: "all",
            };
            this.opencgaSession.opencgaClient.clinical().infoInterpretation(this.clinicalAnalysis.interpretation.id, params)
                .then(response => {
                    this.interpretationVersions = response.responses[0].results.reverse();

                    // We always refresh UI when clinicalAnalysisObserver is called
                    // await this.updateComplete;
                    this.requestUpdate();
                    this.renderHistoryTable();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    renderInterpretation(interpretation, primary) {
        const interpretationLockAction = interpretation.locked ?
            this.renderItemAction(interpretation.id, "unlock", "fa-unlock", "Unlock") :
            this.renderItemAction(interpretation.id, "lock", "fa-lock", "Lock");
        const interpretationTitle = interpretation.locked ?
            html`<i class="fas fa-lock"></i> Interpretation #${interpretation.id.split(".")[1]} - ${interpretation.id}`:
            html`Interpretation #${interpretation.id.split(".")[1]} - ${interpretation.id}`;
        return html`
            <div style="display:flex;padding-bottom:4px;">
                <div style="margin-right:auto;">
                    <h5 style="font-weight: bold">
                        ${interpretationTitle}
                    </h5>
                </div>
                <div class="${classMap({primary: primary})}">
                    <div class="dropdown action-dropdown">
                        <clinical-interpretation-update
                            .clinicalInterpretation="${interpretation}"
                            .clinicalAnalysis="${this.clinicalAnalysis}"
                            .opencgaSession="${this.opencgaSession}"
                            .mode="${"modal"}"
                            .displayConfig="${
                                {
                                    buttonClearText: "Cancel",
                                    buttonOkText: "Update",
                                    modalButtonClassName: "btn-default btn-sm",
                                    modalDisabled: this.clinicalAnalysis.locked
                                }
                            }"
                            @clinicalInterpretationUpdate="${this.onClinicalInterpretationUpdate}">
                        </clinical-interpretation-update>

                        <button class="btn btn-default btn-sm dropdown-toggle one-line" type="button" data-toggle="dropdown"
                                ?disabled="${this.clinicalAnalysis.locked ? "disabled" : ""}">
                            Action <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right">
                            ${primary ? html`
                                <li>
                                    <a
                                        class="btn disabled force-text-left"
                                        data-action="restorePrevious"
                                        data-interpretation-id="${interpretation.id}"
                                        @click="${this.onActionClick}">
                                        <i class="fas fa-code-branch icon-padding" aria-hidden="true"></i>
                                        Restore previous version
                                    </a>
                                </li>
                                <!-- Action Lock/Unlock -->
                                ${interpretationLockAction}
                                <li role="separator" class="divider"></li>
                                ${this.renderItemAction(interpretation.id, "clear", "fa-eraser", "Clear")}
                            ` : html`
                                ${this.renderItemAction(interpretation.id, "setAsPrimary", "fa-map-marker", "Set as primary")}
                                <!-- Action Lock/Unlock -->
                                ${interpretationLockAction}
                                <li role="separator" class="divider"></li>
                                ${this.renderItemAction(interpretation.id, "clear", "fa-eraser", "Clear")}
                                ${this.renderItemAction(interpretation.id, "delete", "fa-trash", "Delete")}
                            `}
                        </ul>
                    </div>
                </div>
            </div>

            <clinical-interpretation-summary
                .interpretation="${interpretation}"
                .primary="${primary}">
            </clinical-interpretation-summary>
        `;
    }

    renderHistoryTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: this.interpretationVersions,
            columns: this._initTableColumns(),
            uniqueId: "id",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            gridContext: this,
            sidePagination: "local",
            pagination: true,
            formatNoMatches: () => "No previous versions",
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
        });
    }

    renderItemAction(interpretationId, action, icon, name) {
        return html`
            <li>
                <a
                    class="btn force-text-left"
                    data-action="${action}"
                    data-interpretation-id="${interpretationId}"
                    @click="${this.onActionClick}">
                    <i class="fas ${icon} icon-padding" aria-hidden="true"></i> ${name}
                </a>
            </li>
        `;
    }

    _initTableColumns() {
        this._columns = [
            {
                title: "ID",
                field: "id"
            },
            {
                title: "Version",
                field: "version"
            },
            {
                title: "Modification Date",
                field: "modificationDate",
                formatter: modificationDate => UtilsNew.dateFormatter(modificationDate, "D MMM YYYY, h:mm:ss a")
            },
            {
                title: "Primary Findings",
                field: "primaryFindings",
                formatter: primaryFindings => primaryFindings?.length
            },
            {
                title: "Status",
                field: "internal.status.name"
            },
            {
                title: "Actions",
                formatter: () => `
                    <div class="btn-group" role="group" aria-label="...">
                        <button class="btn btn-link disabled" type="button" data-action="view">View</button>
                        <button class="btn btn-link" type="button" data-action="restore">Restore</button>
                    </div>
                `,
                valign: "middle",
                events: {
                    "click button": this.onActionClick.bind(this)
                },
                visible: !this._config.columns?.hidden?.includes("actions")
            }
        ];

        return this._columns;
    }

    onActionClick(e) {
        const {action, interpretationId} = e.currentTarget.dataset;
        const interpretationCallback = () => {
            this.onClinicalInterpretationUpdate();
        };

        switch (action) {
            case "setAsPrimary":
                this.clinicalAnalysisManager.setInterpretationAsPrimary(interpretationId, interpretationCallback);
                break;
            case "clear":
                this.clinicalAnalysisManager.clearInterpretation(interpretationId, interpretationCallback);
                break;
            case "delete":
                this.clinicalAnalysisManager.deleteInterpretation(interpretationId, interpretationCallback);
                break;
            case "lock":
                this.clinicalAnalysisManager.lockInterpretation(interpretationId, interpretationCallback);
                break;
            case "unlock":
                this.clinicalAnalysisManager.unLockInterpretation(interpretationId, interpretationCallback);
                break;
        }
    }

    onClinicalInterpretationUpdate() {
        LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
            clinicalAnalysis: this.clinicalAnalysis,
        });
    }

    render() {
        if (!this.clinicalAnalysis?.interpretation) {
            return html`
                <div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i>
                    No primary interpretation available.
                </div>
            `;
        }

        return html`
            <div class="interpreter-content-tab">
                <div class="row">
                    <div class="col-md-8" style="margin-bottom:16px">
                        <h3 style="padding-bottom: 5px">Interpretations</h3>
                        <div class="pull-right">
                            <clinical-interpretation-create
                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                .opencgaSession="${this.opencgaSession}"
                                .mode="${"modal"}"
                                .displayConfig="${{
                                    modalButtonClassName: "btn-primary",
                                    buttonClearText: "Cancel",
                                    modalDisabled: this.clinicalAnalysis.locked
                                }}">
                            </clinical-interpretation-create>
                        </div>
                    </div>

                    <div class="col-md-8" style="margin-bottom:16px">
                        <h4>Primary Interpretation</h4>
                        ${this.renderInterpretation(this.clinicalAnalysis.interpretation, true)}
                    </div>

                    <div class="col-md-8" style="margin-bottom:16px">
                        <h4>Secondary Interpretations</h4>
                        ${this.clinicalAnalysis?.secondaryInterpretations?.length > 0 ? html`
                            ${this.clinicalAnalysis.secondaryInterpretations.map(interpretation => html`
                                <div style="margin-bottom:16px">
                                    ${this.renderInterpretation(interpretation, false)}
                                </div>
                            `)}
                        ` : html`
                            <label>No secondary interpretations found</label>
                        `}
                    </div>

                    <div class="col-md-10" style="padding-top: 10px">
                        <h3>Primary Interpretation History - ${this.clinicalAnalysis.interpretation.id}</h3>
                        <table id="${this.gridId}"></table>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("clinical-interpretation-manager", ClinicalInterpretationManager);
