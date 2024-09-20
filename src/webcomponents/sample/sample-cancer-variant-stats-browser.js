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
import NotificationUtils from "../commons/utils/notification-utils.js";
import UtilsNew from "../../core/utils-new.js";
import "./sample-cancer-variant-stats-plots.js";
import "../variant/variant-browser-filter.js";
import "../commons/opencga-active-filters.js";
import "../commons/view/signature-view.js";
import "../commons/filters/variant-caller-info-filter.js";
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
            cellbaseClient: {
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
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.save = {};
        this.settings = {
            density: "MEDIUM",
            format: "SVG"
        };

        this.callers = [
            "CAVEMAN",
            "PINDEL",
            "ASCAT",
            "BRASS",
        ];
        this.files = [];
        this.filesByCaller = {};

        // Nacho (08/11/2023): commented as part of the fix TASK-5244
        // this.query = {
        //     region: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,X,Y",
        // };
        this.query = null;

        this.queries = {};
        this.circosPlot = null;
        this.circosConfig = {};
        this.signature = {};
        this.deletionAggregationStatsPlot = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
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

        super.update(changedProperties);
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
            this.opencgaSession.opencgaClient.files().search({sampleIds: this.sample.id, format: "VCF", study: this.opencgaSession.study.fqn})
                .then(fileResponse => {
                    this.files = fileResponse.response[0].results;

                    // Assign each file to the specified caller
                    this.filesByCaller = {};
                    this.callers.forEach(callerName => {
                        this.filesByCaller[callerName] = this.files.filter(file => {
                            return (file?.software?.name || "").toUpperCase() === callerName;
                        });
                    });

                    // Prepare a map from caller to File
                    this.callerToFile = {};
                    for (const file of this.files) {
                        if (file.software?.name) {
                            const softwareName = file.software.name.toLowerCase();
                            this.callerToFile[softwareName] = file;
                        }
                    }

                    // Update query with default fileData from callers config
                    if (this.opencgaSession?.study?.internal?.configuration?.clinical?.interpretation?.variantCallers?.length > 0) {
                        const callersConfig = this.opencgaSession.study.internal.configuration.clinical.interpretation.variantCallers
                            .filter(vc => vc.somatic)
                            .filter(vc => this.callers.includes(vc.id.toUpperCase()));

                        const fileDataFilters = [];
                        callersConfig.forEach(vc => {
                            const filtersWithDefaultValues = vc.dataFilters
                                .filter(filter => !filter.source || filter.source === "FILE")
                                .filter(filter => !!filter.defaultValue)
                                .map(filter => {
                                    // Notice that defaultValue includes the comparator, eg. =, >, ...
                                    return filter.id + (filter.id !== "FILTER" ? filter.defaultValue : "=PASS");
                                });

                            // Only add this file to the filter if we have at least one default value
                            if (filtersWithDefaultValues.length > 0) {
                                // We need to find the file for that caller
                                const fileId = this.files.find(file => file.software.name === vc.id)?.name;
                                if (fileId) {
                                    fileDataFilters.push(fileId + ":" + filtersWithDefaultValues.join(";"));
                                }
                            }
                        });

                        // Update query with default 'fileData' parameters
                        this.query = {
                            region: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,X,Y",
                            ...this.query,
                            fileData: fileDataFilters.join(","),
                        };
                    }

                    // // Init the default caller INFO filters
                    // const fileDataFilters = [];
                    // for (const caller of this._config.filter.callers) {
                    //     if (this.callerToFile[caller.id]) {
                    //         fileDataFilters.push(this.callerToFile[caller.id].name + ":" + caller.queryString);
                    //     }
                    // }
                    // this.query = {
                    //     ...this.query,
                    //     fileData: fileDataFilters.join(","),
                    // };

                    this.parseFileDataQuery(this.query);

                    // NOTE: We need to update the _config to update the dynamic VCF caller filters
                    this._config = {...this.getDefaultConfig(), ...this.config};
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
        this.query = {...this.executedQuery};
        this.parseFileDataQuery(this.query);
        this.requestUpdate();
    }

    onRun() {
        this.onVariantFilterSearch({
            detail: {
                query: this.preparedQuery,
            },
        });
    }

    parseFileDataQuery(query) {
        const fileData = query?.fileData;
        const callersConfig = this.opencgaSession?.study?.internal?.configuration?.clinical?.interpretation?.variantCallers || [];

        if (fileData) {
            const fileFilters = fileData.split(",");
            for (const fileFilter of fileFilters) {
                const [fileName, filter] = fileFilter.split(":");
                const callerId = Object.entries(this.callerToFile).find(([k, v]) => v.name === fileName);
                const caller = callersConfig.find(c => c.id === callerId[0]);
                (caller.types || []).forEach(callerType => {
                    this.queries[callerType] = {
                        fileData: fileName + ":" + filter,
                    };
                });
            }
        }
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

    onClear() {
    }

    onSettingsOk() {
    }

    // Prepare sampleVariantStats data for the onSave function.
    onChangeAggregationStatsResults(e) {
        // Parse aggregationStatsResults and create a sampleVariantStats
        const aggregationStatsResults = e.detail.aggregationStatsResults;
        if (aggregationStatsResults) {
            this.sampleVariantStats = {
                id: this.sample.id
            };
            for (const aggregatedResult of aggregationStatsResults) {
                const values = {};
                for (const bucket of aggregatedResult.buckets) {
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

    // Save signature for onSave function.
    onChangeSignature(e) {
        this.signature = {
            ...this.signature,
            ...e.detail.signature,
        };
    }

    onChangeCircosPlot(e) {
        this.circosPlot = e.detail.circosPlot;
        this.circosConfig = e.detail.circosConfig;
    }

    onChangeDeletionAggregationStatsChart(e) {
        this.deletionAggregationStatsPlot = e.detail.value;
    }

    onSave() {
        // Check object is defined
        if (!this.sample?.qualityControl?.variant) {
            this.sample.qualityControl.variant = {
                variantStats: [],
                signatures: [],
                files: []
            };
        }

        // Prepare signatures list to be saved
        if (!this.sample.qualityControl.variant.signatures) {
            this.sample.qualityControl.variant.signatures = [];
        }

        // Check ID is unique before saving
        const signatureIndex = this.sample.qualityControl.variant.signatures.findIndex(signature => signature.id === this.save.id);
        if (signatureIndex === -1) {
            if (this.signature?.["SNV"]) {
                this.sample.qualityControl.variant.signatures.push({
                    id: `${this.save.id}-snv`,
                    type: "SNV",
                    ...this.signature["SNV"],
                });
            }
            if (this.signature?.["SV"]) {
                this.sample.qualityControl.variant.signatures.push({
                    id: `${this.save.id}-sv`,
                    type: "SV",
                    ...this.signature["SV"],
                });
            }
        } else {
            console.warn("Signature ID already exists", this.sample.qualityControl.variant.signatures);
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_WARNING, {
                title: "Warning",
                message: "Signature ID already exists"
            });
        }

        const plotsPromises = [];

        // Prepare circos plot image
        if (this.circosPlot) {
            const circosPlotParams = {
                content: (this.circosPlot.split(",")?.[1] || "").trim(),
                path: "/circos/" + this.save.id + ".png",
                type: "FILE",
                format: "IMAGE",
            };
            plotsPromises.push(
                this.opencgaSession.opencgaClient.files().create(circosPlotParams, {
                    study: this.opencgaSession.study.fqn,
                    parents: true,
                })
            );
        }

        // Prepare deletion aggregation plot image
        if (this.deletionAggregationStatsPlot) {
            const deletionAggregationStatsPlotParams = {
                content: this.deletionAggregationStatsPlot.split("base64,")[1].trim(),
                path: `/deletionAggregationStats/${this.sample.id}-${this.save.id}.png`,
                type: "FILE",
                format: "IMAGE",
            };
            plotsPromises.push(
                this.opencgaSession.opencgaClient.files().create(deletionAggregationStatsPlotParams, {
                    study: this.opencgaSession.study.fqn,
                    parents: true,
                }),
            );
        }

        Promise.all(plotsPromises)
            .then(results => {
                // results[0] --> circos plot response
                // results[1] --> deletion aggregation plot response

                // Check genomePlot object exists
                if (!this.sample.qualityControl.variant.genomePlot) {
                    this.sample.qualityControl.variant["genomePlot"] = {};
                }

                // Append circos plot
                if (this.circosPlot) {
                    this.sample.qualityControl.variant.genomePlot.file = results[0].responses[0].results[0].id;
                    this.sample.qualityControl.variant.genomePlot.description = this.save.description || "";
                    this.sample.qualityControl.variant.genomePlot.config = {
                        title: this.circosConfig?.title,
                        density: this.circosConfig?.density,
                        generalQuery: this.circosConfig?.query,
                        tracks: (this.circosConfig?.tracks || []).map(track => ({
                            // description: track.id,
                            type: track.type,
                            query: track.query,
                        })),
                    };
                }

                // Append the deletion aggregation plot
                if (this.deletionAggregationStatsPlot) {
                    this.sample.qualityControl.variant.files.push(results[results.length - 1].responses[0].results[0].id);
                }

                // Update sample
                const sampleParams = {
                    qualityControl: this.sample.qualityControl,
                };
                this.opencgaSession.opencgaClient.samples().update(this.sample.id, sampleParams, {
                    study: this.opencgaSession.study.fqn,
                })
                    .then(() => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            title: "Success",
                            message: "Variant Stats saved successfully"
                        });
                    })
                    .catch(restResponse => {
                        console.error(restResponse);
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, restResponse);
                    })
                    .finally(() => {
                        this.requestUpdate();
                    });
            })
            .catch(restResponse => {
                console.error(restResponse);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, restResponse);
            })
            .finally(() => {
                this.requestUpdate();
            });
    }

    render() {
        if (!this.opencgaSession) {
            return;
        }

        const hasWritePermission = OpencgaCatalogUtils.getStudyEffectivePermission(
            this.opencgaSession.study,
            this.opencgaSession.user.id,
            "WRITE_CLINICAL_ANALYSIS",
            this.opencgaSession?.organization?.configuration?.optimizations?.simplifyPermissions);

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
                        <button type="button" class="btn btn-primary btn-block" @click="${this.onRun}">
                            <i class="fa fa-arrow-circle-right" aria-hidden="true"></i>
                            <strong>${this._config.filter.searchButtonText || "Search"}</strong>
                        </button>
                    </div>
                    <variant-browser-filter
                        .opencgaSession=${this.opencgaSession}
                        .query="${this.query}"
                        .cellbaseClient="${this.cellbaseClient}"
                        .populationFrequencies="${this.populationFrequencies}"
                        .consequenceTypes="${SAMPLE_STATS_CONSEQUENCE_TYPES}"
                        .cohorts="${this.cohorts}"
                        .config="${this._config.filter}"
                        @queryChange="${this.onVariantFilterChange}"
                        @querySearch="${this.onVariantFilterSearch}">
                    </variant-browser-filter>
                </div>

                <div class="col-md-10">
                    ${hasWritePermission ? html`
                        <div>
                            <div class="d-flex justify-content-end mt-0 ms-1 mb-3 me-0" role="toolbar" aria-label="toolbar">
                                <div class="btn-group me-1">
                                    <data-form
                                        .data=${this.settings}
                                        .config="${this.getSettingsConfig()}"
                                        @fieldChange="${e => this.onSettingsFieldChange(e)}"
                                        @submit="${this.onSettingsOk}">
                                    </data-form>
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
                        </div>
                    ` : null}
                    <div id="${this._prefix}MainContent">
                        <div id="${this._prefix}ActiveFilters">
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
                        </div>

                        <div class="main-view">
                            ${this.executedQuery ? html`
                                <div class="px-3 py-0">
                                    <sample-cancer-variant-stats-plots
                                        .opencgaSession="${this.opencgaSession}"
                                        .query="${this.executedQuery}"
                                        .queries="${this.queries}"
                                        .sampleId="${this.sample?.id}"
                                        @changeSignature="${this.onChangeSignature}"
                                        @changeCircosPlot="${this.onChangeCircosPlot}"
                                        @changeDeletionAggregationStatsChart="${this.onChangeDeletionAggregationStatsChart}"
                                        @changeAggregationStatsResults="${this.onChangeAggregationStatsResults}">
                                    </sample-cancer-variant-stats-plots>
                                </div>
                            ` : html`
                                <div class="alert alert-info px-3 py-0" role="alert">
                                    <i class="fas fa-3x fa-info-circle align-middle"></i> Please select some filters on the left.
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getSettingsConfig() {
        return {
            title: "",
            mode: "modal",
            type: "form",
            buttons: {
                show: false,
                cancelText: "Cancel",
                okText: "OK",
            },
            display: {
                style: "margin: 0px 25px 0px 0px",
                modalTitle: "Display Settings",
                modalButtonName: "Settings",
                modalButtonIcon: "fas fa-cog",
                modalButtonClassName: "btn btn-primary",
                labelWidth: 4,
                labelAlign: "right",
                defaultValue: "",
                defaultLayout: "horizontal",
                modalSize: "modal-lg"
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
        };
    }

    getSaveConfig() {
        return {
            title: "",
            mode: "modal",
            type: "form",
            buttons: {
                show: false,
                cancelText: "Cancel",
                okText: "Save",
            },
            display: {
                style: "margin: 0px 25px 0px 0px",
                modalTitle: "Save Variant Stats",
                modalButtonName: "Save",
                modalButtonIcon: "fas fa-save",
                modalButtonClassName: "btn btn-primary",
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
                            name: "ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add an identifier.",
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                placeholder: "Add a description",
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
            title: "Cancer Variant Plots",
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
                    complexFields: [
                        {id: "genotype", separator: ";"},
                        {id: "fileData", separator: ","},
                    ],
                    hiddenFields: []
                },
                callers: [
                    {
                        id: "caveman",
                        type: "SNV",
                        queryString: "FILTER=PASS;CLPM<=0;ASMD>=140"
                    },
                    {
                        id: "pindel",
                        type: "INDEL",
                        queryString: "FILTER=PASS;QUAL>=250;REP<=9"
                        // queryString: "FILTER=PASS;QUAL>=250"
                    }
                ],
                sections: [ // sections and subsections, structure and order is respected
                    {
                        title: "SNV Filters",
                        filters: [
                            {
                                id: "variant-file-info-filter",
                                visible: () => this.filesByCaller["CAVEMAN"]?.length > 0,
                                params: {
                                    // files: this.filesByCaller["CAVEMAN"] || [],
                                    files: this.files,
                                    visibleCallers: ["caveman"],
                                    opencgaSession: this.opencgaSession
                                },
                            },
                        ],
                    },
                    {
                        title: "INDEL Filters",
                        collapsed: true,
                        filters: [
                            {
                                id: "variant-file-info-filter",
                                visible: () => this.filesByCaller["PINDEL"]?.length > 0,
                                params: {
                                    // files: this.filesByCaller["PINDEL"] || [],
                                    files: this.files,
                                    visibleCallers: ["pindel"],
                                    opencgaSession: this.opencgaSession
                                },
                            },
                        ],
                    },
                    {
                        title: "CNV Filters",
                        collapsed: true,
                        filters: [
                            {
                                id: "variant-file-info-filter",
                                visible: () => this.filesByCaller["ASCAT"]?.length > 0,
                                params: {
                                    // files: this.filesByCaller["ASCAT"] || [],
                                    files: this.files,
                                    visibleCallers: ["ascat"],
                                    opencgaSession: this.opencgaSession
                                },
                            },
                        ],
                    },
                    {
                        title: "Rearrangement Filters",
                        collapsed: true,
                        filters: [
                            {
                                id: "variant-file-info-filter",
                                visible: () => this.filesByCaller["BRASS"]?.length > 0,
                                params: {
                                    // files: this.filesByCaller["BRASS"] || [],
                                    files: this.files,
                                    visibleCallers: ["brass"],
                                    opencgaSession: this.opencgaSession
                                },
                            },
                        ],
                    },
                    {
                        title: "Genomic Filters",
                        collapsed: true,
                        filters: [
                            // {
                            //     id: "file-quality",
                            //     title: "Quality Filter",
                            //     tooltip: "VCF file based FILTER and QUAL filters",
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
                                biotypes: SAMPLE_STATS_BIOTYPES,
                                tooltip: tooltips.biotype
                            },
                            {
                                id: "consequence-type",
                                title: "Select SO terms",
                                tooltip: tooltips.consequenceTypeSelect
                            }
                        ]
                    },
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
        };
    }

}

customElements.define("sample-cancer-variant-stats-browser", SampleCancerVariantStatsBrowser);
