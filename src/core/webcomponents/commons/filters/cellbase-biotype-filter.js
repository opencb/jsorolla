/*
 * Copyright 2015-2016 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "Licen=se");
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

export default class CellbaseBiotypeFilter extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            cellbaseClient: {
                type: Object
            },
            query: {
                type: Object
            },
            config: {
                type: Object
            }
        }
    }

    _init() {
        this._prefix = "crf-" + Utils.randomString(6) + "_";
        this._config = this.getDefaultConfig();
        if(this.query && this.query.biotype && this.query.biotype.length){
            $("#" + this._prefix + "GeneBiotypes").selectpicker("val", this.query.biotype.split(","));
        }
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            biotypes: [
                "3prime_overlapping_ncrna", "IG_C_gene", "IG_C_pseudogene", "IG_D_gene", "IG_J_gene", "IG_J_pseudogene",
                "IG_V_gene", "IG_V_pseudogene", "Mt_rRNA", "Mt_tRNA", "TR_C_gene", "TR_D_gene", "TR_J_gene", "TR_J_pseudogene",
                "TR_V_gene", "TR_V_pseudogene", "antisense", "lincRNA", "miRNA", "misc_RNA", "non_stop_decay",
                "nonsense_mediated_decay", "polymorphic_pseudogene", "processed_pseudogene", "processed_transcript",
                "protein_coding", "pseudogene", "rRNA", "retained_intron", "sense_intronic", "sense_overlapping", "snRNA",
                "snoRNA", "transcribed_processed_pseudogene", "transcribed_unprocessed_pseudogene",
                "translated_processed_pseudogene", "unitary_pseudogene", "unprocessed_pseudogene"
            ],
        }
    }

    filterChange(e) {
        let event = new CustomEvent('filterChange', {
            detail: {
                value: $(e.target).val() ? $(e.target).val().join(",") : null
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <select class="selectpicker" id="${this._prefix}GeneBiotypes" data-size="10" data-live-search="true"
                            data-selected-text-format="count" multiple @change="${this.filterChange}"
                            >
                            ${this._config.biotypes.length && this._config.biotypes.map( biotype => html`
                                <option value="${biotype}">${biotype}</option>
                            `)}
            </select>
                `;
    }
}

customElements.define("cellbase-biotype-filter", CellbaseBiotypeFilter);