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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new";
import GridCommons from "./grid-commons";
import "bootstrap-table";

export default class DataTable extends LitElement {

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
            columns: {
                type: Array
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    updated(changedProperties) {
        if (changedProperties.has("data") &&
            changedProperties.has("columns")) {
            this.renderDataTable();
        }
    }

    renderDataTable() {
        const _config = this.getDefaultConfigTable();
        this.table = $(`#${this._prefix}dataTable`);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: this.columns,
            data: this.data,
            sidePagination: "local",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            searchAlign: "left",
            gridContext: this,
            ..._config,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
        });
    }

    render() {
        return html `
            <table id="${this._prefix}dataTable">
            </table>
        `;
    }

    getDefaultConfigTable() {
        return {
            pagination: this.config?.pagination || false,
            pageSize: this.config?.pageSize || 10,
            pageList: this.config?.pageList || [10, 25, 50],
            search: this.config?.searchable || false,
            showExport: false,
            detailView: false,
            detailFormatter: null,
            multiSelection: false,
            showSelectCheckbox: true,
            showToolbar: true,
            showActions: true
        };
    }

}

customElements.define("data-table", DataTable);
