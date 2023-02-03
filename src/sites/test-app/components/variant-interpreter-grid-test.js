
/**
 * Copyright 2015-2023 OpenCB
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

import {html, LitElement} from "lit";


import "../../../webcomponents/variant/interpretation/variant-interpreter-grid.js";
import {VARIANT_INTERPRETER_DATA} from "../data/variant-interpreter-data.js";
import {CLINICAL_ANALYSIS_DATA} from "../data/clinical-analysis-data.js";

class VariantInterpreterGridTest extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.configVariantInterpreterGrid = {
            renderLocal: true,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            showExport: false,
            detailView: true,
            showReview: true,
            showActions: true,
            showSelectCheckbox: true,
            multiSelection: false,
            nucleotideGenotype: true,
            alleleStringLengthMax: 10,

            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            },

            quality: {
                qual: 30,
                dp: 20
            },
            evidences: {
                showSelectCheckbox: true
            },
            somatic: false,
            variantTypes: ["SNV", "INDEL", "INSERTION", "DELETION"],
        };
    }

    render() {
        return html`
            <variant-interpreter-grid
                .opencgaSession="${this.opencgaSession}"
                .clinicalVariants="${VARIANT_INTERPRETER_DATA}"
                .clinicalAnalysis="${CLINICAL_ANALYSIS_DATA}"
                .review="${true}"
                .config="${this.configVariantInterpreterGrid}"
                @selectrow="${this.onSelectVariant}"
                @updaterow="${this.onUpdateVariant}"
                @checkrow="${this.onCheckVariant}"
                @gridconfigsave="${this.onGridConfigSave}">
            </variant-interpreter-grid>
        `;
    }

}

customElements.define("variant-interpreter-grid-test", VariantInterpreterGridTest);

