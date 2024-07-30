/*
 * Copyright 2015-2024 OpenCB
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
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        if (changedProperties.has("data") ||
            changedProperties.has("columns") ||
            changedProperties.has("config")) {
            this.renderDataTable();
        }
    }

    renderDataTable() {
        this.table = $(`#${this._prefix}dataTable`);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: this.columns,
            data: this.data,
            ...this._config,
        });
    }

    render() {
        return html `
            <table id="${this._prefix}dataTable">
            </table>
        `;
    }

    getDefaultConfig() {
        return {
            sidePagination: "local",
            theadClasses: "table-light",
            buttonsClass: "light",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            search: false,
            searchAlign: "right",
            pagination: false,
            pageSize: 10,
            pageList: [10, 25, 50],
        };
    }

}

customElements.define("data-table", DataTable);
