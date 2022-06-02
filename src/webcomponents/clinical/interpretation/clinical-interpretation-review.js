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
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import Types from "../../commons/types.js";
import BioinfoUtils from "../../../core/bioinfo/bioinfo-utils.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import ClinicalAnalysisManager from "../clinical-analysis-manager.js";
import FormUtils from "../../commons/forms/form-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
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
        this.caseUpdateParams = {};
        this.intrepretationUpdateParams = {};
        this.caseCommentsUpdate = {};
        this.interpretationCommentsUpdate = {};
        this.updateVariants = false;
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

    // update(changedProperties) {
    //     if (changedProperties.has("clinicalAnalysis")) {
    //         this.clinicalAnalysisObserver();
    //     }
    //     super.update(changedProperties);
    // }

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

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "discussion":
            case "date":
            case "status.id":
            case "report.signedBy":
                this.updateParams = FormUtils.updateObjectParams(
                    this._clinicalAnalysis,
                    this.clinicalAnalysis,
                    this.updateParams,
                    param,
                    e.detail.value);
                break;
        }
    }

    onCaseCommentChange(e) {
        this.caseCommentsUpdate = e.detail;
    }

    onInterpretationCommentChange(e) {
        this.interpretationCommentsUpdate = e.detail;
    }

    // Update comments case
    updateOrDeleteCaseComments(notify) {
        const promiseCaseComments = [];
        if (this.caseCommentsUpdate?.updated?.length > 0) {
            promiseCaseComments.push(this.opencgaSession.opencgaClient.clinical()
                .update(this.clinicalAnalysis.id, {comments: this.caseCommentsUpdate.updated}, {commentsAction: "REPLACE", study: this.opencgaSession.study.fqn}));
            // .then(response => {
            //     if (notify && this.caseCommentsUpdate?.deleted?.length === 0) {
            //         this.postUpdateCase(response);
            //     }
            // })
            // .catch(response => {
            //     console.error("An error occurred updating clinicalAnalysis: ", response);
            // });
        }
        if (this.caseCommentsUpdate?.deleted?.length > 0) {
            promiseCaseComments.push(this.opencgaSession.opencgaClient.clinical()
                .update(this.clinicalAnalysis.id, {comments: this.caseCommentsUpdate.deleted}, {commentsAction: "REMOVE", study: this.opencgaSession.study.fqn}));
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
    updateOrDeleteInterpretationComments(notify) {
        const clinicalAnalysisId = this.interpretation.clinicalAnalysisId;
        const interpretationId = this.interpretation.id;
        const promiseInterpretationComments = [];

        if (this.interpretationCommentsUpdate?.updated?.length > 0) {
            promiseInterpretationComments.push(this.opencgaSession.opencgaClient.clinical()
                .updateInterpretation(clinicalAnalysisId, interpretationId,
                    {comments: this.interpretationCommentsUpdate.updated},
                    {commentsAction: "REPLACE", study: this.opencgaSession.study.fqn}
                ));
            // .then(response => {
            //     if (notify && this.interpretationCommentsUpdate?.deleted?.length === 0) {
            //         this.postUpdateInterpretation(response, "");
            //     }
            // })
            // .catch(response => {
            //     console.error("An error occurred updating clinicalAnalysis: ", response);
            // });
        }
        if (this.interpretationCommentsUpdate?.deleted?.length > 0) {
            promiseInterpretationComments.push(this.opencgaSession.opencgaClient.clinical()
                .updateInterpretation(clinicalAnalysisId, interpretationId,
                    {comments: this.interpretationCommentsUpdate.deleted},
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

    postUpdate() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
            message: "Updated successfully",
        });

        // Reset values after success update
        this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
        this.caseUpdateParams = {};
        this.intrepretationUpdateParams = {};

        LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
            // id: this.interpretation.id, // maybe this not would be necessary
            clinicalAnalysis: this.clinicalAnalysis
        });
    }

    onUpdateVariant(e) {

        const rows = Array.isArray(e.detail.row) ? e.detail.row : [e.detail.row];
        rows.forEach(row => {
            this.clinicalAnalysisManager.updateSingleVariant(row);
        });
        this.updateVariants = true;
        this.requestUpdate();
    }

    onSaveIntrepretationVariant(notify) {
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


    // Update Case (No Interpretation)
    onSubmitCase() {

        if (this.caseCommentsUpdate) {
            if (this.caseCommentsUpdate.added?.length > 0) {
                this.caseUpdateParams.comments = this.caseCommentsUpdate.added;
            }
        }

        if (this.caseUpdateParams && UtilsNew.isNotEmpty(this.caseUpdateParams)) {
            return [
                ...this.updateOrDeleteCaseComments(false),
                this.opencgaSession.opencgaClient.clinical()
                    .update(this.clinicalAnalysis.id, this.caseUpdateParams, {
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
            return [...this.updateOrDeleteCaseComments(true)];
        }
    }

    // Update Interpretation
    onSubmitInterpretation() {
        const clinicalAnalysis = this.interpretation.clinicalAnalysisId;
        const id = this.interpretation.id;

        if (this.interpretationCommentsUpdate) {
            if (this.interpretationCommentsUpdate.added?.length > 0) {
                this.intrepretationUpdateParams.comments = this.interpretationCommentsUpdate.added;
            }
        }

        if (this.intrepretationUpdateParams && UtilsNew.isNotEmpty(this.intrepretationUpdateParams)) {
            // update interpretation comments
            return [...this.updateOrDeleteInterpretationComments(false),
                this.opencgaSession.opencgaClient.clinical().updateInterpretation(clinicalAnalysis, id, this.intrepretationUpdateParams, {
                    study: this.opencgaSession.study.fqn,
                // panelsAction: "SET",
                })];
            // .then(response => {
            //     this.postUpdateInterpretation(response, id);
            // }).catch(response => {
            //     NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            // });
        } else {
            return [...this.updateOrDeleteInterpretationComments(true)];
        }
    }


    onSubmitAll() {
        const promiseSubmit = [];

        // Update case
        // if (this.caseCommentsUpdate || this.caseUpdateParams) {
        //     promiseSubmit = [...promiseSubmit, ...this.onSubmitCase()];
        // }

        // Update Interpretation
        // if (this.interpretationCommentsUpdate || this.intrepretationUpdateParams) {
        //     promiseSubmit = [...promiseSubmit, ...this.onSubmitInterpretation()];
        // }

        // update interpretations status variants
        if (this.updateVariants && UtilsNew.isEmpty(promiseSubmit)) {
            this.updateVariants = false;
            this.onSaveIntrepretationVariant(false);
        }

        // if (UtilsNew.isNotEmpty(promiseSubmit)) {
        //     this.onSaveIntrepretationVariant(false);
        //     Promise.all(promiseSubmit)
        //         .then(response => this.postUpdate())
        //         .catch(response => NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response));
        //     this.requestUpdate();
        // }
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
                buttonsVisible: true
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
                            text: "Case Info",
                            type: "title",
                            display: {
                                textStyle: "font-size:24px;font-weight: bold;",
                            },
                        },
                        {
                            title: "Case ID",
                            type: "custom",
                            display: {
                                render: clinicalAnalysis => html`
                                    <label>
                                        ${clinicalAnalysis.id}
                                    </label>
                                    <span style="padding-left: 50px">
                                        <i class="far fa-calendar-alt"></i>
                                        <label>Creation Date:</label> ${UtilsNew.dateFormatter(clinicalAnalysis?.creationDate)}
                                    </span>
                                    <span style="margin: 0 20px">
                                        <i class="far fa-calendar-alt"></i>
                                        <label>Due date:</label> ${UtilsNew.dateFormatter(clinicalAnalysis?.dueDate)}
                                    </span>
                                `,
                            }
                        },
                        {
                            title: "Proband",
                            field: "proband",
                            type: "custom",
                            display: {
                                render: proband => {
                                    const sex = (proband?.sex?.id !== "UNKNOWN") ? `(${proband.sex.id || proband.sex})` : "(Sex not reported)";
                                    const sampleIds = proband.samples.map(sample => sample.id).join(", ");
                                    return html`
                                        <span style="padding-right: 25px">
                                            ${proband.id} ${sex}
                                        </span>
                                        <span style="font-weight: bold; padding-right: 10px">
                                            Sample(s):
                                        </span>
                                        <span>${sampleIds}</span>
                                    `;
                                }
                            }
                        },
                        {
                            title: "Clinical Condition",
                            field: "disorder",
                            type: "custom",
                            display: {
                                render: disorder => UtilsNew.renderHTML(CatalogGridFormatter.disorderFormatter(disorder)),
                            }
                        },
                        {
                            title: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                render: panels => {
                                    let panelHtml = "-";
                                    if (panels?.length > 0) {
                                        panelHtml = html`
                                            ${panels.map(panel => {
                                                if (panel.source?.project?.toUpperCase() === "PANELAPP") {
                                                    return html`
                                                        <div style="margin: 5px 0px">
                                                            <a href="${BioinfoUtils.getPanelAppLink(panel.source.id)}" target="_blank">
                                                                ${panel.name} (${panel.source.project} v${panel.source.version})
                                                            </a>
                                                        </div>`;
                                                } else {
                                                    return html`<div>${panel.id}</div>`;
                                                }
                                            })}`;
                                    }
                                    return html`<div>${panelHtml}</div>`;
                                }
                            }
                        },
                        {
                            title: "Analysis Type",
                            field: "type",
                        },
                        {
                            title: "Interpretation ID",
                            field: "interpretation",
                            type: "custom",
                            display: {
                                render: interpretation => html`
                                    <span style="font-weight: bold; margin-right: 10px">
                                        ${interpretation?.id}
                                    </span>
                                    <span style="color: grey; padding-right: 40px">
                                        version ${interpretation?.version}
                                    </span>
                                `,
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
                                        .opencgaSession="${this.opencgaSession}"
                                        .comments="${data?.comments}"
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
                        {
                            text: "Interpretation Info",
                            type: "title",
                            display: {
                                textStyle: "font-size:24px;font-weight: bold;",
                            },
                        },
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
                                                        showSettings: false
                                                    }
                                                }>
                                            </variant-interpreter-grid>
                                        `:"Reported Variants not found";
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

