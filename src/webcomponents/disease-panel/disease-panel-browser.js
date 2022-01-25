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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
import "../commons/opencga-browser.js";
import "./disease-panel-summary.js";

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
                type: Object
            },
            cellbaseClient: {
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
        this.config = this.getDefautlConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        super.update(changedProperties);
    }

    settingsObserver() {
        this.config = {...this.getDefautlConfig()};
        if (this.settings?.menu) {
            this.config.filter = UtilsNew.mergeFiltersAndDetails(this.config?.filter, this.settings);
        }
        if (this.settings?.table) {
            this.config.filter.result.grid = {...this.config.filter.result.grid, ...this.settings.table};
        }
        if (this.settings?.table?.toolbar) {
            this.config.filter.result.grid.toolbar = {...this.config.filter.result.grid.toolbar, ...this.settings.table.toolbar};
        }
    }

    render() {
        return html `
            <opencga-browser
                resource="DISEASE_PANEL"
                .opencgaSession="${this.opencgaSession}"
                .cellbaseClient="${this.cellbaseClient}"
                .query="${this.query}"
                .config="${this.config}">
            </opencga-browser>
        `;
    }

    getDefautlConfig() {
        return {
            title: "Disease Panel Browser",
            icon: "fab fa-searchengin",
            views: [
                {
                    id: "table-tab",
                    name: "Table result",
                    icon: "fa fa-table",
                    active: true
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
                                name: "Disease Panel Id",
                                description: ""
                            },
                            {
                                id: "disorders",
                                name: "Disorders",
                                description: "",
                                multiple: true,
                                freeTag: true,
                            },
                            {
                                id: "feature",
                                name: "Feature IDs (gene, SNPs...)",
                                description: ""
                            },
                            {
                                id: "region",
                                name: "Region",
                                description: ""
                            },
                            {
                                id: "categories",
                                name: "Categories",
                                placeholder: "Cancer programme...",
                                description: ""
                            },
                            {
                                id: "tags",
                                name: "Tags",
                                description: "",
                                placeholder: "cancer...",
                            },
                            {
                                id: "date",
                                name: "Date",
                                description: ""
                            }
                        ]
                    }
                ],
                examples: [],
                result: {
                    grid: {
                        pageSize: 10,
                        pageList: [10, 25, 50],
                        multiSelection: false,
                        showSelectCheckbox: false
                    }
                },
                detail: {
                    title: "Selected Disease Panel:",
                    showTitle: true,
                    items: [
                        {
                            id: "disease-panel-view",
                            name: "Summary",
                            active: true,
                            render: (diseasePanel, active, opencgaSession) => {
                                return html`
                                    <disease-panel-summary
                                        .diseasePanel="${diseasePanel}"
                                        .opencgaSession="${opencgaSession}">
                                    </disease-panel-summary>`;
                            }
                        },
                        {
                            id: "json-view",
                            name: "JSON Data",
                            mode: "development",
                            render: (diseasePanel, active, opencgaSession) => {
                                return html`
                                    <json-viewer
                                        .data="${diseasePanel}"
                                        .active="${active}">
                                    </json-viewer>`;
                            }
                        }
                    ]
                }
            },
        };
    }

}

customElements.define("disease-panel-browser", DiseasePanelBrowser);
