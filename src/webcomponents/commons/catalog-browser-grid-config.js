/*
 * Copyright 2015-2016 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *s
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {LitElement, html} from "lit";
import LitUtils from "./utils/lit-utils.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import NotificationUtils from "./utils/notification-utils.js";
import "./forms/data-form.js";
import "./forms/select-field-filter.js";

export default class CatalogBrowserGridConfig extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            gridColumns: {
                type: Object
            },
            toolId: {
                type: String,
            },
            config: {
                type: Object
            }
        };
    }

    update(changedProperties) {
        if (changedProperties.has("config") && changedProperties.has("gridColumns")) {
            this.onConfigObserver();
        }
        super.update(changedProperties);
    }

    onConfigObserver() {
        // Prepare data for the column select
        this.selectColumnData = []; // all id, name and fields columns
        this.selectedColumns = []; // get all id columns visible
        const isColumnVisible = col => col.visible === undefined || col.visible;
        const addColumnData = col => {
            if (!col.excludeFromSettings) {
                this.selectColumnData.push({
                    id: col.id,
                    name: col.title
                });
                if (isColumnVisible(col)) {
                    this.selectedColumns.push(col.id);
                }
            }
        };

        /* Rodiel NOTE: 2023-05-01
        * Alternative just in case to know if gridColumns has 2 headers o more.
        * One head always gets a array of object.
        * 2 o more gets arrays of array
        * At the moment it isn't not necessary to use this function because all grid has 2 headers.
        */
        const isArrayOfObjects = arr => Array.isArray(arr) && arr.every(item => typeof item === "object" && item !== null && !Array.isArray(item));

        // process gridcolumn data for column select
        if (this.gridColumns && Array.isArray(this.gridColumns)) {
            let lastSubColumn = 0;
            // Check if the grid has 2 headers
            // get a list of array
            const [columnsHead, columnsChild] = this.gridColumns.length === 2 ? this.gridColumns: [this.gridColumns, []];
            if (columnsChild.length > 0) {
                columnsHead.forEach(column => {
                    if (column?.rowspan === 2) {
                        addColumnData(column);
                    } else {
                        // This condition resolves one head too
                        // but to avoid unnecesary steps it's preferable to resolve one head outside this block. line #102
                        if (column?.colspan !== undefined) {
                            const option = {id: column.id, name: column.title, fields: []};
                            for (let i = lastSubColumn; i < lastSubColumn + column.colspan; i++) {
                                option.fields.push({id: columnsChild[i].id, name: columnsChild[i].title});
                                if (isColumnVisible(columnsChild[i])) {
                                    this.selectedColumns.push(columnsChild[i].id);
                                }
                            }
                            if (option.fields[0].id) {
                                this.selectColumnData.push(option);
                            }
                            lastSubColumn += column.colspan;
                        } else {
                            addColumnData(column);
                        }
                    }
                });
            } else {
                // it just one head: get a list of object
                columnsHead.forEach(column => {
                    addColumnData(column);
                });
            }
        }
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "columns":
                this.config.columns = e.detail.value?.split(",");
                break;
            case "_highlights":
                if (e.detail.value) {
                    const values = e.detail.value.split(",");
                    this.config.highlights.forEach(h => h.active = values.includes(h.id));
                } else {
                    this.config.highlights.forEach(h => h.active = false);
                }
                this._highlights = e.detail.value || "";
                this.requestUpdate();
                break;
        }

        LitUtils.dispatchCustomEvent(this, "configChange", this.config);
    }

    onClear() {
        this.onConfigObserver();
        this.requestUpdate();
    }

    async onSubmit() {
        try {
            // Update user configuration
            await OpencgaCatalogUtils.updateGridConfig(
                "IVA",
                this.opencgaSession,
                this.toolId,
                {
                    pageSize: this.config.pageSize,
                    columns: this.config.columns,
                    highlights: this.config.highlights,
                }
            );
            LitUtils.dispatchCustomEvent(this, "settingsUpdate");

            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                message: "Configuration saved",
            });
        } catch (error) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
        }
    }

    render() {
        return html`
            <data-form
                .data="${this.config}"
                .config="${this.getConfigForm()}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e=>this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>
        `;
    }

    getConfigForm() {
        const isTestEnv = this.opencgaSession?.testEnv ? this.opencgaSession?.testEnv: {};
        return {
            ...isTestEnv,
            id: "browser-grid-config",
            title: "",
            icon: "fas fa-user-md",
            type: "pills",
            display: {
                width: 12,
                titleVisible: false,
                titleAlign: "left",
                titleWidth: 4,
                defaultLayout: "vertical",
                buttonsVisible: true,
                buttonClearText: "Discard",
            },
            sections: [
                {
                    title: "General",
                    display: {
                        titleHeader: "h4",
                        titleStyle: "margin: 5px 5px",
                    },
                    elements: [
                        {
                            type: "text",
                            text: "Select the page size",
                            display: {
                                containerStyle: "margin: 5px 5px 5px 0px"
                            }
                        },
                        {
                            field: "pageSize",
                            type: "custom",
                            text: "Page Size",
                            display: {
                                containerStyle: "margin: 5px 5px 5px 0px",
                                render: (columns, dataFormFilterChange) => {
                                    return html`
                                        <select-field-filter
                                            .data="${this.config.pageList}"
                                            .value="${this.config.pageSize}"
                                            .config="${{
                                                multiple: false,
                                                liveSearch: false,
                                            }}"
                                            @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                        </select-field-filter>
                                    `;
                                }
                            }
                        },
                        {
                            type: "text",
                            text: "Select the columns to be displayed",
                            display: {
                                containerStyle: "margin: 20px 5px 5px 0px",
                            }
                        },
                        {
                            field: "columns",
                            type: "custom",
                            text: "Columns",
                            display: {
                                containerStyle: "margin: 5px 5px 5px 0px",
                                render: (columns, dataFormFilterChange) => {
                                    return html`
                                        <select-field-filter
                                            .data="${this.selectColumnData}"
                                            .value="${this.selectedColumns?.join(",")}"
                                            .config="${{
                                                title: "Columns",
                                                liveSearch: false,
                                                multiple: true,
                                            }}"
                                            @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                        </select-field-filter>
                                    `;
                                }
                            }
                        },
                    ],
                },
                {
                    title: "Highlights",
                    display: {
                        titleHeader: "h4",
                        titleStyle: "margin: 5px 5px",
                    },
                    elements: [
                        {
                            title: "Configure the highlight to apply to displayed variant rows",
                            field: "_highlights",
                            type: "select",
                            multiple: true,
                            allowedValues: this.config?.highlights?.map(highlight => {
                                return {id: highlight.id, name: highlight.name};
                            }) || [],
                            defaultValue: this._highlights,
                            display: {
                                visible: () => (this.config?.highlights || []).length > 0,
                            },
                        },
                        {
                            type: "notification",
                            text: "No highlight conditions defined.",
                            display: {
                                notificationType: "warning",
                                visible: () => (this.config?.highlights || []).length === 0,
                            },
                        },
                    ],
                },
            ]
        };
    }

}

customElements.define("catalog-browser-grid-config", CatalogBrowserGridConfig);
