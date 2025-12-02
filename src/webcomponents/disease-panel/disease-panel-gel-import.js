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

import {html, LitElement} from "lit";
import LitUtils from "../commons/utils/lit-utils.js";
import GridCommons from "../commons/grid-commons.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import UtilsNew from "../../core/utils-new.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../commons/data-list.js";

export default class DiseasePanelGelImport extends LitElement {


    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            repositories: {
                type: Array
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this.PANEL_APP_SOURCE = "PANEL_APP";
        this.PANEL_APP_PAGE_SIZE = 5;

        this._repositories = [];
        this._installedPanels = {};
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    firstUpdated() {
        this.fetchRepositories();
    }

    updateInstalledPanels() {
        this._installedPanels = {};

        // 1. store panels from the study in a map for quick access
        const panelsMap = {};
        this.opencgaSession.study?.panels
            ?.filter(p => p.source?.project === "PanelApp")
            .forEach(p => panelsMap[p.source.name] = p);

        // 2. check which panels are already installed in the study
        this._repositories.forEach(panelApp => {
            this._installedPanels[panelApp.name] = panelsMap[panelApp.name] || null;
        });
    }

    onAction(event, panel) {
        const action = event.target.dataset.action;
        const params = {
            panelIds: [
                panel.id,
            ],
            source: this.PANEL_APP_SOURCE,
        };
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.panels()
            .importPanels(params, {
                study: this.opencgaSession.study.fqn,
                includeResult: true
            })
            .then(response => {
                const panel = response.responses[0].results[0];
                if (action === "add") {
                    this.opencgaSession.study?.panels.push(panel);
                } else if (action === "update") {
                    const index = this.opencgaSession.study?.panels.findIndex(p => p.id === panel.id);
                    if (index !== -1) {
                        this.opencgaSession.study?.panels.splice(index, 1, panel);
                    }
                }
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `Panel '${panel.name}' ${action === "add" ? "imported" : "updated"} successfully.`,
                });
                LitUtils.dispatchCustomEvent(this, "panelImport", null, {
                    id: panel.id,
                    name: panel.name,
                });
                // force to refresh the grid
                this.updateInstalledPanels();
                this._config = this.getDefaultConfig();
            })
            .catch(reason => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    async fetchRepositories() {
        this._repositories = [];
        this.#setLoading(true);

        // 1. create different promises for each API call to PanelApp https://panelapp.genomicsengland.co.uk/api/v1/panels/?format=json&page=1
        for (let page = 1; page <= this.PANEL_APP_PAGE_SIZE; page++) {
            // create a promise for each page
            const url = `https://panelapp.genomicsengland.co.uk/api/v1/panels/?format=json&page=${page}`;
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    this._repositories = this._repositories.concat(data.results);
                }
            } catch (error) {
                console.error("Failed to fetch page ${page}:", error);
            }
        }

        // 2. Update installed panels
        this.updateInstalledPanels();
        this.#setLoading(false);
    }

    render() {
        if (this.isLoading) {
            return html`
                <loading-spinner></loading-spinner>
            `;
        }

        return html`
            <data-list
                .data="${this._repositories || []}"
                .config="${this._config}">
            </data-list>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                float: "left"
            },
            search: {
                fields: ["name", "topics", "description"],
                ignoreCase: true
            },
            sortBy: {
                options: [
                    {
                        id: "name",
                        name: "Name",
                    }
                ]
            },
            groupBy: {
                options: []
            },
            table: {
                showHeader: true,
                options: {
                    classes: "table table-hover table-borderless",
                    theadClasses: "table-light",
                    buttonsClass: "light",
                    iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                    icons: GridCommons.GRID_ICONS,
                    pagination: true,
                    pageSize: 50,
                    pageList: [25, 50, 100],
                    detailView: false,
                    rowStyle: "",
                },
                columns: [
                    {
                        title: "Name",
                        field: "name",
                        formatter: (name, panel) => {
                            return `
                                <div class="d-flex flex-column gap-1">
                                    <div>
                                        ${name}
                                        <a href="https://panelapp.genomicsengland.co.uk/panels/${panel.id}" target="_blank">
                                            <i class="fas fa-external-link-alt ps-2"></i>
                                        </a>
                                    </div>
                                    <div class="d-block text-secondary">
                                        ${panel.types?.map(t => t.name).join(", ") || ""}
                                    </div>
                                </div>
                            `;
                        },
                        width: "30",
                        widthUnit: "%",
                    },
                    {
                        title: "Disease",
                        formatter: (_, panel) => {
                            return `
                                <div class="d-flex flex-column gap-1">
                                    <div>
                                        <span>${panel.disease_sub_group || "-"}</span>
                                    </div>
                                    <div class="d-block text-secondary">${panel.disease_group || ""}</div>
                                </div>
                            `;
                        },
                        width: "20",
                        widthUnit: "%",
                    },
                    {
                        title: "Relevant Disorders",
                        field: "relevant_disorders",
                        formatter: relevant_disorders => {
                            return `
                                <div class="d-flex flex-column gap-1">
                                    <div>
                                        <span>${relevant_disorders?.join(", ") || "-"}</span>
                                    </div>
                                </div>
                            `;
                        },
                        width: "20",
                        widthUnit: "%",
                    },
                    {
                        title: "Last Version",
                        field: "version",
                        formatter: (value, panel) => {
                            return `
                                <div class="d-flex flex-column gap-1">
                                    <div>
                                        ${value} <span class="text-secondary px-1">(${UtilsNew.dateFormatter(panel.version_created)})</span>
                                    </div>

                                    <div class="d-block text-secondary text-nowrap">
                                        Number of genes: ${panel.stats?.number_of_genes || 0}<br>
                                        Number of regions: ${panel.stats?.number_of_regions || 0}
                                    </div>
                                </div>
                            `;
                        }
                    },
                    // {
                    //     title: "Stats",
                    //     field: "stats",
                    //     formatter: stats => {
                    //         return `
                    //             <div style="text-wrap:nowrap">
                    //                 Number of genes: ${stats?.number_of_genes || 0}<br>
                    //                 Number of regions: ${stats?.number_of_regions || 0}
                    //             </div>
                    //         `;
                    //     }
                    // },
                    {
                        title: "Installed Version",
                        formatter: (_, panelApp) => {
                            if (this._installedPanels[panelApp.name]) {
                                return `
                                    <div class="d-flex flex-column gap-1">
                                        <div class="">
                                            ${this._installedPanels[panelApp.name].source?.version}
                                        </div>
                                        <div class="d-block text-secondary text-nowrap">
                                            Number of genes: ${this._installedPanels[panelApp.name].stats?.numberOfGenes || 0}<br>
                                            Number of regions: ${this._installedPanels[panelApp.name].stats?.numberOfRegions || 0}
                                        </div>
                                    </div>
                                `;
                            } else {
                                return `
                                    <div style="color: red; margin: auto;">
                                        <i class="fas fa-times-circle"></i>
                                    </div>
                                `;
                            }
                        }
                    },
                    {
                        title: "Action",
                        field: "add",
                        formatter: (_, panel) => {
                            if (this._installedPanels[panel.name]) {
                                if (this._installedPanels[panel.name].source?.version === panel.version) {
                                    return `
                                        <button type="button" class="btn btn-secondary" disabled>Installed</button>
                                    `;
                                } else {
                                    return `
                                        <button type="button" class="btn btn-warning"  data-action="update">Update</button>
                                    `;
                                }
                            } else {
                                return `
                                    <button type="button" class="btn btn-primary" data-action="add">Add</button>
                                `;
                            }
                        },
                        events: {
                            "click button": (e, value, row) => this.onAction(e, row)
                        }
                    },
                ],
            },
            grid: {
                display: {
                    columns: 3,
                    rowClass: "g-2",
                    cellClass: "p-2"
                },
                render: data => {
                    return html`
                        <div class="card">
                            <div class="card-header">
                                <h4 class="card-title">
                                    ${data.id}
                                </h4>
                            </div>
                            <div class="card-body">
                                ${data.description}
                            </div>
                        </div>
                    `;
                }
            }
        };
    }

}

customElements.define("disease-panel-gel-import", DiseasePanelGelImport);
