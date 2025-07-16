import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../clinical-analysis-review-summary.js";

export default class ClinicalReportOverview extends LitElement {

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
        this._config = this.getDefaultConfig();
    }

    render() {
        if (!this.clinicalAnalysis) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this.clinicalAnalysis}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                pillsLeftColumnClass: "col-md-2",
                buttonsVisible: false,
                buttonOkText: "Save",
                buttonClearText: "",
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
                                        <clinical-analysis-review-summary
                                            .clinicalAnalysis="${data}"
                                            .opencgaSession="${this.opencgaSession}">
                                        </clinical-analysis-review-summary>
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
                                        `:
                                        "No panel data to display";
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
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
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
            ]
        };
    }

}

customElements.define("clinical-report-overview", ClinicalReportOverview);

