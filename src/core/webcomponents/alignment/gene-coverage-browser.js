/**
 * Copyright 2015-2019 OpenCB
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
import UtilsNew from "../../utilsNew.js";
import "../commons/opencga-browser.js";
import "./gene-coverage-detail.js";
import "./gene-coverage-grid.js";


export default class GeneCoverageBrowser extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            file: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "gcb" + UtilsNew.randomString(6);
        this.checkProjects = false;
        this.query = {};
        this.errorState = false;
        this.activeTab = {};
        this.loading = false;
        this.transcriptCoverageDetail = {};
        this.geneIds = [];
        // this.file = "SonsAlignedBamFile.bam";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    onClickRow(e, geneId) {
        console.log("clickrow",e,geneId)
        this.transcriptCoverageDetail[geneId] = e.detail.row;
        this.transcriptCoverageDetail = {...this.transcriptCoverageDetail};
        this.requestUpdate();
    }

    selectGene(e) {
        this.selectedGene = e.detail.value;
        //TODO this.geneIds is initialized, yet here is undefined
        this.geneIds = [...this.geneIds, e.detail.value];
        this.requestUpdate();
        this.fetchData(this.geneIds);
    }

    onClickPill(e) {
        // e.preventDefault();
        this._changeView(e.currentTarget.dataset.id);
    }

    removeGene(e) {
        console.log("remove gene", e.currentTarget.dataset.id);
    }

    _changeView(tabId) {
        $(".content-pills", this).removeClass("active");
        $(".content-tab", this).removeClass("active");
        for (const tab in this.activeTab) this.activeTab[tab] = false;
        $(`button.content-pills[data-id=${tabId}]`, this).addClass("active");
        $("#" + tabId, this).addClass("active");
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    async fetchData(geneIds) {
        this.loading = true;
        //debugger
        await this.requestUpdate();
        this.opencgaSession.opencgaClient.alignments().statsCoverage(this.file, geneIds.join(","), {study: this.opencgaSession.study.fqn})
            .then( restResponse => {
                if(restResponse.getResults().length > 0) {
                    this.stats = restResponse.getResults();
                    this.activeTab[this.stats[0].geneName] = true;
                } else {
                    this.stats = [];
                }
            })
            .catch( e => console.error(e))
            .finally( () => {
                this.loading = false;
                this.requestUpdate();
            })
    }

    onRun() {
        //this.geneIds = ["BRCA2"];
        //this.fetchData(this.geneIds[0]);
        console.log("run! run!", this.geneIds)
        this.requestUpdate();
    }

    getGeneFilterConfig() {
        return {
            title: "QC Summary",
            icon: "",
            type: "form",
            buttons: {
                show: true,
                okText: "Confirm"
            },
            display: {
                labelWidth: 3,
                defaultValue: "-",
                defaultLayout: "horizontal"
            },
            sections: [
                {
                    title: "",
                    elements: [
                        {
                            name: "Select Gene",
                            type: "custom",
                            display: {
                                width: "9",
                                render: () => {
                                    return html`<feature-filter .cellbaseClient="${this.cellbaseClient}" .config=${{addButton: false}} @filterChange="${this.selectGene}"></feature-filter>`;
                                }
                            }
                        },
                        {
                            name: "Select Disease Panel Gene",
                            type: "custom",
                            display: {
                                render: () => {
                                    return html`
                                        <disease-filter .opencgaSession="${this.opencgaSession}" 
                                                        .diseasePanels="${this.opencgaSession.study.panels}" 
                                                        mode="gene"
                                                        .config="${this.config}" 
                                                        @filterChange="${this.selectGene}">
                                        </disease-filter>`
                                }
                            }
                        },
                        {
                            name: "Select Gene by Disease",
                            type: "custom",
                            display: {
                                width: "9",
                                visible: false,
                                render: () => {
                                    const config = {
                                        dataSource: (query, process) => {
                                            this.cellbaseClient.get("feature", "gene", null, "search", {limit: 10, "annotation.disease.id": "^" + query.toUpperCase()}, {})
                                                .then(restResponse => {
                                                    process(restResponse.response[0].result.map( item => ({
                                                        name: item.id,
                                                        //disease: "annotation.disease.id"
                                                    })));
                                                });
                                        }
                                    }
                                    return html`<select-field-filter-autocomplete .config=${config} @filterChange="${this.selectGene}"></select-field-filter-autocomplete>`;
                                }
                            }
                        },
                    ]
                }
            ]
        }
    }

    getDefaultConfig() {
        return {
            title: "Gene Coverage Browser",
            icon: "fas fa-chart-bar",
            description: "",
            filter: {
                detail: {
                    title: "Transcript",
                    showTitle: true,
                    items: [
                        {
                            id: "transcript-detail",
                            name: "Overview",
                            active: true,
                            render: (transcriptCoverageStat, active, opencgaSession) => {
                                return html`<gene-coverage-view .transcript="${transcriptCoverageStat}"></gene-coverage-view>`;
                            }
                        },
                        {
                            id: "transcript-detail",
                            name: "Low Coverage Regions",
                            render: (transcriptCoverageStat, active, opencgaSession) => {
                                return html`<gene-coverage-view .transcript="${transcriptCoverageStat}"></gene-coverage-view>`;
                            }
                        }
                    ]
                }
            }
        };
    }

    render() {
        return this._config
            ? html`
                <style>
                    
                    .coverage-table-close {
                        margin-left: 10px;
                    }
                </style>
                
                <div class="row">
                    <div class="col-md-10">
                        <h3>Select a gene</h3>
                        <div style="padding-left: 15px">
                            <data-form .data="${{}}" .config="${this.getGeneFilterConfig()}" @submit="${this.onRun}"></data-form>
                        </div>
                    </div>

                    <div class="col-md-12">
                        <h3>Gene Coverage</h3>
                        ${this.loading ? html`
                            <div id="loading">
                                <loading-spinner></loading-spinner>
                            </div>
                        ` : this.stats ? html`
                            <div class="btn-group content-pills" role="toolbar" aria-label="toolbar">
                                <div class="btn-group" role="group">
                                    ${this.geneIds && this.geneIds.length ? this.geneIds.map( id => html`
                                        <div class="btn-group">
                                            <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab[id]})}" @click="${this.onClickPill}" data-id="${id}">
                                                <i class="fa fa-table icon-padding" aria-hidden="true"></i> ${id} 
                                                <span class="coverage-table-close close" data-id="${id}" @click="${this.removeGene}"><i class="fa fa-times-circle"></i></span>
                                            </button>
                                        </div>
                                    `) : null}
                                </div>
                            </div>
                            ${this.stats.map(geneCoverageStat => html`
                                <div id="${geneCoverageStat.geneName}" class="content-tab ${classMap({active: this.activeTab[geneCoverageStat.geneName]})}">
                                    <gene-coverage-grid .opencgaSession="${this.opencgaSession}"
                                                    .config="${this._config?.filter?.grid}"
                                                    .stats="${geneCoverageStat.stats}"
                                                    @selectrow="${e => this.onClickRow(e, geneCoverageStat.geneName)}">
                                    </gene-coverage-grid>
                                    <gene-coverage-detail .transcriptCoverageStat="${this.transcriptCoverageDetail?.[geneCoverageStat.geneName]}" .config="${this._config.filter.detail}" .opencgaSession="${this.opencgaSession}"></gene-coverage-detail>
                                </div>
                        `)}` : html`<div class="alert alert-info" role="alert"><i class="fas fa-3x fa-info-circle align-middle"></i> Select a Gene. </div>`}
                    </div>
                </div>`
            : null;
    }

}

customElements.define("gene-coverage-browser", GeneCoverageBrowser);
