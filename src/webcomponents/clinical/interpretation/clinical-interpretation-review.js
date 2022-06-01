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
        this.updateParams = {};
        this._clinicalAnalysis = {};
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
        super.connectedCallback();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.interpretationObserver();
        }
        super.update(changedProperties);
    }

    onCommentChange(e) {
        // TODO: Save comment internal
        this.commentsUpdate = e.detail;
    }

    interpretationObserver() {
        // console.log("this is a clinicalAnalysis", this.clinicalAnalysis);
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

    onClinicalAnalysisUpdate(e) {
        console.log("Clinical Analysis Update", e.detail.clinicalAnalysis);
        this.clinicalAnalysis = e.detail.clinicalAnalysis;
    }

    onSaveVariants(e) {
        const comment = e.detail.comment;
        this.clinicalAnalysisManager.updateInterpretationVariants(comment, () => {
            this.requestUpdate();
            LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
                clinicalAnalysis: this.clinicalAnalysis,
            }, null, {bubbles: true, composed: true});
        });
        this._config = this.getDefaultConfig();
    }

    onSubmit(e) {
        // this.onSaveVariants(e);
        console.log("updateParams: ", this.updateParams);
    }

    render() {
        // Case Info
        // Report overview
        // Reported Variants
        // -- Discussion
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
                @submit=${e => this.onSubmit(e)}>
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
                        // style: "border-left:4px solid #0c2f4c;padding:16px;",
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
                            text: "Panels",
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
                            text: "Comments",
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
                                        .comments="${data?.comments}"
                                        @commentChange="${e => this.onCommentChange(e)}">
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
                        // style: "margin-left:20px"
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
                                        @clinicalAnalysisUpdate=${this.onClinicalAnalysisUpdate}
                                        >
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
                        // style: "background-color:#f3f3f3;border-left:4px solid #0c2f4c;padding:16px;",
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
                        // style: "background-color:#f3f3f3;border-left:4px solid #0c2f4c;padding:16px;",
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

