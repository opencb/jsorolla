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
import UtilsNew from "../../utilsNew.js";
import "../variant/opencga-variant-filter.js";
import "../commons/opencga-active-filters.js";
import "../loading-spinner.js";
import OpencgaCatalogUtils from "../../clients/opencga/opencga-catalog-utils.js";

export default class SampleVariantStatsBrowser extends LitElement {

    constructor() {
        super();

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
            sample: {
                type: Object
            },
            sampleId: {
                type: String
            },
            query: {
                type: Object
            },
            config: {
                type: Object
            },
            active: {
                type: Boolean
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.active = true;

        this.save = {};
        this.preparedQuery = {};
        this.loading = false;
        this.errorState = false;
        this.sampleVariantStats = null;
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if ((changedProperties.has("sample") || changedProperties.has("active")) && this.active) {
            this.sampleObserver();
        }

        if ((changedProperties.has("sampleId") || changedProperties.has("active")) && this.active) {
           this.sampleIdObserver();
        }

        if (changedProperties.has("query")) {
            this.queryObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }

        super.update(changedProperties);
    }

    sampleObserver() {
        console.log("this.sample", this.sample)
        if (this.sample?.qualityControl?.variantMetrics?.variantStats?.length) {

            console.error("old data model")
            this.selectVariantStats("ALL", this.sample.qualityControl.variantMetrics.variantStats[0]);
        }
        if (this.sample?.qualityControl?.variant?.variantStats?.length) {
            console.error("new data model")
            this.selectVariantStats("ALL", this.sample.qualityControl.variant.variantStats[0]);
        }
    }

    sampleIdObserver() {
        if (this.opencgaSession && this.sampleId && this.active) {
            this.opencgaSession.opencgaClient.samples().info(this.sampleId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.sample = response.getResult(0);
                    this.sampleObserver();
                })
                .catch(response => {
                    console.error("An error occurred fetching sample: ", response);
                });
        }
    }

    queryObserver() {
        if (this.query) {
            this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
            this.executedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
        }
        // this.requestUpdate();
    }

    onVariantFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    async onVariantFilterSearch(e) {
        this.query = {...e.detail.query};
        this.renderVariantStats();
    }

    onActiveFilterChange(e) {
        this.query = {study: this.opencgaSession.study.fqn, ...e.detail};
        this.preparedQuery = {...this.query};
        this.executedQuery = {...this.query};

        this.renderVariantStats();
        // this.requestUpdate();
    }

    onActiveFilterClear(e) {
        this.query = {study: this.opencgaSession.study.fqn};
        this.preparedQuery = {...this.query};
        this.executedQuery = {...this.query};

        this.renderVariantStats();
        // this.requestUpdate();
    }

    async renderVariantStats() {
        this.loading = true;
        this.errorState = false;
        await this.requestUpdate();

        this.opencgaSession.opencgaClient.variants().querySampleStats(this.sample?.id, {study: this.opencgaSession.study.fqn, ...this.query})
            .then(response => {
                this.sampleQcVariantStats = {
                    stats: response.responses[0].results[0],
                    query: this.query
                };
                // debugger
            })
            .catch(e => {
                console.log(e);
                this.sampleQcVariantStats = null;
                UtilsNew.notifyError(e);
            })
            .finally(() => {
                this.loading = false;
                this.requestUpdate();
            });
    }

    onSaveFieldChange(e) {
        switch (e.detail.param) {
            case "id":
                this.save.id = e.detail.value;
                break;
            case "description":
                this.save.description = e.detail.value;
                break;
        }
    }

    onSave(e) {
        let variantStats = {
            id: this.save.id,
            query: this.executedQuery || {},
            description: this.save.description || "",
            stats: this.sampleQcVariantStats.stats
        };

        if (!this.sample?.qualityControl?.variantMetrics) {
            this.sample.qualityControl["variantMetrics"] = {
                variantStats: [],
                signatures: []
            };
        }

        if (this.sample.qualityControl.variantMetrics.variantStats) {
            this.sample.qualityControl.variantMetrics.variantStats.push(variantStats);
        } else {
            this.sample.qualityControl.variantMetrics["variantStats"] = [variantStats];
        }

        this.opencgaSession.opencgaClient.samples().update(this.sample.id, {qualityControl: this.sample.qualityControl}, {study: this.opencgaSession.study.fqn})
            .then(restResponse => {
                console.log(restResponse);
                Swal.fire({
                    title: "Success",
                    icon: "success",
                    html: "Variant Stats saved successfully"
                });
            })
            .catch(restResponse => {
                console.error(restResponse);
            })
            .finally(() => {
                this.requestUpdate();
            });
    }

    getSaveConfig() {
        return {
            title: "Save",
            icon: "fas fa-save",
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: "Save",
            },
            display: {
                style: "margin: 0px 25px 0px 0px",
                mode: {
                    type: "modal",
                    title: "Save Variant Stats",
                    buttonClass: "btn btn-primary ripple",
                    disabled: !OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "WRITE_CLINICAL_ANALYSIS")
                },
                labelWidth: 3,
                labelAlign: "right",
                defaultValue: "",
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Filter ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add a filter ID",
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                placeholder: "Add a filter description",
                                rows: 2
                            }
                        }
                    ]
                }
            ]
        };
    }

    getDefaultConfig() {
        return {
            title: "Sample Variant Stats",
            icon: "fas fa-search",
            showTitle: true,
            titleClass: "",
            titleIcon: "fas fa-user",
            filter: {
                title: "Filter",
                searchButton: true,
                searchButtonText: "Run",
                activeFilters: {
                    alias: {
                        ct: "Consequence Types"
                    },
                    complexFields: ["genotype"],
                    hiddenFields: []
                },
                sections: [     // sections and subsections, structure and order is respected
                    {
                        title: "Filters",
                        collapsed: false,
                        fields: [
                            {
                                id: "file-quality",
                                title: "File Quality Filters",
                                tooltip: "VCF file based FILTER and QUAL filters",
                                showDepth: application.appConfig === "opencb"
                            },
                            {
                                id: "region",
                                title: "Genomic Location",
                                tooltip: tooltips.region
                            },
                            {
                                id: "feature",
                                title: "Feature IDs (gene, SNPs, ...)",
                                tooltip: tooltips.feature
                            },
                            {
                                id: "biotype",
                                title: "Gene Biotype",
                                biotypes: BIOTYPES,
                                tooltip: tooltips.biotype
                            },
                            {
                                id: "diseasePanels",
                                title: "Disease Panels",
                                tooltip: tooltips.diseasePanels
                            },
                            {
                                id: "type",
                                title: "Variant Type",
                                types: ["SNV", "INDEL", "CNV", "INSERTION", "DELETION"],
                                tooltip: tooltips.type
                            },
                            {
                                id: "consequenceTypeSelect",
                                title: "Consequence Type",
                                tooltip: tooltips.consequenceTypeSelect
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        id: "Example missense",
                        active: false,
                        query: {
                            ct: "missense_variant"
                        }
                    },
                    {
                        id: "INDEL LoF",
                        query: {
                            type: "INDEL",
                            ct: "lof",
                        }
                    }
                ],
                result: {
                    grid: {}
                },
                detail: {}
            }
        };
    }

    selectVariantStats(id, defaultQcVariantStats) {
        let qcVariantStats = this.sample.qualityControl.variantMetrics.variantStats.find(qcVariantStats => qcVariantStats.id === id);
        if (!qcVariantStats && defaultQcVariantStats) {
            qcVariantStats = defaultQcVariantStats;
        }

        if (qcVariantStats) {
            // set the selected query
            this.query = qcVariantStats.query ?? {};
            this.sampleQcVariantStats = {
                stats: qcVariantStats.stats,
                query: qcVariantStats.query ?? {},
                description: qcVariantStats.description
            };
        }
        this.requestUpdate();
    }

    renderQcVariantStatsSelectItem(qcVvariantStats) {
        return html`
            <div class="break-word" style="border-left: 2px solid #0c2f4c">
                <div style="font-weight: bold; margin: 5px 10px">${qcVvariantStats.id}</div>
                <div style="margin: 5px 10px">${qcVvariantStats.description}</div>
                <div class="help-block break-word" style="margin: 5px 10px;overflow-wrap: break-word;">
                    ${qcVvariantStats.query 
                        ? Object.entries(qcVvariantStats.query).map(([k, v]) => {
                            if (k !== "study") {
                                return html`<span class="break-word" style="overflow-wrap: break-word;"><span style="font-weight: bold">${k}:</span> ${UtilsNew.substring(v, 40)}</span><br>`;
                            } else {
                                if (Object.keys(qcVvariantStats.query).length === 1) {
                                    // No fitlers applied
                                    return html`<span></span>`;
                                }
                            }
                        })
                        : null
                    }
                </div>
            </div>
        `;
    }

    render() {
        if (!this.opencgaSession?.study) {
            return;
        }

        return html`
            ${this.sample && this._config.showTitle
                ? html`
                    <tool-header title="${this._config.title} - ${this.sample.id}" icon="${this._config.titleIcon}" class="${this._config.titleClass}"></tool-header>`
                : null
            }
            <div class="row">                
                <div class="col-md-2 left-menu">
                    <opencga-variant-filter .opencgaSession=${this.opencgaSession}
                                            .query="${this.query}"
                                            .cellbaseClient="${this.cellbaseClient}"
                                            .populationFrequencies="${this.populationFrequencies}"
                                            .consequenceTypes="${this.consequenceTypes}"
                                            .cohorts="${this.cohorts}"
                                            .searchButton="${true}"
                                            .config="${this._config.filter}"
                                            @queryChange="${this.onVariantFilterChange}"
                                            @querySearch="${this.onVariantFilterSearch}">
                    </opencga-variant-filter>
                </div>

                <div class="col-md-10">
                    <div class="btn-toolbar" role="toolbar" aria-label="toolbar" style="margin: 0px 5px 20px 0px">
                        <div class="pull-right" role="group">
                            <div class="btn-group" style="margin-right: 2px">
                                <button type="button" class="btn btn-primary ripple dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" 
                                            aria-expanded="false" title="Show saved variants" @click="${this.onLoad}">
                                    <span><i class="fas fa-folder-open icon-padding"></i>Load <span class="caret" style="padding-left: 5px"></span></span>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="${this._prefix}ResetMenu" style="width: 360px">
                                    <li style="padding: 3px 20px;"><b>Saved Variant Stats</b></li>
                                    ${this.sample?.qualityControl?.variantMetrics?.variantStats?.length > 0
                                        ? this.sample.qualityControl.variantMetrics.variantStats.map(qcVariantStat => html`
                                            <li>
                                                <a href="javascript:void(0);" data-id="${qcVariantStat.id}" @click="${e=> this.selectVariantStats(qcVariantStat.id)}">
                                                    ${this.renderQcVariantStatsSelectItem(qcVariantStat)}
                                                </a>
                                            </li>
                                        `)
                                        : html`<li style="padding: 3px 20px;" class="text-muted">No Variant Stats found</li>`
                                    }
                                </ul>
                            </div>
                            <div class="btn-group">
                                <data-form  .data=${this.save} 
                                            .config="${this.getSaveConfig()}" 
                                            @fieldChange="${e => this.onSaveFieldChange(e)}" 
                                            @submit="${this.onSave}">
                                </data-form>
                            </div>
                        </div>
                    </div>

                    <div>
                        <opencga-active-filters resource="VARIANT"
                                                .opencgaSession="${this.opencgaSession}"
                                                .defaultStudy="${this.opencgaSession.study.fqn}"
                                                .query="${this.preparedQuery}"
                                                .refresh="${this.executedQuery}"
                                                .alias="${this.activeFilterAlias}"
                                                .filters="${this._config.filter.examples}"
                                                .config="${this._config.filter.activeFilters}"
                                                @activeFilterChange="${this.onActiveFilterChange}"
                                                @activeFilterClear="${this.onActiveFilterClear}">
                        </opencga-active-filters>
                      
                        <div class="main-view">
                            ${this.loading
                                ? html`
                                    <div id="loading">
                                        <loading-spinner></loading-spinner>
                                    </div>`
                                : this.sampleQcVariantStats
                                    ? html`
                                        <div style="padding: 0px 15px">
                                            <sample-variant-stats-view  .sampleVariantStats="${this.sampleQcVariantStats}" 
                                                                        .query="${this.sampleQcVariantStats.query}"
                                                                        .description="${this.sampleQcVariantStats.description}">
                                            </sample-variant-stats-view>
                                        </div>`
                                    : this.errorState
                                        ? html`
                                            <div id="error" class="alert alert-danger" role="alert">
                                                ${this.errorState.messages.map( error => html`<p><b>${error.name}</b></p><p>${error.message}</p>`)}
                                            </div>`
                                        : html`
                                            <div class="alert alert-info" role="alert" style="margin: 0px 15px">
                                                <i class="fas fa-3x fa-info-circle align-middle"></i> Please select some filters on the left.
                                            </div>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("sample-variant-stats-browser", SampleVariantStatsBrowser);
