import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import GridCommons from "../../commons/grid-commons.js";
import "../../commons/opencb-grid-toolbar.js";
import "../../loading-spinner.js";

export default class PharmacogenomicsGrid extends LitElement {

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
                type: Object,
            },
            variants: {
                type: Array,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._rows = [];
        this._columns = this.getDefaultColumns();
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
            this.gridCommons = new GridCommons(this._prefix + "PgxTable", this, this._config);
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.has("variants") || changedProperties.has("config") || changedProperties.has("opencgaSession")) {
            this.renderVariants();
        }
    }

    renderVariants() {
        this.table = $(`#${this._prefix}PgxTable`);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: this.variants,
            columns: this._columns,
            sidePagination: "local",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            paginationVAlign: "both",
            formatShowingRows: this.gridCommons.formatShowingRows,
            detailView: this._config.detailView,
            detailFormatter: (value, row) => this.detailFormatter(value, row),
            // onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onDblClickRow: (row, element) => {
                if (this._config.detailView) {
                    if (element[0].innerHTML.includes("fa-plus")) {
                        $("#" + this.gridId).bootstrapTable("expandRow", element[0].dataset.index);
                    } else {
                        $("#" + this.gridId).bootstrapTable("collapseRow", element[0].dataset.index);
                    }
                }
            },
            // onExpandRow: (index, row) => {
            //     this.gridCommons.onClickRow(row.id, row, this.querySelector(`tr[data-index="${index}"]`));
            // },
            onPostBody: data => {
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);
                this._rows = data;
            },
        });
    }

    detailFormatter(value, row) {
        return `
            <div style='padding:20px;'>
                ${row.sentence}
            </div>
        `;
    }

    render() {
        return html`
            <div class="force-overflow">
                <table id="${this._prefix}PgxTable"></table>
            </div>
        `;
    }

    getDefaultColumns() {
        return [];
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

customElements.define("pharmacogenomics-grid", PharmacogenomicsGrid);
