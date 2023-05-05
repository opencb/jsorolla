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
import UtilsNew from "../../../core/utils-new.js";
import GridCommons from "../../commons/grid-commons.js";
import "../../commons/opencb-grid-toolbar.js";
import "../../loading-spinner.js";

export default class VariantInterpreterPharmacogenomicsGrid extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            clinicalAnalysis: {
                type: Object
            },
            clinicalVariants: {
                type: Array
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + "VariantBrowserGrid";
        this._rows = [];
        this.checkedVariants = new Map();
        this.queriedVariants = {};
    }

    firstUpdated() {
        this.table = $("#" + this.gridId);
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("clinicalVariants")) {
            this.renderVariants();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
            this.gridCommons = new GridCommons(this.gridId, this, this._config);

            // Config for the grid toolbar
            // some columns have tooltips in title, we cannot used them for the dropdown
            const defaultColumns = this._getDefaultColumns();
            this.toolbarConfig = {
                ...this._config,
                ...this._config.toolbar, // it comes from external settings
                resource: "CLINICAL_VARIANT",
                columns: defaultColumns, // [0].filter(col => col.rowspan === 2 && col.colspan === 1 && col.visible !== false),
                gridColumns: defaultColumns, // original column structure
            };
            this.requestUpdate();
            this.renderVariants();
        }
    }

    opencgaSessionObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    clinicalAnalysisObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    renderVariants() {
        this.renderLocalVariants();
    }

    renderLocalVariants() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: this.clinicalVariants,
            columns: this._getDefaultColumns(),
            sidePagination: "local",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            paginationVAlign: "both",
            formatShowingRows: this.gridCommons.formatShowingRows,
            detailView: this._config.detailView,
            detailFormatter: (value, row) => this.detailFormatter(value, row),
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            variantGrid: this,

            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onDblClickRow: (row, element) => {
                // We detail view is active we expand the row automatically.
                // FIXME: Note that we use a CSS class way of knowing if the row is expand or collapse, this is not ideal but works.
                if (this._config.detailView) {
                    if (element[0].innerHTML.includes("fa-plus")) {
                        $("#" + this.gridId).bootstrapTable("expandRow", element[0].dataset.index);
                    } else {
                        $("#" + this.gridId).bootstrapTable("collapseRow", element[0].dataset.index);
                    }
                }
            },
            onExpandRow: (index, row) => {
                // Automatically select this row after clicking on "+" icons
                this.gridCommons.onClickRow(row.id, row, this.querySelector(`tr[data-index="${index}"]`));
            },

            onPostBody: data => {
                // We call onLoadSuccess to select first row, this is only needed when rendering from local
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);
                this._rows = data;
            },
        });
    }

    _getDefaultColumns() {
        this._columns = [
            {
                id: "position",
                title: "Chr:Pos",
                field: "chromosome",
                formatter: (value, row) => {
                    return `${row.chromosome}:${row.start}-${row.end}`;
                },
            },
            {
                id: "id",
                title: "Variant",
                field: "id",
            },
            {
                id: "gene",
                title: "Gene",
                field: "gene",
            },
            {
                id: "drugs",
                title: "Drugs",
                field: "drugs",
                formatter: value => (value || []).join(", ") || "-",
            },
            {
                id: "phenotypeCategory",
                title: "Phenotype Category",
                field: "phenotypeCategory",
            },
        ];
        return this._columns;
    }

    detailFormatter(value, row) {
        return `
            <div style='padding:20px;'>
                ${row.sentence}
            </div>
        `;
    }

    showLoading() {
        $("#" + this.gridId).bootstrapTable("showLoading");
    }

    render() {
        return html`
            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this._prefix}VariantBrowserGrid"></table>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            detailView: true,
        };
    }

}

customElements.define("variant-interpreter-pharmacogenomics-grid", VariantInterpreterPharmacogenomicsGrid);
