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


export default class OpencgaSampleBrowser extends LitElement {

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
        this._prefix = "sb" + UtilsNew.randomString(6);

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
            title: "Sample Browser",
            icon: "fas fa-chart-bar",
            searchButtonText: "Run",
            views: [
                {
                    id: "table-tab",
                    name: "Table result",
                    active: true
                },
                {
                    id: "facet-tab",
                    name: "Aggregation stats"
                },/*
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
                                name: "Sample ID",
                                placeholder: "HG01879, HG01880, HG01881...",
                                description: ""
                            },
                            {
                                id: "individual",
                                name: "Individual ID",
                                placeholder: "LP-1234, LP-4567...",
                                description: "",
                                showList: false
                            },
                            {
                                id: "file",
                                name: "File Name",
                                placeholder: "file.vcf, ...",
                                description: ""
                            },
                            {
                                id: "annotations",
                                name: "Sample annotations",
                                description: ""
                            },
                            {
                                id: "phenotypes",
                                name: "Phenotypes",
                                placeholder: "Full-text search, e.g. melanoma",
                                description: ""
                            },
                            {
                                id: "somatic",
                                name: "Somatic",
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
                            id: "HG",
                            individual: "LP",
                            source: "LP",
                            phenotypes: "melanoma",
                            somatic: "True",
                            creationDate: ">=20200216"
                        }
                    }
                ],
                result: {
                    grid: {
                        pageSize: 10,
                        pageList: [10, 25, 50],
                        multiSelection: false
                    },
                    sampleDetail: {
                        showTitle: false
                    }
                },
                detail: {
                    title: "Sample",
                    showTitle: true,
                    items: [
                        {
                            id: "sample-view",
                            name: "Overview",
                            active: true,
                            render: (sample, active, opencgaSession) => {
                                return html`<opencga-sample-view .sample="${sample}" .opencgaSession="${opencgaSession}"></opencga-sample-view>`;
                            }
                        },
                        {
                            id: "sample-variant-stats-view",
                            name: "Variant Stats",
                            render: (sample, active, opencgaSession) => {
                                return html`<sample-variant-stats-view .sampleId="${sample.id}" .opencgaSession="${opencgaSession}"></sample-variant-stats-view>`;
                            }
                        },
                        {
                            id: "individual-view",
                            name: "Individual",
                            render: (sample, active, opencgaSession) => {
                                return html`<opencga-individual-view .individualId="${sample?.individualId}" .opencgaSession="${opencgaSession}"></opencga-individual-view>`;
                            }
                        },
                        {
                            id: "file-view",
                            name: "Files",
                            render: (sample, active, opencgaSession) => {
                                return html`<opencga-file-grid .opencgaSession="${opencgaSession}" .query="${{samples: sample.id}}" .search="${{samples: sample.id}}"></opencga-file-grid>`;
                            }
                        }
                    ]
                }
            },
            aggregation: {
                default: [],
                result: {
                    numColumns: 2
                },
                sections: [
                    {
                        name: "Section Title",
                        // collapsed: false,
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
                                type: "boolean",
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
            }
        };
    }

    render() {
        return this._config ? html`
            <opencga-browser  resource="samples"
                            .opencgaSession="${this.opencgaSession}"
                            .query="${this.query}"
                            .config="${this._config}">
            </opencga-browser>` : null;
    }

}


customElements.define("opencga-sample-browser", OpencgaSampleBrowser);
