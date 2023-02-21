
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
import UtilsTest from "../../../../cypress/support/utils-test.js";
import UtilsNew from "../../../core/utils-new.js";

import "../../../webcomponents/variant/interpretation/variant-interpreter-grid.js";
import "../../../webcomponents/loading-spinner.js";

// import {VARIANT_INTERPRETER_DATA} from "../data/variant-interpreter-data.js";
// import {CLINICAL_ANALYSIS_DATA} from "../data/clinical-analysis-data.js";

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
            variantData: {
                type: String,
            },
            clinicalData: {
                type: String,
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.isLoading = false;
        this.configVariantInterpreterGrid = {
            renderLocal: false,
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


    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") &&
            changedProperties.has("variantData") &&
            changedProperties.has("clinicalData")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this.#setLoading(true);
        const promises = [
            UtilsNew.importJSONFile(`http://reports.test.zettagenomics.com/iva/tests/2.7/${this.variantData}.json`),
            UtilsNew.importJSONFile(`http://reports.test.zettagenomics.com/iva/tests/2.7/${this.clinicalData}.json`)
        ];

        Promise.all(promises)
            .then(content => {
                this.variantInterpreterData = content[0];
                this.clinicalAnalysisData = content[1];
            }).catch(err => {
                console.log("Error to download data test", err);
            }).finally(() => {
                this.#setLoading(false);
            });
    }

    mutate() {
        // 1. no CT array
        // this.variants[0].annotation.consequenceTypes.forEach(ct => ct.geneName = null);
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <variant-interpreter-grid
                .opencgaSession="${this.opencgaSession}"
                .clinicalVariants="${this.variantInterpreterData}"
                .clinicalAnalysis="${this.clinicalAnalysisData}"
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

