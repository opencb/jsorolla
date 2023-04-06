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
import UtilsNew from "../../core/utils-new.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";

export default class ClinicalAnalysisSummary extends LitElement {

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
            clinicalAnalysisId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
        super.update(changedProperties);
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    if (response.responses[0].numResults === 1) {
                        this.clinicalAnalysis = response.responses[0].results[0];
                    }
                })
                .catch(function (reason) {
                    console.error(reason);
                });
        }
    }

    render() {
        return html`
            <data-form
                .data="${this.clinicalAnalysis}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            id: "clinical-analysis",
            title: "Case Summary",
            display: {
                titleVisible: false,
                titleWidth: 3,
                defaultLayout: "horizontal",
                style: "background-color:#f3f3f3;border-left: 4px solid #0c2f4c;padding:16px",
                buttonsVisible: false,
            },
            sections: [
                {
                    id: "summary",
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
                        },
                        {
                            title: "Report",
                            field: "interpretation.attributes.reportTest",
                            type: "custom",
                            display: {
                                render: report => {
                                    const generateUrl = file => {
                                        return {
                                            name: file,
                                            url: `${this.opencgaSession.server.host}/webservices/rest/${this.opencgaSession.server.version}/files/${file}/download?study=${this.opencgaSession.study.fqn}&sid=${this.opencgaSession.token}`
                                        };
                                    };
                                    if (report?.report_files && report?.report_files.length > 0) {
                                        const urlPdfs = report.report_files.map(report => generateUrl(report.fileName));
                                        return urlPdfs.map(report => html`
                                            <div>
                                                <span style="margin-right: 10px">${report.name}</span>
                                                    <a href="${report.url}" >
                                                        <i class="fas fa-download icon-padding"></i>
                                                    </a>
                                                </div>`);
                                    } else {
                                        return html `No files uploaded yet!`;
                                    }
                                }
                            }
                        },
                        {
                            title: "Report (Json)",
                            field: "interpretation.attributes.reportTest._report",
                            type: "custom",
                            display: {
                                render: report => {
                                    if (report !== undefined) {
                                        const nameFile = this.clinicalAnalysis.interpretation.id;
                                        return html`
                                            <div>
                                                <span style="margin-right: 10px">${nameFile}</span>
                                                    <a @click="${e => UtilsNew.downloadJSON(report, "report_" + nameFile)}">
                                                        <i class="fas fa-download icon-padding"></i>
                                                    </a>
                                                </div>`;
                                    } else {
                                        return html `No Report Json`;
                                    }
                                }
                            }
                        }
                    ]
                },
            ]
        };
    }

}

customElements.define("clinical-analysis-summary", ClinicalAnalysisSummary);
