/**
 * Copyright 2015-2019 OpenCB
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
import UtilsNew from "../../../../../core/utils-new.js";
import GridCommons from "../../../../commons/grid-commons.js";
import "../../../../commons/view/detail-tabs.js";
import knockoutDataIndividuals from "../test/knockout.20201103172343.kFIvpr.individuals.js";

export default class KnockoutVariantAllelePairs extends LitElement {

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
            variant: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
        this.gridId = this._prefix + "KnockoutVAPGrid";

    }

    updated(changedProperties) {
        if (changedProperties.has("variantId")) {
            this.prepareData();
            this.renderTable();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    prepareData() {
        // TODO

    }

    renderTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            data: this.tableData,
            columns: this._initTableColumns(),
            sidePagination: "local",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            pagination: true,
            paginationVAlign: "both",
            // formatShowingRows: this.gridCommons.formatShowingRows,
            gridContext: this,
            // formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            loadingTemplate: () => this.gridCommons.loadingFormatter(),
            onClickRow: (row, selectedElement, field) => {
            },
            onLoadSuccess: data => {
                // this is not triggered in case of static data
            },
            onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
            onPostBody: data => {
            }

        });
    }

    _initTableColumns() {
        return [
            {
                title: "Allele",
                field: "variant"
            },
            {
                title: "Pair type",
                field: "pair"
            },
            {
                title: "Type",
                field: "type"
            },
            {
                title: "Alt. freq",
                field: "freq"
            },
            {
                title: "Consequence Type",
                field: "consequenceType"
            },
            {
                title: "ClinVar",
                field: "clinvar"
            },
            {
                title: "Num. Individuals",
                field: "individuals"
            }
        ];
    }

    getDefaultConfig() {
        return {
            title: "Allele Pairs"

        };
    }

    render() {
        return html`
            <div class="row">
                <table id="${this.gridId}"></table>
            </div>
            `;
    }

}

customElements.define("knockout-variant-allele-pairs", KnockoutVariantAllelePairs);
