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

import {LitElement, html} from "/web_modules/lit-element.js";
import ClinicalAnalysisUtils from "../../clinical/clinical-analysis-utils.js";
import UtilsNew from "../../../utilsNew.js";
import PolymerUtils from "../../PolymerUtils.js";
import "../../tool-header.js";
import "./variant-interpreter-grid.js";
import "./variant-interpreter-detail.js";
import "../opencga-variant-filter.js";
import "../../commons/opencga-active-filters.js";
import "../../commons/filters/sample-genotype-filter.js";
import "../../commons/filters/caveman-caller-filter.js";
import "../../commons/filters/strelka-caller-filter.js";
import "../../commons/filters/pindel-caller-filter.js";
import "../../commons/filters/ascat-caller-filter.js";
import "../../commons/filters/canvas-caller-filter.js";
import "../../commons/filters/brass-caller-filter.js";
import "../../commons/filters/manta-caller-filter.js";
import GridCommons from "../grid-commons.js";

class InterpretationGrid extends LitElement {

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
        this._prefix = "ig-" + UtilsNew.randomString(6);
        this.gridId = this._prefix + "int-grid";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
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
                    //this.clinicalAnalysisObserver();
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    clinicalAnalysisObserver() {
        if(this.clinicalAnalysis) {
            this.renderLocalTable()
        } else {

        }
    }

    renderLocalTable() {

        this.data = [{...this.clinicalAnalysis.interpretation, primary: true}, ...this.clinicalAnalysis.secondaryInterpretations]
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: this.data,
            columns: this._initTableColumns(),
            sidePagination: "local",
            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            detailFormatter: this.detailFormatter,
            gridContext: this,
            formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",
            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPageChange: (page, size) => {
                const result = this.gridCommons.onPageChange(page, size);
                //this.from = result.from || this.from;
                //this.to = result.to || this.to;
            },
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            }
        });
    }

    _initTableColumns() {
        this._columns = [
            {
                title: "ID",
                field: "id",
                formatter: (id, interpretation) => id + (interpretation.primary ? " <span class='badge badge-info'>Primary</span>" : "")
            },
            {
                title: "description",
                field: "description"
            },
            {
                title: "methods",
                field: "methods",
                formatter: methods => methods?.map(method => method.name).join("<br>")
            },
            {
                title: "Primary Findings",
                field: "primaryFindings",
                formatter: primaryFindings => primaryFindings?.length
            },
            {
                title: "comments",
                field: "comments"
            },
            {
                title: "creationDate",
                field: "creationDate",
                formatter: creationDate => UtilsNew.dateFormatter(creationDate, "D MMM YYYY, h:mm:ss a")
            },
            {
                title: "Status",
                field: "internal.status.name"
            },
            {
                title: "version",
                field: "version"
            },
            {
                title: "Actions",
                formatter: (_, interpretation) => `
                    <div class="dropdown">
                        <button class="btn btn-default btn-small ripple dropdown-toggle one-line" type="button" data-toggle="dropdown">Select action
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right">
                            
                            ${interpretation.primary ? `
                                <li>
                                    <a href="javascript: void 0" class="btn disabled force-text-left" data-action="history">
                                        <i class="fas fa-code-branch icon-padding" aria-hidden="true"></i> Restore previous version
                                    </a>
                                </li>
                            ` : `
                                <li>
                                    <a href="javascript: void 0" class="btn force-text-left" data-action="setprimary">
                                        <i class="fas fa-map-marker icon-padding" aria-hidden="true"></i> Set as primary
                                    </a>
                                </li>
                                <li>
                                    <a href="javascript: void 0" class="btn force-text-left" data-action="merge">
                                        <i class="far fa-object-group icon-padding" aria-hidden="true"></i> Merge
                                    </a>
                                </li>
                            `}
                            
                            <li role="separator" class="divider"></li>
                            <li>
                                <a href="javascript: void 0" class="btn force-text-left" data-action="clear">
                                    <i class="fas fa-eraser icon-padding" aria-hidden="true"></i> Clear 
                                </a>
                            </li>
                            <li>
                                <a href="javascript: void 0" class="btn disabled force-text-left" data-action="delete">
                                    <i class="fas fa-trash icon-padding" aria-hidden="true"></i> Delete</a>
                            </li>
                        </ul>
                    </div>`,
                valign: "middle",
                events: {
                    "click a": this.onActionClick.bind(this)
                },
                visible: !this._config.columns?.hidden?.includes("actions")
            }

        ];

        return this._columns;
    }

    onActionClick(e, _, row) {
        const {action} = e.target.dataset;
        console.log("onActionClick", action);
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: false,
            multiSelection: false,
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            }
        };
    }

    render() {
        if (!this.clinicalAnalysis) {
            return "";
        }

        return html`
            <div class="interpretation-grid">
                <h3>Interpretations</h3>
                <table id="${this.gridId}"></table>
                <h3>History</h3>
            </div>
        `;
    }
}

customElements.define("interpretation-grid", InterpretationGrid);
