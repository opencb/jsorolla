/*
 * Copyright 2015-Present OpenCB
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
import UtilsNew from "../../../../core/utils-new";

class VariantInterpreterExomiserView extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variant: {
                type: Object
            },
            active: {
                type: Boolean,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.variant = null;
        this.active = false;
    }

    updated(changedProperties) {
        if (changedProperties.has("variant") || (changedProperties.has("active") && this.active)) {
            this.renderTable();
        }
    }

    renderTable() {
        $("#" + this._prefix + "ExomiserTable").bootstrapTable("destroy");
        $("#" + this._prefix + "ExomiserTable").bootstrapTable({
            data: this.variant?.evidences || [],
            pagination: true,
            columns: [
                {
                    title: "Gene",
                    field: "genomicFeature.geneName",
                    halign: "center",
                },
                {
                    title: "Transcript ID",
                    field: "genomicFeature.transcriptId",
                    halign: "center",
                },
                {
                    title: "Rank",
                    field: "attributes.exomiser",
                    halign: "center",
                    formatter: exomiser => {
                        return exomiser?.["RANK"] || "-";
                    },
                },
                {
                    title: "P-Value",
                    field: "attributes.exomiser",
                    formatter: exomiser => {
                        return exomiser?.["P-VALUE"] || "-";
                    },
                },
            ],
        });
    }

    render() {
        return html`
            <div style="padding: 20px;">
                <table id="${this._prefix}ExomiserTable"></table>
            </div>
        `;
    }


}

customElements.define("variant-interpreter-exomiser-view", VariantInterpreterExomiserView);
