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
import UtilsNew from "../../../core/utils-new.js";
import "./variant-interpreter-grid.js";
import "./variant-interpreter-rearrangement-grid.js";
import "./variant-interpreter-detail.js";
import "../../clinical/interpretation/clinical-interpretation-view.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils";
import NotificationUtils from "../../commons/utils/notification-utils";
import ClinicalAnalysisManager from "../../clinical/clinical-analysis-manager";
import LitUtils from "../../commons/utils/lit-utils";

export default class VariantInterpreterReviewPrimary extends LitElement {

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
                type: Object
            },
            clinicalAnalysis: {
                type: Object
            },
            clinicalVariants: {
                type: Array
            },
            cellbaseClient: {
                type: Object
            },
            consequenceTypes: {
                type: Object
            },
            populationFrequencies: {
                type: Object
            },
            proteinSubstitutionScores: {
                type: Object
            },
            mode: {
                type: String
            },
            toolId: {
                type: String,
            },
            settings: {
                type: Object,
            },
            gridConfig: {
                type: Object,
            },
            config: {
                type: Object
            },
            active: {
                type: Boolean,
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.gridConfig = {};

        this.messageError = false;
        this.messageSuccess = false;

        this.variant = null;
        this.reportedVariants = [];

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("config") || changedProperties.has("gridConfig") || changedProperties.has("settings")) {
            this.settingsObserver();
        }

        super.update(changedProperties);
    }

    settingsObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...(this.config || {}),
        };

        if (this.gridConfig) {
            this._config.result.grid = {
                ...this._config.result.grid,
                ...this.gridConfig,
            };
        }

        if (this.settings?.table) {
            this._config.result.grid = {
                ...this._config.result.grid,
                ...this.settings.table,
            };
        }

        // Check for user configuration
        if (this.toolId && this.opencgaSession.user?.configs?.IVA?.settings?.[this.toolId]?.grid) {
            this._config.result.grid = {
                ...this._config.result.grid,
                ...this.opencgaSession.user.configs.IVA.settings[this.toolId].grid,
            };
        }

        // Add copy.execute functions
        if (this._config.result.grid?.copies?.length > 0) {
            this._config.result.grid?.copies.forEach(copy => {
                const originalCopy = this.settings.table.copies.find(c => c.id === copy.id);
                if (originalCopy.execute) {
                    // eslint-disable-next-line no-param-reassign
                    copy.execute = originalCopy.execute;
                }
            });
        }
        this.requestUpdate();
    }

    onSelectVariant(e) {
        this.variantId = e.detail.id;
        this.variant = e.detail.row;
        this.requestUpdate();
    }

    onCheckVariant(e) {
        const rows = Array.isArray(e.detail.row) ? e.detail.row : [e.detail.row];
        rows.forEach(row => {
            if (e.detail.checked) {
                this.clinicalAnalysisManager.addVariant(row);
            } else {
                this.clinicalAnalysisManager.removeVariant(row);
            }
        });
    }

    onUpdateVariant(e) {
        const rows = Array.isArray(e.detail.row) ? e.detail.row : [e.detail.row];
        rows.forEach(row => {
            this.clinicalAnalysisManager.updateSingleVariant(row);
        });
        this.requestUpdate();
    }


    onViewInterpretation() {
        // $("#" + this._prefix + "PreviewModal").modal("show");
        const previewModal = new bootstrap.Modal("#" + this._prefix + "PreviewModal");
        previewModal.show();
    }

    onSaveVariants(e) {
        // We save current query so we can execute the same query after refreshing, check 'clinicaAnalysisObserver'
        this.currentQueryBeforeSaveEvent = this.query;

        // Save current query in the added variants
        // eslint-disable-next-line no-param-reassign
        this.clinicalAnalysisManager.state.addedVariants?.forEach(variant => variant.filters = this.query);

        const comment = e.detail.comment;
        this.clinicalAnalysisManager.updateInterpretationVariants(comment, () => {
            LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
                clinicalAnalysis: this.clinicalAnalysis,
            }, null, {bubbles: true, composed: true});
        });
    }

    async onGridConfigSave(e) {
        const newGridConfig = {...e.detail.value};
        // Remove highlights and copies configuration from new config
        // delete newGridConfig.highlights;

        // Update user configuration
        try {
            // await OpencgaCatalogUtils.updateGridConfig("IVA", this.opencgaSession, this.toolId, newGridConfig);
            // Update user configuration
            await OpencgaCatalogUtils
                .updateGridConfig(
                    "IVA",
                    this.opencgaSession,
                    this.toolId,
                    {
                        // All Variant Grids
                        pageSize: newGridConfig.pageSize,
                        columns: newGridConfig.columns,
                        geneSet: newGridConfig.geneSet,
                        consequenceType: newGridConfig.consequenceType,
                        populationFrequenciesConfig: newGridConfig.populationFrequenciesConfig,
                        highlights: newGridConfig.highlights,
                        // Only Variant Interpreter Grids
                        genotype: newGridConfig.genotype,
                    }
                );
            this.settingsObserver();
            this.requestUpdate();

            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                message: "Configuration saved",
            });
        } catch (error) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
        }
    }

        onUserGridSettingsUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    render() {
        // No primary findings in interpretation --> display message
        if (!this.clinicalAnalysis?.interpretation?.primaryFindings?.length) {
            return html`
                <div class="alert alert-warning">
                    <b>Warning</b>: there are not variants for this clinical interpretation.
                </div>
            `;
        }

        const state = this.clinicalAnalysisManager.state || {};
        const hasVariantsToSave = state.removedVariants?.length || state.updatedVariants?.length;

        return html`
            <div class="d-flex justify-content-end gap-1 mb-2">
                <button type="button" class="btn btn-primary" @click="${this.onViewInterpretation}">
                    Preview
                </button>
                <button class="btn ${hasVariantsToSave ? "btn-danger" : "btn-primary"}" @click="${this.onSaveVariants}">
                    <i class="fas fa-save pe-1" aria-hidden="true"></i>
                    <strong>Save</strong>
                    ${hasVariantsToSave ? html`
                        <span class="badge ms-1">
                            ${(state.removedVariants?.length || 0) + (state.updatedVariants?.length || 0)}
                        </span>
                    ` : null}
                </button>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <div class="pt-1">
                        ${this.clinicalAnalysis?.interpretation ? html`
                            ${this._config.result?.grid?.isRearrangement ? html`
                                <variant-interpreter-rearrangement-grid
                                    .toolId="${this.toolId}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                    .clinicalVariants="${this.clinicalVariants}"
                                    .review="${true}"
                                    .active="${this.active}"
                                    .config="${this._config.result.grid}"
                                    @selectrow="${this.onSelectVariant}"
                                    @updaterow="${this.onUpdateVariant}"
                                    @checkrow="${this.onCheckVariant}"
                                    @userGridSettingsUpdate="${this.onSettingsUpdate}">
                                </variant-interpreter-rearrangement-grid>
                            ` : html`
                                <variant-interpreter-grid
                                    .toolId="${this.toolId}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                    .clinicalVariants="${this.clinicalVariants}"
                                    .review="${true}"
                                    .active="${this.active}"
                                    .config="${this._config.result.grid}"
                                    @selectrow="${this.onSelectVariant}"
                                    @updaterow="${this.onUpdateVariant}"
                                    @checkrow="${this.onCheckVariant}"
                                    @userGridSettingsUpdate="${this.onSettingsUpdate}">
                                </variant-interpreter-grid>
                                <variant-interpreter-detail
                                    .opencgaSession="${this.opencgaSession}"
                                    .variant="${this.variant}"
                                    .toolId="${this.toolId}"
                                    .cellbaseClient="${this.cellbaseClient}"
                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                    .config="${this._config.detail}">
                                </variant-interpreter-detail>
                            `}
                        ` : html`
                            <div class="alert alert-info">
                                <i class="fas fa-3x fa-info-circle align-middle"></i> No Selected variants yet.
                            </div>
                        `}
                    </div>
                </div>
            </div>

            <div class="modal fade" id="${this._prefix}PreviewModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" style="width: 1024px">
                    <div class="modal-content">
                        <div class="modal-header" style="display:flex;align-items:center;">
                            <h4 style="margin-right:auto;">
                                Interpretation preview
                            </h4>
                            <button type="button" class="close" data-bs-dismississ="modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="container-fluid" style="max-height:75vh;overflow-y:auto;">
                                <json-viewer .data="${this.clinicalAnalysis?.interpretation}"></json-viewer>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        const date = UtilsNew.dateFormatter(new Date(), "YYYYMMDDhhmm");
        const exportFilename = `variant_interpreter_${this.opencgaSession?.study?.id}_${this.clinicalAnalysis?.id}_${this.clinicalAnalysis?.interpretation?.id ?? ""}_primaryFindings_${date}`;
        return {
            title: "RD Case Interpreter",
            showTitle: false,
            result: {
                grid: {
                    pagination: true,
                    pageSize: 10,
                    pageList: [10, 25, 50],

                    showSelectCheckbox: true,

                    showReview: true,
                    showActions: true,

                    showExport: true,
                    exportFilename: exportFilename,

                    renderLocal: false,

                    alleleStringLengthMax: 10,
                    // 20231912 Vero: I comment out this code. I believe is not used.
                    // quality: {
                    //     qual: 30,
                    //     dp: 20
                    // },
                    isRearrangement: false,
                }
            },
            detail: {
                title: "Selected Variant",
                items: [
                    {
                        id: "annotationSummary",
                        name: "Summary",
                        active: true,
                        render: variant => html`
                            <cellbase-variant-annotation-summary
                                .variantAnnotation="${variant?.annotation}"
                                .consequenceTypes="${CONSEQUENCE_TYPES}"
                                .proteinSubstitutionScores="${PROTEIN_SUBSTITUTION_SCORE}"
                                .assembly=${this.opencgaSession.project.organism.assembly}>
                            </cellbase-variant-annotation-summary>
                        `,
                    },
                    {
                        id: "annotationConsType",
                        name: "Consequence Type",
                        render: (variant, active) => html`
                            <variant-consequence-type-view
                                .consequenceTypes="${variant?.annotation?.consequenceTypes}"
                                .active="${active}">
                            </variant-consequence-type-view>
                        `,
                    },
                    {
                        id: "annotationPropFreq",
                        name: "Population Frequencies",
                        render: (variant, active) => html`
                            <cellbase-population-frequency-grid
                                .populationFrequencies="${variant?.annotation?.populationFrequencies}"
                                .active="${active}">
                            </cellbase-population-frequency-grid>
                        `,
                    },
                    {
                        id: "annotationClinical",
                        name: "Clinical",
                        render: variant => html`
                            <variant-annotation-clinical-view
                                .traitAssociation="${variant?.annotation?.traitAssociation}"
                                .geneTraitAssociation="${variant?.annotation?.geneTraitAssociation}">
                            </variant-annotation-clinical-view>
                        `,
                    },
                    {
                        id: "fileMetrics",
                        name: "File Metrics",
                        render: (variant, active, opencgaSession) => html`
                            <opencga-variant-file-metrics
                                .opencgaSession="${opencgaSession}"
                                .variant="${variant}"
                                .files="${this.clinicalAnalysis}">
                            </opencga-variant-file-metrics>
                        `,
                    },
                    {
                        id: "cohortStats",
                        name: "Cohort Stats",
                        render: (variant, active, opencgaSession) => html`
                            <variant-cohort-stats
                                .opencgaSession="${opencgaSession}"
                                .variantId="${variant.id}"
                                .active="${active}">
                            </variant-cohort-stats>
                        `,
                    },
                    {
                        id: "samples",
                        name: "Samples",
                        render: (variant, active, opencgaSession) => html`
                            <variant-samples
                                .opencgaSession="${opencgaSession}"
                                .variantId="${variant?.id}"
                                .active="${active}">
                            </variant-samples>
                        `,
                    },
                    {
                        id: "beacon",
                        name: "Beacon",
                        render: (variant, active, opencgaSession) => html`
                            <variant-beacon-network
                                .variant="${variant?.id}"
                                .assembly="${opencgaSession.project.organism.assembly}"
                                .config="${this.beaconConfig}"
                                .active="${active}">
                            </variant-beacon-network>
                        `,
                    },
                    {
                        id: "exomiser",
                        name: "Exomiser",
                        visible: () => {
                            return this.clinicalAnalysis?.interpretation?.method?.name === "interpretation-exomiser";
                        },
                        render: (variant, active) => html`
                            <variant-interpreter-exomiser-view
                                .variant="${variant}"
                                .active="${active}">
                            </variant-interpreter-exomiser-view>
                        `,
                    },
                    {
                        id: "json-view",
                        name: "JSON Data",
                        render: (variant, active) => html`
                            <json-viewer
                                .data="${variant}"
                                .active="${active}">
                            </json-viewer>
                        `,
                    }
                ]
            }
        };
    }

}

customElements.define("variant-interpreter-review-primary", VariantInterpreterReviewPrimary);
