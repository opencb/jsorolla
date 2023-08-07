/**
 * Copyright 2015-present OpenCB
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
// import ClinicalAnalysisManager from "../clinical-analysis-manager.js";
import "../../variant/interpretation/variant-interpreter-grid.js";

export default class ClinicalAnalysisReportedVariants extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalAnalysis: {
                type: Object
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
        this.variants = [];
        this._config = this.getDefaultConfig();
        // this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis") || changedProperties.has("opencgaSession")) {
            this.clinicalAnalysisObserver();
        }

        super.update(changedProperties);
    }

    clinicalAnalysisObserver() {
        this.variants = [];
        if (this.clinicalAnalysis) {
            const interpretations = [
                this.clinicalAnalysis.interpretation,
                ...this.clinicalAnalysis.secondaryInterpretations,
            ];
            interpretations.forEach(interpretation => {
                (interpretation?.primaryFindings || [])
                    .filter(variant => variant?.status === "REPORTED")
                    .forEach(variant => {
                        this.variants.push({
                            ...variant,
                            interpretation: interpretation.id,
                        });
                    });
            });
        }
    }

    render() {
        if (!this.clinicalAnalysis) {
            return "";
        }

        if (this.variants.length === 0) {
            return html`
                <div>No reported variants to display</div>
            `;
        }

        const gridConfig = {
            showInterpretation: true,
            showExport: true,
            showSettings: true,
            showActions: false,
            showEditReview: false,
        };

        return html`
            <variant-interpreter-grid
                .review="${true}"
                .clinicalAnalysis="${this.clinicalAnalysis}"
                .clinicalVariants="${this.variants}"
                .opencgaSession="${this.opencgaSession}"
                .config="${gridConfig}">
            </variant-interpreter-grid>
        `;

        // return html`
        //     <data-form
        //         .data="${this.clinicalAnalysis}"
        //         .config="${this._config}"
        //         @fieldChange="${e => this.onFieldChange(e)}"
        //         @submit=${e => this.onSubmit(e)}>
        //     </data-form>
        // `;
    }

    getDefaultConfig() {
        return {
            buttonsVisible: false,
            sections: [],
        };
    }

}

customElements.define("clinical-analysis-reported-variants", ClinicalAnalysisReportedVariants);

