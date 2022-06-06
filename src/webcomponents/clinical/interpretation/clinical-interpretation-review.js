/**
 * Copyright 2015-2019 OpenCB
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
import UtilsNew from "../../../core/utilsNew.js";
import Types from "../../commons/types.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import ClinicalAnalysisManager from "../clinical-analysis-manager.js";
import FormUtils from "../../commons/forms/form-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import "../clinical-analysis-summary.js";
import "../../variant/interpretation/variant-interpreter-grid.js";
import "../../disease-panel/disease-panel-grid.js";
import "./clinical-interpretation-view.js";

export default class ClinicalInterpretationReview extends LitElement {

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
        this.hasVariantsUpdate = false;
        this._clinicalAnalysis = {};
        this._config = this.getDefaultConfig();
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

    clinicalAnalysisObserver() {
        if (this.opencgaSession && this.clinicalAnalysis) {
            this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    // Update comments case
    fetchUpdateOrDeleteCaseComments() {

        const promiseCaseComments = [];

        if (this.updateCaseComments?.updated?.length > 0) {
            promiseCaseComments.push(this.opencgaSession.opencgaClient.clinical()
                .update(this.clinicalAnalysis.id, {comments: this.updateCaseComments.updated}, {commentsAction: "REPLACE", study: this.opencgaSession.study.fqn}));
            // .then(response => {
            //     if (notify && this.updateCaseComments?.deleted?.length === 0) {
            //         this.postUpdateCase(response);
            //     }
            // })
            // .catch(response => {
            //     console.error("An error occurred updating clinicalAnalysis: ", response);
            // });
        }
        if (this.updateCaseComments?.deleted?.length > 0) {
            promiseCaseComments.push(this.opencgaSession.opencgaClient.clinical()
                .update(this.clinicalAnalysis.id, {comments: this.updateCaseComments.deleted}, {commentsAction: "REMOVE", study: this.opencgaSession.study.fqn}));
            // .then(response => {
            //     if (notify) {
            //         this.postUpdateCase(response);
            //     }
            // })
            // .catch(response => {
            //     console.error("An error occurred updating clinicalAnalysis: ", response);
            // });
        }
        return promiseCaseComments;
    }

    // Update interpretation comments
    // return list<Promise>
    fetchUpdateOrDeleteInterpretationComments(clinicalAnalysisId, interpretationId, updateInterpretationComments) {
        const promiseInterpretationComments = [];

        if (updateInterpretationComments?.updated?.length > 0) {
            promiseInterpretationComments.push(this.opencgaSession.opencgaClient.clinical()
                .updateInterpretation(clinicalAnalysisId, interpretationId,
                    {comments: updateInterpretationComments.updated},
                    {commentsAction: "REPLACE", study: this.opencgaSession.study.fqn}
                ));
            // .then(response => {
            //     if (notify && this.updateInterpretationComments?.deleted?.length === 0) {
            //         this.postUpdateInterpretation(response, "");
            //     }
            // })
            // .catch(response => {
            //     console.error("An error occurred updating clinicalAnalysis: ", response);
            // });
        }
        if (updateInterpretationComments?.deleted?.length > 0) {
            promiseInterpretationComments.push(this.opencgaSession.opencgaClient.clinical()
                .updateInterpretation(clinicalAnalysisId, interpretationId,
                    {comments: updateInterpretationComments.deleted},
                    {commentsAction: "REMOVE", study: this.opencgaSession.study.fqn}
                ));
            // .then(response => {
            //     if (notify) {
            //         this.postUpdateInterpretation(response, "");
            //     }
            // })
            // .catch(response => {
            //     console.error("An error occurred updating clinicalAnalysis: ", response);
            // });
        }
        return promiseInterpretationComments;
    }

    // Update Case (No Interpretation)
    // return List <Promise>
    fetchCase() {
        if (this.updateCaseComments?.added?.length > 0) {
            this.updateCaseParams.comments = this.updateCaseComments.added;
        }

        if (this.updateCaseParams && UtilsNew.isNotEmpty(this.updateCaseParams)) {
            return [
                ...this.fetchUpdateOrDeleteCaseComments(),
                this.opencgaSession.opencgaClient.clinical()
                    .update(this.clinicalAnalysis.id, this.updateCaseParams, {
                        study: this.opencgaSession.study.fqn,
                    // flagsAction: "SET",
                    // panelsAction: "SET",
                    })];
            //  .then(response => {
            //     this.postUpdateCase(response);
            // })
            // .catch(response => {
            //     NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            // });

        } else {
            return [...this.fetchUpdateOrDeleteCaseComments()];
        }
    }

    // Update Interpretation
    // return List <Promise>
    fetchInterpretations() {
        let promiseInterpretationComments = [];
        const clinicalAnalysisId = this.clinicalAnalysis.id;
        this.updateInterpretationComments.forEach(updateInterpretationComments => {
            const interpretationId = updateInterpretationComments.id;

            if (updateInterpretationComments.added?.length > 0) {
                promiseInterpretationComments.push(
                    this.opencgaSession.opencgaClient.clinical().updateInterpretation(clinicalAnalysisId, interpretationId, {comments: updateInterpretationComments.added}, {
                        study: this.opencgaSession.study.fqn,
                    }));
            }

            // update interpretation comments
            promiseInterpretationComments = [
                ...promiseInterpretationComments,
                ...this.fetchUpdateOrDeleteInterpretationComments(clinicalAnalysisId, interpretationId, updateInterpretationComments)];
        });
        return promiseInterpretationComments;
    }

    postUpdate() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
            message: "Updated successfully",
        });

        // Reset values after success update
        this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
        this.updateCaseParams = {};
        this.updateInterpretationComments = [];

        LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
            // id: this.interpretation.id, // maybe this not would be necessary
            clinicalAnalysis: this.clinicalAnalysis
        });
    }

    saveIntrepretationVariant() {
        this.clinicalAnalysisManager.updateInterpretationVariants(null, () => {
            this.requestUpdate();
            // if (notify) {
            //     LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
            //         clinicalAnalysis: this.clinicalAnalysis,
            //     }, null, {bubbles: true, composed: true});
            // }
        });
        this._config = this.getDefaultConfig();
    }

    onUpdateVariant(e) {

        const rows = Array.isArray(e.detail.row) ? e.detail.row : [e.detail.row];
        rows.forEach(row => {
            this.clinicalAnalysisManager.updateSingleVariant(row);
        });
        this.hasVariantsUpdate = true;
        this.requestUpdate();
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "discussion":
            case "date":
            case "status.id":
            case "report.signedBy":
                this.updateCaseParams = FormUtils.updateObjectParams(
                    this._clinicalAnalysis,
                    this.clinicalAnalysis,
                    this.updateCaseParams,
                    param,
                    e.detail.value);
                break;
        }
    }

    onCaseCommentChange(e) {
        this.updateCaseComments = e.detail;
    }

    onInterpretationCommentChange(e) {
        // TODO: Refactor
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

    onSubmitAll() {
        let submitPromises = [];

        // Update case
        if (UtilsNew.isNotEmpty(this.updateCaseComments) || UtilsNew.isNotEmpty(this.updateCaseParams)) {
            submitPromises = [...submitPromises, ...this.fetchCase()];
        }

        // Update Interpretation  || UtilsNew.isNotEmpty(this.intrepretationUpdateParams)
        if (UtilsNew.isNotEmptyArray(this.updateInterpretationComments)) {
            submitPromises = [...submitPromises, ...this.fetchInterpretations()];
        }

        // update interpretations status variants
        if (this.hasVariantsUpdate && UtilsNew.isEmpty(submitPromises)) {
            this.hasVariantsUpdate = false;
            this.saveIntrepretationVariant();
            this.postUpdate();
        }

        // promises Update Case,Interpretation
        if (UtilsNew.isNotEmpty(submitPromises)) {
            // Update variants
            if (this.hasVariantsUpdate) {
                this.hasVariantsUpdate = false;
                this.saveIntrepretationVariant();
            }
            Promise.all(submitPromises)
                .then(response => this.postUpdate())
                .catch(response => NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response));
            this.requestUpdate();
        }
    }

    render() {
        // Case Info
        // Report overview
        // Reported Variants
        // Discussion
        // Conclusion
        // Signed by

        if (!this.clinicalAnalysis) {
            return "";
        }

        return html`
            <data-form
                .data="${this.clinicalAnalysis}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @submit=${e => this.onSubmitAll(e)}>
            </data-form>`;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "pills",
            display: {
                pillsLeftColumnClass: "col-md-2",
                buttonsVisible: true,
                buttonOkText: "Save"
            },
            sections: [
                {
                    id: "caseInfo",
                    title: "Case Info",
                    display: {
                        titleStyle: "display:none"
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
                        {
                            text: "Case Panels",
                            type: "title",
                            display: {
                                textStyle: "font-size:24px;font-weight: bold;",
                            },
                        },
                        {
                            type: "custom",
                            display: {
                                render: data => {
                                    return !data.panels || UtilsNew.isNotEmptyArray(data?.panels) ?
                                        html`
                                            <disease-panel-grid
                                                .opencgaSession="${this.opencgaSession}"
                                                .diseasePanels="${data?.panels}">
                                            </disease-panel-grid>
                                        `:"No panel data to display";
                                }
                            }
                        },
                        {
                            text: "Case Comments",
                            type: "title",
                            display: {
                                textStyle: "font-size:24px;font-weight: bold;",
                            },
                        },
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
                        titleStyle: "display:none"
                    },
                    elements: [
                        // {
                        //     text: "Interpretation Info",
                        //     type: "title",
                        //     display: {
                        //         textStyle: "font-size:24px;font-weight: bold;",
                        //     },
                        // },
                        {
                            type: "custom",
                            display: {
                                render: data => html`
                                    <clinical-interpretation-view
                                        .clinicalAnalysis="${data}"
                                        .opencgaSession="${this.opencgaSession}"
                                        @updaterow="${e => this.onUpdateVariant(e)}"
                                        @commentChange="${e => this.onInterpretationCommentChange(e)}">
                                    </clinical-interpretation-view>
                                `
                            }
                        }
                    ]
                },
                {
                    id: "reportVariant",
                    title: "Reported Variants",
                    display: {
                        titleStyle: "display:none"
                    },
                    elements: [
                        {
                            text: "Reported Variants",
                            type: "title",
                            display: {
                                textStyle: "font-size:24px;font-weight: bold;",
                            },
                        },
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
                                                .clinicalAnalysis=${this.clinicalAnalysis}
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
                                        `:"No reported variants to display";
                                }
                            }
                        }
                    ]
                },
                {
                    id: "final-summary",
                    title: "Final Summary",
                    display: {
                        titleStyle: "display:none"
                    },
                    elements: [
                        {
                            text: "Final Summary",
                            type: "title",
                            display: {
                                textStyle: "font-size:24px;font-weight: bold;",
                            },
                        },
                        {
                            title: "Case Status",
                            field: "status.id",
                            type: "select",
                            allowedValues: ["REVIEW", "CLOSED", "DISCARDED"],
                            // required: true,
                        },
                        {
                            title: "Discussion",
                            type: "input-text",
                            field: "discussion",
                            defaultValue: "",
                            display: {
                                rows: 10,
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
                            field: "date",
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

customElements.define("clinical-interpretation-review", ClinicalInterpretationReview);

