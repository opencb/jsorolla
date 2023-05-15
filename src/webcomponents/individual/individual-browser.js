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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "./qc/individual-qc-inferred-sex.js";
import "./qc/individual-qc-mendelian-errors.js";
import "../clinical/clinical-analysis-grid.js";
import "../commons/opencga-browser.js";
import "../commons/json-viewer.js";
import "../commons/facet-filter.js";
import "../commons/opencb-facet-results.js";
import "./individual-view.js";
import "./individual-grid.js";
import "./individual-detail.js";


export default class IndividualBrowser extends LitElement {

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
            /* facetQuery: {
                type: Object
            },
            selectedFacet: {
                type: Object
            },*/
            settings: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        super.update(changedProperties);
    }

    settingsObserver() {
        this._config = {...this.getDefaultConfig()};
        // merge filter list, canned filters, detail tabs
        if (this.settings?.menu) {
            this._config.filter = UtilsNew.mergeFiltersAndDetails(this._config?.filter, this.settings);
        }
        if (this.settings?.table) {
            this._config.filter.result.grid = {...this._config.filter.result.grid, ...this.settings.table};
        }
        if (this.settings?.table?.toolbar) {
            this._config.filter.result.grid.toolbar = {...this._config.filter.result.grid.toolbar, ...this.settings.table.toolbar};
        }

        // Apply user configuration
        if (this.opencgaSession.user?.configs?.IVA?.individualBrowserCatalog?.grid) {
            this._config.filter.result.grid = {
                ...this._config.filter.result.grid,
                ...this.opencgaSession.user.configs.IVA.individualBrowserCatalog.grid,
            };
        }

        this.requestUpdate();
    }

    onSettingsUpdate() {
        this.settingsObserver();
    }

    render() {
        return this.opencgaSession && this._config ? html`
            <opencga-browser
                resource="INDIVIDUAL"
                .opencgaSession="${this.opencgaSession}"
                .query="${this.query}"
                .config="${this._config}">
            </opencga-browser>` : "";
    }

    getDefaultConfig() {
        return {
            title: "Individual Browser",
            icon: "fab fa-searchengin",
            views: [
                {
                    id: "table-tab",
                    name: "Table result",
                    icon: "fa fa-table",
                    active: true,
                    render: params => html`
                        <individual-grid
                            .opencgaSession="${params.opencgaSession}"
                            .config="${params.config.filter.result.grid}"
                            .eventNotifyName="${params.eventNotifyName}"
                            .query="${params.executedQuery}"
                            .active="${true}"
                            @selectrow="${e => params.onClickRow(e, "individual")}"
                            @settingsUpdate="${() => this.onSettingsUpdate()}">
                        </individual-grid>
                        <individual-detail
                            .opencgaSession="${params.opencgaSession}"
                            .config="${params.config.filter.detail}"
                            .individualId="${params.detail.individual?.id}">
                        </individual-detail>`
                },
                {
                    id: "facet-tab",
                    name: "Aggregation stats",
                    icon: "fas fa-chart-bar",
                    render: params => html`
                        <opencb-facet-results
                            resource="${params.resource}"
                            .opencgaSession="${params.opencgaSession}"
                            .active="${params.active}"
                            .query="${params.facetQuery}"
                            .data="${params.facetResults}">
                        </opencb-facet-results>`
                }
                /*
                {
                    id: "comparator-tab",
                    name: "Comparator"
                }*/
            ],
            filter: {
                searchButton: false,
                sections: [
                    {
                        title: "Section title",
                        collapsed: false,
                        filters: [
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
                                multiple: true,
                                description: ""
                            },
                            {
                                id: "disorders",
                                name: "Disorder",
                                placeholder: "Intellectual disability,Arthrogryposis...",
                                multiple: true,
                                description: ""
                            },
                            {
                                id: "sex",
                                name: "Sex",
                                multiple: true,
                                description: ""
                            },
                            {
                                id: "karyotypicSex",
                                name: "Karyotypic Sex",
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
                                id: "date",
                                name: "Date",
                                description: ""
                            },
                            {
                                id: "annotations",
                                name: "Individual Annotations",
                                description: ""
                            }
                        ]
                    }
                ],
                examples: [],
                activeFilters: {
                    complexFields: [
                        {id: "disorders", separatorRegex: /(?:(?!,\S).)+/g},
                    ],
                },
                result: {
                    grid: {
                        pageSize: 10,
                        pageList: [5, 10, 25],
                        detailView: true,
                        multiSelection: false,
                        showSelectCheckbox: false
                    }
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
                            render: (individual, active, opencgaSession) => html`
                                <individual-view
                                    .individual="${individual}"
                                    .opencgaSession="${opencgaSession}">
                                </individual-view>
                            `,
                        },
                        {
                            id: "clinical-analysis-grid",
                            name: "Clinical Analysis",
                            render: (individual, active, opencgaSession) => {
                                const config = {
                                    readOnlyMode: true
                                };
                                return html`
                                    <p class="alert"> <i class="fas fa-info-circle align-middle"></i> Clinical Analysis in which the individual is the proband.</p>
                                    <clinical-analysis-grid
                                        .query="${{"proband": individual.id}}"
                                        .config=${config}
                                        .opencgaSession="${opencgaSession}">
                                    </clinical-analysis-grid>
                                `;
                            }
                        },
                        {
                            id: "individual-inferred-sex",
                            name: "Inferred Sex",
                            render: (individual, active, opencgaSession) => html`
                                <individual-qc-inferred-sex
                                    .individual="${individual}"
                                    .opencgaSession="${opencgaSession}">
                                </individual-qc-inferred-sex>
                            `,
                        },
                        {
                            id: "individual-mendelian-error",
                            name: "Mendelian Error",
                            render: (individual, active, opencgaSession) => html`
                                <individual-qc-mendelian-errors
                                    .individual="${individual}"
                                    .opencgaSession="${opencgaSession}">
                                </individual-qc-mendelian-errors>
                            `
                        },
                        {
                            id: "json-view",
                            name: "JSON Data",
                            render: (individual, active, opencgaSession) => html`
                                <json-viewer
                                    .data="${individual}"
                                    .active="${active}">
                                </json-viewer>
                            `,
                        }
                    ]
                }
            },
            aggregation: {
                default: ["creationYear>>creationMonth", "status", "ethnicity", "population", "lifeStatus", "phenotypes", "sex", "numSamples[0..10]:1"],
                render: params => html `
                    <facet-filter
                        .config="${params.config.aggregation}"
                        .selectedFacet="${params.selectedFacet}"
                        @facetQueryChange="${params.onFacetQueryChange}">
                    </facet-filter>`,
                result: {
                    numColumns: 2
                },
                sections: [
                    {
                        name: "Individual Attributes",
                        fields: [
                            {
                                id: "studyId",
                                name: "Study id",
                                type: "string",
                                description: "Study [[user@]project:]study where study and project can be either the ID or UUID"
                            },
                            {
                                id: "creationYear",
                                name: "Creation Year",
                                type: "string",
                                description: "Creation year"
                            },
                            {
                                id: "creationMonth",
                                name: "Creation Month",
                                type: "category",
                                allowedValues: ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"],
                                description: "Creation month (JANUARY, FEBRUARY...)"
                            },
                            {
                                id: "creationDay",
                                name: "Creation Day",
                                type: "category",
                                allowedValues: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
                                description: "Creation day"
                            },
                            {
                                id: "creationDayOfWeek",
                                name: "Creation Day Of Week",
                                type: "category",
                                allowedValues: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
                                description: "Creation day of week (MONDAY, TUESDAY...)"
                            },
                            {
                                id: "status",
                                name: "Status",
                                type: "category",
                                allowedValues: ["READY", "DELETED"],
                                description: "Status"
                            },
                            {
                                id: "release",
                                name: "Release",
                                type: "string",
                                description: "Release"
                            },
                            {
                                id: "version",
                                name: "Version",
                                type: "string",
                                description: "Version"
                            },
                            {
                                id: "hasFather",
                                name: "Has Father",
                                type: "category",
                                allowedValues: ["true", "false"],
                                description: "Has father"
                            },
                            {
                                id: "hasMother",
                                name: "Has Mother",
                                type: "category",
                                allowedValues: ["true", "false"],
                                description: "Has mother"
                            },
                            {
                                id: "locationCity",
                                name: "Location City",
                                type: "string",
                                description: "Location city"
                            },
                            {
                                id: "locationState",
                                name: "Location State",
                                type: "string",
                                description: "Location state"
                            },
                            {
                                id: "locationCountry",
                                name: "Location Country",
                                type: "string",
                                description: "Location country"
                            },
                            {
                                id: "yearOfBirth",
                                name: "Year Of Birth",
                                type: "string",
                                description: "Year of birth"
                            },
                            {
                                id: "monthOfBirth",
                                name: "Month Of Birth",
                                type: "category",
                                allowedValues: ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"],
                                description: "Month of birth (JANUARY, FEBRUARY...)"
                            },
                            {
                                id: "dayOfBirth",
                                name: "Day Of Birth",
                                type: "category",
                                allowedValues: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
                                description: "Day of birth"
                            },
                            {
                                id: "sex",
                                name: "Sex",
                                type: "string",
                                description: "Sex"
                            },
                            {
                                id: "karyotypicSex",
                                name: "Laryotypic Sex",
                                type: "string",
                                description: "Karyotypic sex"
                            },
                            {
                                id: "ethnicity",
                                name: "Ethnicity",
                                type: "string",
                                description: "Ethnicity"
                            },
                            {
                                id: "population",
                                name: "Population",
                                type: "string",
                                description: "Population"
                            },
                            {
                                id: "lifeStatus",
                                name: "Life Status",
                                type: "category",
                                allowedValues: ["ALIVE", "ABORTED", "DECEASED", "UNBORN", "STILLBORN", "MISCARRIAGE", "UNKNOWN"],
                                description: "Life status"
                            },
                            {
                                id: "phenotypes",
                                name: "Phenotypes",
                                type: "string",
                                description: "Phenotypes"
                            },
                            {
                                id: "disorders",
                                name: "Disorders",
                                type: "string",
                                description: "Disorders"
                            },
                            {
                                id: "numSamples",
                                name: "Number Of Samples",
                                type: "number",
                                description: "Number Of Samples"
                            },
                            {
                                id: "parentalConsanguinity",
                                name: "Parental Consanguinity",
                                type: "category",
                                allowedValues: ["true", "false"],
                                description: "Parental consanguinity"
                            },
                            {
                                id: "annotations",
                                name: "Annotations",
                                type: "string",
                                description: "Annotations, e.g: key1=value(,key2=value)"
                            }
                        ]
                    },
                    {
                        name: "Advanced",
                        fields: [
                            {
                                id: "field",
                                name: "Field",
                                type: "string",
                                description: "List of fields separated by semicolons, e.g.: studies;type. For nested fields use >>, e.g.: studies>>biotype;type;numSamples[0..10]:1"
                            }
                        ]
                    }
                ]
            },
            annotations: {}
        };
    }


}

customElements.define("individual-browser", IndividualBrowser);
