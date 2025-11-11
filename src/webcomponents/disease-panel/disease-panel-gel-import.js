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
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    firstUpdated() {
        this.fetchRepositories();
    }

    onAdd(e, row) {
        const params = {
            study: this.opencgaSession.study.fqn,
        };
        let error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.userTool()
            .importWorkflow({name: row.full_name}, params)
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Workflow Import",
                    message: `New workflow ${row.full_name} imported correctly`
                });
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                LitUtils.dispatchCustomEvent(this, "workflowImport", {id: row.full_name}, {}, error);
                this.#setLoading(false);
            });
    }

    async fetchRepositories() {
        this.repositories = [];

        // Create different promises for each API call to PanelApp https://panelapp.genomicsengland.co.uk/api/v1/panels/?format=json&page=1
        for (let page = 1; page <= 5; page++) {
            // create a promise for each page
            const url = `https://panelapp.genomicsengland.co.uk/api/v1/panels/?format=json&page=${page}`;
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    this.repositories = this.repositories.concat(data.results);
                }
            } catch (error) {
                console.error(error);
            }
        }
        // debugger

        // try {
        //     const response = await fetch("https://raw.githubusercontent.com/nf-core/website/refs/heads/main/public/pipelines.json");
        //     if (response.ok) {
        //         const data = await response.json();
        //         this.repositories = data?.remote_workflows || [];
        //         console.log(this.repositories)
        //     }
        // } catch (error) {
        //     console.error(error);
        // }
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <div>
                <data-list
                    .data="${this.repositories || []}"
                    .config="${this._config}">
                </data-list>
            </div>
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
                                    <div class="d-block text-secondary">${panel.types?.map(t => t.name).join(", ") || ""}</div>
                                </div>
                            `;
                        },
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
                        }
                    },
                    {
                        title: "Relevant Disorders",
                        field: "relevant_disorders",
                        formatter: (relevant_disorders, panel) => {
                            return `
                                <div class="d-flex flex-column gap-1">
                                    <div>
                                        <span>${relevant_disorders?.join(", ") || "-"}</span>
                                    </div>
                                </div>
                            `;
                        }
                    },
                    {
                        title: "Version",
                        field: "version",
                        formatter: (value, panel) => {
                            return `
                                <div class="d-flex flex-column gap-1">
                                    <div>
                                        ${value}
                                    </div>
                                    <div class="d-block text-secondary" style="text-wrap:nowrap">Published at ${UtilsNew.dateFormatter(panel.version_created)}</div>
                                </div>
                            `;
                        }
                    },
                    {
                        title: "Stats",
                        field: "stats",
                        formatter: stats => {
                            return `
                                <div style="text-wrap:nowrap">
                                    Number of genes: ${stats?.number_of_genes || 0}<br>
                                    Number of regions: ${stats?.number_of_regions || 0}
                                </div>
                            `;
                        }
                    },
                    {
                        title: "Add",
                        field: "add",
                        formatter: () => {
                            return `
                                <button type="button" class="btn btn-primary">Add</button>
                            `;
                        },
                        events: {
                            "click button": (e, value, row) => this.onAdd(e, row)
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
