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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import {classMap} from "lit/directives/class-map.js";
import "./gene-coverage-detail.js";
import "./gene-coverage-grid.js";
import "./gene-coverage-view.js";

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
            fileId: {
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
        this.transcriptCoverageStatsMap = {};
        this.geneIds = [];
        // this.fileId = "SonsAlignedBamFile.bam";
        this.geneCoverageStats = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("file")) {
            this.fileObserver();
        }
    }

    fileObserver() {
        if (!this.fileId) {
            this.errorState = "BAM file not available.";
        } else {
            this.errorState = false;
        }
    }

    selectGene(e) {
        this.selectedGene = e.detail.value.split(",");
        // TODO this.geneIds is initialized, yet here is undefined

        console.log("e.detail.value", e.detail.value);
        console.log("this.selectedGene", this.selectedGene);
        if (this.geneIds) {
            this.geneIds = [...this.geneIds, ...this.selectedGene];
            this.geneIds = [...new Set(this.geneIds)];
        } else {
            this.geneIds = [...new Set(this.selectedGene)];
        }
        console.log("this.selectedGene", this.selectedGene);
        console.log("this.geneIds", this.geneIds);

        this.requestUpdate();
        //this.fetchData(this.selectedGene);
    }

    onClickPill(e) {
        // e.preventDefault();
        this._changeView(e.currentTarget.dataset.id);
    }

    _changeView(tabId) {
        console.log("changing to ", tabId)
        $(`.${this._prefix}gene-coverage-browser .content-pills`, this).removeClass("active");
        $(`.${this._prefix}gene-coverage-browser .content-tab`, this).removeClass("active");
        for (const tab in this.activeTab) this.activeTab[tab] = false;
        $(`.${this._prefix}gene-coverage-browser button.content-pills[data-id=${tabId}]`, this).addClass("active");
        $("#" + tabId, this).addClass("active");
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    async fetchData(geneId) {
        if (this.geneCoverageStats[geneId]) {
            console.warn("gene", geneId, "already fetched");
            return;
        }
        this.loading = true;
        this.requestUpdate();
        await this.updateComplete;
        this.opencgaSession.opencgaClient.alignments().statsCoverage(this.fileId, geneId, {study: this.opencgaSession.study.fqn})
            .then(restResponse => {
                this.geneCoverageStats[geneId] = restResponse.getResult(0);
                this.geneCoverageStats = {...this.geneCoverageStats};
                this._changeView(geneId);
            })
            .catch(restResponse => {
                if (restResponse.getEvents("ERROR").length) {
                    this.errorState = restResponse.getEvents("ERROR").map(error => error.message).join("<br>");
                } else {
                    this.errorState = "Error fetching data";
                }
                console.error("fetchData failed");
                console.error(restResponse);
            })
            .finally(() => {
                this.loading = false;
                this.requestUpdate();
            });
    }

    onRun() {
        // this.selectedGene is always an array of size 1
        this.fetchData(this.selectedGene[0]);
        console.log(this.geneIds, "this.selectedGene", this.selectedGene);
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
                                    return html`
                                        <feature-filter
                                            .cellbaseClient="${this.cellbaseClient}"
                                            .config="${{multiple: false}}"
                                            @filterChange="${e => this.selectGene(e)}">
                                        </feature-filter>`;
                                }
                            }
                        },
                        {
                            name: "Select Disease Panel Gene",
                            type: "custom",
                            display: {
                                render: () => {
                                    return html`
                                        <disease-panel-filter
                                            .opencgaSession="${this.opencgaSession}"
                                            .diseasePanels="${this.opencgaSession.study.panels}"
                                            mode="gene"
                                            .config="${this.config}"
                                            @filterChange="${e => this.selectGene(e)}">
                                        </disease-panel-filter>`;
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
                                            this.cellbaseClient.get("feature", "gene", null, "search", {"limit": 10, "annotation.disease.id": "~^" + query.toUpperCase()}, {})
                                                .then(restResponse => {
                                                    process(restResponse.response[0].result.map(item => ({
                                                        name: item.id,
                                                        //disease: "annotation.disease.id"
                                                    })));
                                                });
                                        }
                                    };
                                    return html`
                                        <select-field-filter-autocomplete
                                            .config=${config} @filterChange="${e => this.selectGene(e)}">
                                        </select-field-filter-autocomplete>`;
                                }
                            }
                        },
                        {
                            name: "Selected gene",
                            type: "custom",
                            display: {
                                render: () => html`<div class="text">${this.selectedGene?.length ? this.selectedGene?.[0] : "No gene selected"}</div>`
                            }
                        }
                    ]
                }
            ]
        };
    }

    removeGene(e) {
        //console.log("remove gene", e.currentTarget.dataset.id);
        //console.log("this.geneCoverageStats", this.geneCoverageStats)
        delete this.geneCoverageStats[e.currentTarget.dataset.id];
        //console.log("this.geneCoverageStats", this.geneCoverageStats)
        this.geneCoverageStats = {...this.geneCoverageStats};
        const geneIds = Object.keys(this.geneCoverageStats);
        if (geneIds.length > 0) {
            console.log("changing view to ", geneIds[0]);
            this._changeView(geneIds[0]);
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
                            id: "overview",
                            name: "Overview",
                            active: true,
                            render: (transcriptCoverageStats, active, opencgaSession) => {
                                return html`
                                    <transcript-coverage-view
                                        .transcriptCoverageStats="${transcriptCoverageStats}">
                                    </transcript-coverage-view>`;
                            }
                        },
                        {
                            id: "low-coverage",
                            name: "Low Coverage Regions",
                            render: (transcriptCoverageStats, active, opencgaSession) => {
                                return html`
                                    <transcript-coverage-low
                                        .transcriptCoverageStats="${transcriptCoverageStats}">
                                    </transcript-coverage-low>`;
                            }
                        }
                    ]
                }
            }
        };
    }

    render() {
        if (this._config && this.fileId) {
            return html`
                <div class="row">
                    <div class="col-md-12 mb-3">
                        <div>
                            <h3>Select a gene</h3>
                            <hr class="mt-0 text-body-secondary"/>
                        </div>
                        <div>
                            <data-form
                                .data=${{}}
                                .config="${this.getGeneFilterConfig()}"
                                @submit="${e => this.onRun(e)}">
                            </data-form>
                        </div>
                    </div>
                    <div class="col-md-12 ${this._prefix}gene-coverage-browser">
                        ${this.loading ? html`
                            <div id="loading">
                                <loading-spinner></loading-spinner>
                            </div>
                        ` : !UtilsNew.isEmpty(this.geneCoverageStats) ? html`
                            <div>
                                <h3>Gene Coverage</h3>
                            </div>
                            <div class="btn-group content-pills" role="toolbar" aria-label="toolbar">
                                <div class="btn-group pull-left" role="group">
                                    ${Object.entries(this.geneCoverageStats).map(([geneId, _]) => html`
                                        <div class="btn-group">
                                            <button type="button" class="btn btn-success content-pills ${classMap({active: this.activeTab[geneId]})}" @click="${this.onClickPill}" data-id="${geneId}">
                                                <i class="fa fa-table pe-1" aria-hidden="true"></i> ${geneId}
                                                <span class="ms-3 close" data-id="${geneId}" @click="${this.removeGene}"><i class="fa fa-times-circle"></i></span>
                                            </button>
                                        </div>
                                    `)}
                                </div>
                            </div>
                            <div class="content-tab-wrapper">
                                ${Object.entries(this.geneCoverageStats).map(([geneId, geneCoverageStat]) => html`
                                    <div id="${geneId}" class="content-tab ${classMap({active: this.activeTab[geneId]})}">
                                        <gene-coverage-view
                                            .config=${this._config}
                                            .geneCoverageStats="${geneCoverageStat}"
                                            .opencgaSession="${this.opencgaSession}">
                                        </gene-coverage-view>
                                    </div>
                                `)}
                            </div>
                            ` : this.errorState ? html`
                                <div id="error" class="alert alert-danger" role="alert">
                                    ${this.errorState}
                                </div>
                                ` : html`<div class="alert alert-info" role="alert"><i class="fas fa-3x fa-info-circle align-middle"></i> Select a Gene. </div>`
                            }
                    </div>
                </div>`;
        } else {
            return html`
                <div id="error" class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> No BAM file available.</div>
            `;
        }
    }

}

customElements.define("gene-coverage-browser", GeneCoverageBrowser);
