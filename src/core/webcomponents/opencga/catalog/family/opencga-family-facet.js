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
import "../../commons/opencga-facet.js";


export default class OpencgaFamilyFacet extends LitElement {

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
            title: "Aggregation Stats for Family",
            name: "Aggregation for Family",
            active: false,
            icon: `fas fa-chart-bar`,
            fields: [
                {id: "gerp", name: "Gerp", type: "integer", defaultValue: "0:1:01"},
                //{name: "Pop Freqs_", category: true},
                {
                    name: "Pop Freqs", fields: [
                        {id: "Pop Freqs name", name: "PopFreqsName", type: "string"},
                        {id: "Pop Freqs format", name: "PopFreqsFormat", type: "string"}
                    ]
                },
                {
                    "name": "study",
                    "param": "query",
                    "type": "string",
                    "allowedValues": "",
                    "required": false,
                    "defaultValue": "",
                    "description": "Study [[user@]project:]study where study and project can be either the ID or UUID"
                },
                {
                    "name": "creationYear",
                    "param": "query",
                    "type": "string",
                    "allowedValues": "",
                    "required": false,
                    "defaultValue": "",
                    "description": "Creation year"
                },
                {
                    "name": "creationMonth",
                    "param": "query",
                    "type": "string",
                    "allowedValues": "",
                    "required": false,
                    "defaultValue": "",
                    "description": "Creation month (JANUARY, FEBRUARY...)"
                },
                {
                    "name": "creationDay",
                    "param": "query",
                    "type": "string",
                    "allowedValues": "",
                    "required": false,
                    "defaultValue": "",
                    "description": "Creation day"
                },
                {
                    "name": "creationDayOfWeek",
                    "param": "query",
                    "type": "string",
                    "allowedValues": "",
                    "required": false,
                    "defaultValue": "",
                    "description": "Creation day of week (MONDAY, TUESDAY...)"
                },
                {
                    "name": "status",
                    "param": "query",
                    "type": "string",
                    "allowedValues": "",
                    "required": false,
                    "defaultValue": "",
                    "description": "Status"
                },
                {
                    "name": "phenotypes",
                    "param": "query",
                    "type": "string",
                    "allowedValues": "",
                    "required": false,
                    "defaultValue": "",
                    "description": "Phenotypes"
                },
                {
                    "name": "release",
                    "param": "query",
                    "type": "string",
                    "allowedValues": "",
                    "required": false,
                    "defaultValue": "",
                    "description": "Release"
                },
                {
                    "name": "version",
                    "param": "query",
                    "type": "string",
                    "allowedValues": "",
                    "required": false,
                    "defaultValue": "",
                    "description": "Version"
                },
                {
                    "name": "numMembers",
                    "param": "query",
                    "type": "string",
                    "allowedValues": "",
                    "required": false,
                    "defaultValue": "",
                    "description": "Number of members"
                },
                {
                    "name": "expectedSize",
                    "param": "query",
                    "type": "string",
                    "allowedValues": "",
                    "required": false,
                    "defaultValue": "",
                    "description": "Expected size"
                },
                {
                    "name": "annotation",
                    "param": "query",
                    "type": "string",
                    "allowedValues": "",
                    "required": false,
                    "defaultValue": "",
                    "description": "Annotation, e.g: key1=value(,key2=value)"
                },
                {
                    "name": "default",
                    "param": "query",
                    "type": "boolean",
                    "allowedValues": "",
                    "required": false,
                    "defaultValue": "false",
                    "description": "Calculate default stats"
                },
                {
                    "name": "field",
                    "param": "query",
                    "type": "string",
                    "allowedValues": "",
                    "required": false,
                    "defaultValue": "",
                    "description": "List of fields separated by semicolons, e.g.: studies;type. For nested fields use >>, e.g.: studies>>biotype;type;numSamples[0..10]:1"
                }
            ],
            annotations: {}
        };
    }


    render() {
        return this._config ? html`
            <opencga-facet  resource="family"
                            .opencgaSession="${this.opencgaSession}"
                            .opencgaClient="${this.opencgaSession.opencgaClient}"
                            .query="${this.browserSearchQuery}"
                            .config="${this._config}"
                            .cellbaseClient="${this.cellbaseClient}"
                            .populationFrequencies="${this.populationFrequencies}"
                            .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                            .consequenceTypes="${this.consequenceTypes}">
            </opencga-facet>` : null;
    }

}


customElements.define("opencga-family-facet", OpencgaFamilyFacet);
