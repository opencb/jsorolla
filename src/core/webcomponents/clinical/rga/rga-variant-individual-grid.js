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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";
import "./../../commons/view/detail-tabs.js";


export default class RgaVariantIndividualGrid extends LitElement {

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
        this.gridId = this._prefix + "VIGrid";

    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
        }

        if (changedProperties.has("variant")) {
            this.prepareData();
            this.renderTable();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    prepareData() {


    }

    renderTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: this.variant.individuals,
            columns: this._initTableColumns(),
            sidePagination: "local",
            uniqueId: "id",
            pagination: true,
            paginationVAlign: "both",
            //formatShowingRows: this.gridCommons.formatShowingRows,
            gridContext: this,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
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
                title: "Individual Id",
                field: "id"
            },
            {
                title: "Sample",
                field: "sampleId"
            },
            {
                title: "Type",
                field: "type"
            },
            {
                title: "GT",
                //field: "variant.genotype"
            },
            {
                title: "DP",
                field: "dp"
            },
            {
                title: "Filter",
                //field: "variant.filter"
            },
            {
                title: "Qual",
                field: "qual"
            }
        ];
    }

    getDefaultConfig() {
        return {
            title: "Individual"

        };
    }

    render() {
        return html`
            <h3 class="break-word">Individual presenting ${this.variant?.id}</h3>
            <div class="row">
                <table id="${this.gridId}"></table>
            </div>
            `;
    }

}

customElements.define("rga-variant-individual-grid", RgaVariantIndividualGrid);
