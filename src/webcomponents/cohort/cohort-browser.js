/*
 * Copyright 2015-2024 OpenCB
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


import {html, LitElement, nothing} from "lit";
import WebUtils from "../commons/utils/web-utils";
import "../commons/opencga-browser.js";
import "./cohort-grid.js";
import "./cohort-detail.js";

export default class CohortBrowser extends LitElement {

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
            opencgaSession: {
                type: Object
            },
            query: {
                type: Object
            },
            settings: {
                type: Object
            }
        };
    }

    #init() {
        this.COMPONENT_ID = "cohort-browser";
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        super.update(changedProperties);
    }

    settingsObserver() {
        this._config = WebUtils.mergeSettingsAndBrowserConfig(this.settings, this.getDefaultConfig(), this.COMPONENT_ID, this.opencgaSession);
    }

    onUserGridSettingsUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    onCohortUpdate() {
        this.settingsObserver();
    }

    render() {
        return this.opencgaSession && this._config ? html`
            <opencga-browser
                resource="COHORT"
                .opencgaSession="${this.opencgaSession}"
                .query="${this.query}"
                .config="${this._config}"
                @cohortUpdate="${this.onCohortUpdate}">
            </opencga-browser>` : "";
    }

    getDefaultConfig() {
        return {
            title: "Cohort Browser",
            icon: "fab fa-searchengin",
            views: [
                {
                    id: "table-tab",
                    name: "Table result",
                    icon: "fa fa-table",
                    active: true,
                    render: params => html`
                        <cohort-grid
                            .toolId="${this.COMPONENT_ID}"
                            .opencgaSession="${params.opencgaSession}"
                            .query="${params.executedQuery}"
                            .search="${params.executedQuery}"
                            .config="${params.config.filter.result.grid}"
                            .eventNotifyName="${params.eventNotifyName}"
                            .active="${true}"
                            @selectrow="${e => params.onClickRow(e)}"
                            @cohortUpdate="${e => params.onComponentUpdate(e)}"
                            @userGridSettingsUpdate="${() => this.onUserGridSettingsUpdate()}">
                        </cohort-grid>
                        ${params?.detail ? html`
                            <cohort-detail
                                .opencgaSession="${params.opencgaSession}"
                                .config="${params.config.filter.detail}"
                                .cohortId="${params.detail?.id}">
                            </cohort-detail>
                        ` : nothing}
                    `,
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
                                name: "Cohort ID",
                                type: "string",
                                placeholder: "Start typing...",
                                description: ""
                            },
                            {
                                id: "samples",
                                name: "Samples",
                                type: "string",
                                placeholder: "HG01879, HG01880, HG01881...",
                                description: ""
                            },
                            // {
                            //     id: "type",
                            //     name: "Type",
                            //     type: "string",
                            //     multiple: true,
                            //     description: ""
                            // },
                            {
                                id: "date",
                                name: "Date",
                                description: ""
                            },
                            {
                                id: "annotations",
                                name: "Cohort annotations",
                                placeholder: "Full-text search, e.g. *melanoma*",
                                description: ""
                            }
                        ]
                    }
                ],
                examples: [],
                result: {
                    grid: {}
                },
                detail: {
                    title: "Cohort",
                    showTitle: true,
                    display: {
                        titleClass: "mt-4",
                        contentClass: "p-3"
                    },
                    items: [
                        {
                            id: "cohort-view",
                            name: "Overview",
                            active: true,
                            render: (cohort, active, opencgaSession) => {
                                return html`
                                    <cohort-view
                                        .opencgaSession="${opencgaSession}"
                                        .cohort="${cohort}">
                                    </cohort-view>
                                `;
                            }
                        },
                        {
                            id: "sample-view",
                            name: "Samples",
                            render: (cohort, active, opencgaSession) => {
                                return html`
                                    <sample-grid
                                        .opencgaSession="${opencgaSession}"
                                        .query="${{cohortIds: cohort.id}}"
                                        .active="${active}">
                                    </sample-grid>
                                `;
                            }
                        },
                        {
                            id: "json-view",
                            name: "JSON Data",
                            render: (cohort, active) => {
                                return html`
                                    <json-viewer
                                        .data="${cohort}"
                                        .active="${active}">
                                    </json-viewer>
                                `;
                            }
                        }
                    ]
                }
            },
            aggregation: {
                default: ["creationYear>>creationMonth", "status", "numSamples[0..10]:1"],
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
                        name: "Cohort Attributes",
                        filters: [
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
                                allowedValues: ["READY", "DELETED", "NONE", "CALCULATING", "INVALID"],
                                description: "Status"
                            },
                            {
                                id: "release",
                                name: "Release",
                                type: "string",
                                description: "Release"
                            },
                            {
                                id: "type",
                                name: "Type",
                                type: "category",
                                allowedValues: ["CASE_CONTROL", "CASE_SET", "CONTROL_SET", "PAIRED", "PAIRED_TUMOR", "AGGREGATE", "TIME_SERIES", "FAMILY", "TRIO", "COLLECTION"],
                                description: "Type"
                            },
                            {
                                id: "numSamples",
                                name: "Number Of Samples",
                                type: "number",
                                description: "Number of samples"
                            },
                            {
                                id: "annotations",
                                name: "Aannotations",
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
            }
        };
    }

}

customElements.define("cohort-browser", CohortBrowser);
