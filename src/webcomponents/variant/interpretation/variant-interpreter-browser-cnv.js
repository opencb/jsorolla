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

class VariantInterpreterBrowserCNV extends LitElement {

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
            query: {
                type: Object,
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
        this.COMPONENT_ID = "variant-interpreter-cancer-cnv";
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

        let activeFilterFilters = [];
        let query = {};

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

        // get the somatic sample
        const somaticSample = this.clinicalAnalysis.proband.samples.find(sample => sample.somatic);
        if (somaticSample) {
            // 1. 'sample' query param: if sample is not defined then we must set the sample and genotype
            if (!query?.sample) {
                // We do not add GT filter ":0/1,1/1,NA" in cancer interpreter anymore
                // because variants with weird GT would not be displayed
                query.sample = somaticSample.id;
            }

            // 2. In CNV browser the TYPE is always COPY_NUMBER
            query.type = "COPY_NUMBER";

            // 3. 'panel' query param: add case panels to query object
            if (this.clinicalAnalysis.interpretation?.panels?.length > 0) {
                query.panel = this.clinicalAnalysis.interpretation.panels.map(panel => panel.id).join(",");
            } else {
                if (this.clinicalAnalysis.panels?.length > 0) {
                    query.panel = this.clinicalAnalysis.panels.map(panel => panel.id).join(",");
                }
            }

            // 4. panelIntersection param: if panel lock is enabled, this param should be also enabled
            if (this.clinicalAnalysis.panelLocked) {
                query.panelIntersection = true;
            }

            // 5. 'fileData' query param: fetch non SV files and set init query
            if (this.opencgaSession?.study?.internal?.configuration?.clinical?.interpretation?.variantCallers?.length > 0) {
                const nonSvSomaticVariantCallers = this.opencgaSession.study.internal.configuration.clinical.interpretation.variantCallers
                    .filter(vc => vc.somatic)
                    .filter(vc => vc.types.includes("COPY_NUMBER") || vc.types.includes("CNV"));

                this.files = this.clinicalAnalysis.files
                    .filter(file => file.format.toUpperCase() === "VCF")
                    .filter(file => {
                        return nonSvSomaticVariantCallers.findIndex(vc => vc.id.toUpperCase() === file.software?.name?.toUpperCase()) >= 0;
                    });

                const fileDataFilters = [];
                nonSvSomaticVariantCallers.forEach(vc => {
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
                query.fileData = fileDataFilters.join(",");

                // getDefaultConfig() uses this.files
                this._config = this.getDefaultConfig();
            }

            // 6. Read defaultFilter from browser settings
            if (this.settings?.menu?.defaultFilter) {
                query = {
                    ...query,
                    ...this.settings.menu.defaultFilter,
                };
            }

            // Add filter to Active Filters menu
            // 1. Add variant stats saved queries to the Active Filters menu
            if (somaticSample.qualityControl?.variant?.variantStats?.length > 0) {
                activeFilterFilters.push({
                    category: true,
                    name: "Variant Stats Filters",
                });
                activeFilterFilters.push(
                    ...somaticSample.qualityControl.variant.variantStats.map(variantStat => ({
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
            // No somatic sample found, this is weird scenario but can happen if a case is created empty.
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
            {id: "type"},
        ];

        // Add panels to locked fields
        if (this.clinicalAnalysis?.panels?.length > 0 && this.clinicalAnalysis.panelLocked) {
            lockedFields.push({id: "panel"});
            lockedFields.push({id: "panelIntersection"});
        }

        return {
            title: this.title || "Cancer CNV Variant Browser",
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
                                visible: () => this._files?.length > 0,
                                params: {
                                    files: this._files
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
                                visible: () => this._files?.length > 0,
                                params: {
                                    files: this._files,
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
                                title: "Disease Panel",
                                disabled: () => this.clinicalAnalysis.panelLocked,
                                message: {
                                    visible: () => this.clinicalAnalysis.panelLocked,
                                    text: "Case Panel is locked, you are not allowed to change selected panel(s)."
                                },
                                tooltip: tooltips.diseasePanels,
                                quick: true
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
            },
            aggregation: {}
        };
    }

}

customElements.define("variant-interpreter-browser-cnv", VariantInterpreterBrowserCNV);
