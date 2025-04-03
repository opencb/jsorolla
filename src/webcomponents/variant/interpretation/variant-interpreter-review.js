/*
 * Copyright 2015-2016 OpenCB
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

import {LitElement, html, nothing} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import "./variant-interpreter-review-primary.js";
import "./variant-interpreter-grid.js";
import "../../clinical/interpretation/clinical-interpretation-editor.js";
import "../../clinical/interpretation/clinical-interpretation-summary.js";
import "../../clinical/interpretation/clinical-interpretation-update.js";
import "../../commons/view/detail-tabs.js";
import "../../commons/forms/data-form.js";

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
            variants: {
                type: Object,
            },
            gridConfig: {
                type: Object,
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
        if (changedProperties.has("clinicalAnalysis") || changedProperties.has("gridConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    onClinicalInterpretationUpdate() {
        LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
            clinicalAnalysis: this.clinicalAnalysis,
        });
    }

    render() {
        // Check if session has not been created or project does not exist
        if (!this.opencgaSession || !this.opencgaSession.project) {
            return nothing;
        }

        return this._config.items.map(item => {
            return item.render(this.clinicalAnalysis, this.variants, true, this.opencgaSession);
        });
    }

    getDefaultConfig() {
        const items = [];
        const defaultGridConfig = {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            // exportFilename: exportFilename,
            detailView: true,
            showReview: true,
            showActions: true,

            showSelectCheckbox: true,
            multiSelection: false,
            nucleotideGenotype: true,
            alleleStringLengthMax: 10,

            quality: {
                qual: 30,
                dp: 20
            },
            evidences: {
                showSelectCheckbox: true
            },
        };

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
                    render: (clinicalAnalysis, allVariants, active, opencgaSession) => {
                        // const variants = clinicalAnalysis?.interpretation?.primaryFindings
                        // const variants = (interpretation?.primaryFindings || [])
                        const variants = (allVariants || [])
                            ?.filter(v => v.studies[0]?.samples[0]?.sampleId === somaticSample?.id)
                            ?.filter(v => (v.type !== "COPY_NUMBER" && v.type !== "CNV"))
                            ?.filter(v => v.type !== "BREAKEND");
                        const gridConfig = {
                            ...defaultGridConfig,
                            ...(this.settings?.browsers?.["CANCER_SNV"]?.table || {}),
                            ...(this.gridConfig || {}),
                            somatic: true,
                            variantTypes: ["SNV", "INDEL"],
                        };
                        return html`
                            ${variants.length > 0 ? html`
                                <h3>Somatic Small Variants</h3>
                                <variant-interpreter-grid
                                    .toolId="${"variant-interpreter-cancer-snv"}"
                                    .opencgaSession="${opencgaSession}"
                                    .clinicalAnalysis="${clinicalAnalysis}"
                                    .clinicalVariants="${variants}"
                                    .review="${true}"
                                    .active="${active}"
                                    .config="${gridConfig}"
                                    @selectrow="${this.onSelectVariant}"
                                    @updaterow="${this.onUpdateVariant}"
                                    @checkrow="${this.onCheckVariant}"
                                    @settingsUpdate="${this.onSettingsUpdate}">
                                </variant-interpreter-grid>
                            ` : nothing}
                        `;
                    },
                });

                // if (variantCallerTypes.has("COPY_NUMBER") || variantCallerTypes.has("CNV")) {
                //     items.push({
                //         id: "somatic-cnv-variants",
                //         name: "Somatic CNV Variants",
                //         render: (clinicalAnalysis, active, opencgaSession) => {
                //             const variants = clinicalAnalysis?.interpretation?.primaryFindings
                //                 ?.filter(v => v.studies[0]?.samples[0]?.sampleId === somaticSample?.id)
                //                 ?.filter(v => v.type === "COPY_NUMBER" || v.type === "CNV");
                //             const gridConfig = {
                //                 somatic: true,
                //                 variantTypes: ["COPY_NUMBER", "CNV"],
                //             };

                //             return html`
                //                 <div class="col-md-10 offset-md-1">
                //                     <tool-header
                //                         class="bg-white"
                //                         title="Somatic CNV Variants - ${clinicalAnalysis?.interpretation?.id}">
                //                     </tool-header>
                //                     ${variants.length > 0 ? html`
                //                         <variant-interpreter-review-primary
                //                             .opencgaSession="${opencgaSession}"
                //                             .clinicalAnalysis="${clinicalAnalysis}"
                //                             .clinicalVariants="${variants || []}"
                //                             .active="${active}"
                //                             .toolId="${"variant-interpreter-cancer-cnv"}"
                //                             .gridConfig="${gridConfig}"
                //                             .settings="${this.settings.browsers["CANCER_CNV"]}">
                //                         </variant-interpreter-review-primary>
                //                     ` : html`
                //                         <div class="alert alert-info">
                //                             No <b>Somatic CNV Variants</b> to display.
                //                         </div>
                //                     `}
                //                 </div>
                //             `;
                //         },
                //     });
                // }

                // if (variantCallerTypes.has("BREAKEND")) {
                //     items.push({
                //         id: "somatic-rearrangements",
                //         name: "Somatic Rearrangements",
                //         render: (clinicalAnalysis, active, opencgaSession) => {
                //             const variants = clinicalAnalysis?.interpretation?.primaryFindings
                //                 ?.filter(v => v.studies[0]?.samples[0]?.sampleId === somaticSample?.id)
                //                 ?.filter(v => v.type === "BREAKEND");
                //             const gridConfig = {
                //                 somatic: true,
                //                 isRearrangement: true,
                //                 variantTypes: ["BREAKEND"],
                //             };

                //             return html`
                //                 <div class="col-md-10 offset-md-1">
                //                     <tool-header
                //                         class="bg-white"
                //                         title="Somatic Rearrangements - ${clinicalAnalysis?.interpretation?.id}">
                //                     </tool-header>
                //                     ${variants?.length > 0 ? html`
                //                         <variant-interpreter-review-primary
                //                             .opencgaSession="${opencgaSession}"
                //                             .clinicalAnalysis="${clinicalAnalysis}"
                //                             .clinicalVariants="${variants || []}"
                //                             .active="${active}"
                //                             .toolId="${"variant-interpreter-rearrangement"}"
                //                             .gridConfig="${gridConfig}"
                //                             .settings="${this.settings.browsers["REARRANGEMENT"]}">
                //                         </variant-interpreter-review-primary>
                //                     ` : html`
                //                         <div class="alert alert-info">
                //                             No <b>Somatic Rearrangements</b> to display.
                //                         </div>
                //                     `}
                //                 </div>
                //             `;
                //         },
                //     });
                // }

                if (germlineSample) {
                    // Add Germline Small Variants tab
                    items.push({
                        id: "germline-small-variants",
                        name: "Germline Small Variants",
                        render: (clinicalAnalysis, allVariants, active, opencgaSession) => {
                            const variants = (allVariants || [])
                                ?.filter(v => v.studies[0]?.samples[0]?.sampleId === germlineSample?.id)
                                ?.filter(v => v.type !== "BREAKEND");
                            const gridConfig = {
                                ...defaultGridConfig,
                                ...(this.settings?.browsers?.["RD"]?.table || {}),
                                ...(this.gridConfig || {}),
                                somatic: false,
                                variantTypes: ["SNV", "INDEL", "INSERTION", "DELETION"],
                            };
                            return html`
                                ${variants.length > 0 ? html`
                                    <h3>Germline Small Variants</h3>
                                    <variant-interpreter-grid
                                        .toolId="${"variant-interpreter-rd"}"
                                        .opencgaSession="${opencgaSession}"
                                        .clinicalAnalysis="${clinicalAnalysis}"
                                        .clinicalVariants="${variants}"
                                        .review="${true}"
                                        .active="${active}"
                                        .config="${gridConfig}"
                                        @selectrow="${this.onSelectVariant}"
                                        @updaterow="${this.onUpdateVariant}"
                                        @checkrow="${this.onCheckVariant}"
                                        @settingsUpdate="${this.onSettingsUpdate}">
                                    </variant-interpreter-grid>
                                ` : nothing}
                            `;
                        },
                    });

                //     // Add Germline Rearrangements tab
                //     items.push({
                //         id: "germline-rearrangements",
                //         name: "Germline Rearrangements",
                //         render: (clinicalAnalysis, active, opencgaSession) => {
                //             const variants = clinicalAnalysis?.interpretation?.primaryFindings
                //                 ?.filter(v => v.studies[0]?.samples[0]?.sampleId === germlineSample?.id)
                //                 ?.filter(v => v.type === "BREAKEND");
                //             const gridConfig = {
                //                 somatic: false,
                //                 isRearrangement: true,
                //                 variantTypes: ["BREAKEND"],
                //             };

                //             return html`
                //                 <div class="col-md-10 offset-md-1">
                //                     <tool-header
                //                         class="bg-white"
                //                         title="Germline Rearrangements - ${clinicalAnalysis?.interpretation?.id}">
                //                     </tool-header>
                //                     ${variants?.length > 0 ? html`
                //                         <variant-interpreter-review-primary
                //                             .opencgaSession="${opencgaSession}"
                //                             .clinicalAnalysis="${clinicalAnalysis}"
                //                             .clinicalVariants="${variants || []}"
                //                             .active="${active}"
                //                             .toolId="${"variant-interpreter-rearrangement"}"
                //                             .gridConfig="${gridConfig}"
                //                             .settings="${this.settings.browsers["REARRANGEMENT"]}">
                //                         </variant-interpreter-review-primary>
                //                     ` : html`
                //                         <div class="alert alert-info">
                //                             No <b>Germline Rearrangements</b> to display.
                //                         </div>
                //                     `}
                //                 </div>
                //             `;
                //         },
                //     });
                }

            } else {
                // items.push({
                //     id: "primary-findings",
                //     name: "Primary Findings",
                //     render: (clinicalAnalysis, active, opencgaSession) => {
                //         // TODO: fix this line to get correct variants to display
                //         const variants = this.clinicalAnalysis?.interpretation?.primaryFindings || [];
                //         const gridConfig = {
                //             somatic: false,
                //             variantTypes: ["SNV", "INDEL", "INSERTION", "DELETION"],
                //         };

                //         return html`
                //             <div class="col-md-10 offset-md-1">
                //                 <tool-header
                //                     class="bg-white"
                //                     title="Primary Findings - ${clinicalAnalysis?.interpretation?.id}">
                //                 </tool-header>
                //                 <variant-interpreter-review-primary
                //                     .opencgaSession="${opencgaSession}"
                //                     .clinicalAnalysis="${clinicalAnalysis}"
                //                     .clinicalVariants="${variants}"
                //                     .active="${active}"
                //                     .toolId="${"variant-interpreter-rd"}"
                //                     .gridConfig="${gridConfig}"
                //                     .settings="${this.settings.browsers["RD"]}">
                //                 </variant-interpreter-review-primary>
                //             </div>
                //         `;
                //     },
                // });
            }
        }

        return {
            // title: "Interpretation review",
            items: items,
        };
    }

}

customElements.define("variant-interpreter-review", VariantInterpreterReview);
