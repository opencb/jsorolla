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

import {LitElement, html, nothing} from "lit";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import UtilsNew from "../../core/utils-new.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../variant/variant-browser-filter.js";
import "../loading-spinner.js";

export default class SampleVariantStatsBrowser extends LitElement {

    constructor() {
        super();

        this.#init();
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

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.active = true;

        this.save = {};
        this.searchActive = true;
        this.preparedQuery = {};
        this.executedQuery = {};
        this.sampleQcVariantStats = null;

        this._variantStatsPath = "variant";
        this._config = this.getDefaultConfig();
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
        if (this.sample?.qualityControl?.[this._variantStatsPath]?.variantStats.length > 0) {
            this.sampleQcVariantStats = this.sample.qualityControl?.[this._variantStatsPath]?.variantStats[0];
        }
    }

    sampleIdObserver() {
        if (this.opencgaSession && this.sampleId && this.active) {
            this.opencgaSession.opencgaClient.samples()
                .info(this.sampleId, {
                    study: this.opencgaSession.study.fqn
                })
                .then(response => {
                    this.sample = response.getResult(0);
                })
                .catch(response => {
                    console.error("An error occurred fetching sample: ", response);
                });
        }
    }

    queryObserver() {
        if (this.query) {
            this.preparedQuery = {...this.query};
            this.executedQuery = {...this.query};
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
    }

    onFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onFilterSearch(e) {
        this.preparedQuery = {...e.detail.query};
        this.executedQuery = {...e.detail.query};
        this.fetchVariantStats();
    }

    onFilterClear() {
        this.preparedQuery = {};
        this.executedQuery = {};
        this.fetchVariantStats();
    }

    fetchVariantStats() {
        this.searchActive = false;
        this.requestUpdate();

        this.opencgaSession.opencgaClient.variants()
            .querySampleStats(this.sample?.id, {
                study: this.opencgaSession.study.fqn,
                ...this.executedQuery
            })
            .then(response => {
                this.sampleQcVariantStats = {
                    stats: response.responses[0].results[0],
                    query: this.executedQuery
                };
            })
            .catch(response => {
                this.sampleQcVariantStats = null;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            })
            .finally(() => {
                this.searchActive = true;
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
            id: this.querySelector(`#${this._prefix}SaveFilterID`).value || "",
            description: this.querySelector(`#${this._prefix}SaveDescription`).value || "",
            query: this.sampleQcVariantStats.query,
            stats: this.sampleQcVariantStats.stats,
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

        // insert the variants stats in the sample quality control
        this.sample.qualityControl[this._variantStatsPath].variantStats.push(variantStats);

        this.opencgaSession.opencgaClient.samples()
            .update(this.sample.id, {qualityControl: this.sample.qualityControl}, {
                study: this.opencgaSession.study.fqn,
            })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Success",
                    message: "Variant Stats saved successfully"
                });
                this.querySelector(`#${this._prefix}SaveFilterID`).value = "";
                this.querySelector(`#${this._prefix}SaveDescription`).value = "";
                // Josemi NOTE: this is a terrible and temporal fix to force closing the Save Menu
                // when user clicks the 'Save' button in the Save menu.
                this.querySelector(`div#${this._prefix}Save div.dropdown-menu`)?.classList?.toggle?.("show");
                this.requestUpdate();
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                console.error(response);
            });
    }

    selectVariantStats(id) {
        const qcVariantStats = this.sample.qualityControl[this._variantStatsPath].variantStats.find(qcVariantStats => qcVariantStats.id === id);

        if (qcVariantStats) {
            this.preparedQuery = qcVariantStats.query;
            this.executedQuery = qcVariantStats.query;
            this.sampleQcVariantStats = {
                id: qcVariantStats.id,
                stats: qcVariantStats.stats,
                query: qcVariantStats.query ?? {},
                description: qcVariantStats.description
            };
        }
        this.requestUpdate();
    }

    renderAvailableVariantStats() {
        if (this.sample?.qualityControl?.[this._variantStatsPath]?.variantStats?.length > 0) {
            return this.sample.qualityControl[this._variantStatsPath].variantStats.map(qcVariantStat => {
                const active = this.sampleQcVariantStats?.id === qcVariantStat.id;
                return html`
                    <a class="d-block dropdown-item ${active ? "active" : "cursor-pointer"}" @click="${() => this.selectVariantStats(qcVariantStat.id)}">
                        <div class="fw-bold">${qcVariantStat.id}</div>
                    </a>
                `;
            });
        }
        // No variant stats available
        return html`
            <div class="text-secondary">No variant stats available</div>
        `;
    }

    render() {
        if (!this.opencgaSession?.study || !this.sample) {
            return nothing;
        }

        // this is to enable/disable the save stats button
        const hasQueryToSave = Object.keys(this.sampleQcVariantStats?.query || {}).length > 0 && !!this.sampleQcVariantStats?.stats;

        return html`
            ${this.sample && this._config.showTitle ? html`
                <tool-header
                    title="${this._config.title} - ${this.sample.id}"
                    class="${this._config.titleClass}">
                </tool-header>
            ` : null}
            <div class="d-flex justify-content-end gap-2 mb-3">
                <div class="dropdown">
                    <button class="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">
                        <span><i class="fas fa-folder-open pe-1"></i> Load Stats</span>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end">
                        <div class="dropdown-header fw-bold">Saved Variant Stats</div>
                        ${this.renderAvailableVariantStats()}
                    </div>
                </div>
                <div class="dropdown" id="${this._prefix}Save">
                    <button class="btn ${hasQueryToSave ? "btn-primary" : "btn-light disabled"} dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                        <span><i class="fas fa-save pe-1"></i> Save Stats</span>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end shadow" style="width:320px;">
                        <div class="my-1 mx-2">
                            <div class="mb-1">
                                <label for="${this._prefix}SaveFilterID" class="form-label small mb-0">Filter ID</label>
                                <input type="text" id="${this._prefix}SaveFilterID" class="form-control" placeholder="Add a filter ID" />
                            </div>
                            <div class="mb-2">
                                <label for="${this._prefix}SaveDescription" class="form-label small mb-0">Description</label>
                                <textarea id="${this._prefix}SaveDescription" class="form-control" rows="3" placeholder="Add a description..."></textarea>
                            </div>
                            <div class="d-flex align-items-center justify-content-end mt-2">
                                <button class="btn btn-primary ${hasQueryToSave ? "" : "disabled"}" @click="${() => this.onSave()}">
                                    <i class="fas fa-save pe-1"></i> Save Stats
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="">
                <variant-browser-filter
                    .resource="${"VARIANT"}"
                    .toolId="${this.COMPONENT_ID || ""}"
                    .opencgaSession=${this.opencgaSession}
                    .preparedQuery="${this.preparedQuery}"
                    .executedQuery="${this.executedQuery}"
                    .searchActive="${this.searchActive || false}"
                    .config="${this._config.filter}"
                    @queryChange="${this.onFilterChange}"
                    @querySearch="${this.onFilterSearch}"
                    @queryClear="${this.onFilterClear}">
                </variant-browser-filter>

                <div class="main-view">
                    ${!this.searchActive ? html`
                        <div id="loading">
                            <loading-spinner></loading-spinner>
                        </div>
                    ` : html`
                        ${this.sampleQcVariantStats ? html`
                            <sample-variant-stats-view
                                .sampleVariantStats="${this.sampleQcVariantStats}"
                                .query="${this.sampleQcVariantStats.query}"
                                .description="${this.sampleQcVariantStats.description}">
                            </sample-variant-stats-view>
                        </div>
                        ` : html`
                            <div class="alert alert-info" role="alert">
                                <i class="fas fa-info-circle"></i> Please select some filters to see variant stats.
                            </div>
                        `}
                    `}
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
            showTitle: false,
            filter: {
                searchButton: true,
                searchButtonText: "Run",
                searchButtonIcon: "fa fa-arrow-circle-right",
                activeFilters: {
                    alias: {
                        ct: "Consequence Types"
                    },
                    complexFields: [
                        {id: "genotype", separator: ";"},
                    ],
                    hiddenFields: []
                },
                sections: [
                    {
                        title: "Filters",
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
                examples: [],
            },
        };
    }

}

customElements.define("sample-variant-stats-browser", SampleVariantStatsBrowser);
