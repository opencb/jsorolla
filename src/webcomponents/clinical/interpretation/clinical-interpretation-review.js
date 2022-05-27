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
import "../../variant/interpretation/variant-interpreter-grid.js";
import "../../disease-panel/disease-panel-grid.js";
import "./clinical-interpretation-view.js";

export default class ClinicalInterpretationReview extends LitElement {

    constructor() {
        super();
        this._init();
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

    _init() {
        this.interpretation = {};
        this._config = this.getDefaultConfig();

    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.interpretationObserver();
        }
        super.update(changedProperties);
    }

    interpretationObserver() {
        // console.log("this is a clinicalAnalysis", this.clinicalAnalysis);
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
                .config="${this._config}">
            </data-form>`;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            // title: "Case Report",
            display: {
                width: 10,
                buttonsVisible: false
            },
            sections: [
                {
                    id: "caseInfo",
                    title: "Case Info",
                    display: {
                        style: "background-color:#f3f3f3;border-left:4px solid #0c2f4c;padding:16px;",
                    },
                    elements: [
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
                        }
                    ]
                },
                {
                    id: "panelView",
                    title: "Panel",
                    elements: [
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
                                        `:"Panel Not Found";
                                }
                            }
                        }
                    ]
                },
                {
                    id: "commentView",
                    title: "Comments",
                    display: {
                        // style: "background-color:#f3f3f3;border-left:4px solid #0c2f4c;padding:16px;",
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: data => html `
                                    <div class="panel panel-info">
                                        <div class="panel-heading">
                                            <div>
                                                <span class="panel-title">User 1</span>
                                                <span class="pull-right">13 Jan 2022</span>
                                            </div>
                                        </div>
                                        <div class="panel-body">
                                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                                            when an unknown printer took a galley of type and scrambled it to make a type
                                            specimen book. It has survived not only five centuries, but also the leap into
                                            electronic typesetting, remaining essentially unchanged. It was popularised in
                                            the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
                                            and more recently with desktop publishing software like Aldus PageMaker including
                                            versions of Lorem Ipsum.
                                        <div>
                                            <span class="label label-warning">Variants</span>
                                            <span class="label label-danger">Cancer</span>
                                        </div>
                                        </div>
                                    </div>
                                    <div class="panel panel-info">
                                        <div class="panel-heading">
                                            <div>
                                                <span class="panel-title">User 2</span>
                                                <span class="pull-right">13 Jan 2022</span>
                                            </div>
                                        </div>
                                        <div class="panel-body">
                                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                                            when an unknown printer took a galley of type and scrambled it to make a type
                                            specimen book. It has survived not only five centuries, but also the leap into
                                            electronic typesetting, remaining essentially unchanged. It was popularised in
                                            the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
                                            and more recently with desktop publishing software like Aldus PageMaker including
                                            versions of Lorem Ipsum.
                                        <div>
                                            <span class="label label-warning">Variants</span>
                                            <span class="label label-danger">Cancer</span>
                                        </div>
                                        </div>
                                    </div>
                                    <div class="panel panel-info">
                                        <div class="panel-heading">
                                            <div>
                                                <span class="panel-title">User 3</span>
                                                <span class="pull-right">13 Jan 2022</span>
                                            </div>
                                        </div>
                                        <div class="panel-body">
                                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                                            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                                            when an unknown printer took a galley of type and scrambled it to make a type
                                            specimen book. It has survived not only five centuries, but also the leap into
                                            electronic typesetting, remaining essentially unchanged. It was popularised in
                                            the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
                                            and more recently with desktop publishing software like Aldus PageMaker including
                                            versions of Lorem Ipsum.
                                        <div>
                                            <span class="label label-warning">Variants</span>
                                            <span class="label label-warning">Gene</span>
                                            <span class="label label-info">Others</span>
                                        </div>
                                        </div>
                                    </div>
                                `
                            }
                        }
                    ]
                },
                {
                    id: "interpretationSummary",
                    title: "Interpretation Info",
                    display: {
                        style: "margin-left:20px"
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: data => html`
                                    <clinical-interpretation-view
                                        .clinicalAnalysis="${data}"
                                        .opencgaSession="${this.opencgaSession}">
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
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: data => {
                                    const variantsReviewed = data?.interpretation?.primaryFindings?.filter(
                                        variant => variant?.status === "REVIEWED");
                                    return variantsReviewed || UtilsNew.isNotEmptyArray(variantsReviewed) ?
                                        html`
                                            <variant-interpreter-grid
                                                review
                                                .clinicalAnalysis=${this.clinicalAnalysis}
                                                .clinicalVariants="${variantsReviewed}"
                                                .opencgaSession="${this.opencgaSession}"
                                                .config=${
                                                    {
                                                        showExport: true,
                                                        showSettings: false
                                                    }
                                                }>
                                            </variant-interpreter-grid>
                                        `:"Variants Not Found";
                                }
                            }
                        }
                    ]
                },
                {
                    id: "final-summary",
                    title: "4. Final Summary",
                    elements: [
                        {
                            title: "Case Status",
                            field: "status.id",
                            type: "select",
                            allowedValues: ["REVIEW", "CLOSED", "DISCARDED"],
                            required: true,
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
                // {
                //     id: "reportConclusion",
                //     title: "Conclusion",
                //     display: {
                //         // style: "background-color:#f3f3f3;border-left:4px solid #0c2f4c;padding:16px;",
                //     },
                //     elements: [
                //         {
                //             type: "custom",
                //             display: {
                //                 render: data => {
                //                     return data?.discussion ? html`<p>${data.discussion}</p>` : "No Conclusion";
                //                 }
                //             }
                //         },
                //         {
                //             field: "conclusion",
                //             type: "input-text",
                //             display: {
                //                 rows: 3,
                //                 placeholder: "Please write a conclusion..."
                //             }
                //         },
                //     ]
                // },
            ]

        });
    }

}

customElements.define("clinical-interpretation-review", ClinicalInterpretationReview);

