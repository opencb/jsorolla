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

import {html, LitElement} from "/web_modules/lit-element.js";
import {classMap} from "/web_modules/lit-html/directives/class-map.js";
import UtilsNew from "../../core/utilsNew.js";
import GridCommons from "../commons/grid-commons.js";
import ClinicalAnalysisManager from "../clinical/clinical-analysis-manager.js";


class ClinicalAnalysisInterpretationEditor extends LitElement {

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
            opencgaSession: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
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
        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this.clinicalAnalysis, this.opencgaSession);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.clinicalAnalysisManager = new ClinicalAnalysisManager(this.clinicalAnalysis, this.opencgaSession);
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
    }

    /**
     * Fetch the CinicalAnalysis object from REST and trigger the observer call.
     */
    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    this.clinicalAnalysisObserver();
                    // this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    async clinicalAnalysisObserver() {
        if (this.clinicalAnalysis && this.clinicalAnalysis.interpretation) {
            this.clinicalAnalysisManager = new ClinicalAnalysisManager(this.clinicalAnalysis, this.opencgaSession);

            this.interpretations = [
                {
                    ...this.clinicalAnalysis.interpretation, primary: true
                },
                ...this.clinicalAnalysis.secondaryInterpretations
            ];

            let params = {
                study: this.opencgaSession.study.fqn,
                version: "all",
                // include: "id,version,modificationDate"
            };
            await this.opencgaSession.opencgaClient.clinical().infoInterpretation(this.clinicalAnalysis.interpretation.id, params)
                .then(response => {
                    this.interpretationVersions = response.responses[0].results.reverse();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }

        // We always refresh UI when clinicalAnalysisObserver is called
        await this.requestUpdate();
        this.renderHistoryTable();
    }

    renderInterpretation(interpretation) {
        return html`
            <div class="interpretation-wrapper ${classMap({primary: interpretation.primary})}">
                <div class="header">
                    <div>${interpretation.primary
                        ? html`<span class="badge badge-dark-blue">PRIMARY</span>`
                        : html`<span class="badge badge-light">SECONDARY</span>`
                    }
                    </div>
                    <span class="id">${interpretation.id}</span>
                    ${interpretation.version ? html`<span class="version">version ${interpretation.version}</span>` : null}
                    <span class="analyst" title="Analyst"><i class="fa fa-user-circle icon-padding" aria-hidden="true"></i>${interpretation?.analyst?.name ?? "-"}</span>
                    <span class="modificationDate" title="Modification date"><i class="far fa-calendar-alt"></i>${moment(interpretation?.attributes?.modificationDate).format("MM/DD/YYYY")}</span>
                </div>
                <div class="row">
                    <div class="col-md-2"><label>Description</label></div>
                    <div class="col-md-10">${interpretation.description ? interpretation.description : "-"}</div>
                </div>
                <div class="row">
                    <div class="col-md-2"><label>Primary Findings</label></div>
                    <div class="col-md-10">${interpretation.primaryFindings?.length}</div>

                </div>
                <div class="row status">
                    <div class="col-md-2"><label>Status</label></div>
                    <div class="col-md-10"><span class="${interpretation?.internal?.status?.name}">${interpretation?.internal?.status?.name}</span></div>
                </div>

                <div class="dropdown action-dropdown">
                    <button class="btn btn-default btn-small ripple dropdown-toggle one-line" type="button" data-toggle="dropdown">Action
                        <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-right">

                        ${interpretation.primary ? html`
                            <li>
                                <a href="javascript: void 0" class="btn disabled force-text-left" data-action="restorePrevious" data-interpretation-id="${interpretation.id}"
                                        @click="${this.onActionClick}">
                                    <i class="fas fa-code-branch icon-padding" aria-hidden="true"></i> Restore previous version
                                </a>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li>
                                <a href="javascript: void 0" class="btn force-text-left" data-action="clear" data-interpretation-id="${interpretation.id}"
                                            @click="${this.onActionClick}">
                                    <i class="fas fa-eraser icon-padding" aria-hidden="true"></i> Clear
                                </a>
                            </li>
                        ` : html`
                            <li>
                                <a href="javascript: void 0" class="btn force-text-left" data-action="setAsPrimary" data-interpretation-id="${interpretation.id}"
                                        @click="${this.onActionClick}">
                                    <i class="fas fa-map-marker icon-padding" aria-hidden="true"></i> Set as primary
                                </a>
                            </li>
                            <li>
                                <a href="javascript: void 0" class="btn force-text-left" data-action="merge" data-interpretation-id="${interpretation.id}"
                                        @click="${this.onActionClick}">
                                    <i class="far fa-object-group icon-padding" aria-hidden="true"></i> Merge
                                </a>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li>
                                <a href="javascript: void 0" class="btn force-text-left" data-action="clear" data-interpretation-id="${interpretation.id}"
                                            @click="${this.onActionClick}">
                                    <i class="fas fa-eraser icon-padding" aria-hidden="true"></i> Clear
                                </a>
                            </li>
                            <li>
                                <a href="javascript: void 0" class="btn force-text-left" data-action="delete" data-interpretation-id="${interpretation.id}"
                                        @click="${this.onActionClick}">
                                    <i class="fas fa-trash icon-padding" aria-hidden="true"></i> Delete</a>
                            </li>
                        `}
                    </ul>
                </div>
            </div>`;
    }

    renderHistoryTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: this.interpretationVersions,
            columns: this._initTableColumns(),
            uniqueId: "id",
            gridContext: this,
            sidePagination: "local",
            pagination: true,
            formatNoMatches: () => "No previous versions",
            formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",
            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
        });
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
                formatter: (_, interpretation) => `
                    <div class="btn-group" role="group" aria-label="...">
                        <button class="btn btn-link disabled" type="button" data-action="view">View</button>
                        <button class="btn btn-link" type="button" data-action="restore">Restore</button>
                    </div>`,
                valign: "middle",
                events: {
                    "click button": this.onActionClick.bind(this)
                },
                visible: !this._config.columns?.hidden?.includes("actions")
            }
        ];

        return this._columns;
    }

    onActionClick(e, _, row) {
        const {action, interpretationId} = e.currentTarget.dataset;
        let interpretationCallback = () => {
            this.dispatchEvent(new CustomEvent("clinicalAnalysisUpdate", {
                detail: {
                    clinicalAnalysis: this.clinicalAnalysis
                },
                bubbles: true,
                composed: true
            }));
        };

        switch (action) {
            case "create":
                this.clinicalAnalysisManager.createInterpretation(null, interpretationCallback);
                break;
            case "setAsPrimary":
                this.clinicalAnalysisManager.setInterpretationAsPrimary(interpretationId, interpretationCallback);
                break;
            // case "restore":
            //     this.clinicalAnalysisManager.restoreInterpretation(interpretationId, interpretationCallback);
            //     break;
            case "clear":
                this.clinicalAnalysisManager.clearInterpretation(interpretationId, interpretationCallback);
                break;
            case "delete":
                this.clinicalAnalysisManager.deleteInterpretation(interpretationId, interpretationCallback);
                break;
        }
    }

    getDefaultConfig() {
        return {
        };
    }

    render() {
        if (!this.clinicalAnalysis) {
            return "";
        }

        return html`
            <div class="interpreter-content-tab">
                ${this.interpretations?.length
                    ? html`
                        <div class="row">
                            <div class="col-md-8" style="margin-bottom: 10px">
                                <h3 style="padding-bottom: 5px">Interpretations</h3>
                                <div class="pull-right">
                                    <button class="btn btn-primary btn-small ripple" type="button" title="Create a new empty interpretation" data-action="create"
                                            @click="${this.onActionClick}">
                                        <span style="padding-right: 10px"><i class="fas fa-file-medical"></i></span>
                                        New Interpretation
                                    </button>
                                </div>
                            </div>

                            <div class="col-md-8" style="margin-bottom: 10px">
                                ${this.interpretations.map(interpretation => this.renderInterpretation(interpretation))}
                            </div>

                            <div class="col-md-10">
                                <h3>Main Interpretation History - ${this.clinicalAnalysis.interpretation.id}</h3>
                                <table id="${this.gridId}"></table>
                            </div>
                        </div>`
                    : html`
                        <div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> No interpretation available yet.</div>`
                }
            </div>
        `;
    }
}

customElements.define("clinical-analysis-interpretation-editor", ClinicalAnalysisInterpretationEditor);
