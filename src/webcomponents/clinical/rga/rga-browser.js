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
import UtilsNew from "../../../core/utils-new.js";
import {guardPage} from "../../commons/html-utils.js";
import "../../commons/opencga-active-filters.js";
import "../../loading-spinner.js";
import "../../commons/tool-header.js";
import "./rga-gene-view.js";
import "./rga-filter.js";
import "./rga-individual-view.js";
import "./rga-variant-view.js";
import "../../commons/opencb-grid-toolbar.js";

export default class RgaBrowser extends LitElement {

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
            query: {
                type: Object
            },
            config: {
                type: Object
            },
            settings: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "rga" + UtilsNew.randomString(6);
        this.query = {};
        this.preparedQuery = {};
        this.executedQuery = {};
        this.activeFilterAlias = {
        };
        this.activeTab = {"variant-tab": true};
        this.detail = {};
        this.resource = "RGA";

        // LoF as defaultQuery
        this.defaultQuery = {
            /* consequenceType: "transcript_ablation,splice_acceptor_variant,splice_donor_variant,stop_gained,frameshift_variant,stop_lost,start_lost,transcript_amplification,inframe_insertion,inframe_deletion",
            geneName: ["GRIK5", "ACTN3", "COMT", "TTN", "ABCA12", "ALMS1", "ALOX12B", "ATP8A2", "BLM",
                "CCNO", "CEP290", "CNGB3", "CUL7", "DNAAF1", "DOCK6", "EIF2B5", "ERCC6", "FLG", "HADA",
                "INPP5K", "MANIB1", "MERTK", "MUTYH", "NDUFAF5", "NDUFS7", "OTOG", "PAH", "PDZD7", "PHYH",
                "PKHD1", "PMM2", "RARS2", "SACS", "SGCA", "SIGMAR1", "SPG7", "TTN", "TYR", "USH2A", "WFS1"].join(","),
            // individualId: "118000206" // 118000208 is not a proband, 118000206 is a proband
            individualId: "210010274", // no case
            // knockoutType: "COMP_HET"*/
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
        $(".bootstrap-select", this).selectpicker();
        UtilsNew.initTooltip(this);
    }

    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        super.update(changedProperties);
    }

    settingsObserver() {
        if (!this.opencgaSession) {
            return;
        }
        // merge filters
        this._config = {...this.getDefaultConfig(), ...this.config};
        // TODO only filter configuration is supported at the moment (no columns nor details)
        // filter list, canned filters
        if (this.settings?.menu) {
            this._config.filter = UtilsNew.mergeFiltersAndDetails(this._config?.filter, this.settings);
        }
        this.requestUpdate();
    }

    opencgaSessionObserver() {
        if (this?.opencgaSession?.study?.fqn) {
            this.query = {study: this.opencgaSession.study.fqn, ...this.defaultQuery};
            this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.defaultQuery};
            // this.requestUpdate().then(() => $(".bootstrap-select", this).selectpicker());
        }
    }

    queryObserver() {
        if (this?.opencgaSession?.study?.fqn) {
            // NOTE UtilsNew.objectCompare avoid repeating remote requests.
            if (this.forceQuery || !UtilsNew.objectCompare(this.query, this._query)) {
                this._query = this.query;
                if (this.query) {
                    this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
                    this.executedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
                } else {
                    this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.defaultQuery};
                    this.executedQuery = {study: this.opencgaSession.study.fqn, ...this.defaultQuery};
                }
                // onServerFilterChange() in opencga-active-filters fires an activeFilterChange event when the Filter dropdown is used
                this.dispatchEvent(new CustomEvent("queryChange", {
                    detail: this.preparedQuery
                }
                ));
                this.detail = {};
            } else {
                // console.error("same queries")
            }
            this.forceQuery = false;
            // this.requestUpdate();
        }
    }

    notifySearch(query) {
        this.dispatchEvent(new CustomEvent("querySearch", {
            detail: {
                query: query
            },
            bubbles: true,
            composed: true
        }));
    }

    async onRun() {
        // NOTE notifySearch() triggers this chain: notifySearch -> onQueryFilterSearch() on iva-app.js -> this.queries updated -> queryObserver() here in rga-browser
        // queryObserver() here stops the repetition of the remote request by checking if it has changed
        this.query = {...this.preparedQuery};
        // forceQuery is meant to force a new search on click on Search, even if the query hasn't changed
        this.forceQuery = true;
        // updates this.queries in iva-app
        this.notifySearch(this.preparedQuery);
    }

    onClickPill(e) {
        this._changeView(e.currentTarget.dataset.tabId);
    }

    _changeView(tabId) {
        $(".content-pills", this).removeClass("active");
        $(".content-tab", this).removeClass("active");
        for (const tab in this.activeTab) {
            if (Object.prototype.hasOwnProperty.call(this.activeTab, tab)) {
                this.activeTab[tab] = false;
            }
        }
        $(`button.content-pills[data-id=${tabId}]`, this).addClass("active");
        $("#" + tabId, this).addClass("active");
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    onFilterChange(e) {
        this.query = e.detail;
    }

    onQueryFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onActiveFilterChange(e) {
        this.preparedQuery = {study: this.opencgaSession.study.fqn, ...e.detail};
        this.query = {study: this.opencgaSession.study.fqn, ...e.detail};
    }

    onActiveFilterClear() {
        console.log("onActiveFilterClear");
        this.query = {study: this.opencgaSession.study.fqn};
        this.preparedQuery = {...this.query};
    }

    getDefaultConfig() {
        // return BrowserConf.config;
        return {
            title: "Recessive Variant Browser",
            icon: "fas fa-dna",
            active: false,
            searchButtonText: "Search",
            consequenceTypes: [
                "frameshift_variant",
                "incomplete_terminal_codon_variant",
                "inframe_deletion",
                "inframe_insertion",
                "missense_variant",
                "start_lost",
                "stop_gained",
                "stop_lost",
                "splice_acceptor_variant",
                "splice_donor_variant",
                "feature_truncation",
                "transcript_ablation"
            ],
            views: [
                {
                    id: "variant-tab",
                    name: "Variants",
                    icon: "fas fa-table"
                },
                {
                    id: "individual-tab",
                    name: "Individuals",
                    icon: "fas fa-table"
                },
                {
                    id: "gene-tab",
                    name: "Genes",
                    icon: "fa fa-table",
                    active: true
                }
            ],
            filter: {
                title: "Filter",
                activeFilters: {
                    alias: {
                        // Example:
                        // "region": "Region",
                        // "gene": "Gene",
                        "ct": "Consequence Types"
                    },
                    complexFields: [],
                    hiddenFields: []
                },
                sections: [ // sections and subsections, structure and order is respected
                    {
                        title: "Gene",
                        collapsed: false,
                        filters: [
                            {
                                id: "geneName",
                                name: "Gene",
                                tooltip: "Gene selection"
                            },
                            {
                                id: "knockoutType",
                                name: "Knockout Type",
                                allowedValues: [{id: "COMP_HET", name: "Compound Heterozygous"}, {id: "HOM_ALT", name: "Homozygous"}]
                            }
                        ]
                    },
                    {
                        title: "Individual",
                        collapsed: false,
                        filters: [
                            {
                                id: "individualId",
                                name: "Individual",
                                tooltip: "Individual selection"
                            }
                        ]
                    },
                    {
                        title: "Confidence",
                        filters: [
                            {
                                id: "numParents",
                                name: "Include families with",
                                tooltip: "Confidence selection",
                                type: "checkbox",
                                allowedValues: [{id: 0, name: "No parents"}, {id: 1, name: "One parent"}, {id: 2, name: "Two parents"}]
                            }
                            /* {
                                id: "probandOnly",
                                name: "Affected individuals (proband) only",
                                type: "boolean",
                                defaultValue: "no",
                                tooltip: "other info here"
                                // allowedValues: ["father", "mother"]
                            }*/
                        ]
                    },
                    {
                        title: "Variants",
                        filters: [
                            /* {
                                id: "cohort",
                                name: "Cohort",
                                tooltip: "Cohort selection"
                            },*/
                            {
                                id: "variants",
                                name: "Variant Id",
                                placeholder: "13:32906644:-:T,13:32912753:AC:-"
                            },
                            /* {
                                id: "region",
                                name: "Genomic Location",
                                tooltip: tooltips.region
                            },*/
                            {
                                id: "populationFrequency",
                                name: "Select Population Frequency",
                                onlyPopFreqAll: true
                            },
                            {
                                id: "type",
                                name: "Variant types",
                                types: ["SNV", "INDEL", "INSERTION", "DELETION"],
                                tooltip: tooltips.type
                                // layout: "horizontal"
                            },
                            {
                                id: "consequenceType",
                                name: "Consequence type",
                                tooltip: tooltips.consequenceTypeSelect,
                                value: CONSEQUENCE_TYPES.lof
                            },
                            {
                                id: "clinicalSignificance",
                                name: "Clinical Significance",
                            }
                        ]
                    }
                ],
                examples: []
            }
        };
    }

    render() {

        if (!this?.opencgaSession?.study?.fqn) {
            return guardPage();
        }

        if (this.opencgaSession.study?.attributes?.RGA?.status !== "INDEXED") {
            return guardPage(`Study ${this?.opencgaSession?.study.name} is not enabled to Recessive Variant Analysis.`);
        }

        return html`
            <style>
                .rga-individual-box {
                    border: 1px solid #8a8a8a;
                    width: 12px;
                    height: 16px;
                    display: inline-block;
                    margin-right: 1px;
                }

            </style>
            <tool-header title="${this._config.title}" icon="${this._config.icon}"></tool-header>
            <div class="row">
                <div class="col-md-2">
                    <div class="d-grid gap-2 mb-3 cy-search-button-wrapper">
                        <button type="button" class="btn btn-primary" @click="${this.onRun}">
                            <i class="fa fa-arrow-circle-right" aria-hidden="true"></i> ${this._config.searchButtonText || "Run"}
                        </button>
                    </div>
                    <ul class="nav nav-tabs mb-3" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" href="#filters_tab" aria-controls="profile" role="tab"
                                data-bs-target="#filters_tab"
                                data-bs-toggle="tab">
                                Filters
                            </button>
                        </li>
                    </ul>

                    <div class="tab-content">
                        <div class="tab-pane fade show active" role="tabpanel" id="filters_tab">
                            <rga-filter
                                .opencgaSession="${this.opencgaSession}"
                                .cellbaseClient="${this.cellbaseClient}"
                                .config="${this._config.filter}"
                                .query="${this.query}"
                                .searchButton="${false}"
                                @queryChange="${this.onQueryFilterChange}">
                            </rga-filter>
                        </div>

                    </div>
                </div>

                <div class="col-md-10">
                    <!-- tabs buttons -->
                    <div class="content-pills mb-3" role="toolbar" aria-label="toolbar">
                        ${this._config.views && this._config.views.length ? this._config.views.map(tab => html`
                            <button type="button" class="btn btn-success ${this.activeTab[tab.id] ? "active" : ""}" ?disabled=${tab.disabled} @click="${this.onClickPill}" data-tab-id="${tab.id}">
                                <i class="${tab.icon ?? "fa fa-table"} pe-1" aria-hidden="true"></i> ${tab.name}
                            </button>
                        `) : html`No view has been configured`}
                    </div>

                    <div>
                        <opencga-active-filters
                            .resource="${this.resource}"
                            .opencgaSession="${this.opencgaSession}"
                            .defaultStudy="${this.opencgaSession?.study?.fqn}"
                            .query="${this.preparedQuery}"
                            .executedQuery="${this.executedQuery}"
                            .alias="${this.activeFilterAlias}"
                            .config="${this._config.activeFilters}"
                            .filters="${this._config.filter.examples}"
                            @activeFilterChange="${this.onActiveFilterChange}"
                            @activeFilterClear="${this.onActiveFilterClear}">
                        </opencga-active-filters>

                        <div class="main-view">
                            <div id="gene-tab" class="content-tab">
                                <rga-gene-view
                                    .query=${this.executedQuery}
                                    .config=${this._config}
                                    .opencgaSession="${this.opencgaSession}"
                                    .active="${this.activeTab["gene-tab"]}">
                                </rga-gene-view>
                            </div>

                            <div id="individual-tab" class="content-tab">
                                <rga-individual-view
                                    .query=${this.executedQuery}
                                    .config=${this._config}
                                    .opencgaSession="${this.opencgaSession}"
                                    .active="${this.activeTab["individual-tab"]}">
                                </rga-individual-view>
                            </div>

                            <div id="variant-tab" class="content-tab active">
                                <rga-variant-view
                                    .query=${this.executedQuery}
                                    .config=${this._config}
                                    .opencgaSession="${this.opencgaSession}"
                                    .cellbaseClient=${this.cellbaseClient}
                                    .active="${this.activeTab["variant-tab"]}">
                                </rga-variant-view>
                            </div>
                        </div>

                        <div class="v-space"></div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("rga-browser", RgaBrowser);
