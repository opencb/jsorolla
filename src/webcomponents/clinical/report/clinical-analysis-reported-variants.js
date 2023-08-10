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
import "../../variant/interpretation/variant-interpreter-rearrangement-grid.js";

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
        this.somaticSamples = new Set();
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
        this.somaticSamples = new Set();
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

            // We need to save if each sample is somatic or germline
            (this.clinicalAnalysis?.proband?.samples || []).forEach(sample => {
                if (sample.somatic) {
                    this.somaticSamples.add(sample.id);
                }
            });
        }
    }

    renderGroupedVariants() {
        return this._config.groupsByVariantType.map(group => {
            const variants = this.variants
                .filter(v => group.somatic === this.somaticSamples.has(v.studies[0]?.samples[0]?.sampleId))
                .filter(v => group.variantTypes.indexOf(v.type) > -1);

            const gridConfig = {
                ...(this.opencgaSession?.user?.configs?.IVA?.[group.gridType]?.grid || {}),
                ...this._config.grid,
                somatic: group.somatic,
                variantTypes: group.variantTypes,
            };

            return html`
                <div style="margin-bottom:16px;">
                    <div style="font-size:20px;font-weight:bold;margin-bottom:8px;">
                        <div>${group.display.title}</div>
                    </div>
                    ${variants.length > 0 ? html`
                        ${group.gridType.endsWith("Rearrangement") ? html`
                            <variant-interpreter-rearrangement-grid
                                .review="${true}"
                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                .clinicalVariants="${variants}"
                                .opencgaSession="${this.opencgaSession}"
                                .config="${gridConfig}">
                            </variant-interpreter-rearrangement-grid>
                        ` : html`
                            <variant-interpreter-grid
                                .review="${true}"
                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                .clinicalVariants="${variants}"
                                .opencgaSession="${this.opencgaSession}"
                                .config="${gridConfig}">
                            </variant-interpreter-grid>
                        `}
                    ` : html`
                        <div style="margin-bottom:24px;">
                            <div>No variants to display of this type.</div>
                        </div>
                    `}
                </div>
            `;
        });
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

        return html`
            <div style="">
                ${this.renderGroupedVariants()}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            grid: {
                showInterpretation: true,
                showExport: false,
                showSettings: false,
                showActions: false,
                showEditReview: false,
            },
            groupsByVariantType: [
                {
                    id: "somatic-small-variants",
                    gridType: "variantInterpreterCancerSNV",
                    somatic: true,
                    variantTypes: ["SNV", "INDEL", "INSERTION", "DELETION"],
                    display: {
                        title: "Somatic Small Variants",
                    },
                },
                {
                    id: "somatic-cnv-variants",
                    gridType: "variantInterpreterCancerCNV",
                    somatic: true,
                    variantTypes: ["COPY_NUMBER", "CNV"],
                    display: {
                        title: "Copy Number Variants",
                    },
                },
                {
                    id: "somatic-rearrangement",
                    gridType: "variantInterpreterRearrangement",
                    somatic: true,
                    variantTypes: ["BREAKEND"],
                    display: {
                        title: "Somatic Structural Rearrangement",
                    },
                },
                {
                    id: "germline-small-variants",
                    gridType: "variantInterpreterCancerSNV",
                    somatic: false,
                    variantTypes: ["SNV", "INDEL", "INSERTION", "DELETION"],
                    display: {
                        title: "Germline Small Variants",
                    },
                },
                {
                    id: "germline-rearrangement",
                    gridType: "variantInterpreterRearrangement",
                    somatic: false,
                    variantTypes: ["BREAKEND"],
                    display: {
                        title: "Germline Structural Rearrangement",
                    },
                },
            ],
        };
    }

}

customElements.define("clinical-analysis-reported-variants", ClinicalAnalysisReportedVariants);

