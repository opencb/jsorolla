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


export default class OpencgaFamilyBrowser extends LitElement {

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
        this._prefix = "fb" + UtilsNew.randomString(6);

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
            title: "Family Browser",
            icon: "fab fa-searchengin",
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
                                name: "Family ID",
                                type: "string",
                                placeholder: "LP-1234,LP-2345...",
                                description: ""
                            },
                            {
                                id: "members",
                                name: "Members",
                                type: "string",
                                placeholder: "HG01879, HG01880, HG01881...",
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
                                id: "annotations",
                                name: "Family Annotations",
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
                            id: "lp",
                            members: "hg",
                            phenotypes: "melanoma",
                            creationDate: "2020"
                        }
                    }
                ],
                activeFilters: {
                    complexFields: ["annotation"]
                },
                grid: {
                    pageSize: 10,
                    pageList: [10, 25, 50],
                    detailView: true,
                    multiSelection: false
                },
                detail: {
                    title: "Family",
                    showTitle: true,
                    items: [
                        {
                            id: "family-view",
                            name: "Overview",
                            active: true,
                            // visible:
                            render: (family, active, opencgaSession) => {
                                return html`<opencga-family-view .opencgaSession="${opencgaSession}" .family="${family}"></opencga-family-view>`;
                            }
                        }
                    ]
                }
            },
            aggregation: {
                default: ["study"],
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
                                id: "numMembers",
                                name: "numMembers",
                                type: "string",
                                description: "Number of members"
                            },
                            {
                                id: "expectedSize",
                                name: "expectedSize",
                                 type: "string",
                                description: "Expected size"
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
        return this.opencgaSession && this._config
            ? html`
                <opencga-browser  resource="family"
                                  .opencgaSession="${this.opencgaSession}"
                                  .query="${this.query}"
                                  .config="${this._config}">
                </opencga-browser>`
            : null;
    }

}

customElements.define("opencga-family-browser", OpencgaFamilyBrowser);
