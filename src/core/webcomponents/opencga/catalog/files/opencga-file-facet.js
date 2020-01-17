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


export default class OpencgaFileFacet extends LitElement {

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
        console.log("connectedCallback _config", this._config)
    }

    firstUpdated(_changedProperties) {
    }

    getDefaultConfig() {

        return {
                title: "Aggregation Stats for Files",
                name: "Agregation for Files",
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
                    {id: "gerp1", name: "Gerp1", type: "categorical", defaultValue: "0:1:01"},
                    {id: "gerp2", name: "Gerp2", type: "range", defaultValue: "0:1:01"},
                    {id: "creationMonth", name: "Month", type: "string", defaultValue: ["JAN", "FEB"]},
                    {id: "study", name: "Study", type: "string", defaultValue: "defStudy"},
                    {id: "name", name: "Name", type: "string"},
                    {id: "type", name: "Type", type: "string"},
                    {id: "format", name: "Format", type: "string"},
                    {id: "bioformat", name: "Bioformat", type: "string"},
                    {id: "creationYear", name: "CreationYear", type: "string"},
                    {id: "creationMonth", name: "CreationMonth", type: "string"},
                    {id: "creationDay", name: "CreationDay", type: "string"},
                    {id: "creationDayOfWeek", name: "CreationDayOfWeek", type: "string"},
                    {id: "status", name: "Status", type: "string"},
                    {id: "release", name: "Release", type: "string"},
                    {id: "external", name: "External", type: "string"},
                    {id: "size", name: "Size", type: "string"},
                    {id: "software", name: "Software", type: "string"},
                    {id: "experiment", name: "Experiment", type: "string"},
                    {id: "numSamples", name: "NumSamples", type: "string"},
                    {id: "numRelatedFiles", name: "NumRelatedFiles", type: "string"},
                    {id: "annotation", name: "Annotation", type: "string"},
                    {id: "default", name: "Default", type: "string"},
                    {id: "field", name: "Field", type: "string"}
                ],
                annotations: {}
            };
    }


    render() {
        return this._config ? html`
            <opencga-facet  resource="files"
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


customElements.define("opencga-file-facet", OpencgaFileFacet);
