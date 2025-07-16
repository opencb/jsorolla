import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import ClinicalAnalysisManager from "../clinical-analysis-manager.js";
import FormUtils from "../../commons/forms/form-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";

export default class ClinicalReportReview extends LitElement {

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
            this._clinicalAnalysis = UtilsNew.objectClone(this.clinicalAnalysis);
            this._config = this.getDefaultConfig();
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

    submitCaseComments() {
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

    saveIntrepretationVariant() {
        this.clinicalAnalysisManager.updateInterpretationVariants(null, () => {
            this.requestUpdate();
            LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
                clinicalAnalysis: this.clinicalAnalysis,
            }, null, {bubbles: true, composed: true});
        });
        this._config = this.getDefaultConfig();
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
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
                this.submitCaseComments();
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
        if (!this.opencgaSession || !this.clinicalAnalysis) {
            return nothing;
        }

        return html`
            <div class="">
                <h3>Reported Variants</h3>
                <hr />
            </div>
            <data-form
                .data="${this.clinicalAnalysis}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @submit=${e => this.onSubmit(e)}>
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            type: "pills",
            display: {
                pillsLeftColumnClass: "col-md-1",
                pillsRightColumnClass: "col-md-11",
                buttonsVisible: false,
                buttonOkText: "Save",
                buttonClearText: "",
                defaultLayout: "vertical",
            },
            sections: [
                {
                    id: "discussion",
                    title: "Discussion",
                    icon: "fa-edit",
                    display: {},
                    elements: [
                        {
                            type: "input-text",
                            field: "report.discussion.text",
                            defaultValue: "",
                            display: {
                                rows: 10,
                                // helpMessage: discussion.author ? html`Last discussion added by <b>${discussion.author}</b> on <b>${UtilsNew.dateFormatter(discussion.date)}</b>.` : null,
                            },
                        },
                    ],
                },
                {
                    id: "recommendation",
                    title: "Recommendation",
                    icon: "fa-notes-medical",
                    display: {},
                    elements: [
                        {
                            field: "report.recommendation",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 10,
                            },
                        },
                    ],
                },
                {
                    id: "methodology",
                    title: "Methodology",
                    icon: "fa-tasks",
                    display: {},
                    elements: [
                        {
                            field: "report.methodology",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 10,
                            },
                        },
                    ],
                },
                {
                    id: "limitations",
                    title: "Limitations",
                    icon: "fa-exclamation-triangle",
                    display: {},
                    elements: [
                        {
                            field: "report.limitations",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 10,
                            },
                        },
                    ],
                },
                {
                    id: "signatures",
                    title: "Signatures",
                    icon: "fa-signature",
                    display: {},
                    elements: [],
                },
            ],
        };
    }

}

customElements.define("clinical-report-review", ClinicalReportReview);
