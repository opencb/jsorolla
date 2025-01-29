/**
 * Copyright 2015-2022 OpenCB
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
import UtilsNew from "../../core/utils-new.js";
import {construction} from "../commons/under-construction.js";
import "./disease-panel-gene-view.js";
import "./disease-panel-region-view.js";
import "./disease-panel-summary.js";
import "./disease-panel-grid.js";
import "./disease-panel-detail.js";
import "../commons/opencga-browser.js";

export default class DiseasePanelBrowser extends LitElement {

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
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            settings: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "disease-panel-browser";
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

        // Apply Study settings
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

    onDiseasePanelUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    render() {
        return html`
            <opencga-browser
                resource="DISEASE_PANEL"
                .opencgaSession="${this.opencgaSession}"
                .query="${this.query}"
                .config="${this._config}"
                @diseasePanelUpdate="${this.onDiseasePanelUpdate}">
            </opencga-browser>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Disease Panel Browser",
            views: [
                {
                    id: "table-tab",
                    name: "Table View",
                    icon: "fa fa-table",
                    active: true,
                    render: params => html`
                        <disease-panel-grid
                            .toolId="${this.COMPONENT_ID}"
                            .opencgaSession="${params.opencgaSession}"
                            .query="${params.executedQuery}"
                            .search="${params.executedQuery}"
                            .config="${params.config.filter.result.grid}"
                            .eventNotifyName="${params.eventNotifyName}"
                            .active="${true}"
                            @queryComplete="${e => params.onQueryComplete(e)}"
                            @selectrow="${e => params.onClickRow(e)}"
                            @diseasePanelUpdate="${e => params.onComponentUpdate(e)}"
                            @settingsUpdate="${() => this.onSettingsUpdate()}">
                        </disease-panel-grid>
                        ${params?.detail ? html`
                            <disease-panel-detail
                                .opencgaSession="${params.opencgaSession}"
                                .config="${params.config.filter.detail}"
                                .diseasePanelId="${params.detail?.id}">
                            </disease-panel-detail>
                        ` : nothing}
                    `,
                },
                {
                    id: "facet-tab",
                    name: "Aggregation Stats",
                    icon: "fas fa-chart-bar",
                    render: params => html `
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
                                title: "Disease Panel ID",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "source",
                                title: "Disease Panel Source",
                                placeholder: "Amelogenesis...",
                                description: "Search by source name",
                                multiple: true,
                                freeTag: true,
                                field: "source.name",
                                resource: "DISEASE_PANEL",
                                quick: true,
                            },
                            {
                                id: "disorders",
                                title: "Disorders",
                                description: "",
                                multiple: true,
                                freeTag: true,
                                field: "disorders.id",
                                resource: "DISEASE_PANEL",
                                quick: true,
                            },
                            {
                                id: "genes",
                                title: "Genes",
                                placeholder: "Select genes...",
                                description: "",
                                multiple: true,
                                freeTag: true,
                                field: "genes.id",
                                resource: "DISEASE_PANEL",
                                quick: true,
                            },
                            {
                                id: "categories",
                                title: "Categories",
                                placeholder: "Cancer programme...",
                                description: "",
                                multiple: true,
                                freeTag: true,
                                field: "categories.name",
                                resource: "DISEASE_PANEL",
                                quick: true,
                            },
                            // {
                            //     id: "region",
                            //     title: "Region",
                            //     placeholder: "Comma-separated list of regions...",
                            //     description: ""
                            // },
                            {
                                id: "tags",
                                title: "Tags",
                                description: "",
                                placeholder: "cancer...",
                                multiple: true,
                                freeTag: true,
                                field: "tags",
                                resource: "DISEASE_PANEL",
                                quick: true,
                            },
                        ]
                    }
                ],
                examples: [],
                result: {
                    grid: {
                        pageSize: 10,
                        pageList: [5, 10, 25],
                        multiSelection: false,
                        showSelectCheckbox: false
                    }
                },
                detail: {
                    title: "Selected Disease Panel:",
                    showTitle: true,
                    display: {
                        titleClass: "mt-4",
                        contentClass: "p-3"
                    },
                    items: [
                        {
                            id: "disease-panel-view",
                            name: "Summary",
                            active: true,
                            render: (diseasePanel, _active, opencgaSession) => html`
                                <disease-panel-summary
                                    .diseasePanel="${diseasePanel}"
                                    .opencgaSession="${opencgaSession}">
                                </disease-panel-summary>`,
                        },
                        {
                            id: "disease-panel-genes",
                            name: "Genes",
                            render: (diseasePanel, _active, opencgaSession) => html`
                                <disease-panel-gene-view
                                    .genePanels="${diseasePanel.genes}"
                                    .opencgaSession=${opencgaSession}>
                                </disease-panel-gene-view>`,
                        },
                        {
                            id: "disease-panel-regions",
                            name: "Regions",
                            render: (diseasePanel, active, opencgaSession) => {
                                return html`
                                    <disease-panel-region-view
                                        .regions="${diseasePanel.regions}"
                                        .opencgaSession=${opencgaSession}>
                                    </disease-panel-region-view>`;
                            }
                        },
                        {
                            id: "disease-panel-variants",
                            name: "Variants",
                            render: () => construction,
                        },
                        {
                            id: "json-view",
                            name: "JSON Data",
                            render: (diseasePanel, active) => html`
                                <json-viewer
                                    .data="${diseasePanel}"
                                    .active="${active}">
                                </json-viewer>`,
                        },
                    ],
                },
            },
            aggregation: {
                default: ["disorders", "source"],
                display: {
                    showNested: false
                },
                sections: [
                    {
                        name: "Sample Attributes",
                        // collapsed: false,
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
                                id: "disorders",
                                name: "Disorders",
                                type: "string",
                                description: "Disorders"
                            },
                            {
                                id: "source",
                                name: "Source",
                                type: "string",
                                description: "Source"
                            },
                            {
                                id: "status",
                                name: "Status",
                                type: "category",
                                allowedValues: ["READY", "DELETED"],
                                description: "Status"
                            },
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

customElements.define("disease-panel-browser", DiseasePanelBrowser);
