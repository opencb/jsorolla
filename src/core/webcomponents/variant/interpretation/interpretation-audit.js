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

class InterpretationAudit extends LitElement {

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
        this._prefix = "ia-" + UtilsNew.randomString(6);
        this.gridId = this._prefix + "int-audit";

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

        this.data = this.clinicalAnalysis.audit ?? []; //safe in case of empty object;
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: this.data,
            columns: this._initTableColumns(),
            // Set table properties, these are read from config property
            uniqueId: "id",
            gridContext: this,
            formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",
            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement)
        });
    }

    _initTableColumns() {
        this._columns = [
            {
                title: "ID",
                field: "id",
            },
            {
                title: "Author",
                field: "author"
            },
            {
                title: "Action",
                field: "action",
                formatter: methods => methods?.map(method => method.name).join("<br>")
            },
            {
                title: "Message",
                field: "message"
            },
            {
                title: "date",
                field: "date",
                formatter: date => UtilsNew.dateFormatter(date, "D MMM YYYY, h:mm:ss a")
            }
        ];

        return this._columns;
    }

    onActionClick(e, _, row) {
        const {action} = e.target.dataset;
        console.log("onActionClick", action);
    }

    getDefaultConfig() {
        return {}
    }

    render() {
        if (!this.clinicalAnalysis) {
            return "";
        }

        return html`
            ${this.clinicalAnalysis.audit?.length ? html`
                <div class="interpretation-audit">
                    <table id="${this.gridId}"></table>
                </div>` : html`
            <div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> No Audit available yet.</div>
            `}

            
        `;
    }
}

customElements.define("interpretation-audit", InterpretationAudit);
