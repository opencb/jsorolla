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
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../variant/variant-browser-filter.js";
import "../commons/opencga-active-filters.js";
import "../loading-spinner.js";

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
            settings: {
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
        this.sampleVariantStats = null;
        this._config = this.getDefaultConfig();
        this.consequenceTypes = SAMPLE_STATS_CONSEQUENCE_TYPES;
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

        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }

        super.update(changedProperties);
    }

    sampleObserver() {
        // TODO temp fix to support both Opencga 2.0.3 and Opencga 2.1.0-rc
        // if (this.sample?.qualityControl?.variantMetrics) {
        //     this._variantStatsPath = "variantMetrics";
        // } else if (this.sample?.qualityControl?.variant) {
        //     this._variantStatsPath = "variant";
        // } else {
        //     console.error("no path for variant stats defined");
        // }
        this._variantStatsPath = "variant";
        if (this.sample?.qualityControl?.["variant"]?.variantStats.length > 0) {
            this._variantStats = this.sample.qualityControl?.["variant"]?.variantStats[0];
            this.selectVariantStats("ALL", this._variantStats);
        }
    }

    sampleIdObserver() {
        if (this.opencgaSession && this.sampleId && this.active) {
            this.opencgaSession.opencgaClient.samples().info(this.sampleId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.sample = response.getResult(0);
                    // this.sampleObserver();
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
    }

    settingsObserver() {
        // merging misc 1st level props from settings and then delete useless prop `menu`
        this._config = {
            ...this.getDefaultConfig(),
            ...this.settings,
        };
        delete this._config?.menu;
        if (this.settings?.menu) {
            this._config.filter = UtilsNew.mergeFiltersAndDetails(this._config?.filter, this.settings);
        }
        this.requestUpdate();
    }

    onVariantFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onVariantFilterSearch(e) {
        this.query = {...e.detail.query};
        this.renderVariantStats();
    }

    onActiveFilterChange(e) {
        this.query = {study: this.opencgaSession.study.fqn, ...e.detail};
        this.preparedQuery = {...this.query};
        this.executedQuery = {...this.query};

        this.renderVariantStats();
    }

    onActiveFilterClear() {
        this.query = {study: this.opencgaSession.study.fqn};
        this.preparedQuery = {...this.query};
        this.executedQuery = {...this.query};

        this.renderVariantStats();
    }

    async renderVariantStats() {
        this.loading = true;
        this.requestUpdate();
        await this.updateComplete;

        this.opencgaSession.opencgaClient.variants().querySampleStats(this.sample?.id, {study: this.opencgaSession.study.fqn, ...this.query})
            .then(response => {
                this.sampleQcVariantStats = {
                    stats: response.responses[0].results[0],
                    query: this.query
                };
            })
            .catch(response => {
                this.sampleQcVariantStats = null;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
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

    onSave() {
        const variantStats = {
            id: this.save.id,
            query: this.executedQuery || {},
            description: this.save.description || "",
            stats: this.sampleQcVariantStats.stats
        };
        delete variantStats.stats.consequenceTypeCount["other"];
        delete variantStats.stats.biotypeCount["other"];
        delete variantStats.stats.biotypeCount["other_non_pseudo_gene"];

        if (!this.sample?.qualityControl?.[this._variantStatsPath]) {
            this.sample.qualityControl[this._variantStatsPath] = {
                variantStats: [],
                signatures: []
            };
        }

        if (this.sample.qualityControl[this._variantStatsPath].variantStats) {
            this.sample.qualityControl[this._variantStatsPath].variantStats.push(variantStats);
        } else {
            this.sample.qualityControl[this._variantStatsPath].variantStats = [variantStats];
        }

        this.opencgaSession.opencgaClient.samples().update(this.sample.id, {qualityControl: this.sample.qualityControl}, {study: this.opencgaSession.study.fqn})
            .then(restResponse => {
                console.log(restResponse);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Success",
                    message: "Variant Stats saved successfully"
                });
            })
            .catch(restResponse => {
                console.error(restResponse);
            })
            .finally(() => {
                this.requestUpdate();
            });
    }

    selectVariantStats(id, defaultQcVariantStats) {
        let qcVariantStats = this.sample.qualityControl[this._variantStatsPath].variantStats.find(qcVariantStats => qcVariantStats.id === id);
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
            <div class="text-break" style="border-left: 2px solid #0c2f4c">
                <div style="font-weight: bold; margin: 5px 10px">${qcVvariantStats.id}</div>
                <div style="margin: 5px 10px">${qcVvariantStats.description}</div>
                <div class="d-block text-secondary text-break" style="margin: 5px 10px;overflow-wrap: break-word;">
                    ${qcVvariantStats.query ? Object.entries(qcVvariantStats.query).map(([k, v]) => {
            if (k !== "study") {
                return html`<span class="text-break" style="overflow-wrap: break-word;"><span style="font-weight: bold">${k}:</span> ${UtilsNew.substring(v, 40)}</span><br>`;
            } else {
                if (Object.keys(qcVvariantStats.query).length === 1) {
                    // No fitlers applied
                    return html`<span></span>`;
                }
            }
        }) : null
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
            ${this.sample && this._config.showTitle ? html`
                <tool-header
                    title="${this._config.title} - ${this.sample.id}"
                    icon="${this._config.titleIcon}"
                    class="${this._config.titleClass}">
                </tool-header>
            ` : null}
            <div class="row">
                <div class="col-md-2 left-menu">
                    <div class="d-grid gap-2 mb-3 cy-search-button-wrapper">
                        <button type="button" class="btn btn-primary btn-block" @click="${() => this.renderVariantStats()}">
                            <i class="fa fa-arrow-circle-right" aria-hidden="true"></i>
                            <strong>${this._config.filter.searchButtonText || "Search"}</strong>
                        </button>
                    </div>
                    <variant-browser-filter
                        .opencgaSession="${this.opencgaSession}"
                        .query="${this.query}"
                        .cellbaseClient="${this.cellbaseClient}"
                        .populationFrequencies="${this.populationFrequencies}"
                        .consequenceTypes="${this.consequenceTypes}"
                        .cohorts="${this.cohorts}"
                        .searchButton="${true}"
                        .config="${this._config.filter}"
                        @queryChange="${this.onVariantFilterChange}"
                        @querySearch="${this.onVariantFilterSearch}">
                    </variant-browser-filter>
                </div>

                <div class="col-md-10">
                    <div class="btn-toolbar justify-content-end mb-3" role="toolbar" aria-label="toolbar">
                        <div class="dropdown btn-group me-1">
                            <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false" title="Show saved variants" @click="${this.onLoad}">
                                <span><i class="fas fa-folder-open pe-1"></i>Load</span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="${this._prefix}ResetMenu" style="width: 260px">
                                <li class="py-1 px-3"><b>Saved Variant Stats</b></li>
                                ${
                                    this.sample?.qualityControl?.[this._variantStatsPath]?.variantStats?.length > 0 ?
                                        this.sample.qualityControl[this._variantStatsPath].variantStats.map(
                                        qcVariantStat => html`
                                        <li>
                                            <a class="dropdown-item" href="javascript:void(0);" data-id="${qcVariantStat.id}"
                                                @click="${() => this.selectVariantStats(qcVariantStat.id)}">
                                                ${this.renderQcVariantStatsSelectItem(qcVariantStat)}
                                            </a>
                                        </li>`) :
                                    html`<li class="py-1 px-3 form-text" >No Variant Stats found</li>`
                                }
                            </ul>
                        </div>
                        <div class="btn-group">
                            <data-form
                                .data=${this.save}
                                .config="${this.getSaveConfig()}"
                                @fieldChange="${e => this.onSaveFieldChange(e)}"
                                @submit="${this.onSave}">
                            </data-form>
                        </div>

                    </div>
                    <div>
                        <opencga-active-filters
                            resource="VARIANT"
                            .opencgaSession="${this.opencgaSession}"
                            .defaultStudy="${this.opencgaSession.study.fqn}"
                            .query="${this.preparedQuery}"
                            .executedQuery="${this.executedQuery}"
                            .alias="${this.activeFilterAlias}"
                            .filters="${this._config.filter.examples}"
                            .config="${this._config.filter.activeFilters}"
                            @activeFilterChange="${this.onActiveFilterChange}"
                            @activeFilterClear="${this.onActiveFilterClear}">
                        </opencga-active-filters>

                        <div class="main-view">
                            ${this.loading ? html`
                                <div id="loading">
                                    <loading-spinner></loading-spinner>
                                </div>
                            ` : html`
                                ${this.sampleQcVariantStats ? html`
                                    <div class="py-0 px-3">
                                        <sample-variant-stats-view
                                            .sampleVariantStats="${this.sampleQcVariantStats}"
                                            .query="${this.sampleQcVariantStats.query}"
                                            .description="${this.sampleQcVariantStats.description}">
                                        </sample-variant-stats-view>
                                    </div>
                                ` : html`
                                    <div class="alert alert-info my-0 mx-3" role="alert">
                                        <i class="fas fa-3x fa-info-circle align-middle"></i>
                                            Please select some filters on the left.
                                    </div>
                                `}
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getSaveConfig() {
        return {
            title: "",
            icon: "fas fa-save",
            mode: "modal",
            type: "form",
            buttons: {
                show: false,
                cancelText: "Cancel",
                okText: "Save"
            },
            display: {
                style: "margin: 0px 25px 0px 0px",
                modalTitle: "Save Variant Stats",
                modalButtonIcon: "fas fa-save",
                modalButtonClassName: "btn btn-primary",
                modalDisabled: !OpencgaCatalogUtils.getStudyEffectivePermission(
                    this.opencgaSession.study,
                    this.opencgaSession.user.id,
                    "WRITE_CLINICAL_ANALYSIS",
                    this.opencgaSession?.organization?.configuration?.optimizations?.simplifyPermissions),
                labelWidth: 3,
                labelAlign: "right",
                defaultValue: "",
                defaultLayout: "horizontal",
                modalSize: "modal-lg"
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Filter ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add a filter ID"
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
            showTitle: false,
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
                    complexFields: [
                        {id: "genotype", separator: ";"},
                    ],
                    hiddenFields: []
                },
                sections: [ // sections and subsections, structure and order is respected
                    {
                        title: "Filters",
                        collapsed: false,
                        filters: [
                            {
                                id: "variant-file-sample-filter",
                                title: "File Quality Filters",
                                tooltip: "VCF file based FILTER and QUAL filters",
                            },
                            {
                                id: "region",
                                title: "Genomic Location",
                                tooltip: tooltips.region
                            },
                            // {
                            //     id: "feature",
                            //     title: "Feature IDs (gene, SNPs, ...)",
                            //     tooltip: tooltips.feature
                            // },
                            {
                                id: "biotype",
                                title: "Gene Biotype",
                                biotypes: SAMPLE_STATS_BIOTYPES,
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
                                id: "consequence-type",
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
                            ct: "lof"
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

}

customElements.define("sample-variant-stats-browser", SampleVariantStatsBrowser);
