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
import {classMap} from "/web_modules/lit-html/directives/class-map.js";
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

    async clinicalAnalysisObserver() {
        if (this.clinicalAnalysis) {
            if (this.clinicalAnalysis.interpretation) {
                this.interpretations = [
                    {...this.clinicalAnalysis.interpretation, primary: true},
                    ...this.clinicalAnalysis.secondaryInterpretations];
            }
            await this.requestUpdate();
            this.renderHistoryTable();
        } else {

        }
    }

    renderInterpretation(interpretation) {
        return html`
            <div class="interpretation-wrapper ${classMap({primary: interpretation.primary})}">
                <div class="header">
                    <div>${interpretation.primary ? html`<span class="badge badge-dark-blue">Primary</span>` : html`<span class="badge badge-light">Secondary</span>`}</div>
                    <span class="id">${interpretation.id}</span>
                    ${interpretation.version ? html`<span class="version">version ${interpretation.version}</span>` : null}
                    
                    
                    <span class="analyst" title="Analyst"><i class="fa fa-user-circle icon-padding" aria-hidden="true"></i>${interpretation?.analyst?.name ?? "-"}</span>
                    <span class="modificationDate" title="Modification date"><i class="far fa-calendar-alt"></i> ${moment(interpretation?.attributes?.modificationDate).format("MM/DD/YYYY")}</span>
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
                                    <a href="javascript: void 0" class="btn disabled force-text-left" data-action="history" @click="${this.onActionClick}">
                                        <i class="fas fa-code-branch icon-padding" aria-hidden="true"></i> Restore previous version
                                    </a>
                                </li>
                            ` : html`
                                <li>
                                    <a href="javascript: void 0" class="btn force-text-left" data-action="setprimary" @click="${this.onActionClick}">
                                        <i class="fas fa-map-marker icon-padding" aria-hidden="true"></i> Set as primary
                                    </a>
                                </li>
                                <li>
                                    <a href="javascript: void 0" class="btn force-text-left" data-action="merge" @click="${this.onActionClick}">
                                        <i class="far fa-object-group icon-padding" aria-hidden="true"></i> Merge
                                    </a>
                                </li>
                            `}
                            
                            <li role="separator" class="divider"></li>
                            <li>
                                <a href="javascript: void 0" class="btn force-text-left" data-action="clear" @click="${this.onActionClick}">
                                    <i class="fas fa-eraser icon-padding" aria-hidden="true"></i> Clear 
                                </a>
                            </li>
                            ${!interpretation.primary ? html`
                                <li>
                                    <a href="javascript: void 0" class="btn disabled force-text-left" data-action="delete" @click="${this.onActionClick}">
                                        <i class="fas fa-trash icon-padding" aria-hidden="true"></i> Delete</a>
                                </li>` : null}
                        </ul>
                    </div>
                
                
            </div>`;

    }

    renderHistoryTable() {

        this.data = [];
        if (this.clinicalAnalysis?.interpretation) {
            const versionCnt = this.clinicalAnalysis.interpretation.version;
            this.data = [...Array(versionCnt - 1).keys()].map( num => ({...this.clinicalAnalysis.interpretation, version: num+1})).reverse()
        }
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: this.data,
            columns: this._initTableColumns(),
            uniqueId: "id",
            gridContext: this,
            sidePagination: "local",
            formatNoMatches: () => "No previous versions",
            formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",
            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            ajax: params => {
                params.error();
                /*let _filters = {
                    study: this.opencgaSession.study.fqn,
                    include: "id,description,comment",
                    id:"CA-2.1"
                };
                this.opencgaSession.opencgaClient.clinical().searchInterpretation(_filters)
                    .then(res => {
                        console.log(res)
                        params.success(res)
                    })
                    .catch(e => {
                        console.error(e);
                        params.error(e);
                    });*/
            },
            /*responseHandler: response => {
                const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                return result.response;
            },*/
            // onPageChange: (page, size) => {
            //     const result = this.gridCommons.onPageChange(page, size);
            //     //this.from = result.from || this.from;
            //     //this.to = result.to || this.to;
            // },
            // onPostBody: data => {
            //     // We call onLoadSuccess to select first row
            //     //this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            // }
        });
    }

    _initTableColumns() {
        this._columns = [
            {
                title: "ID",
                field: "id"
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
                                <li>
                                    <a href="javascript: void 0" class="btn disabled force-text-left" data-action="restore">
                                        <i class="fas fa-code-branch icon-padding" aria-hidden="true"></i> Restore this version
                                    </a>
                                </li>
                                <li>
                                    <a href="javascript: void 0" class="btn force-text-left" data-action="compare">
                                        <i class="far fa-object-group icon-padding" aria-hidden="true"></i> Compare
                                    </a>
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
            title: "",
            icon: "",
            display: {
                collapsable: true,
                showTitle: false,
                labelWidth: 2,
                defaultValue: "-"
            },
            sections: [
                {
                    title: "Primary Interpretation",
                    display: {
                        // width: 10,
                        collapsed: false
                    },
                    elements: [
                        {
                            name: "ID",
                            field: "id",
                            formatter: (id, interpretation) => id + (interpretation.primary ? " <span class='badge badge-info'>Primary</span>" : "")
                        },
                        {
                            name: "Description",
                            field: "description"
                        },
                        {
                            name: "Methods",
                            field: "methods",
                            type: "custom",
                            display: {
                                render: methods => methods?.map(method => method.name).join("<br>")
                            }
                        },
                        {
                            name: "Primary Findings",
                            field: "primaryFindings",
                            type: "custom",
                            display: {
                                render: primaryFindings => primaryFindings?.map(primaryFinding => primaryFinding.id).join(", ")
                            }
                        },
                        {
                            name: "Comments",
                            field: "comments"
                        },
                        {
                            name: "Creation Date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: creationDate => UtilsNew.dateFormatter(creationDate, "D MMM YYYY, h:mm:ss a")
                            }
                        },
                        {
                            name: "Status",
                            field: "internal.status.name"
                        },
                        {
                            name: "Version",
                            field: "version"
                        }
                    ]
                }
            ]
        };
    }

    render() {
        if (!this.clinicalAnalysis) {
            return "";
        }

        return html`
            <div class="interpretation-grid">
                ${this.interpretations?.length ? html`
                    <h3>Interpretations</h3>
                    <div class="row">
                        <div class="col-md-8">
                            ${this.interpretations.map(interpretation => this.renderInterpretation(interpretation))}
                        </div>
                    </div>
                   
                    <h3>Main Interpretation History</h3>
                    <table id="${this.gridId}"></table>
                ` : html`
                    <div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> No interpretation available yet.</div>`
                } 
                </div>
            `;
    }
}

customElements.define("interpretation-grid", InterpretationGrid);
