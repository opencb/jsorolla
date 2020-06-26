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
import UtilsNew from "../../utilsNew.js";
import "../commons/opencga-browser.js";


export default class OpencgaIndividualBrowser extends LitElement {

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
            query: {
                type: Object
            },
            facetQuery: {
                type: Object
            },
            selectedFacet: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "facet" + UtilsNew.randomString(6);

        // These are for making the queries to server
        this.facetFields = [];
        this.facetRanges = [];

        this.facetFieldsName = [];
        this.facetRangeFields = [];

        this.facets = new Set();
        this.facetFilters = [];

        this.facetActive = true;
        this.selectedFacet = {};
        this.selectedFacetFormatted = {};
        this.errorState = false;

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    getDefaultConfig() {
        return {
            title: "Individual Browser",
            icon: "fab fa-searchengin",
            searchButtonText: "Search",
            views: [
                {
                    id: "table-tab",
                    name: "Table result",
                    icon: "fa fa-table",
                    active: true
                },
                {
                    id: "facet-tab",
                    name: "Aggregation stats",
                    icon: "fas fa-chart-bar"
                }
                ,/*
                {
                    id: "comparator-tab",
                    name: "Comparator"
                }*/
            ],
            filter: {
                sections: [
                    {
                        title: "Section title",
                        collapsed: false,
                        fields: [
                            {
                                id: "id",
                                name: "Individual ID",
                                type: "string",
                                placeholder: "LP-1234,LP-2345...",
                                description: ""
                            },
                            {
                                id: "samples",
                                name: "Sample ID",
                                type: "string",
                                placeholder: "HG01879, HG01880, HG01881...",
                                description: ""
                            },
                            {
                                id: "father",
                                name: "Father ID",
                                type: "string",
                                placeholder: "LP-1234,LP-2345...",
                                description: ""
                            },
                            {
                                id: "mother",
                                name: "Mother ID",
                                type: "string",
                                placeholder: "LP-1234,LP-2345...",
                                description: ""
                            },
                            {
                                id: "phenotypes",
                                name: "Phenotype",
                                placeholder: "Full-text search, e.g. *melanoma*",
                                description: ""
                            },
                            {
                                id: "disorders",
                                name: "Disorder",
                                placeholder: "Intellectual disability,Arthrogryposis...",
                                description: ""
                            },
                            {
                                id: "sex",
                                name: "Sex",
                                allowedValues: ["MALE", "FEMALE", "UNKNOWN", "UNDETERMINED"],
                                multiple: true,
                                description: ""
                            },
                            {
                                id: "karyotypicSex",
                                name: "Karyotypic Sex",
                                type: "category",
                                allowedValues: ["XX", "XY", "XO", "XXY", "XXX", "XXYY", "XXXY", "XXXX", "XYY", "OTHER", "UNKNOWN"],
                                multiple: true,
                                description: ""
                            },
                            {
                                id: "ethnicity",
                                name: "Ethnicity",
                                type: "string",
                                placeholder: "White caucasian,asiatic...",
                                description: ""
                            },
                            {
                                id: "lifeStatus",
                                name: "Life Status",
                                allowedValues: ["ALIVE", "ABORTED", "DECEASED", "UNBORN", "STILLBORN", "MISCARRIAGE", "UNKNOWN"],
                                multiple: true,
                                description: ""
                            },
                            {
                                id: "annotations",
                                name: "Individual Annotations",
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
                        active: false,
                        query: {
                            id: "LP",
                            samples: "HG",
                            sex: "FEMALE",
                            karyotypicSex: "VCF,BCF,PROTOCOL_BUFFER",
                            ethnicity: "asiatic",
                            disorder: "british",
                            affectationStatus: "AFFECTED",
                            lifeStatus: "ALIVE",
                            phenotypes: "melanoma",
                            creationDate: "20201004"
                        }
                    }
                ],
                grid: {
                    pageSize: 10,
                    pageList: [10, 25, 50],
                    detailView: true,
                    multiSelection: false,
                    showSelectCheckbox: false
                },
                gridComparator: {
                    pageSize: 5,
                    pageList: [5, 10],
                    detailView: true,
                    multiSelection: true
                },
                detail: {
                    title: "Individual",
                    showTitle: true,
                    items: [
                        {
                            id: "individual-view",
                            name: "Overview",
                            active: true,
                            render: (individual, active, opencgaSession) => {
                                return html`<opencga-individual-view .individual="${individual}" .opencgaSession="${opencgaSession}"></opencga-individual-view>`;
                            }
                        }
                    ]
                }
            },
            aggregation: {
                default: ["type", "format", "bioformat"],
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
                                id: "source",
                                name: "source",
                                type: "string",
                                description: "Source"
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
                                id: "status",
                                name: "status",
                                type: "string",
                                description: "Status"
                            },
                            {
                                id: "type",
                                name: "type",
                                type: "string",
                                description: "type"
                            },
                            {
                                id: "phenotypes",
                                name: "phenotypes",
                                type: "string",
                                description: "Phenotypes"
                            },
                            {
                                id: "release",
                                name: "release",
                                type: "string",
                                description: "Release"
                            },
                            {
                                id: "version",
                                name: "version",
                                type: "string",
                                description: "Version"
                            },
                            {
                                id: "somatic",
                                name: "somatic",
                                type: "category",
                                allowedValues: ["true", "false"],
                                multiple: false,
                                defaultValue: "false",
                                description: "Somatic"
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
            annotations: {},
        };
    }

    render() {
        return this._config ? html`
            <opencga-browser  resource="individuals"
                            .opencgaSession="${this.opencgaSession}"
                            .query="${this.query}"
                            .config="${this._config}">
            </opencga-browser>` : null;
    }

}

customElements.define("opencga-individual-browser", OpencgaIndividualBrowser);
