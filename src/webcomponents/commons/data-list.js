/*
 * Copyright 2015-2016 OpenCB
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
import GridCommons from "./grid-commons.js";
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "./utils/lit-utils.js";

export default class DataList extends LitElement {

    static LIST_MODE = "LIST";
    static GRID_MODE = "GRID";

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            data: {
                type: Array
            },
            search: {
                type: String
            },
            mode: {
                type: String
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._data = [];
        this.data = [];
        this.mode = DataList.LIST_MODE;
        this.active = true;
        this.htmlTableId = this._prefix + "TableHtmlId";

        this.searchField = "";
        this.sortById = "none";

        this.groupById = "none";
        this.groupByResult = {};
        this.groupByResultValues = [];

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("data")) {
            this.dataObserver();
        }
        if (changedProperties.has("mode") ||
            changedProperties.has("config")) {
            this.propertyObserver();
        }
        super.update(changedProperties);
    }

    updated(changedProperties) {
        // If the search property is changed, we must update the input field and we need the DOM to be ready
        if (changedProperties.has("search")) {
            this.querySelector("#" + this._prefix + "InputSearch").value = this.search;
            this.onSearch({currentTarget: {value: this.search}});
        }
        if (changedProperties.size > 0 && this.active) {
            this.renderTable();
        }
    }

    dataObserver() {
        this._data = JSON.parse(JSON.stringify(this.data));
    }

    modeObserver(e, mode) {
        this.mode = mode;
        debugger
        this.renderTable();
    }

    propertyObserver() {
        // With each property change we must be updated config and create the columns again. No extra checks are needed.
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
            display: {
                ...this.getDefaultConfig().display,
                ...this.config.display,
            },
            search: {
                ...this.getDefaultConfig().search,
                ...this.config.search,
            },
            sortBy: {
                ...this.getDefaultConfig().sortBy,
                ...this.config.sortBy,
            },
            groupBy: {
                ...this.getDefaultConfig().groupBy,
                ...this.config.groupBy,
            },
            table: {
                ...this.getDefaultConfig().table,
                ...this.config.table,
                options: {
                    ...this.getDefaultConfig().table.options,
                    ...this.config.table.options
                },
                columns: this.config.table?.columns || this.getDefaultConfig().table.columns
            },
            grid: {
                ...this.getDefaultConfig().grid,
                ...this.config.grid,
                options: {
                    ...this.getDefaultConfig().grid.options,
                    ...this.config.grid.options
                },
                render: this.config.grid?.render || this.getDefaultConfig().grid.render
            },
        };

        if (this._config.table?.checkbox) {
            this._config.table.columns.splice(this._config.table?.checkboxIndex || 0, 0, {
                field: "state",
                checkbox: true,
                align: "center",
                valign: "middle"
            });
        }
        this.gridCommons = new GridCommons(this.htmlTableId, this, this._config);
        this.renderTable();
    }

    onSearch(e) {
        // Save the search value
        this.searchField = e.currentTarget.value;

        // 1. Filter the data using the original data!
        if (e.currentTarget.value === "none") {
            this._data = JSON.parse(JSON.stringify(this.data));
        } else {
            this._data = this.#search(this.data, e.currentTarget.value);
        }

        // 2. If we are sorting by some field, we need to re-sort the data to reflect the new order
        if (this.sortById !== "none") {
            const sortByOption = this._config.sortBy.options.find(option => option.id === this.sortById);
            this._data = this.#sortData(this._data, sortByOption);
        }

        // 3. If we are grouping by some field, we need to re-group the data to reflect the new order
        if (this.groupById !== "none") {
            // Note: this calls to renderTable() again
            this.onGroupBy({currentTarget: {value: this.groupById}});
        } else {
            this.renderTable();
        }
    }

    // Private method that filters the data using the provided value
    #search(data, value) {
        return data.filter(item => {
            for (const field of this._config.search.fields) {
                if (this._config.search.ignoreCase) {
                    if (Array.isArray(item[field])) {
                        if (item[field].join().toLowerCase().includes(value.toLowerCase())) {
                            return true;
                        }
                    } else {
                        if (item[field]?.toLowerCase().includes(value.toLowerCase())) {
                            return true;
                        }
                    }
                } else {
                    if (Array.isArray(item[field])) {
                        if (item[field]?.join()?.includes(value)) {
                            return true;
                        }
                    } else {
                        if (item[field]?.includes(value)) {
                            return true;
                        }
                    }
                }
            }
        });
    }

    onSortBy(e) {
        // Save the selected sort by field
        this.sortById = e.currentTarget.value;

        if (e.currentTarget.value === "none") {
            // Reset the data
            this._data = JSON.parse(JSON.stringify(this.data));
            if (this.searchField) {
                this._data = this.#search(this.data, this.searchField);
            }
        } else {
            // Get the selected option
            const sortByOption = this._config.sortBy.options.find(option => option.id === e.currentTarget.value);
            // Set default order to 'asc'
            if (!sortByOption.order) {
                sortByOption.order = "asc";
            }
            // Sort by 'id' field using the already filtered data, no need to filter again
            this._data = this.#sortData(this._data, sortByOption);
        }

        // If we are grouping by some field, we need to re-group the data to reflect the new order
        if (this.groupById !== "none") {
            // Note: this calls to renderTable() again
            this.onGroupBy({currentTarget: {value: this.groupById}});
        } else {
            this.renderTable();
        }
    }

    onSortByClear() {
        const dropdown = document.getElementById(this._prefix + "SortBy");
        dropdown.value = "none";
        this.onSortBy({currentTarget: dropdown});
    }

    #sortData(data, sortByOption) {
        return data.sort((a, b) => {
            if (a[sortByOption.id] > b[sortByOption.id]) {
                return sortByOption.order === "asc" ? 1 : -1;
            } else if (a[sortByOption.id] < b[sortByOption.id]) {
                return sortByOption.order === "asc" ? -1 : 1;
            } else {
                return 0;
            }
        });
    }

    onGroupBy(e) {
        // Save the selected groupBy field
        this.groupById = e.currentTarget.value;

        if (e.currentTarget.value === "none") {
            this.groupByResult = {};
            this.groupByResultValues = [];
        } else {
            const groupByOption = this._config.groupBy.options.find(option => option.id === e.currentTarget.value);
            this.groupByResult = this._data.reduce((result, currentValue) => {
                (result[currentValue[groupByOption.id]] = result[currentValue[groupByOption.id]] || [])
                    .push(currentValue);
                return result;
            }, {});
            this.groupByResultValues = groupByOption.values?.length > 0 ? groupByOption.values : Object.keys(this.groupByResult);
        }
        this.renderTable();
    }

    onGroupByClear() {
        const dropdown = document.getElementById(this._prefix + "GroupBy");
        dropdown.value = "none";
        this.onGroupBy({currentTarget: dropdown});
    }

    renderToolbar() {
        const float = this._config?.display?.float === "left" ? "float-start" : "float-end";
        debugger
        return html`
            <div
                class="d-flex justify-content-between border-bottom border-black ${this._config.display?.classes || ""}"
                role="toolbar"
                aria-label="Toolbar with button groups">
                <!--
                <div class="input-group m-2 pe-5">
                    <label class="m-2">Showing ${this._data.length} items</label>
                </div>
                -->
                <!--<div class="d-flex">-->
                <div class="btn-toolbar m-2" role="toolbar" aria-label="Toolbar view mode">
                    <div class="btn-group me-2" role="group" aria-label="Data list views">
                        <label class="btn btn-outline-secondary">
                            <i class="fas fa-list"></i>
                            <input
                                type="radio"
                                class="btn-check"
                                name="mode"
                                autocomplete="off"
                                @click="${e => this.modeObserver(e, DataList.LIST_MODE)}"
                                ?checked="${this.mode === DataList.LIST_MODE}"/>
                        </label>
                        <label class="btn btn-outline-secondary">
                            <i class="fas fa-th"></i>
                            <input
                               type="radio"
                               class="btn-check"
                               name="mode"
                               autocomplete="off"
                               @click="${e => this.modeObserver(e, DataList.GRID_MODE)}"
                               ?checked="${this.mode === DataList.GRID_MODE}"/>
                        </label>
                    </div>
                    ${this._config.groupBy?.options?.length > 0 ? html`
                        <div class="input-group">
                            <label class="input-group-text fw-semibold" for="${this._prefix}GroupBy">Group by</label>
                            <select id="${this._prefix}GroupBy" class="form-select" @change="${this.onGroupBy}">
                                <option value="none" selected>Select ...</option>
                                ${this._config.groupBy?.options?.map(option => html`
                                <option value="${option.id}">${option.name}</option>
                            `)}
                            </select>
                            <label class="input-group-text" style="cursor: pointer" @click="${this.onGroupByClear}"><i class="fas fa-times"></i></label>
                        </div>
                    ` : nothing}
                </div>
                <div class="d-flex">
                    ${this._config.search?.fields?.length > 0 ? html`
                    <div class="input-group m-2 ps-5">
                        <div class="input-group-text" id="btnGroupAddon">
                            <i class="fas fa-search" aria-hidden="true"></i>
                        </div>
                        <input id="${this._prefix}InputSearch" type="text" class="form-control" placeholder="${this._config.search?.placeholder || "Search ..."}" aria-label="Input group example" aria-describedby="btnGroupAddon"
                               @input="${this.onSearch}">
                    </div>
                ` : nothing}

                    ${this._config.sortBy?.options?.length > 0 ? html`
                    <div class="input-group m-2">
                        <label class="input-group-text fw-semibold" for="${this._prefix}SortBy">Sort by</label>
                        <select id="${this._prefix}SortBy" class="form-select" @change="${this.onSortBy}">
                            <option value="none" style="font-style: italic" selected>Select ...</option>
                            ${this._config.sortBy?.options?.map(option => html`
                                <option value="${option.id}">${option.name}</option>
                            `)}
                        </select>
                        <label class="input-group-text" style="cursor: pointer" @click="${this.onSortByClear}"><i class="fas fa-times"></i></label>
                    </div>
                ` : nothing}
                </div>
            </div>
        `;
    }

    async renderTable() {
        // This renders the GRID mode automatically, since the render() method calls to the JS function renderUngroupedAndGroupByWithGrid()
        this.requestUpdate();
        await this.updateComplete;

        // LIST mode is implemented using Bootstrap Table, so we need to call to these methods
        if (this.mode.toUpperCase() === DataList.LIST_MODE) {
            if (this.groupByResultValues?.length === 0) {
                this.renderUngroupedWithLists();
            } else {
                this.renderGroupByWithLists();
            }
        }
    }

    renderUngroupedWithLists() {
        this.table = $("#" + this.htmlTableId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            uniqueId: this._config.table?.uniqueId || "id",
            data: this._data,
            columns: this._config.table.columns,

            // Add default configuration
            ...this._config.table.options,

            detailView: this._config.detailView,
            gridContext: this,
            loadingTemplate: () => GridCommons.loadingFormatter(),
            onClickRow: (row, selectedElement) => LitUtils.dispatchCustomEvent(this, "clickrow", row, selectedElement),
            // onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onDblClickRow: (row, element) => LitUtils.dispatchCustomEvent(this, "doubleclickrow", row, element),
            onCheck: row => this.gridCommons.onCheck(row.id, row),
            onUncheck: row => this.gridCommons.onUncheck(row.id, row),
        });

        // Show/Hide table header
        this.gridCommons.hideHeader(!this._config.table?.showHeader);
    }

    renderGroupByWithLists() {
        for (const value of this.groupByResultValues) {
            const valueHtmlTableId = this._prefix + value + "TableHtmlId";
            this.table = $("#" + valueHtmlTableId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                uniqueId: this._config.table?.uniqueId || "id",
                data: this.groupByResult[value],
                columns: this._config.table.columns,

                // Add default configuration
                ...this._config.table.options,

                detailView: this._config.detailView,
                gridContext: this,
                loadingTemplate: () => GridCommons.loadingFormatter(),
                onClickRow: (row, selectedElement) => LitUtils.dispatchCustomEvent(this, "clickrow", row, selectedElement),
                onDblClickRow: (row, element) => LitUtils.dispatchCustomEvent(this, "doubleclickrow", row, element),
                onCheck: row => this.gridCommons.onCheck(row.id, row),
                onUncheck: row => this.gridCommons.onUncheck(row.id, row),
            });

            const header = this.querySelector(`#${valueHtmlTableId} thead`);
            if (header) {
                if (!this._config.table?.showHeader) {
                    header.style.display = "none";
                    // this.context.querySelector(`#${this.gridId} tbody tr:first-child`).style.borderTopWidth = "1px";
                } else {
                    header.style.display = "";
                }
            }
        }
    }

    renderUngroupedAndGroupByWithGrid(value) {
        // 1. Get the data for the selected groupBy value, if not provided, use the ungrouped data
        const localData = value ? this.groupByResult[value] || [] : this._data;

        // 2. If there is no data, show a message
        if (localData.length === 0) {
            return html`
                <div class="container">
                    <div class="alert">No data available</div>
                </div>
            `;
        }

        // 3. Calculate the number of columns and rows
        const numColumns = this._config.grid?.options?.columns || 2;
        const numRows = Math.ceil(localData.length / numColumns);
        const columnWidth = 12 / numColumns;

        const htmlResult = [];
        for (let i = 0; i < numRows; i ++) {
            // 4. Prepare the row data
            const row = [];
            for (let j = 0; j < numColumns; j++) {
                if (i * numColumns + j < localData.length) {
                    row.push(localData[i * numColumns + j]);
                }
            }

            // 5. Render the row
            htmlResult.push(html`
                <div class="row ${this._config.grid?.options?.rowClass || "g-2"}">
                    ${row.map(r => html`
                        <div class="col-${columnWidth}">
                            <div class="${this._config.grid?.options?.cellClass || "p-2"}">
                                ${this._config.grid.render(r)}
                            </div>
                        </div>
                    `)}
                </div>
            `);
        }

        return html`
            <div class="container">
                ${htmlResult}
            </div>
        `;
    }

    render() {
        return html`
            ${this.renderToolbar()}

            ${this.mode === DataList.LIST_MODE ? html`
                <!-- Default table to display -->
                ${this.groupByResultValues?.length === 0 ? html`
                    <div id="${this._prefix}TableDiv" class="">
                        <table id="${this.htmlTableId}" style="border-collapse: separate; border-spacing: 0 0.5rem; background-color: transparent"></table>
                    </div>
                ` : html`
                    ${this.groupByResultValues?.map(value => html`
                        <div id="${this._prefix}${value}TableDiv" class="">
                            <h4>${value}</h4>
                            <table id="${this._prefix}${value}TableHtmlId" style="border-collapse: separate; border-spacing: 0 0.5rem; background-color: transparent"></table>
                        </div>
                    `)}
                `}
            ` : nothing}

            ${this.mode === DataList.GRID_MODE ? html`
                ${this.groupByResultValues?.length === 0 ? this.renderUngroupedAndGroupByWithGrid() : html`
                    ${this.groupByResultValues?.map(value => html`
                        <div id="${this._prefix}${value}TableDiv" class="">
                            <h4>${value}</h4>
                            ${this.renderUngroupedAndGroupByWithGrid(value)}
                        </div>
                    `)}
                `}
            ` : nothing}
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                // classes: "shadow bg-body-tertiary rounded",
                style: "",
                float: "left",
            },
            search: {
                fields: ["id", "name", "description"],
                placeholder: "Search ...",
                ignoreCase: true
            },
            table: {
                uniqueId: "id",
                showHeader: false,
                checkbox: false,
                checkboxIndex: 0,
                options: {
                    classes: "table table-hover table-borderless",
                    theadClasses: "table-light",
                    buttonsClass: "light",
                    iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                    icons: GridCommons.GRID_ICONS,
                    pagination: false,
                    pageSize: 100,
                    pageList: [100],
                    detailView: false,
                    checkbox: true
                }
            },
            grid: {
                options: {
                    columns: 3,
                    rowClass: "g-2",
                    cellClass: "p-2"
                },
                render: data => {
                    return html`
                        <div></div>
                    `;
                }
            }
        };
    }

}

customElements.define("data-list", DataList);
