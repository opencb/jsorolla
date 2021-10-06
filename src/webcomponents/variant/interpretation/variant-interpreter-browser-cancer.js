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
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import ClinicalAnalysisManager from "../../clinical/clinical-analysis-manager.js";
import ClinicalAnalysisUtils from "../../clinical/clinical-analysis-utils.js";
import UtilsNew from "../../../core/utilsNew.js";
import "./variant-interpreter-browser-toolbar.js";
import "./variant-interpreter-grid.js";
import "./variant-interpreter-detail.js";
import "../opencga-variant-filter.js";
import "../../commons/tool-header.js";
import "../../commons/opencga-active-filters.js";
import "../../commons/filters/sample-genotype-filter.js";
import "../../commons/filters/variant-caller-info-filter.js";

class VariantInterpreterBrowserCancer extends LitElement {

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
            // query: {
            //     type: Object
            // },
            cellbaseClient: {
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
        this._prefix = UtilsNew.randomString(8);

        this.variant = null;
        this.reportedVariants = [];

        this.query = {};
        this.activeFilterFilters = [];
        this.predefinedFilter = false; // flag that hides the warning message in active-filter for predefined samples value

        this.savedVariants = [];
        this.notSavedVariantIds = 0;
        this.removedVariantIds = 0;
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    connectedCallback() {
        super.connectedCallback();

        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this.clinicalAnalysis, this.opencgaSession);
    }

    updated(changedProperties) {
        if (changedProperties.has("settings") || changedProperties.has("config")) {
            this.settingsObserver();
        }

        if (changedProperties.has("opencgaSession")) {
            this.clinicalAnalysisManager = new ClinicalAnalysisManager(this.clinicalAnalysis, this.opencgaSession);
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        // if (changedProperties.has("query")) {
        //     this.queryObserver();
        // }
    }

    settingsObserver() {
        if (!this.clinicalAnalysis) {
            return;
        }
        // merge filters
        this._config = {...this.getDefaultConfig(), ...this.config};
        // filter list, canned filters, detail tabs
        if (this.settings?.menu) {
            this._config.filter = UtilsNew.mergeFiltersAndDetails(this._config?.filter, this.settings);
        }

        if (this.settings?.table) {
            this._config.filter.result.grid = {...this._config.filter.result.grid, ...this.settings.table};
        }
        if (this.settings?.table?.toolbar) {
            this._config.filter.result.grid.toolbar = {...this._config.filter.result.grid.toolbar, ...this.settings.table.toolbar};
        }
        this.requestUpdate();
    }

    queryObserver() {
        if (this.opencgaSession && this.query) {
            this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
            this.executedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
        }
        this.requestUpdate();
    }

    clinicalAnalysisObserver() {
        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this.clinicalAnalysis, this.opencgaSession);
        this._sample = this.clinicalAnalysis.proband.samples.find(sample => sample.somatic);
        if (this._sample) {
            // Set query object
            if (!this.query?.sample) {
                this.query = {
                    ...this.query,
                    sample: this._sample.id + ":0/1,1/1,NA"
                };
            }

            // Object to map callers ID to Files
            this.callerToFile = {};
            this.opencgaSession.opencgaClient.files().search({sampleIds: this._sample.id, format: "VCF", study: this.opencgaSession.study.fqn})
                .then(fileResponse => {
                    this.files = fileResponse.response[0].results;
                    for (const file of this.files) {
                        if (file.software?.name) {
                            const softwareName = file.software.name.toLowerCase();
                            this.callerToFile[softwareName] = file;
                        }
                    }

                    // Create the variantCallers configuration to: i) set the default init query; ii) create the dynamic side menu
                    const fileDataFilters = [];
                    this.variantCallers = this.getVariantCallers();
                    this.variantCallers.forEach(caller => {
                        const filters = caller.dataFilters
                            .filter(filter => !!filter.defaultValue)
                            .map(filter => {
                                // Notice that defaultValue includes the comparator, eg. =, >, ...
                                return filter.id + (filter.id !== "FILTER" ? filter.defaultValue : "=PASS");
                            });

                        // Only add this file to the filter if we have at least one default value
                        if (filters.length > 0) {
                            fileDataFilters.push(caller.fileId + ":" + filters.join(";"));
                        }
                    });

                    // Add study caller default 'fileData' query
                    // TODO add sampleData.
                    this.query = {
                        ...this.query,
                        fileData: fileDataFilters.join(","),
                    };

                    this.settingsObserver();
                    this.queryObserver();
                })
                .catch(response => {
                    console.error("An error occurred fetching sample: ", response);
                });
        }

        const sampleQc = ClinicalAnalysisUtils.getProbandSampleQc(this.clinicalAnalysis, 1);
        let _activeFilterFilters = [];
        if (sampleQc) {
            // TODO temp fix to support both Opencga 2.0.3 and Opencga 2.1.0-rc
            if (sampleQc.variantMetrics) {
                this._variantStatsPath = "variantMetrics";
            } else if (sampleQc.variant) {
                this._variantStatsPath = "variant";
            } else {
                console.error("unexpected QC data model");
            }
            const variantStats = sampleQc[this._variantStatsPath]?.variantStats;
            if (variantStats && variantStats.length > 0) {
                _activeFilterFilters = variantStats.map(variantStat => ({id: variantStat.id, query: variantStat.query}));
            }
        }

        // this.activeFilterFilters = _activeFilterFilters && _activeFilterFilters.length > 0 ? _activeFilterFilters : this._config.filter.examples;
        // If WC variant stats filters are found we add them to active filters, we do not replace them.
        if (_activeFilterFilters.length > 0) {
            // Concat QC filters to examples
            if (this._config?.filter?.examples && this._config.filter.examples.length > 0) {
                _activeFilterFilters.push({separator: true});
                _activeFilterFilters.push(...this._config.filter.examples);
            }
            this.activeFilterFilters = _activeFilterFilters;
        } else {
            this.activeFilterFilters = this._config.filter.examples;
        }

        if (this.clinicalAnalysis?.interpretation?.primaryFindings?.length) {
            this.savedVariants = this.clinicalAnalysis?.interpretation?.primaryFindings?.map(v => v.id);
        }
    }

    /*
     * Fetch the CinicalAnalysis object from REST and trigger the observer call.
     */
    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    this.clinicalAnalysisObserver();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    onSelectVariant(e) {
        this.variantId = e.detail.id;
        this.variant = e.detail.row;

        this.requestUpdate();
    }

    onCheckVariant(e) {
        if (e.detail.checked) {
            this.clinicalAnalysisManager.addVariant(e.detail.row);
        } else {
            this.clinicalAnalysisManager.removeVariant(e.detail.row);
        }
    }

    onFilterVariants(e) {
        const variantIds = e.detail.variants.map(v => v.id);
        this.preparedQuery = {...this.preparedQuery, id: variantIds.join(",")};
        this.executedQuery = {...this.executedQuery, id: variantIds.join(",")};
        this.requestUpdate();
    }

    onResetVariants(e) {
        this.clinicalAnalysisManager.reset();

        this.preparedQuery = {...this.preparedQuery};
        this.executedQuery = {...this.executedQuery};
        delete this.preparedQuery.id;
        delete this.executedQuery.id;

        this.clinicalAnalysis = {...this.clinicalAnalysis};
        // this.requestUpdate();
    }

    onSaveVariants(e) {
        const comment = e.detail.comment;
        const saveCallback = () => {
            this.dispatchEvent(new CustomEvent("clinicalAnalysisUpdate", {
                detail: {
                    clinicalAnalysis: this.clinicalAnalysis
                },
                bubbles: true,
                composed: true
            }));
        };
        this.clinicalAnalysisManager.updateInterpretation(comment, saveCallback);
    }

    onVariantFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onVariantFilterSearch(e) {
        this.preparedQuery = e.detail.query;
        this.executedQuery = e.detail.query;
        this.requestUpdate();
    }

    onActiveFilterChange(e) {
        this.query = {...e.detail};
        this.queryObserver();
    }

    onActiveFilterClear() {
        this.query = {study: this.opencgaSession.study.fqn, sample: this._sample.id};
        this.queryObserver();
    }

    getVariantCallers() {
        const variantCallers = [];
        const fieldToCaller = {"PASS": []}; // PASS is always there

        // Generate a map of of INFO fields to callerIds and fileIds
        this.files.forEach(file => {
            file.attributes.variantFileMetadata.header.complexLines
                .filter(line => line.key === "INFO")
                .forEach(line => {
                    if (!fieldToCaller[line.id]) {
                        fieldToCaller[line.id] = [];
                    }

                    fieldToCaller[line.id].push({
                        callerId: file.software?.name,
                        fileId: file.id
                    });
                });

            // Add PASS automatically to all files
            fieldToCaller["PASS"].push({
                callerId: file.software?.name,
                fileId: file.id
            });
        });

        const studyInternalConfiguration = this.opencgaSession?.study?.internal?.configuration;

        // Check if variantCallers have been configured
        if (studyInternalConfiguration?.clinical?.interpretation?.variantCallers) {
            const indexedFields = {};
            if (studyInternalConfiguration?.variantEngine?.sampleIndex?.fileIndexConfiguration?.customFields) {
                for (const customField of studyInternalConfiguration.variantEngine.sampleIndex.fileIndexConfiguration.customFields) {
                    if (customField.source === "FILE") {
                        indexedFields[customField.key] = customField;
                    }
                }
            }

            // TODO check if this work
            for (const caller of studyInternalConfiguration.clinical.interpretation.variantCallers) {
                if (this.callerToFile?.[caller.id]) {
                    // Check if dataFilter are indexed
                    for (const dataFilter of caller.dataFilters) {
                        if (indexedFields[dataFilter.id]) {
                            const field = indexedFields[dataFilter.id];
                            if (field.type.startsWith("RANGE_")) {
                                dataFilter.comparators = field.type === "RANGE_LT" ? ["<", ">="] : [">", "<="];
                                dataFilter.allowedValues = field.thresholds;
                            } else {
                                dataFilter.allowedValues = field.values;
                            }
                        }
                    }

                    variantCallers.push({
                        ...caller,
                        fileId: this.callerToFile[caller.id]?.name
                    });
                }
            }
        } else {
            // If not variantCallers configuration exist we can check for the indexed custom fields in the sample index.
            // Example:
            // "customFields": [
            //     {
            //         "source": "FILE",
            //         "key": "FILTER",
            //         "type": "CATEGORICAL",
            //         "values": [
            //             "PASS"
            //         ],
            //         "nullable": true
            //     },
            //     {
            //         "source": "FILE",
            //         "key": "ASMD",
            //         "type": "RANGE_LT",
            //         "thresholds": [
            //             20,
            //             30,
            //             250,
            //             300
            //         ],
            //         "nullable": true
            //     }
            // ]
            if (studyInternalConfiguration?.variantEngine?.sampleIndex?.fileIndexConfiguration?.customFields) {
                const callerToDataFilters = {};
                for (const customField of studyInternalConfiguration.variantEngine.sampleIndex.fileIndexConfiguration.customFields) {
                    // At the moment we support all FILE fields but QUAL, since the values do not follow any standard
                    if (customField.source === "FILE" && customField.key !== "QUAL") {
                        let fieldName, fieldType, fieldValues, fieldComparators;

                        // Check if field id is FILTER and has only PASS value
                        if (customField.key === "FILTER") {
                            if (customField.values?.length === 1 && customField.values[0] === "PASS") {
                                fieldName = "PASS",
                                fieldType = "BOOLEAN";
                            } else {
                                fieldType = "CATEGORICAL";
                                fieldValues = customField.values;
                            }
                        } else {
                            // All other fields are processed normally
                            if (customField.type.startsWith("RANGE_")) {
                                fieldType = "NUMERIC";
                                fieldValues = customField.thresholds;
                                fieldComparators = customField.type === "RANGE_LT" ? ["<", ">="] : [">", "<="];
                            } else {
                                fieldType = "CATEGORICAL";
                                fieldValues = customField.values;
                            }
                        }

                        // Add this field to each caller dataFilter
                        (fieldToCaller[fieldName || customField.key] || []).forEach(caller => {
                            if (!callerToDataFilters[caller.callerId]) {
                                callerToDataFilters[caller.callerId] = [];
                            }
                            callerToDataFilters[caller.callerId].push({
                                id: customField.key,
                                name: fieldName || customField.key,
                                type: fieldType,
                                source: customField.source,
                                allowedValues: fieldValues,
                                comparators: fieldComparators || [],
                            });
                        });
                    }
                }

                const entries = Object.entries(this.callerToFile);
                for (const entry of entries) {
                    if (callerToDataFilters[entry[0]]) {
                        variantCallers.push({
                            id: entry[0],
                            dataFilters: callerToDataFilters[entry[0]],
                            fileId: entry[1].name,
                        });
                    }
                }
            }
        }

        // FIXME remove this temporary code ASAP
        if (variantCallers.length === 0 && this.opencgaSession?.study?.id === "test") {
            variantCallers.push({
                id: "caveman",
                columns: ["ASMD"],
                dataFilters: [
                    {
                        id: "FILTER",
                        name: "PASS",
                        type: "BOOLEAN",
                        defaultValue: "PASS"
                    },
                    {
                        id: "CLPM",
                        name: "CLPM name",
                        type: "NUMERIC",
                        defaultValue: ">=0"
                    },
                    {
                        id: "ASMD",
                        name: "ASMD name",
                        type: "NUMERIC",
                        source: "FILE",
                        comparators: ["<", ">="],
                        allowedValues: ["120", "130", "140"],
                        defaultValue: ">=140"
                    }
                ],
                fileId: this.callerToFile["caveman"]?.name
            });
            variantCallers.push({
                id: "pindel",
                columns: ["REP"],
                dataFilters: [
                    {
                        id: "FILTER",
                        name: "PASS",
                        type: "BOOLEAN",
                        defaultValue: "PASS"
                    }
                ],
                fileId: this.callerToFile["pindel"]?.name
            });
        }

        return variantCallers;
    }

    getDefaultConfig() {
        return {
            title: "Cancer Case Interpreter",
            icon: "fas fa-search",
            active: false,
            showOtherTools: false,
            showTitle: false,
            filter: {
                title: "Filter",
                searchButton: true,
                searchButtonText: "Search",
                activeFilters: {
                    alias: {
                        // Example:
                        // "region": "Region",
                        // "gene": "Gene",
                        "ct": "Consequence Types"
                    },
                    complexFields: ["sample", "fileData"],
                    hiddenFields: [],
                    lockedFields: [{id: "sample"}]
                },
                sections: [ // sections and subsections, structure and order is respected
                    {
                        title: "Sample And File",
                        collapsed: false,
                        filters: [
                            {
                                id: "sample-genotype",
                                title: "Sample Genotype",
                                params: {
                                    genotypes: [
                                        {
                                            id: "0/1", name: "HET"
                                        },
                                        {
                                            id: "1/1", name: "HOM ALT"
                                        },
                                        {
                                            separator: true
                                        },
                                        {
                                            id: "NA", name: "NA"
                                        }
                                    ]
                                }
                            },
                            {
                                id: "variant-file",
                                title: "VCF File Filter",
                                params: {
                                    files: this.files
                                }
                            },
                            // {
                            //     id: "file-quality",
                            //     title: "Quality Filters",
                            //     tooltip: "VCF file based FILTER and QUAL filters",
                            //     visible: UtilsNew.isEmpty(this.callerToFile)
                            // },
                            {
                                id: "variant-file-info-filter",
                                title: "Variant File Caller Filter",
                                params: {
                                    callers: this.variantCallers
                                }
                            }
                        ]
                    },
                    {
                        title: "Genomic",
                        collapsed: true,
                        filters: [
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
                                id: "type",
                                title: "Variant Type",
                                types: ["SNV", "INDEL", "COPY_NUMBER", "INSERTION", "DELETION", "DUPLICATION", "MNV", "BREAKEND"],
                                tooltip: tooltips.type
                            }
                        ]
                    },
                    {
                        title: "Clinical",
                        collapsed: true,
                        filters: [
                            {
                                id: "diseasePanels",
                                title: "Disease Panels",
                                tooltip: tooltips.diseasePanels
                            },
                            {
                                id: "clinical-annotation",
                                title: "Clinical Annotation",
                                tooltip: tooltips.clinical
                            }
                        ]
                    },
                    {
                        title: "Consequence Type",
                        collapsed: true,
                        filters: [
                            {
                                id: "consequenceTypeSelect",
                                title: "Select SO terms",
                                tooltip: tooltips.consequenceTypeSelect
                            }
                        ]
                    },
                    {
                        title: "Population Frequency",
                        collapsed: true,
                        filters: [
                            {
                                id: "populationFrequency",
                                title: "Select Population Frequency",
                                allowedFrequencies: "0.0001,0.0005,0.001,0.005,0.01,0.05",
                                tooltip: tooltips.populationFrequencies,
                                showSetAll: false,
                                // TODO read this from the Study.internal.configuration in OpenCGA 2.1
                                populationFrequencies: {
                                    studies: [
                                        {
                                            id: "1kG_phase3",
                                            title: "1000 Genomes",
                                            populations: [
                                                {
                                                    id: "ALL", title: "All populations [ALL]"
                                                }
                                            ]
                                        },
                                        {
                                            id: "GNOMAD_GENOMES",
                                            title: "gnomAD Genomes",
                                            populations: [
                                                {
                                                    id: "ALL", title: "gnomAD [ALL]"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        ]
                    },
                    {
                        title: "Phenotype",
                        collapsed: true,
                        filters: [
                            {
                                id: "go",
                                title: "GO Accessions (max. 100 terms)",
                                tooltip: tooltips.go
                            },
                            {
                                id: "hpo",
                                title: "HPO Accessions",
                                tooltip: tooltips.hpo
                            }
                        ]
                    },
                    {
                        title: "Deleteriousness",
                        collapsed: true,
                        filters: [
                            {
                                id: "proteinSubstitutionScore",
                                title: "Protein Substitution Score",
                                tooltip: tooltips.proteinSubstitutionScore
                            },
                            {
                                id: "cadd",
                                title: "CADD",
                                tooltip: tooltips.cadd
                            }
                        ]
                    },
                    {
                        title: "Conservation",
                        collapsed: true,
                        filters: [
                            {
                                id: "conservation",
                                title: "Conservation Score",
                                tooltip: tooltips.conservation
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        id: "Example BRCA2",
                        active: false,
                        query: {
                            gene: "BRCA2",
                            conservation: "phylop<0.001"
                        }
                    },
                    {
                        id: "LoF and missense",
                        active: false,
                        query: {
                            ct: "lof,missense_variant"
                        }
                    },
                    {
                        id: "Full Example",
                        query: {
                            "xref": "BRCA1,TP53",
                            "biotype": "protein_coding",
                            "type": "SNV,INDEL",
                            "ct": "lof",
                            "populationFrequencyAlt": "GNOMAD_GENOMES:ALL<0.1",
                            "protein_substitution": "sift>5,polyphen>4",
                            "conservation": "phylop>1;phastCons>2;gerp<=3"
                        }
                    }
                ],
                result: {
                    grid: {
                        pagination: true,
                        pageSize: 10,
                        pageList: [5, 10, 25],
                        showExport: false,
                        detailView: true,
                        showReview: false,
                        showActions: false,
                        showSelectCheckbox: true,
                        multiSelection: false,
                        nucleotideGenotype: true,
                        alleleStringLengthMax: 10,

                        genotype: {
                            type: "VAF"
                        },

                        header: {
                            horizontalAlign: "center",
                            verticalAlign: "bottom"
                        },

                        quality: {
                            qual: 30,
                            dp: 20
                        }
                    }
                },
                detail: {
                    title: "Selected Variant:",
                    showTitle: true,
                    items: [
                        {
                            id: "annotationSummary",
                            name: "Summary",
                            active: true,
                            render: variant => {
                                return html`
                                    <cellbase-variant-annotation-summary
                                            .variantAnnotation="${variant.annotation}"
                                            .consequenceTypes="${CONSEQUENCE_TYPES}"
                                            .proteinSubstitutionScores="${PROTEIN_SUBSTITUTION_SCORE}">
                                    </cellbase-variant-annotation-summary>`;
                            }
                        },
                        {
                            id: "annotationConsType",
                            name: "Consequence Type",
                            render: (variant, active) => {
                                return html`
                                    <variant-consequence-type-view
                                            .consequenceTypes="${variant.annotation.consequenceTypes}"
                                            .active="${active}">
                                    </variant-consequence-type-view>`;
                            }
                        },
                        {
                            id: "annotationPropFreq",
                            name: "Population Frequencies",
                            render: (variant, active) => {
                                return html`
                                    <cellbase-population-frequency-grid
                                            .populationFrequencies="${variant.annotation.populationFrequencies}"
                                            .active="${active}">
                                    </cellbase-population-frequency-grid>`;
                            }
                        },
                        {
                            id: "annotationClinical",
                            name: "Clinical",
                            render: variant => {
                                return html`
                                    <variant-annotation-clinical-view
                                            .traitAssociation="${variant.annotation.traitAssociation}"
                                            .geneTraitAssociation="${variant.annotation.geneTraitAssociation}">
                                    </variant-annotation-clinical-view>`;
                            }
                        },
                        {
                            id: "fileMetrics",
                            name: "File Metrics",
                            render: (variant, active, opencgaSession) => {
                                return html`
                                    <opencga-variant-file-metrics
                                            .opencgaSession="${opencgaSession}"
                                            .variant="${variant}"
                                            .files="${this.clinicalAnalysis}">
                                    </opencga-variant-file-metrics>`;
                            }
                        },
                        {
                            id: "cohortStats",
                            name: "Cohort Stats",
                            render: (variant, active, opencgaSession) => {
                                return html`
                                    <variant-cohort-stats
                                            .opencgaSession="${opencgaSession}"
                                            .variant="${variant}"
                                            .active="${active}">
                                    </variant-cohort-stats>`;
                            }
                        },
                        {
                            id: "samples",
                            name: "Samples",
                            render: (variant, active, opencgaSession) => {
                                return html`
                                    <opencga-variant-samples
                                            .opencgaSession="${opencgaSession}"
                                            .variantId="${variant.id}"
                                            .active="${active}">
                                    </opencga-variant-samples>`;
                            }
                        },
                        {
                            id: "beacon",
                            name: "Beacon",
                            render: (variant, active, opencgaSession) => {
                                return html`
                                    <variant-beacon-network
                                            .variant="${variant.id}"
                                            .assembly="${opencgaSession.project.organism.assembly}"
                                            .config="${this.beaconConfig}"
                                            .active="${active}">
                                    </variant-beacon-network>`;
                            }
                        }
                    ]
                }
            },
            aggregation: {}
        };
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession?.study) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No project available to browse. Please login to continue</h3>
                </div>
            `;
        }

        return html`
            <style>
                .prioritization-center {
                    margin: auto;
                    text-align: justify;
                    width: 95%;
                }

                .browser-variant-tab-title {
                    font-size: 115%;
                    font-weight: bold;
                }

                .prioritization-variant-tab-title {
                    font-size: 115%;
                    font-weight: bold;
                }

                .form-section-title {
                    padding: 5px 0px;
                    width: 95%;
                    border-bottom-width: 1px;
                    border-bottom-style: solid;
                    border-bottom-color: #ddd
                }

                #clinicalAnalysisIdText {
                    padding: 10px;
                }

                .clinical-analysis-id-wrapper {
                    padding: 20px;
                }

                .clinical-analysis-id-wrapper .text-filter-wrapper {
                    margin: 20px 0;
                }
            </style>

            ${this._config.showTitle ? html`
                <tool-header title="${this.clinicalAnalysis ? `${this._config.title} (${this.clinicalAnalysis.id})` : this._config.title}" icon="${this._config.icon}"></tool-header>
            ` : null}

            <div class="row">
                <div class="col-md-2">
                    <opencga-variant-filter .opencgaSession="${this.opencgaSession}"
                                            .query="${this.query}"
                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                            .cellbaseClient="${this.cellbaseClient}"
                                            .populationFrequencies="${this.populationFrequencies}"
                                            .consequenceTypes="${SAMPLE_STATS_CONSEQUENCE_TYPES}"
                                            .config="${this._config.filter}"
                                            @queryChange="${this.onVariantFilterChange}"
                                            @querySearch="${this.onVariantFilterSearch}">
                    </opencga-variant-filter>
                </div> <!-- Close col-md-2 -->

                <div class="col-md-10">
                    <div>
                        ${OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "WRITE_CLINICAL_ANALYSIS") ?
                                html`
                                    <variant-interpreter-browser-toolbar    .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                            .state="${this.clinicalAnalysisManager.state}"
                                                                            @filterVariants="${this.onFilterVariants}"
                                                                            @resetVariants="${this.onResetVariants}"
                                                                            @saveInterpretation="${this.onSaveVariants}">
                                    </variant-interpreter-browser-toolbar>` :
                                null
                        }
                    </div>

                    <div id="${this._prefix}MainContent">
                        <div id="${this._prefix}ActiveFilters">
                            <opencga-active-filters resource="VARIANT"
                                                    .opencgaSession="${this.opencgaSession}"
                                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                                    .defaultStudy="${this.opencgaSession.study.fqn}"
                                                    .query="${this.preparedQuery}"
                                                    .executedQuery="${this.executedQuery}"
                                                    .filters="${this.activeFilterFilters}"
                                                    .alias="${this._config.activeFilterAlias}"
                                                    .config="${this._config.filter.activeFilters}"
                                                    @activeFilterChange="${this.onActiveFilterChange}"
                                                    @activeFilterClear="${this.onActiveFilterClear}">
                            </opencga-active-filters>
                        </div>

                        <div class="main-view">
                            <div id="${this._prefix}TableResult" class="variant-interpretation-content active">
                                <variant-interpreter-grid .opencgaSession="${this.opencgaSession}"
                                                          .clinicalAnalysis="${this.clinicalAnalysis}"
                                                          .query="${this.executedQuery}"
                                                          .config="${this._config.filter.result.grid}"
                                                          @selectrow="${this.onSelectVariant}"
                                                          @checkrow="${this.onCheckVariant}">
                                </variant-interpreter-grid>

                                <!-- Bottom tabs with detailed variant information -->
                                <variant-interpreter-detail .opencgaSession="${this.opencgaSession}"
                                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                                            .variant="${this.variant}"
                                                            .cellbaseClient="${this.cellbaseClient}"
                                                            .config=${this._config.filter.detail}>
                                </variant-interpreter-detail>
                            </div>
                        </div>
                    </div> <!-- Close MainContent -->
                </div> <!-- Close col-md-10 -->
            </div> <!-- Close row -->
        `;
    }

}

customElements.define("variant-interpreter-browser-cancer", VariantInterpreterBrowserCancer);
