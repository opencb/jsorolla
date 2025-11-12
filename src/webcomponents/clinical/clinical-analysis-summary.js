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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import WebUtils from "../commons/utils/web-utils.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils";
import "../commons/forms/data-form.js";

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
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this._clinicalAnalysis = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    clinicalAnalysisIdObserver() {
        this._clinicalAnalysis = null;
        if (this.clinicalAnalysisId && this.opencgaSession) {
            this.opencgaSession.opencgaClient.clinical()
                .info(this.clinicalAnalysisId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._clinicalAnalysis = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    clinicalAnalysisObserver() {
        this._clinicalAnalysis = this.clinicalAnalysis;
    }

    render() {
        if (!this.opencgaSession || !this._clinicalAnalysis) {
            return nothing;
        }

        return html`
            <data-form
                .data=${this._clinicalAnalysis}
                .config="${this._config || {}}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Clinical Analysis Overview",
            display: {
                titleVisible: true,
                buttonsVisible: false,
                separationClassName: "mb-1",
                layout: [
                    {
                        className: "row mb-4",
                        sections: [
                            {
                                id: "case-general",
                                className: "col-6",
                            },
                            {
                                id: "case-metadata",
                                className: "col-6",
                            },
                        ],
                    },
                    {
                        id: "interpretations",
                        className: "mb-4",
                    },
                    {
                        id: "family",
                        className: "mb-4",
                    },
                ],
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "case-general",
                    display: {
                        titleWidth: 4,
                        className: "p-4 border border-1 border-gray-200 rounded-4 bg-white",
                    },
                    elements: [
                        {
                            type: "text",
                            text: "General Information",
                            display: {
                                className: "mb-2 fs-5 fw-bold",
                            },
                        },
                        {
                            title: "Case ID",
                            field: "id",
                        },
                        {
                            title: "Proband",
                            field: "proband.id",
                        },
                        {
                            title: "Disorder",
                            type: "complex",
                            display: {
                                template: "${disorder}",
                                format: {
                                    disorder: disorder => CatalogGridFormatter.disorderFormatter([disorder]),
                                },
                                defaultValue: "-",
                            },
                        },
                        {
                            title: "Flags",
                            field: "flags",
                            // type: "custom",
                            type: "list",
                            display: {
                                contentLayout: "vertical",
                                listClassName: "d-flex align-items-center flex-wrap gap-1",
                                listItemClassName: "badge bg-secondary text-white d-flex align-items-center gap-2",
                                defaultValue: "-",
                                template: "<span>${id}</span>",
                            },
                        },
                        {
                            title: "Status",
                            field: "status.id",
                        },
                        {
                            title: "Priority",
                            type: "complex",
                            display: {
                                template: "${priority.id}",
                                className: {
                                    "priority.id": (id, data) => `badge ${WebUtils.getClinicalAnalysisPriorityColour(data?.priority?.rank)}`,
                                },
                            }
                        },
                        {
                            title: "Assigned To",
                            field: "analysts",
                            type: "list",
                            display: {
                                contentLayout: "vertical",
                                listClassName: "d-flex align-items-center flex-wrap gap-1",
                                listItemClassName: "badge bg-secondary text-white d-flex align-items-center gap-2",
                                defaultValue: "-",
                                template: "<i class='fas fa-user-md'></i><span>${name}</span>",
                            },
                        },
                    ],
                },
                {
                    id: "case-metadata",
                    display: {
                        titleWidth: 4,
                        className: "p-4 border border-1 border-gray-200 rounded-4 bg-white",
                    },
                    elements: [
                        {
                            type: "text",
                            text: "Metadata",
                            display: {
                                className: "mb-2 fs-5 fw-bold",
                            },
                        },
                        {
                            title: "UUID",
                            field: "uuid",
                            type: "custom",
                            display: {
                                render: uuid => html`
                                    <code class="text-break">${uuid || "-"}</code>
                                `,
                                defaultValue: "-",
                            },
                        },
                        {
                            title: "Analysis Type",
                            field: "type",
                        },
                        {
                            title: "Version",
                            field: "version",
                            display: {
                                defaultValue: "-",
                            },
                        },
                        {
                            title: "Release",
                            field: "release",
                            display: {
                                defaultValue: "-",
                            },
                        },
                        {
                            title: "Creation Date",
                            field: "creationDate",
                            display: {
                                format: date => UtilsNew.dateFormatter(date),
                            },
                        },
                        {
                            title: "Due date",
                            field: "dueDate",
                            display: {
                                separationClassName: "mb-0",
                                defaultValue: "-",
                                format: date => UtilsNew.dateFormatter(date),
                            },
                        }
                    ],
                },
                {
                    id: "interpretations",
                    display: {
                        titleWidth: 4,
                        className: "p-4 border border-1 border-gray-200 rounded-4 bg-white",
                    },
                    elements: [
                        {
                            type: "text",
                            text: "Interpretations",
                            display: {
                                className: "mb-2 fs-5 fw-bold",
                            },
                        },
                        {
                            type: "table",
                            display: {
                                getData: clinicalAnalysis => {
                                    const allInterpretations = [];
                                    // 1. include the primary interpretation
                                    if (clinicalAnalysis?.interpretation) {
                                        allInterpretations.push({
                                            ...clinicalAnalysis.interpretation,
                                            primary: true, // add primary flag
                                        });
                                    }
                                    // 2. include secondary interpretations
                                    if (clinicalAnalysis?.secondaryInterpretations?.length > 0) {
                                        allInterpretations.push(...clinicalAnalysis.secondaryInterpretations);
                                    }
                                    // 3. return all interpretations
                                    return allInterpretations;
                                },
                                className: "table-borderless table-grid mb-0",
                                separationClassName: "mb-0",
                                headerCellClassName: "bg-white",
                                bodyRowClassName: "bg-gray-100",
                                bodyCellClassName: "align-middle",
                                defaultValue: () => html`
                                    <div class="alert alert-light border-0 mb-0 d-flex flex-column align-items-center gap-1">
                                        <i class="fas fa-info-circle fs-3"></i>
                                        <div class="text-break">No interpretations for this Clinical Analysis.</div>
                                    </div>
                                `,
                                columns: [
                                    {
                                        title: "Interpretation",
                                        field: "id",
                                        type: "custom",
                                        display: {
                                            className: "text-break",
                                            style: {
                                                "font-weight": "bold",
                                            },
                                            render: (id, onChange, updatedParans, data, row) => html`
                                                <div class="text-break fw-bold">
                                                    <span>${id}</span>
                                                    ${row.primary ? html`
                                                        <span class="badge text-bg-primary align-middle ms-2">PRIMARY</span>
                                                    ` : nothing}
                                                </div>
                                                <div class="text-muted small">Version ${row.version}</div>
                                            `,
                                        },
                                    },
                                    {
                                        title: "Status",
                                        field: "status.id",
                                        type: "custom",
                                        display: {
                                            render: statusId => html`
                                                <span class="badge ${statusId ? "text-bg-primary" : "text-bg-secondary"}">
                                                    <strong>${statusId || "NO_STATUS"}</strong>
                                                </span>
                                            `,
                                        },
                                    },
                                    {
                                        title: "Method",
                                        field: "method",
                                        type: "custom",
                                        display: {
                                            render: method => {
                                                if (!method || !method?.name) {
                                                    return "-";
                                                }
                                                return html`
                                                    <div class="d-flex align-items-center gap-2 mb-1">
                                                        <strong>${method.name}</strong> 
                                                        <span class="text-muted small">Version ${method.version || "-"}</span>
                                                    </div>
                                                    <div class="d-flex flex-wrap gap-1">
                                                        ${(method.dependencies || []).map(item => html`
                                                            <span class="badge text-bg-primary">${item.name} (${item.version})</span>
                                                        `)}
                                                    </div>
                                                `;
                                            },
                                        },
                                    },
                                    {
                                        field: "panels",
                                        title: "Panels",
                                        type: "list",
                                        display: {
                                            separationClassName: "mb-0",
                                            listClassName: "mb-0 ps-0",
                                            contentLayout: "bullets",
                                            defaultLayout: "vertical",
                                            defaultValue: "-",
                                            format: panel => {
                                                return panel.name || panel.id;
                                            },
                                        },
                                    },
                                    {
                                        field: "stats.primaryFindings",
                                        title: "Primary Findings",
                                        type: "custom",
                                        display: {
                                            render: stats => {
                                                if (stats.numVariants === 0) {
                                                    return "No variants selected.";
                                                }
                                                return html`
                                                    <div class="fw-bold">${stats.numVariants} variants selected.</div>
                                                    <div class="text-muted small">
                                                        <span>Genes: </span>
                                                        ${Object.keys(stats.geneCount || {}).map(gene => html`
                                                            <span><b>${gene}</b> (${stats.geneCount[gene]}) </span>
                                                        `)}
                                                    </div>
                                                `;
                                            }
                                        },
                                    },
                                    {
                                        title: "Assigned to",
                                        field: "analyst",
                                        type: "custom",
                                        display: {
                                            render: analyst => html`
                                                ${analyst?.id || analyst?.name ? html`
                                                    <div class="d-inline-flex align-items-center gap-2">
                                                        <i class="fas fa-user-md"></i>
                                                        <strong style="white-space:nowrap;">${analyst.name || analyst.id}</strong>
                                                    </div>
                                                ` : "-"}
                                            `,
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    id: "family",
                    display: {
                        visible: clinicalAnalysis => clinicalAnalysis?.id && clinicalAnalysis.type === "FAMILY",
                        titleWidth: 4,
                        className: "p-4 border border-1 border-gray-200 rounded-4 bg-white",
                        layout: [
                            {
                                id: "title",
                            },
                            {
                                className: "row",
                                elements: [
                                    {
                                        id: "members",
                                        className: "col-9",
                                    },
                                    {
                                        id: "pedigree",
                                        className: "col-3",
                                    },
                                ],
                            },
                        ],
                    },
                    elements: [
                        {
                            id: "title",
                            type: "text",
                            text: (clinicalAnalysis) => {
                                return `Family Information - ${clinicalAnalysis?.family?.id || ""}`;
                            },
                            display: {
                                className: "mb-2 fs-5 fw-bold",
                            },
                        },
                        {
                            id: "members",
                            title: "Family Members",
                            field: "family.members",
                            type: "table",
                            display: {
                                defaultLayout: "vertical",
                                className: "table-borderless table-grid mb-0",
                                separationClassName: "mb-0",
                                headerCellClassName: "bg-white",
                                bodyRowClassName: "bg-gray-100",
                                bodyCellClassName: "align-middle",
                                columns: [
                                    {
                                        title: "Individual",
                                        field: "id",
                                        display: {
                                            className: "text-break",
                                            style: {
                                                "font-weight": "bold"
                                            }
                                        }
                                    },
                                    {
                                        title: "Gender",
                                        field: "sex.id",
                                        display: {
                                            className: "text-break",
                                        }
                                    },
                                    {
                                        id: "disorders",
                                        field: "disorders",
                                        title: "Disorders",
                                        type: "list",
                                        display: {
                                            separationClassName: "mb-0",
                                            listClassName: "mb-0 ps-0",
                                            contentLayout: "bullets",
                                            defaultLayout: "vertical",
                                            defaultValue: "-",
                                            template: "${name} (${id})",
                                            link: {
                                                "id": id => {
                                                    return BioinfoUtils.getOntologyLink(id);
                                                },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            id: "pedigree",
                            title: "Pedigree",
                            type: "image",
                            field: "family.pedigreeGraph.base64",
                            display: {
                                defaultLayout: "vertical",
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-analysis-summary", ClinicalAnalysisSummary);
