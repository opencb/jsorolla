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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "../commons/opencga-browser.js";
import "../commons/facet-filter.js";
import "./family-grid.js";
import "./family-detail.js";


export default class FamilyBrowser extends LitElement {

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
            settings: {
                type: Object
            }
        };
    }

    _init() {
        this.COMPONENT_ID = "family-browser";
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        super.update(changedProperties);
    }

    settingsObserver() {
        this._config = this.getDefaultConfig();

        // merge filter list, canned filters, detail tabs
        if (this.settings?.menu) {
            this._config.filter = UtilsNew.mergeFiltersAndDetails(this._config?.filter, this.settings);
        }

        // Grid configuration and take out toolbar admin/user settings to grid level.
        if (this.settings?.table) {
            const {toolbar, ...otherTableProps} = this.settings.table;
            UtilsNew.setObjectValue(this._config, "filter.result.grid", {
                ...this._config.filter.result.grid,
                ...otherTableProps,
                ...toolbar,
            });
        }

        // Apply User grid configuration. Only 'pageSize' and 'columns' are set
        UtilsNew.setObjectValue(this._config, "filter.result.grid", {
            ...this._config.filter?.result?.grid,
            ...this.opencgaSession.user?.configs?.IVA?.settings?.[this.COMPONENT_ID]?.grid
        });

        this.requestUpdate();
    }

    onSettingsUpdate() {
        this.settingsObserver();
    }

    onFamilyUpdate() {
        this.settingsObserver();
    }

    render() {
        if (!this.opencgaSession) {
            return html`<div>Not valid session</div>`;
        }

        return html`
            <opencga-browser
                resource="FAMILY"
                .opencgaSession="${this.opencgaSession}"
                .query="${this.query}"
                .config="${this._config}"
                @familyUpdate="${this.onFamilyUpdate}">
            </opencga-browser>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Family Browser",
            icon: "fab fa-searchengin",
            views: [
                {
                    id: "table-tab",
                    name: "Table result",
                    icon: "fa fa-table",
                    active: true,
                    render: params => html `
                        <family-grid
                            .toolId="${this.COMPONENT_ID}"
                            .opencgaSession="${params.opencgaSession}"
                            .query="${params.executedQuery}"
                            .config="${params.config.filter.result.grid}"
                            .active="${true}"
                            .eventNotifyName="${params.eventNotifyName}"
                            @selectrow="${e => params.onClickRow(e)}"
                            @familyUpdate="${e => params.onComponentUpdate(e)}"
                            @settingsUpdate="${() => this.onSettingsUpdate()}">
                        </family-grid>
                        ${params?.detail ? html`
                            <family-detail
                                .opencgaSession="${params.opencgaSession}"
                                .config="${params.config.filter.detail}"
                                .familyId="${params.detail?.id}">
                            </family-detail>
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
                        </opencb-facet-results>
                    `,
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
                                id: "disorders",
                                name: "Disorders",
                                placeholder: "Intellectual disability,Arthrogryposis...",
                                description: ""
                            },
                            {
                                id: "phenotypes",
                                name: "Phenotype",
                                placeholder: "Full-text search, e.g. *melanoma*",
                                description: ""
                            },
                            {
                                id: "date",
                                name: "Creation Date",
                                description: ""
                            },
                            {
                                id: "annotations",
                                name: "Family Annotations",
                                description: ""
                            }
                        ]
                    }
                ],
                examples: [],
                activeFilters: {
                    complexFields: [
                        {id: "annotation", separator: ";"},
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
                detail: {
                    title: "Family",
                    showTitle: true,
                    items: [
                        {
                            id: "family-view",
                            name: "Overview",
                            active: true,
                            render: (family, active, opencgaSession) => html`
                                <family-view
                                    .opencgaSession="${opencgaSession}"
                                    .family="${family}"
                                    .settings="${OPENCGA_FAMILY_VIEW_SETTINGS}">
                                </family-view>
                            `,
                        },
                        {
                            id: "family-relatedness",
                            name: "Relatedness",
                            render: (family, active, opencgaSession) => html`
                                <opencga-family-relatedness-view
                                    .family="${family}"
                                    .opencgaSession="${opencgaSession}">
                                </opencga-family-relatedness-view>
                            `,
                        },
                        {
                            id: "json-view",
                            name: "JSON Data",
                            render: (family, active) => html`
                                <json-viewer
                                    .data="${family}"
                                    .active="${active}">
                                </json-viewer>
                            `,
                        }
                    ]
                }
            },
            aggregation: {
                default: [
                    "creationYear>>creationMonth",
                    "status",
                    "phenotypes",
                    "expectedSize",
                    "numMembers[0..20]:2",
                ],
                render: params => html `
                    <facet-filter
                        .config="${params.config.aggregation}"
                        .selectedFacet="${params.selectedFacet}"
                        @facetQueryChange="${params.onFacetQueryChange}">
                    </facet-filter>
                `,
                result: {
                    numColumns: 2
                },
                sections: [
                    {
                        name: "Family Attributes",
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
                                allowedValues: [
                                    "1", "2", "3", "4", "5",
                                    "6", "7", "8", "9", "10",
                                    "11", "12", "13", "14", "15",
                                    "16", "17", "18", "19", "20",
                                    "21", "22", "23", "24", "25",
                                    "26", "27", "28", "29", "30", "31"],
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
                                allowedValues: ["READY", "DELETED", "INCOMPLETE"],
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
                                id: "numMembers",
                                name: "Number Of Members",
                                type: "string",
                                description: "Number of members"
                            },
                            {
                                id: "expectedSize",
                                name: "Expected Size",
                                type: "string",
                                description: "Expected size"
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

customElements.define("family-browser", FamilyBrowser);
