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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import Types from "../commons/types.js";
import LitUtils from "../commons/utils/lit-utils.js";
import ClinicalAnalysisManager from "./clinical-analysis-manager.js";
import FormUtils from "../commons/forms/form-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "./clinical-analysis-summary.js";
import "../variant/interpretation/variant-interpreter-grid.js";
import "../variant/interpretation/variant-interpreter-grid-beta.js";
import "../disease-panel/disease-panel-grid.js";
import "./interpretation/clinical-interpretation-view.js";

// BETA
export default class ClinicalAnalysisReviewInfo extends LitElement {

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
            interpretationId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.updateCaseParams = {};
        this.updateCaseComments = {};
        this.updateInterpretationComments = [];
        this._clinicalAnalysis = {};
        this._config = this.getDefaultConfig();
        this.variantReview = {};
    }

    connectedCallback() {
        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
        super.connectedCallback();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
        super.update(changedProperties);
    }

    clinicalAnalysisObserver() {
        if (this.opencgaSession && this.clinicalAnalysis) {
            this._clinicalAnalysis = UtilsNew.objectClone(this.clinicalAnalysis);
            this._config = this.getDefaultConfig();
            // Generate Result as Template
            this.generateResultsTemplate();
            this.generateMethodologyTemplate();
            // init variant reported to attributes.
            this.fillVariantReportAttributes();
            this.requestUpdate();
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                })
                .catch(response => {
                    this.notifyError(response);
                });
        }
    }

    // Update comments case
    updateOrDeleteCaseComments(notify) {
        if (this.updateCaseComments?.updated?.length > 0) {
            this.opencgaSession.opencgaClient.clinical()
                .update(this.clinicalAnalysis.id, {comments: this.updateCaseComments.updated}, {commentsAction: "REPLACE", study: this.opencgaSession.study.fqn})
                .then(response => {
                    if (notify && this.updateCaseComments?.deleted?.length === 0) {
                        this.postUpdate(response);
                    }
                })
                .catch(response => {
                    this.notifyError(response);
                });
        }
        if (this.updateCaseComments?.deleted?.length > 0) {
            this.opencgaSession.opencgaClient.clinical()
                .update(this.clinicalAnalysis.id, {comments: this.updateCaseComments.deleted}, {commentsAction: "REMOVE", study: this.opencgaSession.study.fqn})
                .then(response => {
                    if (notify) {
                        this.postUpdate(response);
                    }
                })
                .catch(response => {
                    this.notifyError(response);
                });
        }
    }

    updateOrDeleteInterpretationComments(clinicalAnalysisId, interpretationId, updateInterpretationComments, notify) {
        if (updateInterpretationComments?.updated?.length > 0) {
            this.opencgaSession.opencgaClient.clinical()
                .updateInterpretation(clinicalAnalysisId, interpretationId,
                    {comments: updateInterpretationComments.updated},
                    {commentsAction: "REPLACE", study: this.opencgaSession.study.fqn}
                ).then(response => {
                    if (notify && this.updateInterpretationComments?.deleted?.length === 0) {
                        this.postUpdate(response, "");
                    }
                })
                .catch(response => {
                    this.notifyError(response);
                });
        }
        if (updateInterpretationComments?.deleted?.length > 0) {
            this.opencgaSession.opencgaClient.clinical()
                .updateInterpretation(clinicalAnalysisId, interpretationId,
                    {comments: updateInterpretationComments.deleted},
                    {commentsAction: "REMOVE", study: this.opencgaSession.study.fqn}
                ).then(response => {
                    if (notify) {
                        this.postUpdate(response, "");
                    }
                })
                .catch(response => {
                    this.notifyError(response);
                });
        }
    }

    generateClassificationTemplate(variantEvidence) {
        const generateIntroVariant = `Siguiendo las guías de clasificación establecidas por el ACMG la variante <b>${variantEvidence.variantId}</b> ha sido clasificada ` +
        "de la siguiente manera:";
        const acmgClassification = transcript => {
            const classifications = Array.from(new Set(transcript.review.acmg.map(acmg => acmg.classification))).join(",");
            return classifications !== "" ? `(${classifications})` : "N/A";
        };
        const transcriptTemplate = transcript => `Para el transcrito <b>${transcript.genomicFeature.transcriptId}</b> del gen <b>${transcript.genomicFeature.geneName}</b>` +
        ` que cumple con los criterios de ACMG <b>${acmgClassification(transcript)}</b>` +
        ` esta variante se clasifica como variante <b>${transcript.review.clinicalSignificance?? "N/A"}</b>`;
        const generateTranscriptTemplate = variant => variant.clinicalEvidences.map(transcript => `<li>${transcriptTemplate(transcript)}</li>`).join("");
        const generateDiscussion = variant => variant.clinicalEvidences
            .map(transcript => UtilsNew.isNotEmpty(transcript.review.discussion?.text) ? `<b>${transcript.genomicFeature.transcriptId}:</b><br/>${transcript.review.discussion?.text}` : "").join("");

        const content = {
            acmgContent: `<p>${generateIntroVariant}</p><ul>${generateTranscriptTemplate(variantEvidence)}</ul>`,
            discussionContent: generateDiscussion(variantEvidence)
        };

        return content;
    }

    fillVariantReportAttributes() {
        const variantsReported = this._clinicalAnalysis?.interpretation?.primaryFindings?.filter(
            variant => variant?.status === "REPORTED");
        const variants = UtilsNew.getObjectValue(this.clinicalAnalysis, "interpretation.attributes.reportTest.interpretations.variants", []);
        const _variantModel = {
            _classificationAcmgTT: "",
            _classsificationDiscussionTT: "",
            _variantText: "",
            id: "",
            transcripts: [{
                hgvs: "",
                geneName: "",
                transcriptId: "",
            }],
            title: "",
            populationControlText: "",
            bibliographyEvidenceText: "",
            diseaseAssociationText: "",
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


        variantsReported.forEach(variant => {
            // get variant evidence with hgvs
            const variantEvidence = this.getHgvsVariants(variant);
            const variantIndex = variants.findIndex(variant => variant.id === variantEvidence.variantId);
            const variantTitle = variantEvidence.clinicalEvidences.map(evidence => evidence.genomicFeature.geneName + " " + evidence.hgvs)
                .join(" || ");
            const classification = this.generateClassificationTemplate(variantEvidence);
            switch (true) {
                // Updated variants from attributes if exists and has differents transcript.
                // case variantIndex > -1 && (variants[variantIndex]?.transcriptId !== evidence.genomicFeature?.transcriptId):
                case variantIndex > -1:
                    variants[variantIndex] = {
                        ..._variantModel, // init model
                        ...variants[variantIndex],
                        _classificationAcmgTT: classification.acmgContent,
                        _classsificationDiscussionTT: classification.discussionContent,
                        title: variantTitle,
                    };
                    UtilsNew.setObjectValue(this.clinicalAnalysis, "interpretation.attributes.reportTest.interpretations.variants", variants);
                    break;
                // new variant reported if not exist on attributes report
                case variantIndex < 0:
                    variants.push(
                        {
                            ..._variantModel, // init model
                            id: variantEvidence.variantId,
                            _classificationAcmgTT: classification.acmgContent,
                            _classsificationDiscussionTT: classification.discussionContent,
                            title: variantTitle,
                            // genId: evidence.genomicFeature?.geneName?? "",
                            // hgvs: evidence.hgvs,
                            // transcriptId: evidence.genomicFeature.transcriptId,
                        },
                    );
                    UtilsNew.setObjectValue(this.clinicalAnalysis, "interpretation.attributes.reportTest.interpretations.variants", variants);
                    break;
            }
        });
    }

    getHgvsVariants(variant) {
        // gen (TranscriptID) hgvs
        const selectedEvidences = variant.evidences
            .filter(evidences => evidences.review.select);
        const variantHgvs = variant.annotation.hgvs;

        const clinicalEvidences = selectedEvidences.map(evidence => {
            const transcriptId = evidence.genomicFeature.transcriptId;
            const hgvsFound = variantHgvs.find(hgvs => hgvs.startsWith(transcriptId));
            return {
                ...evidence,
                hgvs: hgvsFound || transcriptId
            };
        });

        return {
            variantId: variant.id,
            clinicalEvidences
        };
    }

    generateResultsTemplate() {
        const variantsReported = this._clinicalAnalysis?.interpretation?.primaryFindings?.filter(
            variant => variant?.status === "REPORTED");

        // tmp function for template
        // const isHomozygosity = variant => variant.alternate === variant.reference;
        if (UtilsNew.isNotEmptyArray(variantsReported)) {
            const evidencesWithHgvs = variantsReported
                .map(variant => {
                    const selectedEvidences = variant.evidences
                        .filter(evidence => evidence.review.select);
                    const hgvs = variant.annotation.hgvs;
                    if (selectedEvidences.length > 0) {
                        return {
                            id: variant.id,
                            // zigosityType: isHomozygosity(variant) ? "Homocigosis" : "heterocigosis",
                            evidences: selectedEvidences,
                            hgvs: hgvs
                        };
                    }
                })
                .filter(variant => variant) // Removed undefined
                .flatMap(variant => variant.evidences
                    .map(evidence => {
                        const transcriptId = evidence.genomicFeature.transcriptId;
                        const hgvsFound = variant.hgvs
                            .find(hgvs => hgvs.startsWith(transcriptId));
                        return {
                            ...evidence,
                            variantId: variant.id,
                            // zigosityType: variant.zigosityType,
                            hgvs: hgvsFound || transcriptId
                        };
                    }))
                .filter(variant => variant); // Removed undefined
            const variantAcmg = evidencesWithHgvs.map(evidence => `<span>La variante <b>${evidence.variantId}</b> es clasificada como <b>${evidence.classification.clinicalSignificance}</b>` +
            ` en el gen <b>${evidence.genomicFeature.geneName} (${evidence.genomicFeature.transcriptId})</b></span>`).join("</br>");
            const hgvsList = evidencesWithHgvs.map(evidence => `<li><b>${evidence.variantId} - ${evidence.hgvs}</b></li>`).join("");
            UtilsNew.setObjectValue(this.clinicalAnalysis, "interpretation.attributes.reportTest.mainResults.templateResult", `${variantAcmg} <ol>${hgvsList}</ol> </br>`);
        }
    }

    generateMethodologyTemplate() {
        const generateContent = (tag, content) => `<${tag}>${content}</${tag}><p style="color:red">Content here...</p>`;
        const methodologyTemplate = [
            generateContent("h2", "Source of the sample and type of sample"),
            generateContent("h2", "Sequencing Kit"),
            generateContent("h2", "Panels"),
            generateContent("h2", "Technical Specifications"),
            generateContent("h2", "Sequencing"),
            generateContent("h2", "Analysis"),
            generateContent("h2", "Molecular classification"),
            generateContent("h2", "Validation with sanger and MLPA"),
            generateContent("h2", "Limitaciones del estudio"),
        ];
        const methodology = UtilsNew.getObjectValue(this.clinicalAnalysis, "interpretation.attributes.reportTest.study.method.description", "");
        if (UtilsNew.isEmpty(methodology)) {
            UtilsNew.setObjectValue(this.clinicalAnalysis, "interpretation.attributes.reportTest.study.method.description", `${methodologyTemplate.join("<br>")}`);
        }
    }

    submitCaseInfo() {
        // Update methodology description
        this.submitReportVariant();

        // update case comments
        if (this.updateCaseComments?.added?.length > 0) {
            this.updateOrDeleteCaseComments(false);
            this.opencgaSession.opencgaClient.clinical()
                .update(this.clinicalAnalysis.id, {comments: this.updateCaseComments.added}, {
                    study: this.opencgaSession.study.fqn,
                    // flagsAction: "SET",
                    // panelsAction: "SET",
                })
                .then(response => {
                    this.postUpdate(response);
                })
                .catch(response => {
                    this.notifyError(response);
                });
        } else {
            this.updateOrDeleteCaseComments(true);
        }
    }

    // ClinicalReport
    submitReportVariant() {

        if (this.updateCaseParams && UtilsNew.isNotEmpty(this.updateCaseParams)) {
            this.opencgaSession.opencgaClient.clinical()
                .updateInterpretation(this.clinicalAnalysis.id, this.clinicalAnalysis.interpretation.id,
                    {attributes: this.updateCaseParams.interpretation.attributes}, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.postUpdate(response);
                })
                .catch(response => {
                    // In this scenario notification does not raise any errors because none of the conditions shown in notificationManager.response are present.
                    this.notifyError(response);
                });
        }
    }


    submitCaseFinalSummary() {
        if (this.updateCaseParams && UtilsNew.isNotEmpty(this.updateCaseParams)) {
            this.opencgaSession.opencgaClient.clinical()
                .update(this.clinicalAnalysis.id, this.updateCaseParams, {
                    study: this.opencgaSession.study.fqn,
                    // flagsAction: "SET",
                    // panelsAction: "SET",
                })
                .then(response => {
                    this.postUpdate(response);
                })
                .catch(response => {
                    // In this scenario notification does not raise any errors because none of the conditions shown in notificationManager.response are present.
                    this.notifyError(response);
                });
        }
    }


    submitInterpretationsComments() {
        const clinicalAnalysisId = this.clinicalAnalysis.id;
        this.updateInterpretationComments.forEach(updateInterpretationComments => {
            const interpretationId = updateInterpretationComments.id;
            if (updateInterpretationComments.added?.length > 0) {
                this.updateOrDeleteInterpretationComments(clinicalAnalysisId, interpretationId, updateInterpretationComments, false);
                this.opencgaSession.opencgaClient.clinical().updateInterpretation(clinicalAnalysisId, interpretationId, {comments: updateInterpretationComments.added}, {
                    study: this.opencgaSession.study.fqn,
                }).then(response => {
                    this.postUpdate(response, interpretationId);
                }).catch(response => {
                    this.notifyError(response);
                });
            } else {
                this.updateOrDeleteInterpretationComments(clinicalAnalysisId, interpretationId, updateInterpretationComments, true);
            }
        });
    }

    notifyError(response) {
        if (typeof response == "string") {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                message: response
            });
        } else {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
        }
        console.error("An error occurred updating clinicalAnalysis: ", response);
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

    onUpdateVariant(e) {
        const rows = Array.isArray(e.detail.row) ? e.detail.row : [e.detail.row];
        rows.forEach(row => {
            this.clinicalAnalysisManager.updateSingleVariant(row);
        });
        this.saveIntrepretationVariant();
        this.requestUpdate();
    }

    onClinicalInterpretationUpdate() {
        LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
            clinicalAnalysis: this.clinicalAnalysis,
        });
    }

    saveIntrepretationVariant() {
        this.clinicalAnalysisManager.updateInterpretationVariants(null, () => {
            this.requestUpdate();
            LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
                clinicalAnalysis: this.clinicalAnalysis,
            }, null, {bubbles: true, composed: true});
        });
        this._config = this.getDefaultConfig();
    }

    onFieldChangeOld(e, field) {
        const param = field || e.detail.param;
        if (param.includes("attributes")) {
            UtilsNew.setObjectValue(this.updateCaseParams, "interpretation.attributes", this._clinicalAnalysis.interpretation.attributes);
            UtilsNew.setObjectValue(this.updateCaseParams, param, e.detail.value);
        } else {
            switch (param) {
                case "report.date":
                case "status.id":
                case "report.signedBy":
                    this.updateCaseParams = FormUtils.updateObjectParams(
                        this._clinicalAnalysis,
                        this.clinicalAnalysis,
                        this.updateCaseParams,
                        param,
                        e.detail.value);
                    break;
                case "report.discussion.text":
                    // Josemi (2022-07-29) added very basic implementation for saving discussion data
                    // This should be improved in the future allowing formUtils to handle more than two fields in updateObjectParams
                    this.clinicalAnalysis.report = {
                        ...this.clinicalAnalysis.report,
                        discussion: {
                            text: e.detail.value,
                            author: this.opencgaSession?.user?.id || "-",
                            date: UtilsNew.getDatetime(),
                        },
                    };
                    this.updateCaseParams = {
                        ...this.updateCaseParams,
                        report: {
                            ...this.updateCaseParams?.report,
                            discussion: this.clinicalAnalysis.report.discussion,
                        },
                    };
                    break;
            }
        }
        this.requestUpdate();
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;

        if (param.includes("attributes")) {
            // Copy all attributes
            // UtilsNew.setObjectValue(this.updateCaseParams, "interpretation.attributes", this._clinicalAnalysis.interpretation.attributes);
            UtilsNew.setObjectValue(this.updateCaseParams, "interpretation.attributes", this.clinicalAnalysis.interpretation.attributes);
            // Update the attribute field
            UtilsNew.setObjectValue(this.updateCaseParams, param, e.detail.value);
        } else {
            switch (param) {
                case "report.date":
                case "status.id":
                case "report.signedBy":
                    UtilsNew.setObjectValue(this.updateCaseParams, param, e.detail.value);
                    break;
                case "report.discussion.text":
                    const discussion = {
                        text: e.detail.value,
                        author: this.opencgaSession?.user?.id || "-",
                        date: UtilsNew.getDatetime(),
                    };
                    UtilsNew.setObjectValue(this.clinicalAnalysis, "report.discussion", discussion);
                    UtilsNew.setObjectValue(this.updateCaseParams, "report.discussion", discussion);
                    break;
            }
        }
        // this.clinicalAnalysis = {...e.detail.data};
        // console.log("Case Update", this.clinicalAnalysis);
        // this.updateCaseParams = FormUtils.getUpdatedFields(
        //     this._clinicalAnalysis,
        //     this.updateCaseParams,
        //     param,
        //     e.detail.value);
        // Notify to parent components in case the want to perform any other action, fir instance, get the gene info in the disease panels.
        // LitUtils.dispatchCustomEvent(this, "componentFieldChange", e.detail.value, {component: this._component, action: e.detail.action}, null);
        this.requestUpdate();
    }

    openModalReport(variantId) {
        const variantReview = this.clinicalAnalysis?.interpretation?.primaryFindings?.find(variant => variant.id === variantId);
        this.variantReview = UtilsNew.objectClone(variantReview);
        this.openModalTest = {flag: true};
        this.requestUpdate();
    }

    onCaseCommentChange(e) {
        this.updateCaseComments = e.detail;
    }

    onInterpretationCommentChange(e) {
        if (this.updateInterpretationComments.length > 0) {
            const index = this.updateInterpretationComments.findIndex(i => i.id === e.detail?.id);
            if (index >= 0) {
                this.updateInterpretationComments[index] = e.detail;
            } else {
                this.updateInterpretationComments.push(e.detail);
            }
        } else {
            this.updateInterpretationComments.push(e.detail);
        }
    }

    onSubmit(e) {
        // By Sections
        switch (e.detail?.value) {
            case "caseInfo":
                this.submitCaseInfo();
                break;
            case "reportVariant":
                this.submitReportVariant();
                break;
            case "interpretationSummary":
                this.submitInterpretationsComments();
                break;
            case "finalSummary":
                this.submitCaseFinalSummary();
                break;
            default:
                break;
        }
    }

    render() {
        if (!this.clinicalAnalysis) {
            return "";
        }

        return html`
            <data-form
                .data="${this.clinicalAnalysis}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @submit=${e => this.onSubmit(e)}>
            </data-form>
            <clinical-analysis-report-update
                .openModal="${this.openModalTest}"
                .variantReview="${this.variantReview}"
                .clinicalAnalysis="${this._clinicalAnalysis}"
                .cellbaseClient="${this.cellbaseClient}"
                .opencgaSession="${this.opencgaSession}"
                @onCloseModal="${e => (this.openModalTest = {flag: false})}"
                .displayConfig="${{buttonsVisible: false}}">
            </clinical-analysis-report-update>
        `;
    }

    getDefaultConfig() {
        const discussion = this.clinicalAnalysis?.report?.discussion || {};
        return Types.dataFormConfig({
            type: "pills",
            display: {
                pillsLeftColumnClass: "col-md-2",
                buttonsVisible: false,
                buttonOkText: "Save",
                buttonClearText: ""
            },
            sections: [
                {
                    id: "caseInfo",
                    title: "Case Info",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: data => {
                                    const isLocked = interpretation => interpretation.locked? html`<i class="fas fa-lock"></i>`:"";
                                    return html`
                                        <div style="font-size:24px;font-weight: bold;margin-bottom: 12px">
                                            <span>${isLocked(data)} Case Info</span>
                                        </div>
                                        <clinical-analysis-summary
                                            .clinicalAnalysis="${data}"
                                            .opencgaSession="${this.opencgaSession}">
                                        </clinical-analysis-summary>
                                    `;
                                }
                            }
                        },
                        UtilsNew.titleElement("Description"),
                        {
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                disabled: false
                            }
                        },
                        UtilsNew.titleElement("Methodology Used"),
                        {
                            field: "interpretation.attributes.reportTest.study.method.description",
                            type: "rich-text",
                            display: {
                                disabled: false
                            }
                        },
                        // {
                        //     type: "custom",
                        //     display: {
                        //         render: data => {
                        //             return !data.panels || UtilsNew.isNotEmptyArray(data?.panels) ?
                        //                 html`
                        //                     <disease-panel-grid
                        //                         .opencgaSession="${this.opencgaSession}"
                        //                         .diseasePanels="${data?.panels}">
                        //                     </disease-panel-grid>
                        //                 `:
                        //                 "No panel data to display";
                        //         }
                        //     }
                        // },
                        UtilsNew.titleElement("Case Comments"),
                        {
                            type: "custom",
                            display: {
                                render: data => html`
                                    <clinical-analysis-comment-editor
                                        .id=${data?.id}
                                        .opencgaSession="${this.opencgaSession}"
                                        .comments="${data?.comments}"
                                        .disabled="${!!this.clinicalAnalysis?.locked}"
                                        @commentChange="${e => this.onCaseCommentChange(e)}">
                                    </clinical-analysis-comment-editor>
                                `
                            }
                        },
                    ]
                },
                {
                    id: "interpretationSummary",
                    title: "Interpretation Info",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: data => {
                                    const isLocked = data => data?.interpretation.locked? html`<i class="fas fa-lock"></i>`:"";
                                    return html`
                                    <div style="display:flex;gap:12px">
                                        <div style="font-size:24px;font-weight: bold;margin-bottom: 12px">
                                            <span>${isLocked(data)} Interpretation</span>
                                        </div>
                                        <div>
                                            <clinical-interpretation-update
                                                .clinicalInterpretation="${data?.interpretation}"
                                                .clinicalAnalysis="${data}"
                                                .opencgaSession="${this.opencgaSession}"
                                                .mode="${"modal"}"
                                                .displayConfig="${
                                                    {
                                                        buttonClearText: "Cancel",
                                                        buttonOkText: "Update",
                                                        modalButtonClassName: "btn-default btn-sm",
                                                        modalDisabled: this.clinicalAnalysis.locked
                                                    }
                                                }"
                                                @clinicalInterpretationUpdate="${this.onClinicalInterpretationUpdate}">
                                            </clinical-interpretation-update>
                                        </div>
                                    </div>
                                    <clinical-interpretation-view
                                        .clinicalAnalysis="${data}"
                                        .opencgaSession="${this.opencgaSession}"
                                        @updaterow="${e => this.onUpdateVariant(e)}"
                                        @commentChange="${e => this.onInterpretationCommentChange(e)}">
                                        </clinical-interpretation-view>
                                `;
                                }
                            }
                        }
                    ]
                },
                {
                    id: "reportVariant",
                    title: "Reported Variants",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        UtilsNew.titleElement("Reported Variants"),
                        {
                            type: "custom",
                            display: {
                                render: data => {
                                    const variantsReported = data?.interpretation?.primaryFindings?.filter(
                                        variant => variant?.status === "REPORTED");
                                    return UtilsNew.isNotEmptyArray(variantsReported) ?
                                        html`
                                            <variant-interpreter-grid
                                                review
                                                .clinicalAnalysis=${data}
                                                .clinicalVariants="${variantsReported}"
                                                .opencgaSession="${this.opencgaSession}"
                                                .config=${
                                                    {
                                                        showExport: true,
                                                        showSettings: false,
                                                        showActions: false,
                                                        showEditReview: false,
                                                    }
                                                }>
                                            </variant-interpreter-grid>
                                        `:
                                        "No reported variants to display";
                                }
                            }
                        },
                        UtilsNew.titleElement("Results"),
                        {
                            field: "interpretation.attributes.reportTest.mainResults.templateResult",
                            type: "rich-text",
                            display: {
                                disabled: false,
                                preview: true,
                            }
                        },
                        UtilsNew.titleElement("Results Summary"),
                        {
                            field: "interpretation.attributes.reportTest.mainResults.summaryResult",
                            type: "rich-text",
                            display: {
                                disabled: false,
                            }
                        },
                        UtilsNew.titleElement("Interpretations"),
                        UtilsNew.titleElement("Intro"),
                        {
                            field: "interpretation.attributes.reportTest.interpretations.intro",
                            type: "rich-text",
                            display: {
                                disabled: false
                            }
                        },
                        UtilsNew.titleElement("Variants"),
                        {
                            field: "interpretation.attributes.reportTest.interpretations.variants",
                            type: "object-list",
                            display: {
                                showEditItemListButton: false,
                                showDeleteItemListButton: false,
                                showAddItemListButton: false,
                                showAddBatchListButton: false,
                                view: variant => {
                                    debugger;
                                    const variantKeys = UtilsNew.getObjectValue(this.clinicalAnalysis, "interpretation.attributes.reportTest.interpretations._variantsKeys", []);
                                    const variantContent = `${variantKeys?.map(key => variant[key]).join(" ")}`;
                                    return html `
                                            <div style="display:flex">
                                                <div style="font-size:20px;font-weight: bold;">
                                                    <span>${variant?.title !== ""? variant?.title: variant.id}</span>
                                                </div>
                                                <button class="btn btn-default" style="margin-bottom:6px;margin-left:6px"
                                                    @click="${() => this.openModalReport(variant.id)}"
                                                >Edit Content</button>
                                            </div>
                                            <rich-text-editor
                                                .data="${variantContent}"
                                                .config="${{preview: true}}">
                                            </rich-text-editor>
                                    `;

                                }
                            },
                            elements: []
                        }
                    ]
                },
                {
                    id: "finalSummary",
                    title: "Final Summary",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true
                    },
                    elements: [
                        UtilsNew.titleElement("Final Summary"),
                        {
                            title: "Case Status",
                            field: "status.id",
                            type: "select",
                            allowedValues: ["READY_FOR_INTERPRETATION", " CLOSED", "READY_FOR_REPORT", "REJECTED"],
                        },
                        {
                            title: "Discussion",
                            type: "input-text",
                            field: "report.discussion.text",
                            defaultValue: "",
                            display: {
                                rows: 10,
                                helpMessage: discussion.author ? html`Last discussion added by <b>${discussion.author}</b> on <b>${UtilsNew.dateFormatter(discussion.date)}</b>.` : null,
                            },
                        },
                        {
                            title: "Analysed by",
                            field: "analyst.name",
                        },
                        {
                            title: "Signed off by",
                            type: "input-text",
                            field: "report.signedBy",
                            defaultValue: "",
                        },
                        {
                            title: "Date",
                            type: "input-date",
                            field: "report.date",
                            display: {
                                disabled: false,
                            },
                        },
                    ]
                },
            ]
        });
    }

}

customElements.define("clinical-analysis-review-info", ClinicalAnalysisReviewInfo);
