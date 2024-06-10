
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
import UtilsNew from "../../../../core/utils-new.js";

import "../../../../webcomponents/variant/interpretation/variant-interpreter-grid.js";
// import "../../../webcomponents/loading-spinner.js";

class VariantInterpreterRDGridTest extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            testDataVersion: {
                type: String
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
        this.variantInterpreterData = null;
        this.clinicalAnalysisData = null;
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("testDataVersion")) {
            this.opencgaSessionObserver();
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this.#setLoading(true);
        const promises = [
            UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/variant-interpreter-rd-platinum-na12877.json`),
            UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/clinical-analysis-platinum-na12877.json`)
        ];

        Promise.all(promises)
            .then(content => {
                this.variantInterpreterData = content[0];
                this.clinicalAnalysisData = content[1];
                this.mutate();
            })
            .catch(err => {
                console.log("Error to download data test", err);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    mutate() {
        // Nothing to do (yet...)
    }

    onSettingsUpdate() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.opencgaSession?.user?.configs?.IVA?.variantInterpreterBrowserRD?.grid,
        };
        this.requestUpdate();
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <h2 style="font-weight: bold;">
                Variant Interpreter Browser RD (${this.clinicalAnalysisData.id})
            </h2>
            <variant-interpreter-grid
                .toolId="${"variant-interpreter-rd"}"
                .opencgaSession="${this.opencgaSession}"
                .clinicalVariants="${this.variantInterpreterData}"
                .clinicalAnalysis="${this.clinicalAnalysisData}"
                .review="${true}"
                .config="${this._config}"
                @selectrow="${this.onSelectVariant}"
                @updaterow="${this.onUpdateVariant}"
                @checkrow="${this.onCheckVariant}"
                @settingsUpdate="${() => this.onSettingsUpdate()}">
            </variant-interpreter-grid>
        `;
    }

    getDefaultConfig() {
        return {
            somatic: false,
            variantTypes: ["SNV", "INDEL", "INSERTION", "DELETION"],
        };
    }

}

customElements.define("variant-interpreter-rd-grid-test", VariantInterpreterRDGridTest);

