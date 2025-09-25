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
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import WebUtils from "../commons/utils/web-utils.js";
import "../commons/forms/data-form.js";
import "../individual/individual-grid.js";
import "../individual/individual-summary.js";

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
            display: {
                titleVisible: false,
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
                        id: "proband",
                    },
                ],
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "case-general",
                    display: {
                        titleWidth: 4,
                        className: "p-3 border border-1 border-gray-200 rounded-4 bg-white",
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
                            title: "Analysis Type",
                            field: "type",
                        },
                        {
                            title: "Flags",
                            field: "flags",
                            type: "custom",
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
                                template: "<i class='fas fa-user-md'></i><span>${id}</span>",
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
                    id: "proband",
                    title: "Proband",
                    display: {
                        titleClassName: "fw-bold",
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: clinicalAnalysis => {
                                    return html`
                                        <individual-summary
                                            .individualId="${clinicalAnalysis?.proband?.id}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .displayConfig="${{
                                                titleVisible: false,
                                            }}">
                                        </individual-summary>
                                    `;
                                },
                            },
                        },
                    ],
                },
                {
                    id: "family",
                    title: "Family",
                    display: {
                        visible: clinicalAnalysis => clinicalAnalysis?.id && clinicalAnalysis.type === "FAMILY",
                    },
                    elements: [
                        {
                            title: "Family ID",
                            field: "family.id"
                        },
                        {
                            title: "Name",
                            field: "family.name"
                        },
                        {
                            title: "Members",
                            field: "family",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: family => html`
                                    <div class="overflow-y-auto">
                                        <individual-grid
                                            .opencgaSession="${this.opencgaSession}"
                                            .individuals="${family?.members || []}"
                                            .config="${{
                                                showToolbar: false,
                                                showActions: false,
                                            }}">
                                        </individual-grid>
                                    </div>
                                `,
                            },
                        },
                        {
                            title: "Pedigree",
                            type: "image",
                            field: "family.pedigreeGraph.base64",
                        },

                    ]
                },
                {
                    id: "files",
                    title: "Files",
                    elements: [
                        {
                            type: "table",
                            field: "files",
                            display: {
                                columns: [
                                    {
                                        title: "Name",
                                        field: "name",
                                    },
                                    {
                                        title: "Size",
                                        field: "size",
                                        display: {
                                            format: size => UtilsNew.getDiskUsage(size),
                                        },
                                    },
                                    {
                                        title: "Format",
                                        field: "format",
                                    },
                                    {
                                        title: "Software",
                                        field: "software",
                                        display: {
                                            format: software => software?.name ? `${software.name} (${software.version || "-"})` : "-",
                                        },
                                    },
                                    {
                                        title: "Creation Date",
                                        field: "creationDate",
                                        display: {
                                            format: creationDate => UtilsNew.dateFormatter(creationDate, "D MMM YYYY, h:mm:ss a"),
                                        }
                                    },
                                ],
                            },
                        }
                    ]
                }
            ]
        };
    }

}

customElements.define("clinical-analysis-summary", ClinicalAnalysisSummary);
