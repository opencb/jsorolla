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
            /*query: { //TODO is that supposed to be used to define the BAM file
                type: Object
            },*/
            panelIds: {
                type: Object
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
        this.file = "SonsAlignedBamFile.bam";
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
        console.log("selectGene", e)
        this.geneIds = e.detail.value.split(",");
        this.fetchData(this.geneIds);
        this.requestUpdate();
    }

    onClickPill(e) {
        // e.preventDefault();
        this._changeView(e.currentTarget.dataset.id);
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
        await this.requestUpdate();
        this.opencgaSession.opencgaClient.alignments().statsCoverage(this.file, geneIds, {study: this.opencgaSession.study.fqn})
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
                            name: "Details",
                            active: true,
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
                <h3>Select a gene</h3>
                <div class="row">
                    <div class="col-md-6">
                        <feature-filter .cellbaseClient="${this.cellbaseClient}" @filterChange="${this.selectGene}"></feature-filter>
                
                        <disease-filter .opencgaSession="${this.opencgaSession}" .config="${this.config}" 
                                        @filterChange="${e => this.onFilterChange("panel", e.detail.value)}">
                        </disease-filter>
                    </div>
                    
                    <div class="col-md-12">
                        ${this.loading ? html`
                            <div id="loading">
                                <loading-spinner></loading-spinner>
                            </div>
                        ` : this.stats ? html`
                            <div class="btn-group content-pills" role="toolbar" aria-label="toolbar">
                                <div class="btn-group" role="group">
                                    ${this.geneIds && this.geneIds.length ? this.geneIds.map( id => html`
                                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab[id]})}" @click="${this.onClickPill}" data-id="${id}">
                                            <i class="fa fa-table icon-padding" aria-hidden="true"></i> ${id}
                                        </button>
                                    `) : null}
                                </div>
                            </div>
                            ${this.stats.map(geneCoverageStat => html`
                                <div id="${geneCoverageStat.geneName}" class="content-tab ${classMap({active: this.activeTab[geneCoverageStat.geneName]})}">
                                    <h3>Gene Coverage ${geneCoverageStat.geneName} </h3>
                                    <gene-coverage-grid .opencgaSession="${this.opencgaSession}"
                                                    .config="${this._config?.filter?.grid}"
                                                    .stats="${geneCoverageStat.stats}"
                                                    @selectrow="${e => this.onClickRow(e, geneCoverageStat.geneName)}">
                                    </gene-coverage-grid>
                                    <gene-coverage-detail .transcriptCoverageStat="${this.transcriptCoverageDetail?.[geneCoverageStat.geneName]}" .config="${this._config.filter.detail}" .opencgaSession="${this.opencgaSession}"></gene-coverage-detail>
                                </div>
                        `)}` : null}
                    </div>
                </div>`
            : null;
    }

}

customElements.define("gene-coverage-browser", GeneCoverageBrowser);
