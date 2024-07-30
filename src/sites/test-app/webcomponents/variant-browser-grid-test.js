
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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../../../webcomponents/variant/variant-browser-grid.js";

class VariantBrowserGridTest extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            testVariantFile: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            testDataVersion: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.COMPONENT_ID = "variant-browser";
        this.variants = null;
        this._config = {};
    }

    update(changedProperties) {
        if (changedProperties.has("testVariantFile") || changedProperties.has("testDataVersion")) {
            this.variantsObserver();
        }

        super.update(changedProperties);
    }

    variantsObserver() {
        this.variants = null;
        if (this.testDataVersion && this.testVariantFile) {
            UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/${this.testVariantFile}.json`)
                .then(content => {
                    this.variants = content;
                    this.mutate();
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    this.requestUpdate();
                });
        }
    }

    mutate() {
        // 1. no gene names in the CT array
        // this.variants[10].annotation.consequenceTypes.forEach(ct => ct.geneName = null);

        // 2. SIFT with no description available
        // this.variants[10].annotation.consequenceTypes
        //     .filter(ct => ct.proteinVariantAnnotation)
        //     .forEach(ct => delete ct.proteinVariantAnnotation.substitutionScores[0].description);
        // Finally, we update variants mem address to force a rendering
        // this.variants = [...this.variants];
    }

    onUserGridSettingsUpdate() {
        this._config = {
            ...this._config,
            ...this.opencgaSession?.user?.configs?.IVA?.settings?.[this.COMPONENT_ID]?.grid,
        };
        this.requestUpdate();
    }

    render() {
        if (!this.variants || !this.opencgaSession) {
            return nothing;
        }

        return html`
            <div data-cy="variant-browser-container">
                <h2 style="font-weight: bold;">
                    Variant Browser (${this.testVariantFile})
                </h2>
                <variant-browser-grid
                    .toolId="${this.COMPONENT_ID}"
                    .variants="${this.variants}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config}"
                    @userGridSettingsUpdate="${() => this.onUserGridSettingsUpdate()}"
                    .populationFrequencies="${this.config.populationFrequencies}">
                </variant-browser-grid>
            </div>
        `;
    }

}

customElements.define("variant-browser-grid-test", VariantBrowserGridTest);
