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

import {LitElement, html} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import "./variant-interpreter-review-primary.js";
import "../../clinical/interpretation/clinical-interpretation-editor.js";
import "../../clinical/interpretation/clinical-interpretation-summary.js";
import "../../clinical/interpretation/clinical-interpretation-update.js";
import "../../commons/view/detail-tabs.js";

export default class VariantInterpreterReview extends LitElement {

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
                type: Object,
            },
            clinicalAnalysis: {
                type: Object,
            },
            clinicalAnalysisId: {
                type: String,
            },
            settings: {
                type: Object,
            },
        };
    }

    _init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    this._config = this.getDefaultConfig();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    onClinicalInterpretationUpdate() {
        LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
            clinicalAnalysis: this.clinicalAnalysis,
        });
    }

    render() {
        // Check if session has not been created or project does not exist
        if (!this.opencgaSession || !this.opencgaSession.project) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue</h3>
                </div>
            `;
        }

        return html`
            <detail-tabs
                .data="${this.clinicalAnalysis}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        const items = [
            {
                id: "general-info",
                name: "General Info",
                active: false,
                render: (clinicalAnalysis, active, opencgaSession) => {
                    const displayConfig = {
                        titleVisible: false,
                        width: 8,
                        modalButtonClassName: "btn-light btn-sm",
                        buttonsLayout: "top",
                        buttonsWidth: 8,
                    };

                    return html`
                        <div class="col-md-10 offset-md-1">
                            <tool-header
                                class="bg-white"
                                title="Interpretation - ${clinicalAnalysis?.interpretation?.id}">
                            </tool-header>
                            <div class="col-md-8 mb-3">
                                <clinical-interpretation-summary
                                    .opencgaSession="${opencgaSession}"
                                    .interpretation="${clinicalAnalysis?.interpretation}">
                                </clinical-interpretation-summary>
                            </div>
                            <clinical-interpretation-update
                                .clinicalInterpretation="${clinicalAnalysis?.interpretation}"
                                .clinicalAnalysis="${clinicalAnalysis}"
                                .opencgaSession="${opencgaSession}"
                                .displayConfig="${displayConfig}"
                                @clinicalInterpretationUpdate="${this.onClinicalInterpretationUpdate}">
                            </clinical-interpretation-update>
                        </div>
                    `;
                }
            }
        ];

        // Check for clinicalAnalysis
        if (this.clinicalAnalysis) {
            // Get all VariantCaller types configured
            const variantCallerTypes = new Set();
            this.opencgaSession.study?.internal?.configuration?.clinical?.interpretation?.variantCallers?.forEach(vc => {
                for (const type of vc?.types) {
                    variantCallerTypes.add(type);
                }
            });

            const type = this.clinicalAnalysis.type.toUpperCase();
            if (type === "CANCER") {
                const somaticSample = this.clinicalAnalysis?.proband?.samples?.find(s => s.somatic);
                const germlineSample = this.clinicalAnalysis?.proband?.samples?.find(s => !s.somatic);

                items.push({
                    id: "somatic-small-variants",
                    name: "Somatic Small Variants",
                    render: (clinicalAnalysis, active, opencgaSession) => {
                        // TODO: fix this line to get correct variants to display
                        // const variants = this.clinicalAnalysis?.interpretation?.primaryFindings || [];
                        const variants = clinicalAnalysis?.interpretation?.primaryFindings
                            ?.filter(v => v.studies[0]?.samples[0]?.sampleId === somaticSample?.id)
                            ?.filter(v => (v.type !== "COPY_NUMBER" && v.type !== "CNV"))
                            ?.filter(v => v.type !== "BREAKEND");
                        const gridConfig = {
                            somatic: true,
                            variantTypes: ["SNV", "INDEL"],
                        };

                        return html`
                            <div class="col-md-10 offset-md-1">
                                <tool-header
                                    class="bg-white"
                                    title="Somatic Small Variants - ${clinicalAnalysis?.interpretation?.id}">
                                </tool-header>
                                ${variants.length > 0 ? html`
                                    <variant-interpreter-review-primary
                                        .opencgaSession="${opencgaSession}"
                                        .clinicalAnalysis="${clinicalAnalysis}"
                                        .clinicalVariants="${variants || []}"
                                        .active="${active}"
                                        .toolId="${"variant-interpreter-cancer-snv"}"
                                        .gridConfig="${gridConfig}"
                                        .settings="${this.settings.browsers["CANCER_SNV"]}">
                                    </variant-interpreter-review-primary>
                                ` : html`
                                    <div class="alert alert-info">
                                        No <b>Somatic Small Variants</b> to display.
                                    </div>
                                `}
                            </div>
                        `;
                    },
                });

                if (variantCallerTypes.has("COPY_NUMBER") || variantCallerTypes.has("CNV")) {
                    items.push({
                        id: "somatic-cnv-variants",
                        name: "Somatic CNV Variants",
                        render: (clinicalAnalysis, active, opencgaSession) => {
                            const variants = clinicalAnalysis?.interpretation?.primaryFindings
                                ?.filter(v => v.studies[0]?.samples[0]?.sampleId === somaticSample?.id)
                                ?.filter(v => v.type === "COPY_NUMBER" || v.type === "CNV");
                            const gridConfig = {
                                somatic: true,
                                variantTypes: ["COPY_NUMBER", "CNV"],
                            };

                            return html`
                                <div class="col-md-10 offset-md-1">
                                    <tool-header
                                        class="bg-white"
                                        title="Somatic CNV Variants - ${clinicalAnalysis?.interpretation?.id}">
                                    </tool-header>
                                    ${variants.length > 0 ? html`
                                        <variant-interpreter-review-primary
                                            .opencgaSession="${opencgaSession}"
                                            .clinicalAnalysis="${clinicalAnalysis}"
                                            .clinicalVariants="${variants || []}"
                                            .active="${active}"
                                            .toolId="${"variant-interpreter-cancer-cnv"}"
                                            .gridConfig="${gridConfig}"
                                            .settings="${this.settings.browsers["CANCER_CNV"]}">
                                        </variant-interpreter-review-primary>
                                    ` : html`
                                        <div class="alert alert-info">
                                            No <b>Somatic CNV Variants</b> to display.
                                        </div>
                                    `}
                                </div>
                            `;
                        },
                    });
                }

                if (variantCallerTypes.has("BREAKEND")) {
                    items.push({
                        id: "somatic-rearrangements",
                        name: "Somatic Rearrangements",
                        render: (clinicalAnalysis, active, opencgaSession) => {
                            const variants = clinicalAnalysis?.interpretation?.primaryFindings
                                ?.filter(v => v.studies[0]?.samples[0]?.sampleId === somaticSample?.id)
                                ?.filter(v => v.type === "BREAKEND");
                            const gridConfig = {
                                somatic: true,
                                isRearrangement: true,
                                variantTypes: ["BREAKEND"],
                            };

                            return html`
                                <div class="col-md-10 offset-md-1">
                                    <tool-header
                                        class="bg-white"
                                        title="Somatic Rearrangements - ${clinicalAnalysis?.interpretation?.id}">
                                    </tool-header>
                                    ${variants?.length > 0 ? html`
                                        <variant-interpreter-review-primary
                                            .opencgaSession="${opencgaSession}"
                                            .clinicalAnalysis="${clinicalAnalysis}"
                                            .clinicalVariants="${variants || []}"
                                            .active="${active}"
                                            .toolId="${"variant-interpreter-rearrangement"}"
                                            .gridConfig="${gridConfig}"
                                            .settings="${this.settings.browsers["REARRANGEMENT"]}">
                                        </variant-interpreter-review-primary>
                                    ` : html`
                                        <div class="alert alert-info">
                                            No <b>Somatic Rearrangements</b> to display.
                                        </div>
                                    `}
                                </div>
                            `;
                        },
                    });
                }

                if (germlineSample) {
                    // Add Germline Small Variants tab
                    items.push({
                        id: "germline-small-variants",
                        name: "Germline Small Variants",
                        render: (clinicalAnalysis, active, opencgaSession) => {
                            const variants = clinicalAnalysis?.interpretation?.primaryFindings
                                ?.filter(v => v.studies[0]?.samples[0]?.sampleId === germlineSample?.id)
                                ?.filter(v => v.type !== "BREAKEND");
                            const gridConfig = {
                                somatic: false,
                                variantTypes: ["SNV", "INDEL", "INSERTION", "DELETION"],
                            };

                            return html`
                                <div class="col-md-10 offset-md-1">
                                    <tool-header
                                        class="bg-white"
                                        title="Germline Small Variants - ${clinicalAnalysis?.interpretation?.id}">
                                    </tool-header>
                                    ${variants.length > 0 ? html`
                                        <variant-interpreter-review-primary
                                            .opencgaSession="${opencgaSession}"
                                            .clinicalAnalysis="${clinicalAnalysis}"
                                            .clinicalVariants="${variants || []}"
                                            .active="${active}"
                                            .toolId="${"variant-interpreter-rd"}"
                                            .gridConfig="${gridConfig}"
                                            .settings="${this.settings.browsers["RD"]}">
                                        </variant-interpreter-review-primary>
                                    ` : html`
                                        <div class="alert alert-info">
                                            No <b>Germline Small Variants</b> to display.
                                        </div>
                                    `}
                                </div>
                            `;
                        },
                    });

                    // Add Germline Rearrangements tab
                    items.push({
                        id: "germline-rearrangements",
                        name: "Germline Rearrangements",
                        render: (clinicalAnalysis, active, opencgaSession) => {
                            const variants = clinicalAnalysis?.interpretation?.primaryFindings
                                ?.filter(v => v.studies[0]?.samples[0]?.sampleId === germlineSample?.id)
                                ?.filter(v => v.type === "BREAKEND");
                            const gridConfig = {
                                somatic: false,
                                isRearrangement: true,
                                variantTypes: ["BREAKEND"],
                            };

                            return html`
                                <div class="col-md-10 offset-md-1">
                                    <tool-header
                                        class="bg-white"
                                        title="Germline Rearrangements - ${clinicalAnalysis?.interpretation?.id}">
                                    </tool-header>
                                    ${variants?.length > 0 ? html`
                                        <variant-interpreter-review-primary
                                            .opencgaSession="${opencgaSession}"
                                            .clinicalAnalysis="${clinicalAnalysis}"
                                            .clinicalVariants="${variants || []}"
                                            .active="${active}"
                                            .toolId="${"variant-interpreter-rearrangement"}"
                                            .gridConfig="${gridConfig}"
                                            .settings="${this.settings.browsers["REARRANGEMENT"]}">
                                        </variant-interpreter-review-primary>
                                    ` : html`
                                        <div class="alert alert-info">
                                            No <b>Germline Rearrangements</b> to display.
                                        </div>
                                    `}
                                </div>
                            `;
                        },
                    });
                }

            } else {
                items.push({
                    id: "primary-findings",
                    name: "Primary Findings",
                    render: (clinicalAnalysis, active, opencgaSession) => {
                        // TODO: fix this line to get correct variants to display
                        const variants = this.clinicalAnalysis?.interpretation?.primaryFindings || [];
                        const gridConfig = {
                            somatic: false,
                            variantTypes: ["SNV", "INDEL", "INSERTION", "DELETION"],
                        };

                        return html`
                            <div class="col-md-10 offset-md-1">
                                <tool-header
                                    class="bg-white"
                                    title="Primary Findings - ${clinicalAnalysis?.interpretation?.id}">
                                </tool-header>
                                <variant-interpreter-review-primary
                                    .opencgaSession="${opencgaSession}"
                                    .clinicalAnalysis="${clinicalAnalysis}"
                                    .clinicalVariants="${variants}"
                                    .active="${active}"
                                    .toolId="${"variant-interpreter-rd"}"
                                    .gridConfig="${gridConfig}"
                                    .settings="${this.settings.browsers["RD"]}">
                                </variant-interpreter-review-primary>
                            </div>
                        `;
                    },
                });
            }
        }

        return {
            // title: "Interpretation review",
            display: {
                classes: "justify-content-center"
            },
            items: items,
        };
    }

}

customElements.define("variant-interpreter-review", VariantInterpreterReview);
