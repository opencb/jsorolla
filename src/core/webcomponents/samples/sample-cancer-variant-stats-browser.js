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

import {html, LitElement} from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
import OpencgaCatalogUtils from "../../clients/opencga/opencga-catalog-utils.js";
import "./sample-cancer-variant-stats-plots.js";
import "../variant/opencga-variant-filter.js";
import "../commons/opencga-active-filters.js";
import "../commons/view/signature-view.js";
import "../commons/filters/caveman-caller-filter.js";
import "../commons/filters/strelka-caller-filter.js";
import "../commons/filters/pindel-caller-filter.js";
import "../commons/filters/ascat-caller-filter.js";
import "../commons/filters/canvas-caller-filter.js";
import "../commons/filters/brass-caller-filter.js";
import "../commons/filters/manta-caller-filter.js";
import "../loading-spinner.js";

export default class SampleCancerVariantStatsBrowser extends LitElement {

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
            sampleId: {
                type: String
            },
            sample: {
                type: Object
            },
            query: {
                type: Object
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = UtilsNew.randomString(8);

        this.save = {};
        this.settings = {
            density: "MEDIUM",
            format: "SVG"
        };

        this.queries = {};
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }

        if (changedProperties.has("sample")) {
            this.sampleObserver();
        }

        if (changedProperties.has("query")) {
            this.queryObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    queryObserver() {
        if (this.query) {
            this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
            this.executedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
        }
        this.requestUpdate();
    }

    sampleIdObserver() {
        if (this.opencgaSession && this.sampleId) {
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

    sampleObserver() {
        if (this.opencgaSession && this.sample) {
            // let vcfIds = this.sample.fileIds?.filter(fileId => fileId.endsWith(".vcf") || fileId.endsWith(".vcf.gz")).join(",");
            this.opencgaSession.opencgaClient.files().search({sampleIds: this.sample.id, study: this.opencgaSession.study.fqn})
                .then(fileResponse => {
                    this.files = fileResponse.response[0].results;

                    // Prepare a map from caller to File
                    this.callerToFile = {};
                    for (let file of this.files) {
                        if (file.software?.name) {
                            let softwareName = file.software.name.toLowerCase();
                            this.callerToFile[softwareName] = file;
                        }
                    }
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching sample: ", response);
                });
        }
    }

    onVariantFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onVariantFilterSearch(e) {
        this.preparedQuery = e.detail.query;
        this.executedQuery = e.detail.query;

        this._queries = {};
        let types = ["SNV", "INDEL", "CNV", "REARRANGEMENT"];
        for (let type of types) {
            if (this.queries[type]) {
                this._queries[type] = {
                    fileData: ""
                };
                for (let caller of Object.keys(this.queries[type])) {
                    if (this.callerToFile[caller]) {
                        let fileId = this.callerToFile[caller].name;
                        let fileFilter = this.queries[type][caller];
                        // this._queries[type].fileData += fileId + ":" + fileFilter;
                        let fileData = fileId + ":" + fileFilter;
                        this._queries[type].fileData += this._queries[type].fileData ? "," + fileData : fileData
                    }
                }
            }
        }
        debugger

        this.requestUpdate();
    }

    onActiveFilterChange(e) {
        this.query = {study: this.opencgaSession.study.fqn, ...e.detail};
        // this.requestUpdate();
    }

    onActiveFilterClear() {
        this.query = {study: this.opencgaSession.study.fqn};
        // this.requestUpdate();
    }

    onFilterIdChange(e) {
        this.filterId = e.currentTarget.value;
    }

    onFilterDescriptionChange(e) {
        this.filterDescription = e.currentTarget.value;
    }

    onSettingsFieldChange(e) {
        switch (e.detail.param) {
            case "density":
                this.settings.id = e.detail.value;
                break;
            case "format":
                this.settings.format = e.detail.value;
                break;
        }
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

    onClear(e) {
    }

    onSettingsOk(e) {
    }

    /**
     * Prepare sampleVariantStats data for the onSave function.
     * @param e
     */
    onChangeAggregationStatsResults(e) {
        // Parse aggregationStatsResults and create a sampleVariantStats
        let aggregationStatsResults = e.detail.aggregationStatsResults;
        if (aggregationStatsResults) {
            this.sampleVariantStats = {
                id: this.sample.id
            };
            for (let aggregatedResult of aggregationStatsResults) {
                let values = {};
                for (let bucket of aggregatedResult.buckets) {
                    values[bucket.value] = bucket.count;
                }
                switch (aggregatedResult.name) {
                    case "chromosome":
                        this.sampleVariantStats.variantCount = aggregatedResult.count;
                        this.sampleVariantStats.chromosomeCount = values;
                        break;
                    case "genotype":
                        this.sampleVariantStats.genotypeCount = values;
                        break;
                    case "type":
                        this.sampleVariantStats.typeCount = values;
                        break;
                    case "biotype":
                        this.sampleVariantStats.biotypeCount = values;
                        break;
                    case "consequenceType":
                        this.sampleVariantStats.consequenceTypeCount = values;
                        break;
                }
            }
        }
    }

    /**
     * Save signature for onSave function.
     * @param e
     */
    onChangeSignature(e) {
        this.signature = e.detail.signature;
    }

    onSave(e) {
        // Search bamFile for the sample
        // let bamFile = this.clinicalAnalysis.files.find(file => file.format === "BAM" && file.samples.some(sample => sample.id === this.sample.id));
        let bamFileId = this.sample.fileIds.find(fileId => fileId.endsWith(".bam"));
        let variantStats = {
            id: this.save.id,
            query: this.executedQuery || {},
            description: this.save.description || "",
            stats: this.sampleVariantStats
        };

        // Check if a metric object for that bamFileId exists
        let metric = this.sample?.qualityControl?.metrics.find(metric => metric.bamFileId === bamFileId);
        if (metric) {
            // Push the stats and signature in the existing metric object
            metric.variantStats.push(variantStats);
            metric.signatures.push(this.signature);
        } else {
            // create a new metric
            metric = {
                bamFileId: bamFileId,
                variantStats: [variantStats],
                signatures: [this.signature]
            }
            // Check if this is the first metric object
            if (this.sample?.qualityControl?.metrics) {
                this.sample.qualityControl.metrics.push(metric);
            } else {
                this.sample["qualityControl"] = {
                    metrics: [metric]
                };
            }
        }

        this.opencgaSession.opencgaClient.samples().update(this.sample.id, {qualityControl: this.sample.qualityControl}, {study: this.opencgaSession.study.fqn})
            .then( restResponse => {
                console.log(restResponse);
            })
            .catch( restResponse => {
                console.error(restResponse);
            })
            .finally( () => {
                this.requestUpdate();
            })
    }

    getSettingsConfig() {
        return {
            title: "Settings",
            icon: "fas fa-cog",
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: "OK",
            },
            display: {
                style: "margin: 0px 25px 0px 0px",
                mode: {
                    type: "modal",
                    title: "Display Settings",
                    buttonClass: "btn btn-default ripple"
                },
                labelWidth: 4,
                labelAlign: "right",
                defaultValue: "",
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    title: "Circos",
                    elements: [
                        {
                            name: "Rain Plot Density",
                            field: "density",
                            type: "select",
                            allowedValues: ["LOW", "MEDIUM", "HIGH"],
                            defaultValue: "LOW",
                            display: {
                            }
                        },
                        {
                            name: "Image format",
                            field: "format",
                            type: "select",
                            allowedValues: ["PNG", "SVG"],
                            defaultValue: ["PNG"],
                            display: {
                            }
                        },
                    ]
                }
            ]
        }
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
                    buttonClass: "btn btn-default ripple"
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
        }
    }

    onFilterChange(type, caller, value) {
        if (value) {
            if (!this.queries[type]) {
                this.queries[type] = {};
            }
            this.queries[type][caller] = Object.entries(value.detail.value).map(([k, v]) => k + v).join(";");
        } else {
            delete this.queries[type][caller];
        }
    }

    getDefaultConfig() {
        return {
            title: "Cancer Variant Plots",
            icon: "fas fa-search",
            searchButtonText: "Search",
            showTitle: true,
            titleClass: "",
            titleIcon: "fas fa-user",
            filter: {
                title: "Filter",
                activeFilters: {
                    alias: {
                        ct: "Consequence Types"
                    },
                    complexFields: ["genotype"],
                    hiddenFields: []
                },
                sections: [     // sections and subsections, structure and order is respected
                    {
                        title: "Genomic Filters",
                        collapsed: false,
                        fields: [
                            // {
                            //     id: "file-quality",
                            //     title: "Quality Filter",
                            //     tooltip: "VCF file based FILTER and QUAL filters",
                            //     showDepth: application.appConfig === "opencb"
                            // },
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
                                biotypes: biotypes,
                                tooltip: tooltips.biotype
                            },
                            {
                                id: "consequenceTypeSelect",
                                title: "Select SO terms",
                                tooltip: tooltips.consequenceTypeSelect
                            }
                        ]
                    },
                    {
                        title: "SNV Filters",
                        collapsed: false,
                        fields: [
                            {
                                id: "caveman-caller",
                                title: "Caveman",
                                render: (eventHandler, query) => html`<caveman-caller-filter @filterChange="${e => this.onFilterChange("SNV", "caveman", e)}"></caveman-caller-filter>`,
                                visible: () => this.callerToFile
                                    ? typeof this.callerToFile["caveman"] !== "undefined" || this.callerToFile["caveman"] != null
                                    : false
                            },
                            {
                                id: "strelka-caller",
                                title: "Strelka",
                                render: (eventHandler, query) => html`<strelka-caller-filter @filterChange="${e => this.onFilterChange("SNV", "strelka", e)}"></strelka-caller-filter>`,
                                visible: () => this.callerToFile
                                    ? typeof this.callerToFile["strelka"] !== "undefined" || this.callerToFile["strelka"] != null
                                    : false
                            },
                        ]
                    },
                    {
                        title: "INDEL Filters",
                        collapsed: true,
                        fields: [
                            {
                                id: "pindel-caller",
                                title: "Pindel",
                                render: (eventHandler, query) => html`<pindel-caller-filter @filterChange="${e => this.onFilterChange("INDEL", "pindel", e)}"></pindel-caller-filter>`,
                                visible: () => this.callerToFile
                                    ? typeof this.callerToFile["pindel"] !== "undefined" || this.callerToFile["pindel"] != null
                                    : false
                            },
                            {
                                id: "strelka-caller",
                                title: "Strelka",
                                render: (eventHandler, query) => html`<strelka-caller-filter @filterChange="${e => this.onFilterChange("INDEL", "strelka", e)}"></strelka-caller-filter>`,
                                visible: () => this.callerToFile
                                    ? typeof this.callerToFile["strelka"] !== "undefined" || this.callerToFile["strelka"] != null
                                    : false
                            },
                        ]
                    },
                    {
                        title: "CNV Filters",
                        collapsed: true,
                        fields: [
                            {
                                id: "ascat-caller",
                                title: "Ascat",
                                render: (eventHandler, query) => html`<ascat-caller-filter @filterChange="${e => this.onFilterChange("CNV", "ascat", e)}"></ascat-caller-filter>`,
                                visible: () => this.callerToFile
                                    ? typeof this.callerToFile["ascat"] !== "undefined" || this.callerToFile["ascat"] != null
                                    : false
                            },
                            {
                                id: "canvas-caller",
                                title: "Canvas",
                                render: (eventHandler, query) => html`<canvas-caller-filter @filterChange="${e => this.onFilterChange("CNV", "canvas", e)}"></canvas-caller-filter>`,
                                visible:() => this.callerToFile
                                    ? typeof this.callerToFile["canvas"] !== "undefined" || this.callerToFile["canvas"] != null
                                    : false
                            },
                        ]
                    },
                    {
                        title: "Rearrangement Filters",
                        collapsed: true,
                        fields: [
                            {
                                id: "brass-caller",
                                title: "Brass",
                                render: (eventHandler, query) => html`<brass-caller-filter @filterChange="${e => this.onFilterChange("REARRANGEMENT", "brass", e)}"></brass-caller-filter>`,
                                visible: () => this.callerToFile
                                    ? typeof this.callerToFile["brass"] !== "undefined" || this.callerToFile["brass"] != null
                                    : false
                            },
                            {
                                id: "manta-caller",
                                title: "Manta",
                                render: (eventHandler, query) => html`<manta-caller-filter @filterChange="${e => this.onFilterChange("REARRANGEMENT", "manta", e)}"></manta-caller-filter>`,
                                visible: () => this.callerToFile
                                    ? typeof this.callerToFile["manta"] !== "undefined" || this.callerToFile["manta"] != null
                                    : false
                            },
                        ]
                    }
                ],
                examples: [
                    {
                        id: "Example Missense PASS",
                        active: false,
                        query: {
                            filter: "PASS",
                            ct: "lof,missense_variant"
                        }
                    },
                ],
                result: {
                    grid: {}
                },
                detail: {
                }
            }
        }
    }

    render() {
        if (!this.opencgaSession) {
            return;
        }

        return html`
            ${this.sample && this._config.showTitle
                ? html`<tool-header title="${this._config.title} - ${this.sample.id}" icon="${this._config.titleIcon}" class="${this._config.titleClass}"></tool-header>`
                : null
            }
            <div class="row">
                <div class="col-md-3 left-menu">
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

                <div class="col-md-9">
                    ${OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "WRITE_CLINICAL_ANALYSIS") ? html`
                        <div>
                            <div class="btn-toolbar" role="toolbar" aria-label="toolbar" style="margin-bottom: 20px">
                                <div class="pull-right" role="group">
                                    <data-form  .data=${this.settings} 
                                                .config="${this.getSettingsConfig()}" 
                                                @fieldChange="${e => this.onSettingsFieldChange(e)}" 
                                                @submit="${this.onSettingsOk}">
                                    </data-form>
                                    <data-form  .data=${this.save} 
                                                .config="${this.getSaveConfig()}" 
                                                @fieldChange="${e => this.onSaveFieldChange(e)}" 
                                                @submit="${this.onSave}">
                                    </data-form>
                                </div>
                            </div>
                        </div>
                    ` : null}
                    
                    <div id="${this._prefix}MainContent">    
                        <div id="${this._prefix}ActiveFilters">
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
                        </div>

                        <div class="main-view">
                            ${this.executedQuery 
                                ? html`
                                    <div class="" style="padding: 0px 15px">
                                        <sample-cancer-variant-stats-plots      .opencgaSession="${this.opencgaSession}"
                                                                                .query="${this.executedQuery}"
                                                                                .queries="${this._queries}"
                                                                                .sampleId="${this.sample?.id}"
                                                                                .active="${this.active}"
                                                                                @changeSignature="${this.onChangeSignature}"
                                                                                @changeAggregationStatsResults="${this.onChangeAggregationStatsResults}">
                                        </sample-cancer-variant-stats-plots>
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

customElements.define("sample-cancer-variant-stats-browser", SampleCancerVariantStatsBrowser);
