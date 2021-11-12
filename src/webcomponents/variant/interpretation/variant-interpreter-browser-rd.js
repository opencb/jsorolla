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
import UtilsNew from "../../../core/utilsNew.js";
import "./variant-interpreter-browser-toolbar.js";
import "./variant-interpreter-grid.js";
import "./variant-interpreter-detail.js";
import "../variant-browser-filter.js";
import "../../commons/tool-header.js";
import "../../commons/opencga-active-filters.js";

class VariantInterpreterBrowserRd extends LitElement {

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
            query: {
                type: Object
            },
            cellbaseClient: {
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

        // this.defaultGenotypes = ["0/0", "0/1", "1/1"];

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this.clinicalAnalysis, this.opencgaSession);
    }

    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.clinicalAnalysisManager = new ClinicalAnalysisManager(this.clinicalAnalysis, this.opencgaSession);
        }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        super.update(changedProperties);
    }

    settingsObserver() {
        if (!this.clinicalAnalysis) {
            return;
        }
        // merge filters
        this._config = {...this.getDefaultConfig()};

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
        // this.requestUpdate();
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
        let isSettingsObserverCalled = false;

        // Init the active filters with every new Case opened. Then we add the default filters for the given sample
        const _activeFilterFilters = this._config?.filter?.examples || [];

        this.sample = this.clinicalAnalysis.proband?.samples?.find(sample => !sample.somatic);
        if (this.sample) {
            // Init query object if needed
            if (!this.query) {
                this.query = {};
            }

            // 1. 'sample' query param: if sample is not defined then we must set the sample and genotype
            if (!this.query?.sample) {
                this._sampleQuery = null;
                switch (this.clinicalAnalysis.type.toUpperCase()) {
                    case "SINGLE":
                    case "CANCER":
                        this._sampleQuery = this.sample.id + ":" + ["0/1", "1/1"].join(",");
                        break;
                    case "FAMILY":
                        const sampleIds = [this.sample.id + ":" + ["0/1", "1/1"].join(",")];
                        for (const member of this.clinicalAnalysis.family?.members) {
                            // Proband is already in the array in the first position
                            if (member.id !== this.clinicalAnalysis.proband?.id && member.samples?.length > 0) {
                                sampleIds.push(member.samples[0].id + ":" + ["0/0", "0/1", "1/1"].join(","));
                            }
                        }
                        this._sampleQuery = sampleIds.join(";");
                        break;
                }

                // Set query object
                if (this._sampleQuery) {
                    this.query.sample = this._sampleQuery;
                }
            }

            // 2. 'panel' query param: add case panels to query object
            // TODO should we also check main interpretation panels?
            if (this.clinicalAnalysis.panels?.length > 0) {
                this.query.panel = this.clinicalAnalysis.panels.map(panel => panel.id).join(",");
            }

            // 3. 'fileData' query param: fetch non SV files and set init query
            if (this.opencgaSession?.study?.internal?.configuration?.clinical?.interpretation?.variantCallers?.length > 0) {
                const nonSvGermlineVariantCallers = this.opencgaSession.study.internal.configuration.clinical.interpretation.variantCallers
                    .filter(vc => !vc.somatic)
                    .filter(vc => vc.types.includes("SNV") || vc.types.includes("INDEL") ||
                        vc.types.includes("INSERTION") || vc.types.includes("DELETION") ||
                        vc.types.includes("COPY_NUMBER") || vc.types.includes("CNV"));

                this.files = this.clinicalAnalysis.files
                    .filter(file => file.format.toUpperCase() === "VCF")
                    .filter(file =>
                        nonSvGermlineVariantCallers.findIndex(vc => vc.id.toUpperCase() === file.software?.name?.toUpperCase()) >= 0);

                const fileDataFilters = [];
                nonSvGermlineVariantCallers
                    .forEach(vc => {
                        const filters = vc.dataFilters
                            .filter(filter => !filter.source || filter.source === "FILE")
                            .filter(filter => !!filter.defaultValue)
                            .map(filter => {
                                // Notice that defaultValue includes the comparator, eg. =, >, ...
                                return filter.id + (filter.id !== "FILTER" ? filter.defaultValue : "=PASS");
                            });

                        // Only add this file to the filter if we have at least one default value
                        if (filters.length > 0) {
                            // We need to find the file for that caller
                            const fileId = this.files.find(file => file.software.name === vc.id)?.name;
                            if (fileId) {
                                fileDataFilters.push(fileId + ":" + filters.join(";"));
                            }
                        }
                    });

                //  Update query with default 'fileData' parameters
                this.query.fileData = fileDataFilters.join(",");
            }

            // Add filter to Active Filters menu
            // 1. Add variant stats saved queries to the Active Filters menu
            if (this.sample.qualityControl?.variant?.variantStats?.length > 0) {
                _activeFilterFilters.length > 0 ? _activeFilterFilters.push({separator: true}) : null;
                _activeFilterFilters.push(
                    ...this.sample.qualityControl.variant.variantStats
                        .map(variantStat => (
                            {
                                id: variantStat.id,
                                active: false,
                                query: variantStat.query
                            }
                        ))
                );
            }

            // 2. Add default initial query the the active filter menu
            _activeFilterFilters.unshift({separator: true});
            _activeFilterFilters.unshift(
                {
                    id: "Default Initial Query",
                    active: true,
                    query: this.query
                }
            );

            // Set active filters
            this.activeFilterFilters = _activeFilterFilters;

            // We need to update query
            this.queryObserver();

            this.settingsObserver();
            isSettingsObserverCalled = true;
        } else {
            // No germline sample found, this is weird scenario but can happen if a case is created empty.
            // We init active filters anyway.
            this.activeFilterFilters = _activeFilterFilters;
        }

        if (this.clinicalAnalysis?.interpretation?.primaryFindings?.length) {
            this.savedVariants = this.clinicalAnalysis?.interpretation?.primaryFindings?.map(v => v.id);
        }

        // No need to call to settingsObserver() again if already called in files.search.
        if (!isSettingsObserverCalled) {
            this.settingsObserver();
        }
    }

    /*
     * Fetch the ClinicalAnalysis object from REST and trigger the observer call.
     */
    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    // this.clinicalAnalysisObserver();
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
        this.query = {...e.detail}; // we add this.predefinedFilter in case sample field is not present
        // this.preparedQuery = {...e.detail};
        // // TODO is this really needed? it seems to work without this line.
        // this.executedQuery = {...e.detail};
        this.requestUpdate();
    }

    onActiveFilterClear() {
        this.query = {study: this.opencgaSession.study.fqn, sample: this._sampleQuery};
        // this.preparedQuery = {...this.query};
        // this.executedQuery = {...this.query};
        this.requestUpdate();
    }

    getDefaultConfig() {
        // Add case panels to query object
        // TODO should we also check main interpretation panels?
        const lockedFields = [
            {
                id: "sample"
            }
        ];
        if (this.clinicalAnalysis?.panels?.length > 0 && this.clinicalAnalysis.panelLock) {
            lockedFields.push({id: "panel"});
        }

        return {
            title: "RD Case Interpreter",
            showSaveInterpretation: true,
            showOtherTools: true,
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
                    lockedFields: lockedFields
                },
                sections: [
                    {
                        title: "Sample",
                        collapsed: false,
                        filters: [
                            {
                                id: "sample-genotype",
                                title: "Sample Genotype",
                                visible: () => this.clinicalAnalysis.type.toUpperCase() === "SINGLE",
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
                                            id: "1", name: "HEMI"
                                        }
                                    ]
                                }
                            },
                            {
                                id: "sample",
                                title: "Sample Genotype",
                                tooltip: tooltips.sample,
                                clinicalAnalysis: this.clinicalAnalysis,
                                visible: () => this.clinicalAnalysis.type.toUpperCase() === "FAMILY"
                            },
                            {
                                id: "file-quality",
                                title: "Quality Filters",
                                tooltip: "VCF file based FILTER and QUAL filters"
                            },
                            {
                                id: "variant-file-info-filter",
                                title: "Variant Caller File Filter",
                                visible: () => this.files?.length > 0,
                                params: {
                                    files: this.files,
                                    opencgaSession: this.opencgaSession,
                                }
                            },
                            {
                                id: "cohort",
                                title: "Cohort Alternate Stats",
                                onlyCohortAll: true,
                                tooltip: tooltips.cohort
                                // cohorts: this.cohorts
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
                                types: ["SNV", "INDEL", "COPY_NUMBER", "INSERTION", "DELETION", "DUPLICATION", "MNV"],
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
                                disabled: {
                                    check: () => this.clinicalAnalysis.panelLock,
                                    message: "Case Panel is locked, you are not allowed to change selected panel(s)."
                                },
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
                                id: "consequence-type",
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
                                allowedFrequencies: "0.001,0.005,0.01",
                                tooltip: tooltips.populationFrequencies,
                                showSetAll: false,
                                // TODO read this from the StudyConfiguration in OpenCGA 2.1
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
                        id: "Example 1 - BRCA2",
                        active: false,
                        query: {
                            gene: "BRCA2"
                        }
                    },
                    {
                        id: "Example 2 - LoF and missense variants",
                        active: false,
                        query: {
                            ct: "frameshift_variant,incomplete_terminal_codon_variant,start_lost,stop_gained,stop_lost," +
                                "splice_acceptor_variant,splice_donor_variant,feature_truncation,transcript_ablation,missense_variant"
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
                        showReview: true,
                        showActions: false,
                        showSelectCheckbox: true,
                        multiSelection: false,
                        nucleotideGenotype: true,
                        alleleStringLengthMax: 10,

                        header: {
                            horizontalAlign: "center",
                            verticalAlign: "bottom"
                        },

                        quality: {
                            qual: 30,
                            dp: 20
                        },
                        evidences: {
                            showSelectCheckbox: true
                        }
                    }
                },
                detail: {
                    title: "Selected Variant: ",
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
                    <variant-browser-filter
                        .opencgaSession="${this.opencgaSession}"
                        .query="${this.query}"
                        .clinicalAnalysis="${this.clinicalAnalysis}"
                        .cellbaseClient="${this.cellbaseClient}"
                        .populationFrequencies="${POPULATION_FREQUENCIES}"
                        .consequenceTypes="${SAMPLE_STATS_CONSEQUENCE_TYPES}"
                        .config="${this._config.filter}"
                        @queryChange="${this.onVariantFilterChange}"
                        @querySearch="${this.onVariantFilterSearch}">
                    </variant-browser-filter>
                </div> <!-- Close col-md-2 -->

                <div class="col-md-10">
                    <div>
                        ${OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "WRITE_CLINICAL_ANALYSIS") ?
                            html`
                                <variant-interpreter-browser-toolbar
                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                    .state="${this.clinicalAnalysisManager.state}"
                                    @filterVariants="${this.onFilterVariants}"
                                    @resetVariants="${this.onResetVariants}"
                                    @saveInterpretation="${this.onSaveVariants}">
                                </variant-interpreter-browser-toolbar>` : null
                        }
                    </div>

                    <div id="${this._prefix}MainContent">
                        <div id="${this._prefix}ActiveFilters">
                            <opencga-active-filters
                                resource="VARIANT"
                                .opencgaSession="${this.opencgaSession}"
                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                .defaultStudy="${this.opencgaSession.study.fqn}"
                                .query="${this.preparedQuery}"
                                .executedQuery="${this.executedQuery}"
                                .filters="${this.activeFilterFilters}"
                                .alias="${this._config.activeFilterAlias}"
                                .genotypeSamples="${this.genotypeSamples}"
                                .modeInheritance="${this.modeInheritance}"
                                .config="${this._config.filter.activeFilters}"
                                @activeFilterChange="${this.onActiveFilterChange}"
                                @activeFilterClear="${this.onActiveFilterClear}">
                            </opencga-active-filters>
                        </div>

                        <!-- SEARCH TABLE RESULT -->
                        <div class="main-view">
                            <div id="${this._prefix}Interactive" class="variant-interpretation-content">
                                <variant-interpreter-grid
                                    .opencgaSession="${this.opencgaSession}"
                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                    .query="${this.executedQuery}"
                                    .review="${true}"
                                    .config="${this._config.filter.result.grid}"
                                    @selectrow="${this.onSelectVariant}"
                                    @checkrow="${this.onCheckVariant}">
                                </variant-interpreter-grid>

                                <!-- Bottom tabs with detailed variant information -->
                                <variant-interpreter-detail
                                    .opencgaSession="${this.opencgaSession}"
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

customElements.define("variant-interpreter-browser-rd", VariantInterpreterBrowserRd);
