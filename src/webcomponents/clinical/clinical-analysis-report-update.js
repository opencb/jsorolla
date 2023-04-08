/*
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

import {html, LitElement, nothing} from "lit";

import UtilsNew from "../../core/utils-new.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import {construction} from "../commons/under-construction.js";
import Types from "../commons/types";
import "./clinical-analysis-comment-editor.js";
import "./filters/clinical-priority-filter.js";
import "./filters/clinical-flag-filter.js";
import "../commons/forms/data-form.js";
import "../commons/filters/disease-panel-filter.js";
import "../file/file-create.js";
import "../variant/interpretation/variant-interpreter-grid-beta.js";
import "../variant/interpretation/variant-interpreter-detail.js";

// WIP: Form BETA
export default class ClinicalAnalysisReportUpdate extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            openModal: {
                type: Object
            },
            clinicalAnalysis: {
                type: Object,
            },
            variantReview: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            cellbaseClient: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            }
        };
    }

    #init() {
        this.clinicalAnalysisId = "";
        this._clinicalAnalysis = {};
        this._config = this.getDefaultConfig();
        this._prefix = UtilsNew.randomString(8);
        this.displayConfig = {
            titleWidth: 3,
            width: 8,
            titleVisible: false,
            defaultLayout: "horizontal",
            buttonsVisible: true,
            buttonsWidth: 8,
            buttonsAlign: "right",
        };
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
        if (changedProperties.has("variantReview")) {
            this.variantReviewObserver();
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        /**
        * It has been moved here so that the first click works.
        */
        if (changedProperties.has("openModal") &&
            changedProperties.has("variantReview")) {
            if (this.openModal?.flag) {
                this.openModalReport();
            }
        }

        $(`#${this._prefix}EditReport`).on("hide.bs.modal", e => {
            this.variantReview = {};
            LitUtils.dispatchCustomEvent(this, "onCloseModal");
        });
    }

    clinicalAnalysisObserver() {
        this._clinicalAnalysis = UtilsNew.objectClone(this.clinicalAnalysis);
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }


    variantReviewObserver() {
        if (UtilsNew.isNotEmpty(this._clinicalAnalysis)) {
            this._variantReview = UtilsNew.objectClone(this.variantReview);
            this._reportInfo = this._clinicalAnalysis.interpretation.attributes?.reportTest;
            this._variantInfo = this._reportInfo?.interpretations?.variants?.find(variant => variant.id === this.variantReview.id) || {};
            UtilsNew.setObjectValue(this._variantInfo, "variant", this._variantReview?.discussion?.text || "");
            this._config = this.getDefaultConfig();
            this.requestUpdate();
        }
    }

    openModalReport() {
        $(`#${this._prefix}EditReport`).modal("show");
    }

    submitReportVariant() {

        // * tmp solution until clinicalAnalysis attr works.
        let reportInfo = this._clinicalAnalysis.interpretation.attributes?.reportTest;

        // check if exist variant
        const hasReport = UtilsNew.isNotEmpty(reportInfo);
        // check if exist interpretations
        const hasInterpretations = hasReport && UtilsNew.isNotEmpty(reportInfo.interpretations);
        // check if contains all structures
        // const hasVariants = hasInterpretations && UtilsNew.isNotEmptyArray(reportInfo.interpretations.variants);
        const hasVariantsKeys = hasInterpretations && (reportInfo.interpretations.variants !== undefined);
        switch (true) {
            // reportTest.interpretations.variants
            case hasVariantsKeys:
                this._variantInfo.id = this.variantReview.id;
                const variantIndex = reportInfo.interpretations.variants?.findIndex(variant => variant.id === this._variantReview.id);
                if (variantIndex > -1) {
                    reportInfo.interpretations.variants[variantIndex] = {...this._variantInfo};
                } else {
                    reportInfo.interpretations.variants.push(this._variantInfo);
                }
                break;
            // reporTest.interpretations
            case hasInterpretations:
                // TODO: Soon
                const _variantModel = {
                    id: "",
                    genId: "",
                    hgvs: "",
                    transcriptId: "",
                    title: "",
                    variant: "",
                    evidence: "",
                    populationControl: "",
                    acmg: "",
                    classification: "",
                    diseaseAssociation: "",
                    recommendations: "",
                    others: "",
                    _metadata: {
                        opencgaInterpretation: [
                            {
                                idInterpretation: "",
                                filter: {}
                            }
                        ]
                    }
                };
                console.log("Missing varints");
                break;
            // reportTest
            case hasReport:
                console.log("Missing interpretations");
                break;
            // nothing
            default:
                console.log("Missing all them");
                reportInfo = {
                    interpretations: {
                        variants: [
                            ...this._variantInfo
                        ]
                    }
                };
                break;
        }

        if (reportInfo) {
            this.opencgaSession.opencgaClient.clinical()
                .updateInterpretation(this.clinicalAnalysis.id, this.clinicalAnalysis.interpretation.id,
                    {attributes: {reportTest: reportInfo}}, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.postUpdate(response);
                })
                .catch(response => {
                // In this scenario notification does not raise any errors because none of the conditions shown in notificationManager.response are present.
                    this.notifyError(response);
                });
        }
        // * End tmp solution
    }

    notifyError(response) {
        if (typeof response == "string") {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                message: response
            });
        } else {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
        }
        console.error("An error occurred updating report: ", response);
    }

    postUpdate(response) {
        // NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
            message: "Updated successfully",
        });

        // Reset values after success update
        this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
        this.updateCaseParams = {};
        this.updateInterpretationComments = [];
        this._config = this.getDefaultConfig();

        LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
            // id: this.interpretation.id, // maybe this not would be necessary
            clinicalAnalysis: this.clinicalAnalysis
        });

        this.requestUpdate();
    }

    onVariantReviewChange(e) {
        this.variantReviewUpdate = e.detail.value;
    }

    onVariantReviewOk() {
        // this.checkedVariants?.set(this.variantReview.id, this.variantReview);
        // Dispatch variant update
        LitUtils.dispatchCustomEvent(this, "updaterow", null, {
            id: this.variantReviewUpdate.id,
            row: this.variantReviewUpdate
            // rows: Array.from(this.checkedVariants.values()),
        });

        // Clear selected variant to review
        this.variantReview = null;
        this.requestUpdate();
    }

    renderModalReport() {
        const fullWidth = (window.innerWidth * 0.95) + "px";
        const fullHeight = window.innerHeight + "px";
        const variantAnnotationConfig = {
            showHgsvFromCT: true,
            filter: {
                geneSet: {
                    ensembl: true,
                    refseq: true,
                },
                consequenceType: {
                    maneTranscript: true,
                    gencodeBasicTranscript: false,
                    ensemblCanonicalTranscript: true,
                    refseqTranscript: true,
                    ccdsTranscript: false,
                    ensemblTslTranscript: false,
                    proteinCodingTranscript: false,
                    highImpactConsequenceTypeTranscript: false,
                    showNegativeConsequenceTypes: true
                },
            }
        };
        const detailTabConfig = {
            title: "Selected Variant: ",
            showTitle: true,
            items: [
                {
                    id: "annotationSummary",
                    name: "Summary",
                    active: true,
                    render: variant => {
                        return html`
                            <div class="row">
                                <div class="col-md-6">
                                    <cellbase-variant-annotation-summary
                                        .variantAnnotation="${variant.annotation}"
                                        .consequenceTypes="${CONSEQUENCE_TYPES}"
                                        .proteinSubstitutionScores="${PROTEIN_SUBSTITUTION_SCORE}"
                                        .assembly=${this.opencgaSession.project.organism.assembly}
                                        .config="${variantAnnotationConfig}">
                                    </cellbase-variant-annotation-summary>
                            </div>
                            <div class="col-md-6" style="padding-top:12px">
                                <h3 class="section-title">Review Variant</h3>
                                <clinical-interpretation-variant-review
                                    .opencgaSession="${this.opencgaSession}"
                                    .variant="${this.variantReview}"
                                    .mode="${"form"}"
                                    @variantChange="${e => this.onVariantReviewChange(e)}">
                                </clinical-interpretation-variant-review>
                                <button type="button" class="btn btn-primary pull-right" data-dismiss="modal" @click="${() => this.onVariantReviewOk()}">Save</button>
                            </div>
                        </div>
                            `;
                    }
                },
                {
                    id: "annotationConsType",
                    name: "Consequence Type",
                    render: (variant, active) => {
                        return html`
                            <variant-consequence-type-view
                                .consequenceTypes="${variant.annotation.consequenceTypes}"
                                .active="${active}">
                            </variant-consequence-type-view>`;
                    }
                },
                {
                    id: "clinicalEvidence",
                    name: "Clinical Evidence",
                    render: (variant, active) => {
                        return html`
                            <variant-clinical-evidence-view
                                review
                                .clinicalVariant="${variant}"
                                .opencgaSession="${this.opencgaSession}"
                                .clinicalAnalysis="${this.clinicalAnalysis}">
                            </variant-clinical-evidence-view>
                        `;
                    }
                },
                {
                    id: "annotationPropFreq",
                    name: "Population Frequencies",
                    render: (variant, active) => {
                        return html`
                            <cellbase-population-frequency-grid
                                .populationFrequencies="${variant.annotation.populationFrequencies}"
                                .active="${active}">
                            </cellbase-population-frequency-grid>`;
                    }
                },
                {
                    id: "annotationClinical",
                    name: "Clinical",
                    render: variant => {
                        return html`
                            <variant-annotation-clinical-view
                                .traitAssociation="${variant.annotation.traitAssociation}"
                                .geneTraitAssociation="${variant.annotation.geneTraitAssociation}">
                            </variant-annotation-clinical-view>`;
                    }
                },
                {
                    id: "fileMetrics",
                    name: "File Metrics",
                    render: (variant, active, opencgaSession) => {
                        return html`
                            <opencga-variant-file-metrics
                                .opencgaSession="${opencgaSession}"
                                .variant="${variant}"
                                .files="${this.clinicalAnalysis}">
                            </opencga-variant-file-metrics>`;
                    }
                },
                {
                    id: "cohortStats",
                    name: "Cohort Stats",
                    render: (variant, active, opencgaSession) => {
                        return html`
                            <variant-cohort-stats
                                .opencgaSession="${opencgaSession}"
                                .variant="${variant}"
                                .active="${active}">
                            </variant-cohort-stats>`;
                    }
                },
                {
                    id: "samples",
                    name: "Samples",
                    render: (variant, active, opencgaSession) => html`
                        <variant-samples
                            .opencgaSession="${opencgaSession}"
                            .variantId="${variant.id}"
                            .active="${active}">
                        </variant-samples>
                    `,
                },
                // {
                //     id: "protein",
                //     name: "Protein (Beta)",
                //     render: (variant, active, opencgaSession) => html`
                //         <protein-lollipop-variant-view
                //             .opencgaSession="${opencgaSession}"
                //             .variant="${variant}"
                //             .query="${this.query}"
                //             .active="${active}">
                //         </protein-lollipop-variant-view>
                //     `,
                // },
                {
                    id: "beacon",
                    name: "Beacon",
                    render: (variant, active, opencgaSession) => {
                        return html`
                            <variant-beacon-network
                                .variant="${variant.id}"
                                .assembly="${opencgaSession.project.organism.assembly}"
                                .config="${this.beaconConfig}"
                                .active="${active}">
                            </variant-beacon-network>`;
                    }
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (variant, active) => html`
                        <json-viewer .data="${variant}" .active="${active}"></json-viewer>
                    `,
                }
            ]
        };

        return html`
            <div class="modal fade modal" id="${this._prefix}EditReport" tabindex="-1"
                role="dialog" aria-hidden="true" style="padding-top:0; overflow-y: visible">
                <div class="modal-dialog" style="width: ${fullWidth};">
                    <div class="modal-content" style="height: ${fullHeight};  overflow-y:scroll;">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                            <div style="display:flex;gap:12px">
                            <h4 class="modal-title" id="myModalLabel">Variant Review Report</h4>
                            <span class="label label-info">Status: ${this._variantReview?.status || "-"}</span>
                            <span class="label label-info">Confidence: ${this._variantReview.confidence?.value || "-"}</span>
                            </div>
                        </div>
                        <div style="padding:1%; display:flex; flex-direction:column; height: 100%">
                            <div>
                                <data-form
                                    .data="${this._variantInfo}"
                                    .config="${this._config}"
                                    @submit="${e => this.submitReportVariant(e)}">
                                </data-form>
                            </div>
                            <div>
                                <variant-interpreter-grid-beta
                                    review
                                    .clinicalAnalysis=${this._clinicalAnalysis}
                                    .clinicalVariants="${[this._variantReview]}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config=${
                                        {
                                            showExport: false,
                                            showSettings: false,
                                            showActions: false,
                                            showEditReview: false,
                                            showHgvs: true,
                                            detailView: true
                                        }
                                    }>
                                </variant-interpreter-grid-beta>
                                <variant-interpreter-detail
                                    .opencgaSession="${this.opencgaSession}"
                                    .clinicalAnalysis="${this._clinicalAnalysis}"
                                    .variant="${this._variantReview}"
                                    .cellbaseClient="${this.cellbaseClient}"
                                    .config=${detailTabConfig}>
                                </variant-interpreter-detail>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    render() {

        if (UtilsNew.isEmpty(this.variantReview)) {
            return nothing;
        }

        // open modal by btn
        // open modal by Link
        // open modal by prop/config
        return html`
            ${this.displayConfig?.buttonsVisible? html `
                <button class="btn btn-default" style="margin-bottom:6px;margin-left:6px"
                    @click=${this.openModalReport}>
                        ${this.displayConfig?.btnName? this.displayConfig.btnName : "Edit Content"}
                </button>`: nothing}

            ${this.renderModalReport()}
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "tabs",
            description: "Update an variant report",
            display: {

                buttonsVisible: false,
                buttonOkText: "Save",
                buttonClearText: ""
            },
            sections: [
                {
                    id: "variantReport",
                    title: "Variant Discussion",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        // {
                        //     field: "variant",
                        //     type: "rich-text",
                        //     display: {
                        //         preview: true,
                        //     }
                        // },
                        {
                            type: "custom",
                            display: {
                                render: () => {
                                    return html `
                                    <p class="text-muted"># Discussion provided from review variant (Not editable here, please use the summary tab at the bottom of the variant grid)</p>
                                        <rich-text-editor
                                            .data="${this._variantInfo.variant}"
                                            .config="${{preview: true, disabled: true}}">
                                        </rich-text-editor>`;
                                }
                            }
                        }
                    ]
                },
                {
                    id: "bibliographyEvidencesReport",
                    title: "Bibliography Evidences",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        {
                            field: "evidence",
                            type: "rich-text",
                            display: {
                                preview: false,
                            }
                        },
                    ]
                },
                {
                    id: "classificationReport",
                    title: "Classification",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        {
                            field: "classification",
                            type: "rich-text",
                            display: {
                                preview: false,
                            }
                        },
                    ]
                },
                {
                    id: "populationReport",
                    title: "Population",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        {
                            field: "populationControl",
                            type: "rich-text",
                            display: {
                                preview: false,
                            }
                        },
                    ]
                },
                {
                    id: "diseaseAssociationReport",
                    title: "Disease Association",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        {
                            field: "diseaseAssociation",
                            type: "rich-text",
                            display: {
                                preview: false,
                            }
                        },
                    ]
                },
                {
                    id: "recommendationsReport",
                    title: "Recommendations",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        {
                            field: "recommendations",
                            type: "rich-text",
                            display: {
                                preview: false,
                            }
                        },
                    ]
                },
                {
                    id: "otherReports",
                    title: "Other",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        {
                            field: "others",
                            type: "rich-text",
                            display: {
                                preview: false,
                            }
                        },
                    ]
                },
                {
                    id: "uploadReport",
                    title: "Upload files",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: false,
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                render: (clinicalAnalysis, dataFormFilterChange) => html`
                                    <file-create
                                        .data="${clinicalAnalysis}"
                                        .opencgaSession="${this.opencgaSession}">
                                    </file-create>`
                            },
                        },
                    ]
                },
                {
                    id: "previewReports",
                    title: "Preview",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: false,
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: () => {
                                    const variantContent = `${this._reportInfo.interpretations?._variantsKeys?.map(key => this._variantInfo[key]).join(" ")}`;
                                    return html `
                                        <rich-text-editor
                                            .data="${variantContent}"
                                            .config="${{preview: true}}">
                                        </rich-text-editor>`;
                                }
                            }
                        }
                    ]
                },
            ]
        });
    }

}

customElements.define("clinical-analysis-report-update", ClinicalAnalysisReportUpdate);
