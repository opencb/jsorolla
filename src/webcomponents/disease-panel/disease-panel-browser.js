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

import {LitElement, html, nothing} from "lit";
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
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object,
            },
            cellbaseClient: {
                type: Object,
            },
            query: {
                type: Object,
            },
            settings: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    _init() {
        this.COMPONENT_ID = "disease-panel-browser";
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("settings") || changedProperties.has("config")) {
            this.settingsObserver();
        }
        super.update(changedProperties);
    }

    settingsObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...(this.config || {}),
        };

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

        this.requestUpdate();
    }

    onSettingsUpdate() {
        this.settingsObserver();
    }
    onDiseasePanelUpdate() {
        this.settingsObserver();
    }

    render() {
        return html `
            <opencga-browser
                resource="DISEASE_PANEL"
                .opencgaSession="${this.opencgaSession}"
                .cellbaseClient="${this.cellbaseClient}"
                .query="${this.query}"
                .config="${this._config}"
                @diseasePanelUpdate="${this.onDiseasePanelUpdate}">
            </opencga-browser>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Disease Panel Browser",
            icon: "fab fa-searchengin",
            views: [
                {
                    id: "table-tab",
                    name: "Table result",
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
                                name: "Disease Panel ID",
                                description: ""
                            },
                            // {
                            //     id: "name",
                            //     name: "Disease Panel Name",
                            //     placeholder: "Amelogenesis...",
                            //     description: "",
                            //     multiple: true,
                            //     freeTag: true,
                            //     field: "name",
                            //     resource: "DISEASE_PANEL"
                            // },
                            {
                                id: "source",
                                name: "Panel Source Name",
                                placeholder: "Amelogenesis...",
                                description: "",
                                multiple: true,
                                freeTag: true,
                                field: "source.name",
                                resource: "DISEASE_PANEL"
                            },
                            {
                                id: "disorders",
                                name: "Disorders",
                                description: "",
                                multiple: true,
                                freeTag: true,
                                field: "disorders.id",
                                resource: "DISEASE_PANEL"
                            },
                            {
                                id: "categories",
                                name: "Categories",
                                placeholder: "Cancer programme...",
                                description: "",
                                multiple: true,
                                freeTag: true,
                                field: "categories.name",
                                resource: "DISEASE_PANEL"
                            },
                            {
                                id: "genes",
                                name: "Genes",
                                placeholder: "Select genes...",
                                description: "",
                                multiple: true,
                                freeTag: true,
                                field: "genes.id",
                                resource: "DISEASE_PANEL"
                            },
                            {
                                id: "region",
                                name: "Region",
                                placeholder: "Comma-separated list of regions...",
                                description: ""
                            },
                            {
                                id: "tags",
                                name: "Tags",
                                description: "",
                                placeholder: "cancer...",
                                multiple: true,
                                freeTag: true,
                                field: "tags",
                                resource: "DISEASE_PANEL"
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
        };
    }

}

customElements.define("disease-panel-browser", DiseasePanelBrowser);
