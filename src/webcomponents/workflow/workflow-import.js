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
import LitUtils from "../commons/utils/lit-utils";
import GridCommons from "../commons/grid-commons";
import NotificationUtils from "../commons/utils/notification-utils";
import UtilsNew from "../../core/utils-new";
import "../commons/filters/catalog-search-autocomplete.js";
import "../commons/data-list.js";

export default class WorkflowImport extends LitElement {

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
            mode: {
                type: String
            },
        };
    }

    #init() {
        this.workflow = {};
        this.mode = "";

        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.fetchRepositories("nf-core");
        }
        super.update(changedProperties);
    }

    onAdd(e, row) {
        const params = {
            study: this.opencgaSession.study.fqn,
        };
        let error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.workflows()
            .importWorkflow({id: row.full_name}, params)
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

    async fetchRepositories(org) {
        this.repositories = [];

        try {
            const response = await fetch("https://raw.githubusercontent.com/nf-core/website/refs/heads/main/public/pipelines.json");
            if (response.ok) {
                const data = await response.json();
                this.repositories = data?.remote_workflows || [];
                console.log(this.repositories)
            }
        } catch (error) {
            console.error(error);
        }
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
                    },
                    {
                        id: "stargazers_count",
                        name: "Stars",
                        order: "desc"
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
                        field: "full_name",
                        rowspan: 1,
                        colspan: 1,
                        formatter: (value, row) => {
                            return `
                                <div>
                                    <div class="my-2">${value}
                                        <a href="${row.homepage}"  target="_blank"><i class="fas fa-external-link-alt ps-2"></i></a>
                                    </div>
                                    <div class="d-block text-secondary my-1">${row.description}</div>
                                </div>
                            `;
                        },
                        width: "50",
                        widthUnit: "%"
                    },
                    {
                        title: "Version",
                        field: "releases",
                        rowspan: 1,
                        colspan: 1,
                        formatter: value => {
                            return `
                                <div>
                                    <div class="my-2">
                                        <span>
                                            ${value[0]?.tag_name}
                                        </span>
                                    </div>
                                    <div class="d-block text-secondary">Published at ${UtilsNew.dateFormatter(value[0].published_at)}</div>
                                </div>
                            `;
                        }
                    },
                    {
                        title: "Default Branch",
                        field: "default_branch",
                        rowspan: 1,
                        colspan: 1,
                        formatter: (value, row) => {
                            return `
                                <div>
                                    <div class="my-2">
                                        <span>Branch: ${value}</span>
                                        <a href="${row.html_url}" target="_blank"><i class="fab fa-github fa-lg ps-2"></i></a>
                                    </div>
                                    <div class="d-block text-secondary">Updated at ${UtilsNew.dateFormatter(row.updated_at)}</div>
                                </div>
                            `;
                        }
                    },
                    {
                        title: "Stars",
                        field: "stargazers_count",
                        rowspan: 1,
                        colspan: 1,
                        formatter: value => {
                            return `
                                <div>
                                    <a>
                                        <span>
                                            <i class="fas fa-star pe-2" aria-hidden="true" style="color: darkgoldenrod"></i>${value}
                                        </span>
                                    </a>
                                </div>
                            `;
                        }
                    },
                    {
                        title: "Add",
                        field: "add",
                        rowspan: 1,
                        colspan: 1,
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

customElements.define("workflow-import", WorkflowImport);
