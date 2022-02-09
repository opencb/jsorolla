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
import UtilsNew from "../../../core/utilsNew.js";
import "./variant-interpreter-browser-template.js";

class VariantInterpreterBrowserRearrangement extends LitElement {

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
            }
        };
    }

    _init() {
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
        // Init the active filters with every new Case opened. Then we add the default filters for the given sample
        const _activeFilterFilters = this._config?.filter?.examples ? [...this._config.filter.examples] : [];

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
            if (this.clinicalAnalysis.panelLock) {
                this.query.panelIntersection = true;
            }

            this.callerToFile = {};
            // 4. 'fileData' query param: fetch non SV files and set init query
            this.opencgaSession.opencgaClient.files().search({sampleIds: this.somaticSample.id, study: this.opencgaSession.study.fqn})
                .then(fileResponse => {
                    this.files = fileResponse.responses[0].results;
                    // Prepare a map from caller to File
                    this.callerToFile = {};
                    for (const file of this.files) {
                        if (file.software?.name) {
                            const softwareName = file.software.name.toLowerCase();
                            this.callerToFile[softwareName] = file;
                        }
                    }

                    // Init the default caller INFO filters
                    const fileDataFilters = [];
                    for (const caller of this._config.filter.callers) {
                        if (this.callerToFile[caller.id]) {
                            fileDataFilters.push(this.callerToFile[caller.id].name + ":" + caller.queryString);
                        }
                    }

                    this.query = {
                        ...this.query,
                        fileData: fileDataFilters.join(",")
                    };

                    // NOTE: We need to update the _config to update the dynamic VCF caller filters
                    this._config = this.getDefaultConfig();
                })
                .catch(response => {
                    console.error("An error occurred fetching sample: ", response);
                });


            // Add filter to Active Filter's menu
            // 1. Add variant stats saved queries to the Active Filters menu
            if (this.somaticSample.qualityControl?.variant?.variantStats?.length > 0) {
                _activeFilterFilters.length > 0 ? _activeFilterFilters.push({separator: true}) : null;
                _activeFilterFilters.push(
                    ...this.somaticSample.qualityControl.variant.variantStats
                        .map(variantStat => (
                            {
                                id: variantStat.id,
                                active: false,
                                query: variantStat.query
                            }
                        ))
                );
            }

            // 2. Add default initial query the active filter menu
            _activeFilterFilters.unshift({separator: true});
            _activeFilterFilters.unshift(
                {
                    id: "Default Initial Query",
                    active: false,
                    query: this.query
                }
            );

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

    render() {
        return html`
            <variant-interpreter-browser-template
                .clinicalAnalysis="${this.clinicalAnalysis}"
                .query="${this.query}"
                .opencgaSession="${this.opencgaSession}"
                .settings="${this.settings}"
                .config="${this._config}">
            </variant-interpreter-browser-template>
        `;
    }

    getDefaultConfig() {
        // Prepare dynamic Variant Caller INFO filters
        const callers = ["Caveman", "strelka", "Pindel", "ASCAT", "Canvas", "BRASS", "Manta", "TNhaplotyper2", "Pisces", "CRAFT"];
        const callerFilters = callers.map(caller => {
            const callerId = caller.toLowerCase();
            return {
                id: callerId,
                title: caller + " Filters",
                description: () => html`
                    File filters for <span style="font-style: italic; word-break: break-all">${this.callerToFile[callerId].name}</span>
                `,
                visible: () => this.callerToFile && this.callerToFile[callerId],
                params: {
                    fileId: `${this.callerToFile ? this.callerToFile[callerId]?.name : null}`,
                },
            };
        });

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
                callers: [],
                sections: [ // sections and subsections, structure and order is respected
                    {
                        title: "Genomic",
                        collapsed: false,
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
                                id: "diseasePanels",
                                title: "Disease Panels",
                                tooltip: tooltips.diseasePanels
                            },
                            {
                                id: "biotype",
                                title: "Gene Biotype",
                                biotypes: SAMPLE_STATS_BIOTYPES,
                                tooltip: tooltips.biotype
                            },
                            {
                                id: "ext-svtype",
                                title: "SVTYPE",
                                types: ["TRANSLOCATION", "DUPLICATION", "INVERSION", "DELETION"],
                                tooltip: tooltips.type,
                                params: {
                                    fileId: `${this.callerToFile ? this.callerToFile["brass"]?.name : null}`,
                                }
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
                        alleleStringLengthMax: 25,
                        header: {
                            horizontalAlign: "center",
                            verticalAlign: "bottom"
                        },

                        isRearrangement: true,
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
                            render: variant => html`
                                <cellbase-variant-annotation-summary
                                    .variantAnnotation="${variant.annotation}"
                                    .consequenceTypes="${SAMPLE_STATS_CONSEQUENCE_TYPES}"
                                    .proteinSubstitutionScores="${PROTEIN_SUBSTITUTION_SCORE}"
                                    .assembly=${this.opencgaSession.project.organism.assembly}>
                                </cellbase-variant-annotation-summary>
                            `,
                        },
                        {
                            id: "annotationConsType",
                            name: "Consequence Type",
                            render: (variant, active) => html`
                                <variant-consequence-type-view
                                    .consequenceTypes="${variant.annotation.consequenceTypes}"
                                    .active="${active}">
                                </variant-consequence-type-view>
                            `,
                        },
                        {
                            id: "annotationPropFreq",
                            name: "Population Frequencies",
                            render: (variant, active) => html`
                                <cellbase-population-frequency-grid
                                    .populationFrequencies="${variant.annotation.populationFrequencies}"
                                    .active="${active}">
                                </cellbase-population-frequency-grid>
                            `,
                        },
                        {
                            id: "annotationClinical",
                            name: "Clinical",
                            render: variant => html`
                                <variant-annotation-clinical-view
                                    .traitAssociation="${variant.annotation.traitAssociation}"
                                    .geneTraitAssociation="${variant.annotation.geneTraitAssociation}">
                                </variant-annotation-clinical-view>
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
                            id: "beacon",
                            name: "Beacon",
                            render: (variant, active, opencgaSession) => html`
                                <variant-beacon-network
                                    .variant="${variant.id}"
                                    .assembly="${opencgaSession.project.organism.assembly}"
                                    .config="${this.beaconConfig}"
                                    .active="${active}">
                                </variant-beacon-network>
                            `,
                        }
                    ]
                }
            },
            aggregation: {
            }
        };
    }

}

customElements.define("variant-interpreter-browser-rearrangement", VariantInterpreterBrowserRearrangement);
