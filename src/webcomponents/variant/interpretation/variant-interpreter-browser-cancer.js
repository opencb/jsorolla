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

class VariantInterpreterBrowserCancer extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this.#init();
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
            title: {
                type: String,
            },
            settings: {
                type: Object
            },
            active: {
                type: Boolean,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "variant-interpreter-cancer-snv";
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

            // 2. 'panel' query param: add case panels to query object
            if (this.clinicalAnalysis.interpretation?.panels?.length > 0) {
                this.query.panel = this.clinicalAnalysis.interpretation.panels.map(panel => panel.id).join(",");
            } else {
                if (this.clinicalAnalysis.panels?.length > 0) {
                    this.query.panel = this.clinicalAnalysis.panels.map(panel => panel.id).join(",");
                }
            }

            // 3. panelIntersection param: if panel lock is enabled, this param should be also enabled
            if (this.clinicalAnalysis.panelLocked) {
                this.query.panelIntersection = true;
            }

            // 4. Get all files indexed
            this.indexedFiles = this.clinicalAnalysis.files
                .filter(file => file.format.toUpperCase() === "VCF");

            // 5. 'fileData' query param: fetch non SV files and set init query
            if (this.opencgaSession?.study?.internal?.configuration?.clinical?.interpretation?.variantCallers?.length > 0) {
                // Somatic callers with the right Variant Type and with defined INFO filters
                const nonSvSomaticVariantCallers = this.opencgaSession.study.internal.configuration.clinical.interpretation.variantCallers
                    .filter(vc => vc.somatic)
                    // .filter(vc => vc.id.toUpperCase() !== "ASCAT")
                    // .filter(vc => vc.types.includes("SNV") || vc.types.includes("INDEL") ||
                    //     vc.types.includes("COPY_NUMBER") || vc.types.includes("CNV"))
                    .filter(vc => vc.types.includes("SNV") || vc.types.includes("INDEL"))
                    .filter(vc => vc.dataFilters.findIndex(filter => !filter.source || filter.source === "FILE") !== -1);

                // Files matching the selected Variant Callers
                this.files = this.clinicalAnalysis.files
                    .filter(file => file.format.toUpperCase() === "VCF")
                    .filter(file =>
                        nonSvSomaticVariantCallers.findIndex(vc => vc.id.toUpperCase() === file.software?.name?.toUpperCase()) !== -1);

                if (this.files?.length > 0) {
                    const fileDataFilters = [];
                    nonSvSomaticVariantCallers
                        .forEach(vc => {
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
                                const fileId = this.files
                                    .filter(file => file.internal?.variant?.index?.status?.id === "READY")
                                    .find(file => file.software.name === vc.id)?.name;
                                if (fileId) {
                                    fileDataFilters.push(fileId + ":" + filtersWithDefaultValues.join(";"));
                                }
                            }
                        });

                    // Update query with default 'fileData' parameters
                    this.query.fileData = fileDataFilters.join(",");
                } else {
                    this.files = this.clinicalAnalysis.files
                        .filter(file => file.format.toUpperCase() === "VCF");
                }
            } else {
                this.files = this.clinicalAnalysis.files
                    .filter(file => file.format.toUpperCase() === "VCF");
            }

            // 6. Read defaultFilter from browser settings
            if (this.settings?.menu?.defaultFilter) {
                this.query = {
                    ...this.query,
                    ...this.settings.menu.defaultFilter,
                };
            }

            // Create _config again since getDefaultConfig() uses this.files
            this._config = this.getDefaultConfig();


            // Add filter to Active Filter's menu
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
                id: "Default Filter",
                active: false,
                query: this.query,
            });

            // Add 'file' filter if 'fileData' exists
            if (this.files) {
                const fileNames = this.files
                    .filter(file => file.internal?.variant?.index?.status?.id === "READY")
                    .map(f => f.name);
                // Only filter by file if there are more than 1 file indexed
                if (fileNames.length > 0) {
                    const joinedFileNames = fileNames.join(",");
                    for (const filter of _activeFilterFilters) {
                        if (filter.query?.fileData && !filter.query?.file) {
                            filter.query.file = joinedFileNames;
                        }
                    }
                }
            }

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
            // {id: "sampleData"},
            // {id: "file"},
            // {id: "fileData"},
        ];

        // Add panels to locked fields
        if (this.clinicalAnalysis?.panels?.length > 0 && this.clinicalAnalysis.panelLocked) {
            lockedFields.push({id: "panel"});
            lockedFields.push({id: "panelIntersection"});
        }

        return {
            title: this.title || "SNV Variant Browser",
            filter: {
                activeFilters: {
                    hiddenFields: [],
                    lockedFields: lockedFields,
                },
                save: {
                    ignoreParams: ["study", "sample", "file", "fileData"],
                },
                sections: [ // sections and subsections, structure and order is respected
                    {
                        title: "Sample And File",
                        collapsed: false,
                        filters: [
                            {
                                id: "sample-genotype",
                                title: "Sample Genotype",
                                tooltip: tooltips.sample,
                                quick: true
                            },
                            {
                                id: "variant-file",
                                title: "VCF File Filter",
                                visible: () => this.files?.length > 1,
                                params: {
                                    files: this.files,
                                },
                                tooltip: tooltips.vcfFile,
                            },
                            {
                                id: "variant-file-sample-filter",
                                title: "Variant Caller Sample Filter",
                                // tooltip: "VCF file sample filters"
                                tooltip: tooltips.variantCallerSample,
                            },
                            {
                                id: "variant-file-info-filter",
                                title: "Variant Caller File Filter",
                                visible: () => this.files?.length > 0,
                                // visible: () => !!this.query.fileData,
                                params: {
                                    files: this.files,
                                    opencgaSession: this.opencgaSession
                                },
                                tooltip: tooltips.variantCallerFile,
                            },
                            {
                                id: "cohort",
                                title: "Cohort Alternate Stats",
                                onlyCohortAll: true,
                                tooltip: tooltips.cohort,
                                studies: this.opencgaSession?.project?.studies
                            }
                        ]
                    },
                    {
                        title: "Genomic",
                        collapsed: true,
                        filters: [
                            {
                                id: "variant",
                                title: "Variant ID",
                                description: "Introduce a comma separated list of variant IDs. Accepted format is chrom:position:ref:alt, eg: 11:66923381:-:A",
                                tooltip: tooltips.variant,
                                quick: true,
                            },
                            {
                                id: "region",
                                title: "Genomic Region",
                                message: {
                                    visible: () => this.clinicalAnalysis.panelLocked,
                                    text: "Regions will be intersected with selected panels.",
                                },
                                tooltip: tooltips.region,
                            },
                            {
                                id: "feature",
                                title: "Feature ID",
                                description: "Select a feature from the list (gene, SNP, etc.)",
                                message: {
                                    visible: () => this.clinicalAnalysis.panelLocked,
                                    text: "Feature regions will be intersected with selected panels.",
                                },
                                tooltip: tooltips.feature,
                                quick: true
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
                                params: {
                                    types: VARIANT_TYPES
                                },
                                quick: true
                            }
                        ]
                    },
                    {
                        title: "Consequence Type",
                        collapsed: true,
                        filters: [
                            {
                                id: "consequence-type",
                                title: "Consequence Type",
                                tooltip: tooltips.consequenceTypeSelect,
                                quick: true
                            }
                        ]
                    },
                    {
                        title: "Population Frequency",
                        collapsed: true,
                        filters: [
                            {
                                id: "populationFrequency",
                                title: "Population Frequency",
                                tooltip: tooltips.populationFrequencies,
                                params: {
                                    showSetAll: false,
                                    populationFrequencyIndexConfiguration: this.opencgaSession?.study?.internal?.configuration
                                        ?.variantEngine?.sampleIndex?.annotationIndexConfiguration?.populationFrequency,
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
                                title: "Disease Panel",
                                disabled: () => this.clinicalAnalysis.panelLocked,
                                message: {
                                    visible: () => this.clinicalAnalysis.panelLocked,
                                    text: "Case Panel is locked, you are not allowed to change selected panel(s)."
                                },
                                tooltip: tooltips.diseasePanels,
                                quick: true
                            },
                            {
                                id: "clinical-annotation",
                                title: "Clinical Annotation",
                                tooltip: tooltips.clinical,
                                quick: true
                            },
                            {
                                id: "role-in-cancer",
                                title: "Role In Cancer",
                                tooltip: tooltips.roleInCancer,
                                disabled: () => UtilsNew.compareVersions("2.6.0", this.opencgaSession.about.Version) < 0,
                                message: {
                                    visible: () => UtilsNew.compareVersions("2.6.0", this.opencgaSession.about.Version) < 0,
                                    text: "Gene Role in Cancer filter is only available from OpenCGA 2.6.0"
                                },
                                params: {
                                    rolesInCancer: ROLE_IN_CANCER
                                },
                                quick: true
                            },
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
                    // {
                    //     id: "Example 1 - BRCA2",
                    //     active: false,
                    //     query: {
                    //         gene: "BRCA2"
                    //     }
                    // },
                    // {
                    //     id: "Example 2 - LoF and missense variants",
                    //     active: false,
                    //     query: {
                    //         ct: "frameshift_variant,incomplete_terminal_codon_variant,start_lost,stop_gained,stop_lost," +
                    //             "splice_acceptor_variant,splice_donor_variant,feature_truncation,transcript_ablation,missense_variant"
                    //     }
                    // }
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

                        genotype: {
                            type: "VAF"
                        },

                        quality: {
                            qual: 30,
                            dp: 20
                        },
                        somatic: true,
                        variantTypes: ["SNV", "INDEL"],
                    }
                },
            },
            aggregation: {}
        };
    }

}

customElements.define("variant-interpreter-browser-cancer", VariantInterpreterBrowserCancer);
