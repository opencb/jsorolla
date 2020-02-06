/**
 * Copyright 2015-2019 OpenCB
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

import {LitElement, html} from "/web_modules/lit-element.js";
import "./opencga-variant-filter.js";
import "../opencga/commons/opencga-facet-result-view.js";
import "../opencga/opencga-active-filters.js";
import "../commons/filters/select-field-filter.js";
import "../../loading-spinner.js";

// TODO spring-cleaning the old code

export default class OpencgaVariantFacet extends LitElement {

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
            opencgaClient: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            populationFrequencies: {
                type: Object
            },
            consequenceTypes: {
                type: Object
            },
            proteinSubstitutionScores: {
                type: Object
            },
            query: {
                type: Object
            },
            search: {
                type: Object
            },
            config: {
                type: Object
            },
            facetQuery: {
                type: Object
            },
            selectedFacet: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "facet" + Utils.randomString(6);

        this.checkProjects = false;

        this.activeFilterAlias = {
            "annot-xref": "XRef",
            "biotype": "Biotype",
            "annot-ct": "Consequence Types",
            "alternate_frequency": "Population Frequency",
            "annot-functional-score": "CADD",
            "protein_substitution": "Protein Substitution",
            "annot-go": "GO",
            "annot-hpo": "HPO"
        };

        this.fixedFilters = ["studies"];

        // These are for making the queries to server
        this.facetFields = [];
        this.facetRanges = [];

        this.facetFieldsName = [];
        this.facetRangeFields = [];

        this.results = [];
        this._showInitMessage = true;

        this.facets = new Set();
        this.facetFilters = [];

        this.facetConfig = {a: 1};
        this.facetActive = true;
        this.query = {};
        this.preparedQuery = {};
        this.selectedFacet = {};
        this.selectedFacetFormatted = {};
        this.errorState = false;


        /* TODO review: from variant-browser */
        this._collapsed = false;
        this.genotypeColor = {
            "0/0": "#6698FF",
            "0/1": "#FFA500",
            "1/1": "#FF0000",
            "./.": "#000000",
            "0|0": "#6698FF",
            "0|1": "#FFA500",
            "1|0": "#FFA500",
            "1|1": "#FF0000",
            ".|.": "#000000",
        };
        this.variantId = "No variant selected";

        this._sessionInitialised = false;
        this.detailActiveTabs = [];
    }

    firstUpdated(_changedProperties) {
        $(".bootstrap-select", this).selectpicker();
        //console.log("this.query from BROWSER", this.query)
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(_changedProperties) {
        if (_changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
    }

    opencgaSessionObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = {...this.getDefaultConfig(), ...this.config};

        // Check if Beacon hosts are configured
        for (let detail of this._config.detail) {
            if (detail.id === "beacon" && UtilsNew.isNotEmptyArray(detail.hosts)) {
                this.beaconConfig = {
                    hosts: detail.hosts
                };
            }
        }

        // Update cohorts from config, this updates the Cohort filter MAF
        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.project)) {
            for (let section of this._config.filter.menu.sections) {
                for (let subsection of section.subsections) {
                    if (subsection.id === "cohort") {
                        this.cohorts = subsection.cohorts;
                    }
                }
            }

            if (this._sessionInitialised) {
                // We reset the query object when the session is changed
                this.query = {
                    study: this.opencgaSession.study.fqn
                };
            } else {
                this.query = {...this.query};
            }


            this.checkProjects = true;
        } else {
            this.checkProjects = false;
        }

        this._sessionInitialised = true;

    }


    getDefaultConfig() {
        console.log("getDefaultConfig", this.opencgaSession)
        return {
            title: "Aggregation Stats",
            active: false,
            populationFrequencies: true,
            endpoint: this.opencgaSession.opencgaClient.variants(),
            fields: [
                {
                    name: "terms", fields: [
                        {
                            name: "Chromosome", value: "chromosome"
                        },
                        {
                            name: "Studies", value: "studies"
                        },
                        {
                            name: "Variant Type", value: "type"
                        },
                        {
                            name: "Genes", value: "genes"
                        },
                        {
                            name: "Biotypes", value: "biotypes"
                        },
                        {
                            name: "Consequence Type", value: "soAcc"
                        }
                    ]
                },
                {
                    name: "ranges", fields: [
                        {
                            name: "PhastCons", value: "phastCons", default: "[0..1]:0.1"
                        },
                        {
                            name: "PhyloP", value: "phylop", default: ""
                        },
                        {
                            name: "Gerp", value: "gerp", default: "[-12.3..6.17]:2"
                        },
                        {
                            name: "CADD Raw", value: "caddRaw", default: ""
                        },
                        {
                            name: "CADD Scaled", value: "caddScaled", default: ""
                        },
                        {
                            name: "Sift", value: "sift", default: "[0..1]:0.1"
                        },
                        {
                            name: "Polyphen", value: "polyphen", default: "[0..1]:0.1"
                        }
                    ]
                }]

        }
    }

    render() {
        return this._config ? html`
            <opencga-facet  resource="variants"
                            .opencgaSession="${this.opencgaSession}"
                            .opencgaClient="${this.opencgaSession.opencgaClient}"
                            .query="${this.query}"
                            .config="${this._config}"
                            .cellbaseClient="${this.cellbaseClient}"
                            .populationFrequencies="${this.populationFrequencies}"
                            .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                            .consequenceTypes="${this.consequenceTypes}">
            </opencga-facet>` : null;
    }

}


customElements.define("opencga-variant-facet", OpencgaVariantFacet);
