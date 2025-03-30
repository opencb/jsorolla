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
import "../commons/aggregation-stats.js";
import "./individual-grid.js";
import "./individual-view.js";

export default class IndividualBrowser extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            query: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            settings: {
                type: Object
            }
        };
    }

    #init() {
        this.COMPONENT_ID = "individual-browser";
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

        // Apply Study grid configuration
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
    }

    onSettingsUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    onIndividualUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <opencga-browser
                resource="INDIVIDUAL"
                .opencgaSession="${this.opencgaSession}"
                .query="${this.query}"
                .config="${this._config}"
                @individualUpdate="${this.onIndividualUpdate}">
            </opencga-browser>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Individual Browser",
            views: [
                {
                    id: "table-tab",
                    name: "Table",
                    icon: "fa fa-table",
                    active: true,
                    render: params => html`
                        <individual-grid
                            .toolId="${this.COMPONENT_ID}"
                            .opencgaSession="${params.opencgaSession}"
                            .config="${params.config.filter.result.grid}"
                            .eventNotifyName="${params.eventNotifyName}"
                            .query="${params.executedQuery}"
                            .active="${true}"
                            @queryComplete="${e => params.onQueryComplete(e)}"
                            @selectrow="${e => params.onClickRow(e)}"
                            @individualUpdate="${e => params.onComponentUpdate(e)}"
                            @settingsUpdate="${() => this.onSettingsUpdate()}">
                        </individual-grid>
                        ${params?.detail ? html`
                            <individual-view
                                .opencgaSession="${params.opencgaSession}"
                                .individualId="${params.detail?.id}">
                            </individual-view>
                        ` : nothing}
                    `,
                },
                {
                    id: "facet-tab",
                    name: "Aggregation Stats",
                    icon: "fas fa-chart-bar",
                    render: params => html`
                        <aggregation-stats
                            resource="${params.resource}"
                            .query="${params.executedQuery}"
                            .active="${params.active}"
                            .opencgaSession="${params.opencgaSession}"
                            .config="${params.config.aggregation}">
                        </aggregation-stats>
                    `,
                }
            ],
            filter: {
                sections: [
                    {
                        title: "Section title",
                        collapsed: false,
                        filters: [
                            {
                                id: "id",
                                title: "Individual ID",
                                type: "string",
                                placeholder: "LP-1234,LP-2345...",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "samples",
                                title: "Sample ID",
                                type: "string",
                                placeholder: "HG01879, HG01880, HG01881...",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "father",
                                title: "Father ID",
                                type: "string",
                                placeholder: "LP-1234,LP-2345...",
                                description: ""
                            },
                            {
                                id: "mother",
                                title: "Mother ID",
                                type: "string",
                                placeholder: "LP-1234,LP-2345...",
                                description: ""
                            },
                            {
                                id: "disorders",
                                title: "Disorder",
                                placeholder: "Intellectual disability,Arthrogryposis...",
                                multiple: true,
                                description: "",
                                quick: true,
                            },
                            {
                                id: "phenotypes",
                                title: "Phenotype",
                                placeholder: "Full-text search, e.g. *melanoma*",
                                multiple: true,
                                description: "",
                                quick: true,
                            },
                            {
                                id: "sex",
                                title: "Sex",
                                multiple: true,
                                description: "",
                                quick: true
                            },
                            {
                                id: "karyotypicSex",
                                title: "Karyotypic Sex",
                                multiple: true,
                                description: ""
                            },
                            {
                                id: "ethnicity",
                                title: "Ethnicity",
                                type: "string",
                                placeholder: "White caucasian,asiatic...",
                                description: "",
                                quick: true
                            },
                            {
                                id: "date",
                                title: "Date",
                                description: ""
                            },
                            {
                                id: "annotations",
                                title: "Individual Annotations",
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
            },
            aggregation: {
                default: ["disorders", "creationYear[MONTH]"],
                display: {
                    showNested: false
                },
                sections: [
                    {
                        name: "Individual Attributes",
                        fields: [
                            {
                                id: "creationDate",
                                name: "Creation Date",
                                type: "date",
                                allowedValues: ["YEAR", "MONTH", "DAY"],
                                multiple: false,
                                description: "Creation date, you can use 'day', 'month' or 'year' to group by"
                            },
                            // {
                            //     id: "status",
                            //     name: "Status",
                            //     type: "category",
                            //     allowedValues: ["READY", "DELETED"],
                            //     description: "Status"
                            // },
                            {
                                id: "version",
                                name: "Version",
                                type: "string",
                                description: "Version"
                            },
                            // {
                            //     id: "locationCity",
                            //     name: "Location City",
                            //     type: "string",
                            //     description: "Location city"
                            // },
                            // {
                            //     id: "locationState",
                            //     name: "Location State",
                            //     type: "string",
                            //     description: "Location state"
                            // },
                            // {
                            //     id: "locationCountry",
                            //     name: "Location Country",
                            //     type: "string",
                            //     description: "Location country"
                            // },
                            {
                                id: "dateOfBirth",
                                name: "Date Of Birth",
                                type: "date",
                                allowedValues: ["YEAR", "MONTH", "DAY"],
                                multiple: false,
                                description: "Date of birth, you can use 'day', 'month' or 'year' to group by"
                            },
                            {
                                id: "sex.id",
                                name: "Sex",
                                type: "string",
                                description: "Sex"
                            },
                            {
                                id: "karyotypicSex",
                                name: "Karyotypic Sex",
                                type: "string",
                                description: "Karyotypic sex"
                            },
                            {
                                id: "ethnicity.id",
                                name: "Ethnicity",
                                type: "string",
                                description: "Ethnicity"
                            },
                            {
                                id: "population.id",
                                name: "Population",
                                type: "string",
                                description: "Population"
                            },
                            {
                                id: "phenotypes.id",
                                name: "Phenotypes",
                                type: "string",
                                description: "Phenotypes"
                            },
                            {
                                id: "disorders.id",
                                name: "Disorders",
                                type: "string",
                                description: "Disorders"
                            },
                            {
                                id: "parentalConsanguinity",
                                name: "Parental Consanguinity",
                                type: "string",
                                // allowedValues: ["true", "false"],
                                description: "Parental consanguinity"
                            },
                            // {
                            //     id: "annotations",
                            //     name: "Annotations",
                            //     type: "string",
                            //     description: "Annotations, e.g: key1=value(,key2=value)"
                            // }
                        ]
                    },
                    // {
                    //     name: "Advanced",
                    //     fields: [
                    //         {
                    //             id: "field",
                    //             name: "Field",
                    //             type: "string",
                    //             description: "List of fields separated by semicolons, e.g.: studies;type. For nested fields use >>, e.g.: studies>>biotype;type;numSamples[0..10]:1"
                    //         }
                    //     ]
                    // }
                ]
            },
            annotations: {}
        };
    }


}

customElements.define("individual-browser", IndividualBrowser);
