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
import "./variant-interpreter-browser-template.js";
import "./exomiser/variant-interpreter-exomiser-view.js";
import "../variant-samples.js";
import "../../visualization/protein-lollipop-variant-view.js";

class VariantInterpreterBrowserCNV extends LitElement {

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
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            settings: {
                type: Object
            },
            active: {
                type: Boolean,
            },
        };
    }

    _init() {
        this.COMPONENT_ID = "variant-interpreter-cancer-cnv";
        this._prefix = UtilsNew.randomString(8);

        this.query = {};
        this.activeFilterFilters = [];
        this.savedVariants = [];

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        super.update(changedProperties);
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    clinicalAnalysisObserver() {
        // Init the active filters with every new Case opened. Then we add the default filters for the given sample.
        let _activeFilterFilters;
        if (this.settings?.menu?.examples?.length > 0) {
            // Load custom filters if configured
            // We need to clone to make sure we reset active fields
            _activeFilterFilters = UtilsNew.objectClone(this.settings.menu.examples);
        } else {
            // Load default filters if not custom defined
            _activeFilterFilters = this._config?.filter?.examples ? [...this._config.filter.examples] : [];
        }

        // Check for adding the examples filters section
        if (_activeFilterFilters?.length > 0) {
            _activeFilterFilters.unshift({
                category: true,
                name: "Example Filters",
            });
        }

        this.somaticSample = this.clinicalAnalysis.proband.samples.find(sample => sample.somatic);
        if (this.somaticSample) {
            // Init query object if needed
            if (!this.query) {
                this.query = {};
            }

            // 1. 'sample' query param: if sample is not defined then we must set the sample and genotype
            if (!this.query?.sample) {
                // We do not add GT filter ":0/1,1/1,NA" in cancer interpreter anymore
                // because variants with weird GT would not be displayed
                this.query.sample = this.somaticSample.id;
            }

            // 2. In CNV browser the TYPE is always COPY_NUMBER
            this.query.type = "COPY_NUMBER";

            // 3. 'panel' query param: add case panels to query object
            if (this.clinicalAnalysis.interpretation?.panels?.length > 0) {
                this.query.panel = this.clinicalAnalysis.interpretation.panels.map(panel => panel.id).join(",");
            } else {
                if (this.clinicalAnalysis.panels?.length > 0) {
                    this.query.panel = this.clinicalAnalysis.panels.map(panel => panel.id).join(",");
                }
            }

            // 4. panelIntersection param: if panel lock is enabled, this param should be also enabled
            if (this.clinicalAnalysis.panelLock) {
                this.query.panelIntersection = true;
            }

            // 5. 'fileData' query param: fetch non SV files and set init query
            if (this.opencgaSession?.study?.internal?.configuration?.clinical?.interpretation?.variantCallers?.length > 0) {
                const nonSvSomaticVariantCallers = this.opencgaSession.study.internal.configuration.clinical.interpretation.variantCallers
                    .filter(vc => vc.somatic)
                    .filter(vc => vc.types.includes("COPY_NUMBER") || vc.types.includes("CNV"));

                this.files = this.clinicalAnalysis.files
                    .filter(file => file.format.toUpperCase() === "VCF")
                    .filter(file =>
                        nonSvSomaticVariantCallers.findIndex(vc => vc.id.toUpperCase() === file.software?.name?.toUpperCase()) >= 0);

                const fileDataFilters = [];
                nonSvSomaticVariantCallers
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

                // Update query with default 'fileData' parameters
                this.query.fileData = fileDataFilters.join(",");

                // getDefaultConfig() uses this.files
                this._config = this.getDefaultConfig();
            }

            // 6. Read defaultFilter from browser settings
            if (this.settings?.menu?.defaultFilter) {
                this.query = {
                    ...this.query,
                    ...this.settings.menu.defaultFilter,
                };
            }

            // Add filter to Active Filters menu
            // 1. Add variant stats saved queries to the Active Filters menu
            if (this.somaticSample.qualityControl?.variant?.variantStats?.length > 0) {
                _activeFilterFilters.push({
                    category: true,
                    name: "Variant Stats Filters",
                });
                _activeFilterFilters.push(
                    ...this.somaticSample.qualityControl.variant.variantStats.map(variantStat => ({
                        id: variantStat.id,
                        active: false,
                        query: variantStat.query,
                    })),
                );
            }

            // 2. Add default initial query the active filter menu
            _activeFilterFilters.unshift({
                id: "Default Initial Query",
                active: false,
                query: this.query,
            });

            // Set active filters
            this._config.filter.activeFilters.filters = _activeFilterFilters;
            const activeFilter = this._config.filter.activeFilters.filters.find(filter => filter.active);
            if (activeFilter?.query) {
                this.query = {...this.query, ...activeFilter.query};
            }
        } else {
            // No somatic sample found, this is weird scenario but can happen if a case is created empty.
            // We init active filters anyway.
            this._config.filter.activeFilters.filters = [];
        }

        this.query = {...this.query};
    }

    onQueryChange(event) {
        this.query = event.detail.query;
    }

    render() {
        return html`
            <variant-interpreter-browser-template
                .clinicalAnalysis="${this.clinicalAnalysis}"
                .cellbaseClient="${this.cellbaseClient}"
                .query="${this.query}"
                .opencgaSession="${this.opencgaSession}"
                .settings="${this.settings}"
                .toolId="${this.COMPONENT_ID}"
                .config="${this._config}"
                .active="${this.active}"
                @queryChange="${this.onQueryChange}">
            </variant-interpreter-browser-template>
        `;
    }

    getDefaultConfig() {
        const lockedFields = [
            {id: "sample"},
            {id: "sampleData"},
            {id: "file"},
            {id: "fileData"},
            {id: "type"},
        ];

        // Add panels to locked fields
        if (this.clinicalAnalysis?.panels?.length > 0 && this.clinicalAnalysis.panelLock) {
            lockedFields.push({id: "panel"});
            lockedFields.push({id: "panelIntersection"});
        }

        return {
            title: "Cancer CNV Case Interpreter",
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
                        "ct": "Consequence Types",
                        "sample": "Sample Genotype"
                    },
                    complexFields: [
                        {id: "sample", separator: ";"},
                        {id: "fileData", separator: ","},
                    ],
                    hiddenFields: [],
                    lockedFields: lockedFields,
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
                                            id: "1", name: "HAPLOID (1)"
                                        },
                                        {
                                            id: "1/2", name: "BIALLELIC (1/2)"
                                        },
                                        {
                                            id: "NA", name: "NA"
                                        }
                                    ]
                                },
                                tooltip: tooltips.sample,
                            },
                            {
                                id: "variant-file",
                                title: "VCF File Filter",
                                visible: () => this.files?.length > 0,
                                params: {
                                    files: this.files
                                },
                                tooltip: tooltips.vcfFile,
                            },
                            // {
                            //     id: "variant-file-sample-filter",
                            //     title: "Variant Caller Sample Filter",
                            //     tooltip: "VCF file sample filters"
                            // },
                            {
                                id: "variant-file-info-filter",
                                title: "Variant Caller File Filter",
                                visible: () => this.files?.length > 0,
                                params: {
                                    files: this.files,
                                    opencgaSession: this.opencgaSession
                                },
                                tooltip: tooltips.variantCallerFile,
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
                                message: {
                                    visible: () => this.clinicalAnalysis.panelLock,
                                    text: "Regions will be intersected with selected panels.",
                                },
                                tooltip: tooltips.region,
                            },
                            {
                                id: "feature",
                                title: "Feature IDs (gene, ...)",
                                message: {
                                    visible: () => this.clinicalAnalysis.panelLock,
                                    text: "Feature regions will be intersected with selected panels.",
                                },
                                tooltip: tooltips.feature,
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
                                tooltip: tooltips.type,
                                disabled: true,
                                params: {
                                    types: ["COPY_NUMBER"],
                                },
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
                                disabled: () => this.clinicalAnalysis.panelLock,
                                message: {
                                    visible: () => this.clinicalAnalysis.panelLock,
                                    text: "Case Panel is locked, you are not allowed to change selected panel(s)."
                                },
                                tooltip: tooltips.diseasePanels
                            },
                        ],
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
                        // pagination: true,
                        // pageSize: 10,
                        // pageList: [5, 10, 25],
                        // showExport: false,
                        // detailView: true,
                        // showReview: false,
                        // showActions: true,
                        showSelectCheckbox: true,
                        // multiSelection: false,
                        // nucleotideGenotype: true,
                        // alleleStringLengthMax: 10,

                        hideType: true,
                        hidePopulationFrequencies: true,
                        hideClinicalInfo: true,
                        hideDeleteriousness: true,

                        genotype: {
                            type: "VAF"
                        },

                        quality: {
                            qual: 30,
                            dp: 20
                        },
                        somatic: true,
                        variantTypes: ["COPY_NUMBER", "CNV"],
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
                            render: variant => html`
                                <cellbase-variant-annotation-summary
                                    .variantAnnotation="${variant?.annotation}"
                                    .consequenceTypes="${CONSEQUENCE_TYPES}"
                                    .proteinSubstitutionScores="${PROTEIN_SUBSTITUTION_SCORE}"
                                    .assembly=${this.opencgaSession.project.organism.assembly}>
                                </cellbase-variant-annotation-summary>
                            `,
                        },
                        {
                            id: "fileMetrics",
                            name: "File Metrics",
                            render: (variant, active, opencgaSession) => html`
                                <opencga-variant-file-metrics
                                    .opencgaSession="${opencgaSession}"
                                    .variant="${variant}"
                                    .files="${this.clinicalAnalysis}">
                                </opencga-variant-file-metrics>
                            `,
                        },
                        {
                            id: "cohortStats",
                            name: "Cohort Stats",
                            render: (variant, active, opencgaSession) => html`
                                <variant-cohort-stats
                                    .opencgaSession="${opencgaSession}"
                                    .variant="${variant}"
                                    .active="${active}">
                                </variant-cohort-stats>
                            `,
                        },
                        {
                            id: "samples",
                            name: "Samples",
                            render: (variant, active, opencgaSession) => html`
                                <variant-samples
                                    .opencgaSession="${opencgaSession}"
                                    .variantId="${variant.id}"
                                    .active="${active}">
                                </variant-samples>
                            `,
                        },
                        {
                            id: "protein",
                            name: "Protein (Beta)",
                            render: (variant, active, opencgaSession) => html`
                                <protein-lollipop-variant-view
                                    .opencgaSession="${opencgaSession}"
                                    .variant="${variant}"
                                    .query="${this.query}"
                                    .active="${active}">
                                </protein-lollipop-variant-view>
                            `,
                        },
                        {
                            id: "beacon",
                            name: "Beacon",
                            render: (variant, active, opencgaSession) => html`
                                <variant-beacon-network
                                    .variant="${variant?.id}"
                                    .assembly="${opencgaSession.project.organism.assembly}"
                                    .config="${this.beaconConfig}"
                                    .active="${active}">
                                </variant-beacon-network>
                            `,
                        },
                        {
                            id: "exomiser",
                            name: "Exomiser",
                            visible: () => {
                                return this.clinicalAnalysis?.interpretation?.method?.name === "interpretation-exomiser";
                            },
                            render: (variant, active) => html`
                                <variant-interpreter-exomiser-view
                                    .variant="${variant}"
                                    .active="${active}">
                                </variant-interpreter-exomiser-view>
                            `,
                        },
                        {
                            id: "json-view",
                            name: "JSON Data",
                            render: (variant, active) => html`
                                <json-viewer .data="${variant}" .active="${active}"></json-viewer>
                            `,
                        }
                    ]
                }
            },
            aggregation: {}
        };
    }

}

customElements.define("variant-interpreter-browser-cnv", VariantInterpreterBrowserCNV);
