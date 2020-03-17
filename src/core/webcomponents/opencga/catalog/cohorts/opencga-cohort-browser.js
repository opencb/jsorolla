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
import Utils from "./../../../../utils.js";
import "../../commons/opencga-browser.js";

export default class OpencgaCohortBrowser extends LitElement {

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
            },
            resource: {
                type: String
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

    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
    }

    getDefaultConfig() {
        return {
            title: "Cohort Browser",
            icon: "fas fa-chart-bar",
            showComparator: true,
            filter: {
                sections: [
                    {
                        title: "Section title",
                        collapsed: false,
                        fields: [
                            {
                                id: "id",
                                name: "ID",
                                type: "string",
                                placeholder: "LP-1234,LP-2345...",
                                description: ""
                            },
                            {
                                id: "samples",
                                name: "Samples",
                                type: "string",
                                placeholder: "HG01879, HG01880, HG01881...",
                                description: ""
                            },
                            {
                                id: "annotations",
                                name: "Cohort annotations",
                                placeholder: "Full-text search, e.g. *melanoma*",
                                description: ""
                            },
                            {
                                id: "type",
                                name: "Type",
                                multiple: true,
                                allowedValues: ["All", "CASE_CONTROL", "CASE_SET", "CONTROL_SET", "PAIRED", "PAIRED_TUMOR", "AGGREGATE", "TIME_SERIES", "FAMILY", "TRIO"],
                                description: ""
                            },
                            {
                                id: "date",
                                name: "Date",
                                description: ""
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        name: "Full",
                        query: {
                            annotation: "Pedigree:versionControl.GitVersionControl=git",
                            type: "TIME_SERIES,FAMILY",
                            id: "lp",
                            samples: "hg"
                        }
                    }
                ],
                grid: {}
            },
            aggregation: {
                default: ["name"],
                result: {
                    numColumns: 2
                },
                sections: [
                    {
                        name: "section title",
                        fields: [
                            {
                                id: "study",
                                name: "study",
                                type: "string",
                                description: "Study [[user@]project:]study where study and project can be either the ID or UUID"
                            },
                            {
                                id: "type",
                                name: "type",
                                type: "string",
                                description: "type"
                            },
                            {
                                id: "creationYear",
                                name: "creationYear",
                                type: "string",
                                description: "Creation year"
                            },
                            {
                                id: "creationMonth",
                                name: "creationMonth",
                                type: "string",
                                description: "Creation month (JANUARY, FEBRUARY...)"
                            },
                            {
                                id: "creationDay",
                                name: "creationDay",
                                type: "string",
                                description: "Creation day"
                            },
                            {
                                id: "creationDayOfWeek",
                                name: "creationDayOfWeek",
                                type: "string",
                                description: "Creation day of week (MONDAY, TUESDAY...)"
                            },
                            {
                                id: "numSamples",
                                name: "numSamples",
                                type: "string",
                                description: "Number of samples"
                            },
                            {
                                id: "status",
                                name: "status",
                                type: "string",
                                description: "Status"
                            },
                            {
                                id: "release",
                                name: "release",
                                type: "string",
                                description: "Release"
                            },
                            {
                                id: "annotation",
                                name: "annotation",
                                type: "string",
                                description: "Annotation, e.g: key1=value(,key2=value)"
                            },
                            {
                                id: "field",
                                name: "field",
                                type: "string",
                                description: "List of fields separated by semicolons, e.g.: studies;type. For nested fields use >>, e.g.: studies>>biotype;type;numSamples[0..10]:1"
                            }
                        ]
                    }
                ]
            },

            // TODO recheck
            gridComparator: {
                multiSelection: true,
                pageSize: 5,
                pageList: [5, 10]
            },
            variableSetIds: []
        };
    }


    render() {
        return this._config ? html`
            <opencga-browser  resource="cohort"
                            .opencgaSession="${this.opencgaSession}"
                            .opencgaClient="${this.opencgaSession.opencgaClient}"
                            .query="${this.browserSearchQuery}"
                            .config="${this._config}"
                            .cellbaseClient="${this.cellbaseClient}"
                            .populationFrequencies="${this.populationFrequencies}"
                            .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                            .consequenceTypes="${this.consequenceTypes}">
            </opencga-browser>` : null;
    }

}


customElements.define("opencga-cohort-browser", OpencgaCohortBrowser);
