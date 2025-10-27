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

export default class FamilyBrowser extends LitElement {

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
    }

    onSettingsUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    onFamilyUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
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
            views: [
                {
                    id: "table-tab",
                    name: "Table",
                    icon: "fa fa-table",
                    active: true,
                    render: params => html`
                        <family-grid
                            .toolId="${this.COMPONENT_ID}"
                            .opencgaSession="${params.opencgaSession}"
                            .query="${params.executedQuery}"
                            .config="${params.config.filter.result.grid}"
                            .active="${true}"
                            .eventNotifyName="${params.eventNotifyName}"
                            @queryComplete="${e => params.onQueryComplete(e)}"
                            @familyUpdate="${e => params.onComponentUpdate(e)}"
                            @settingsUpdate="${() => this.onSettingsUpdate()}">
                        </family-grid>
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
                                title: "Family ID",
                                type: "string",
                                placeholder: "LP-1234,LP-2345...",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "members",
                                title: "Members",
                                type: "string",
                                placeholder: "HG01879, HG01880, HG01881...",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "disorders",
                                title: "Disorders",
                                placeholder: "Intellectual disability,Arthrogryposis...",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "phenotypes",
                                title: "Phenotype",
                                placeholder: "Full-text search, e.g. *melanoma*",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "date",
                                title: "Creation Date",
                                description: ""
                            },
                            {
                                id: "annotations",
                                title: "Family Annotations",
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
            },
            aggregation: {
                default: ["disorders", "creationYear[MONTH]"],
                display: {
                    showNested: false
                },
                sections: [
                    {
                        name: "Family Attributes",
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
                            //     allowedValues: ["READY", "DELETED", "INCOMPLETE"],
                            //     description: "Status"
                            // },
                            {
                                id: "version",
                                name: "Version",
                                type: "string",
                                description: "Version"
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

customElements.define("family-browser", FamilyBrowser);
