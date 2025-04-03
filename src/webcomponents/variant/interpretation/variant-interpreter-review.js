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
                                    @updaterow="${this.onUpdateVariant}"
                                    @checkrow="${this.onCheckVariant}"
                                    @settingsUpdate="${this.onSettingsUpdate}">
                                </variant-interpreter-grid>
                            ` : nothing}
                        `;
                    },
                });

                if (variantCallerTypes.has("COPY_NUMBER") || variantCallerTypes.has("CNV")) {
                    items.push({
                        id: "somatic-cnv-variants",
                        name: "Somatic CNV Variants",
                        render: (clinicalAnalysis, allVariants, active, opencgaSession) => {
                            // const variants = clinicalAnalysis?.interpretation?.primaryFindings
                            const variants = (allVariants || [])
                                ?.filter(v => v.studies[0]?.samples[0]?.sampleId === somaticSample?.id)
                                ?.filter(v => v.type === "COPY_NUMBER" || v.type === "CNV");
                            const gridConfig = {
                                ...defaultGridConfig,
                                ...(this.settings?.browsers?.["CANCER_CNV"]?.table || {}),
                                ...(this.gridConfig || {}),
                                somatic: true,
                                variantTypes: ["COPY_NUMBER", "CNV"],
                            };
                            return html`
                                ${variants.length > 0 ? html`
                                    <h3>Somatic CNV Variants</h3>
                                    <variant-interpreter-grid
                                        .toolId="${"variant-interpreter-cancer-snv"}"
                                        .opencgaSession="${opencgaSession}"
                                        .clinicalAnalysis="${clinicalAnalysis}"
                                        .clinicalVariants="${variants}"
                                        .review="${true}"
                                        .active="${active}"
                                        .config="${gridConfig}"
                                        @updaterow="${this.onUpdateVariant}">
                                    </variant-interpreter-grid>
                                ` : nothing}
                            `;
                        },
                    });
                }

                if (variantCallerTypes.has("BREAKEND")) {
                    items.push({
                        id: "somatic-rearrangements",
                        name: "Somatic Rearrangements",
                        render: (clinicalAnalysis, allVariants, active, opencgaSession) => {
                            // const variants = clinicalAnalysis?.interpretation?.primaryFindings
                            const variants = (allVariants || [])
                                ?.filter(v => v.studies[0]?.samples[0]?.sampleId === somaticSample?.id)
                                ?.filter(v => v.type === "BREAKEND");
                            const gridConfig = {
                                ...defaultGridConfig,
                                ...(this.settings?.browsers?.["REARRANGEMENT"]?.table || {}),
                                ...(this.gridConfig || {}),
                                somatic: true,
                                isRearrangement: true,
                                variantTypes: ["BREAKEND"],
                            };
                            return html`
                                ${variants.length > 0 ? html`
                                    <h3>Somatic Rearrangements</h3>
                                    <variant-interpreter-rearrangement-grid
                                        .toolId="${"variant-interpreter-rearrangement"}"
                                        .opencgaSession="${opencgaSession}"
                                        .clinicalAnalysis="${clinicalAnalysis}"
                                        .clinicalVariants="${variants}"
                                        .review="${true}"
                                        .active="${active}"
                                        .config="${gridConfig}"
                                        @updaterow="${this.onUpdateVariant}">
                                    </variant-interpreter-rearrangement-grid>
                                ` : nothing}
                            `;
                        },
                    });
                }

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
                    // Add Germline Rearrangements tab
                    items.push({
                        id: "germline-rearrangements",
                        name: "Germline Rearrangements",
                        render: (clinicalAnalysis, allVariants, active, opencgaSession) => {
                            // const variants = clinicalAnalysis?.interpretation?.primaryFindings
                            const variants = (allVariants || [])
                                ?.filter(v => v.studies[0]?.samples[0]?.sampleId === germlineSample?.id)
                                ?.filter(v => v.type === "BREAKEND");
                            const gridConfig = {
                                ...defaultGridConfig,
                                ...(this.settings?.browsers?.["REARRANGEMENT"]?.table || {}),
                                ...(this.gridConfig || {}),
                                somatic: false,
                                isRearrangement: true,
                                variantTypes: ["BREAKEND"],
                            };
                            return html`
                                ${variants.length > 0 ? html`
                                    <h3>Germline Rearrangements</h3>
                                    <variant-interpreter-rearrangement-grid
                                        .toolId="${"variant-interpreter-rearrangement"}"
                                        .opencgaSession="${opencgaSession}"
                                        .clinicalAnalysis="${clinicalAnalysis}"
                                        .clinicalVariants="${variants}"
                                        .review="${true}"
                                        .active="${active}"
                                        .config="${gridConfig}"
                                        @updaterow="${this.onUpdateVariant}">
                                    </variant-interpreter-rearrangement-grid>
                                ` : nothing}
                            `;
                        },
                    });
                }
            } else {
                // SINGLE or FAMILY case types
                items.push({
                    id: "primary-findings",
                    name: "Primary Findings",
                    render: (clinicalAnalysis, allVariants, active, opencgaSession) => {
                        const gridConfig = {
                            ...defaultGridConfig,
                            ...(this.settings?.browsers?.["RD"]?.table || {}),
                            ...(this.gridConfig || {}),
                            somatic: false,
                            variantTypes: ["SNV", "INDEL", "INSERTION", "DELETION"],
                        };
                        return html`
                            ${allVariants.length > 0 ? html`
                                <variant-interpreter-grid
                                    .toolId="${"variant-interpreter-rd"}"
                                    .opencgaSession="${opencgaSession}"
                                    .clinicalAnalysis="${clinicalAnalysis}"
                                    .clinicalVariants="${allVariants}"
                                    .review="${true}"
                                    .active="${active}"
                                    .config="${gridConfig}"
                                    @updaterow="${this.onUpdateVariant}">
                                </variant-interpreter-grid>
                            ` : html`
                                <div class="alert alert-info">
                                    No <b>Primary Findings</b> to display.
                                </div>
                            `}
                        `;
                    },
                });
            }
        }

        return {
            items: items,
        };
    }

}

customElements.define("variant-interpreter-review", VariantInterpreterReview);
