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

import {html, LitElement} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "./variant-interpreter-browser-template.js";

class VariantInterpreterBrowserRd extends LitElement {

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
            query: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "variant-interpreter-rd";
        this._prefix = UtilsNew.randomString(8);
        this._query = {};
        this._files = [];
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

    /*
     * Fetch the ClinicalAnalysis object from REST and trigger the observer call.
     */
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
        // Configuration is using the clinicalAnalysis
        this._config = this.getDefaultConfig();

        let query = {};
        let activeFilterFilters;

        // Init the active filters with every new Case opened. Then we add the default filters for the given sample.
        if (this.settings?.menu?.examples?.length > 0) {
            // Load custom filters if configured
            // We need to clone to make sure we reset active fields
            activeFilterFilters = UtilsNew.objectClone(this.settings.menu.examples);
        } else {
            // Load default filters if not custom defined
            activeFilterFilters = this._config?.filter?.examples ? [...this._config.filter.examples] : [];
        }

        // Check for adding the examples filters section
        if (activeFilterFilters?.length > 0) {
            activeFilterFilters.unshift({
                category: true,
                name: "Example Filters",
            });
        }

        // get the germline sample
        const sample = this.clinicalAnalysis.proband?.samples?.find(sample => !sample.somatic);

        if (sample) {
            // 1. 'sample' query param: if sample is not defined then we must set the sample and genotype
            if (!query?.sample) {
                let sampleQuery = null;
                switch (this.clinicalAnalysis.type.toUpperCase()) {
                    case "SINGLE":
                    case "CANCER":
                        // Nacho (29-7-24): we have found too many exceptions in the genotypes, we should NOT add the genotypes here
                        // this._sampleQuery = this.sample.id + ":" + ["0/1", "1/1", "1", "1/2"].join(",");
                        sampleQuery = sample.id;
                        break;
                    case "FAMILY":
                        // Add proband genotypes
                        const sampleIds = [sample.id + ":" + ["0/1", "1/1", "1", "1/2"].join(",")];
                        for (const member of this.clinicalAnalysis.family?.members) {
                            // Proband is already in the array in the first position, we add other family members
                            if (member.id !== this.clinicalAnalysis.proband?.id && member.samples?.length > 0) {
                                sampleIds.push(member.samples[0].id + ":" + ["0/0", "0/1", "1/1", "1", "1/2"].join(","));
                            }
                        }
                        sampleQuery = sampleIds.join(";");
                        break;
                }

                // Set query object
                if (sampleQuery) {
                    query.sample = sampleQuery;
                }
            }

            // 2. 'panel' query param: add case panels to query object
            if (this.clinicalAnalysis.interpretation?.panels?.length > 0) {
                query.panel = this.clinicalAnalysis.interpretation.panels.map(panel => panel.id).join(",");
            } else {
                if (this.clinicalAnalysis.panels?.length > 0) {
                    query.panel = this.clinicalAnalysis.panels.map(panel => panel.id).join(",");
                }
            }

            // 3. panelIntersection param: if panel lock is enabled, this param should be also enabled
            if (this.clinicalAnalysis.panelLocked) {
                query.panelIntersection = true;
            }

            // 4. 'fileData' query param: fetch non SV files and set init query
            if (this.opencgaSession?.study?.internal?.configuration?.clinical?.interpretation?.variantCallers?.length > 0) {
                // Germline callers with the right Variant Type and with defined INFO filters
                const nonSvGermlineVariantCallers = this.opencgaSession.study.internal.configuration.clinical.interpretation.variantCallers
                    .filter(vc => !vc.somatic)
                    .filter(vc => vc.types.includes("SNV") || vc.types.includes("INDEL") ||
                        vc.types.includes("COPY_NUMBER") || vc.types.includes("CNV") ||
                        vc.types.includes("INSERTION") || vc.types.includes("DELETION"))
                    .filter(vc => vc.dataFilters.findIndex(filter => !filter.source || filter.source === "FILE") !== -1);

                // Files matching the selected Variant Callers
                this._files = (this.clinicalAnalysis.files || [])
                    .filter(file => file.format.toUpperCase() === "VCF")
                    .filter(file =>
                        nonSvGermlineVariantCallers.findIndex(vc => vc.id.toUpperCase() === file.software?.name?.toUpperCase()) !== -1);

                if (this._files?.length > 0) {
                    const fileDataFilters = [];
                    nonSvGermlineVariantCallers
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
                                // We need to find the file for that caller, file MUST be indexed
                                const fileId = this._files
                                    .filter(file => file.internal?.variant?.index?.status?.id === "READY")
                                    .find(file => file.software.name === vc.id)?.name;
                                if (fileId) {
                                    fileDataFilters.push(fileId + ":" + filtersWithDefaultValues.join(";"));
                                }
                            }
                        });

                    // Update query with default 'fileData' parameters
                    query.fileData = fileDataFilters.join(",");
                } else {
                    this._files = this.clinicalAnalysis.files?.filter(file => file.format.toUpperCase() === "VCF") || [];
                }
            } else {
                this._files = this.clinicalAnalysis.files?.filter(file => file.format.toUpperCase() === "VCF") || [];
            }

            // 5. Read defaultFilter from browser settings
            if (this.settings?.menu?.defaultFilter) {
                query = {
                    ...query,
                    ...this.settings.menu.defaultFilter,
                };
            }

            // Create _config again since getDefaultConfig() uses this.files
            this._config = this.getDefaultConfig();

            // Add filter to Active Filter's menu
            // 1. Add variant stats saved queries to the Active Filters menu
            if (sample.qualityControl?.variant?.variantStats?.length > 0) {
                activeFilterFilters.push({
                    category: true,
                    name: "Variant Stats Filters",
                });
                activeFilterFilters.push(
                    ...sample.qualityControl.variant.variantStats.map(variantStat => ({
                        id: variantStat.id,
                        active: false,
                        query: variantStat.query,
                    })),
                );
            }

            // 2. Add default initial query the active filter menu
            activeFilterFilters.unshift({
                id: "Default Filter",
                active: false,
                query: query,
            });

            // Add 'file' filter if 'fileData' exists
            if (this._files) {
                const fileNames = this._files
                    .filter(file => file.internal?.variant?.index?.status?.id === "READY")
                    .map(f => f.name);
                // Only filter by file if there are more than 1 file indexed
                if (fileNames.length > 0) {
                    const joinedFileNames = fileNames.join(",");
                    for (const filter of activeFilterFilters) {
                        if (filter.query?.fileData && !filter.query?.file) {
                            filter.query.file = joinedFileNames;
                        }
                    }
                }
            }

            // Set active filters
            this._config.filter.filters = activeFilterFilters;
            const activeFilter = this._config.filter.filters.find(filter => filter.active);
            if (activeFilter?.query) {
                query = {
                    ...query,
                    ...activeFilter.query,
                };
            }
        } else {
            // No germline sample found, this is weird scenario but can happen if a case is created empty.
            // We init active filters anyway.
            this._config.filter.filters = [];
        }

        // set the initial query: use the query from the property (to restore the previous query) or the default query
        this._query = this.query ? UtilsNew.objectClone(this.query) : query;
    }

    onQueryChange(event) {
        this._query = event.detail.query;
    }

    render() {
        return html`
            <variant-interpreter-browser-template
                .clinicalAnalysis="${this.clinicalAnalysis}"
                .query="${this._query}"
                .opencgaSession="${this.opencgaSession}"
                .settings="${this.settings}"
                .toolId="${this.COMPONENT_ID}"
                .config="${this._config}"
                .active="${this.active}"
                @queryChange="${event => this.onQueryChange(event)}">
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
            title: this.title || "RD Variant Browser",
            filter: {
                filters: [],
                defaultFilter: null,
                activeFilters: {
                    hiddenFields: [],
                    lockedFields: lockedFields
                },
                save: {
                    ignoreParams: ["study", "sample", "file", "fileData"],
                },
                sections: [
                    {
                        title: "Sample",
                        collapsed: false,
                        filters: [
                            {
                                id: "sample-genotype",
                                title: "Sample Genotype",
                                visible: () => this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "CANCER",
                                tooltip: tooltips.sample,
                                quick: this.clinicalAnalysis?.type?.toUpperCase() === "SINGLE" || this.clinicalAnalysis?.type?.toUpperCase() === "CANCER"
                            },
                            {
                                id: "family-genotype",
                                title: "Family Genotype",
                                clinicalAnalysis: this.clinicalAnalysis,
                                visible: () => this.clinicalAnalysis.type.toUpperCase() === "FAMILY",
                                tooltip: tooltips.sample,
                                quick: false, // this.clinicalAnalysis?.type?.toUpperCase() === "FAMILY"
                            },
                            {
                                id: "individual-hpo",
                                title: "Proband Phenotype Filter",
                                tooltip: tooltips.sample,
                                disabled: () => !this.clinicalAnalysis?.proband?.phenotypes?.length,
                                message: {
                                    visible: () => !this.clinicalAnalysis?.proband?.phenotypes?.length,
                                    text: "No phenotypes found."
                                },
                                params: {
                                    individual: this.clinicalAnalysis?.proband
                                }
                            },
                            {
                                id: "variant-file",
                                title: "VCF File Filter",
                                visible: () => this._files?.length > 1,
                                params: {
                                    files: this._files,
                                },
                                tooltip: tooltips.vcfFile,
                            },
                            {
                                id: "variant-file-sample-filter",
                                title: "Variant Caller Sample Filters",
                                // tooltip: "VCF file sample filters"
                                tooltip: tooltips.variantCallerSample,
                            },
                            {
                                id: "variant-file-info-filter",
                                title: "Variant Caller File Filter",
                                visible: () => this._files?.length > 0,
                                params: {
                                    files: this._files,
                                    opencgaSession: this.opencgaSession,
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
                                    // types: ["SNV", "INDEL", "COPY_NUMBER", "INSERTION", "DELETION", "DUPLICATION", "MNV"]
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
                                disabled: () => this.clinicalAnalysis.panelLock,
                                message: {
                                    visible: () => this.clinicalAnalysis.panelLock,
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
                        // pagination: true,
                        // pageSize: 10,
                        // pageList: [5, 10, 25],
                        // showExport: false,
                        // detailView: true,
                        // showReview: true,
                        // showActions: true,
                        showSelectCheckbox: true,
                        // multiSelection: false,
                        // nucleotideGenotype: true,
                        // alleleStringLengthMax: 10,

                        quality: {
                            qual: 30,
                            dp: 20
                        },
                        evidences: {
                            showSelectCheckbox: true
                        },
                        somatic: false,
                        variantTypes: ["SNV", "INDEL", "INSERTION", "DELETION"],
                    }
                },
            },
            aggregation: {}
        };
    }

}

customElements.define("variant-interpreter-browser-rd", VariantInterpreterBrowserRd);
