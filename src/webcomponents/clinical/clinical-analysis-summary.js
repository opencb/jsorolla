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
        this._clinicalAnalysis = {};
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
        this._clinicalAnalysis = {...this.clinicalAnalysis};
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
                layout: [
                    {
                        id: "",
                        className: "row mb-5",
                        sections: [
                            {
                                id: "detail",
                                className: "col-md-6"
                            },
                            {
                                id: "proband",
                                className: "col-md-6"
                            }
                        ]
                    },
                    {
                        id: "family",
                        className: ""
                    },
                    {
                        id: "files",
                        className: ""
                    }
                ],
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "detail",
                    title: "Details",
                    display: {
                        titleWidth: 3,
                    },
                    elements: [
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
                            display: {
                                visible: !this._config?.hiddenFields?.includes("type"),
                            },
                        },
                        {
                            title: "Flags",
                            field: "flags",
                            type: "list",
                            display: {
                                visible: !this._config?.hiddenFields?.includes("flags"),
                                separator: " ",
                                contentLayout: "horizontal",
                                template: "${id}",
                                className: {
                                    "id": "badge text-bg-secondary",
                                },
                            }
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
                            title: "Description",
                            field: "description",
                            display: {
                                errorMessage: "-",
                            },
                        },
                        {
                            title: "Assigned To",
                            field: "analysts",
                            type: "list",
                            display: {
                                contentLayout: "bullets",
                                visible: !this._config?.hiddenFields?.includes("analyst.assignee") && !this._config?.hiddenFields?.includes("analyst.id"),
                                format: analyst => analyst.id,
                            },
                        },
                        {
                            title: "Creation Date",
                            field: "creationDate",
                            display: {
                                format: date => UtilsNew.dateFormatter(date)
                            },
                        },
                        {
                            title: "Due date",
                            field: "dueDate",
                            display: {
                                format: date => UtilsNew.dateFormatter(date)
                            },
                        }
                    ]
                },
                {
                    id: "proband",
                    title: "Proband",
                    display: {
                        titleWidth: 3,
                    },
                    elements: [
                        {
                            title: "Proband",
                            field: "proband.id"
                        },
                        {
                            title: "Sex (Karyotypic)",
                            field: "proband",
                            display: {
                                defaultValue: "Not specified",
                                format: proband => `${proband?.sex?.id ?? proband?.sex} (${proband?.karyotypicSex})`
                            },
                        },
                        {
                            title: "Date of Birth",
                            field: "proband.dateOfBirth",
                        },
                        {
                            title: "Life Status",
                            field: "proband.lifeStatus",
                        },
                        {
                            title: "Disorders",
                            field: "proband.disorders",
                            type: "list",
                            display: {
                                defaultValue: "-",
                                contentLayout: "bullets",
                                transform: disorders => (disorders || []).map(disorder => ({disorder})),
                                template: "${disorder.name} (${disorder.id})",
                                link: {
                                    "disorder.id": id => id.startsWith("OMIM:") ?
                                        BioinfoUtils.getOmimOntologyLink(id) :
                                        "",
                                },
                            },
                        },
                        {
                            title: "Phenotypes",
                            field: "proband.phenotypes",
                            type: "list",
                            display: {
                                defaultValue: "-",
                                contentLayout: "bullets",
                                transform: phenotypes => (phenotypes || [])
                                    .sort(item => item?.status === "OBSERVED" ? -1 : 1)
                                    .map(phenotype => ({phenotype})),
                                template: "${phenotype.name} (${phenotype.id}) - ${phenotype.status}",
                                link: {
                                    "phenotype.id": id => id.startsWith("HP:") ? BioinfoUtils.getHpoLink(id) : id,
                                }
                            },
                        },
                        {
                            title: "Samples",
                            field: "proband.samples",
                            type: "table",
                            style: {
                                "margin-top": "1em",
                            },
                            display: {
                                // defaultValue: "No sample found",
                                defaultLayout: "vertical",
                                headerStyle: {
                                    background: "#f5f5f5",
                                    lineHeight: "0.5"
                                },
                                columns: [
                                //     {
                                //         title: "ID",
                                //         field: "id",
                                //         formatter: (sampleId, sample) => {
                                //             let somaticHtml = "";
                                //             if (typeof sample.somatic !== "undefined") {
                                //                 somaticHtml = sample.somatic ? "Somatic" : "Germline";
                                //             }
                                //             return `
                                //                 <div>
                                //                     <span style="font-weight: bold; margin: 5px 0">${sampleId}</span>
                                //                     ${somaticHtml ? `<span class="help-block" style="margin: 5px 0">${somaticHtml}</span>` : nothing}
                                //                 </div>
                                //             `;
                                //         },
                                //     },
                                    {
                                        title: "ID",
                                        type: "complex",
                                        display: {
                                            defaultValue: "-",
                                            template: "${id} ${somatic}",
                                            format: {
                                                "somatic": (somatic, sample) => sample.somatic ? "Somatic" : "Germline",
                                            },
                                            className: {
                                                "somatic": "form-text"
                                            },
                                            style: {
                                                "id": {
                                                    "font-weight": "bold"
                                                },
                                                "somatic": {
                                                    "margin": "5px 0"
                                                },
                                            }
                                        },
                                    },
                                    {
                                        title: "Files",
                                        field: "fileIds",
                                        type: "list",
                                        display: {
                                            defaultValue: "-",
                                            contentLayout: "vertical",
                                        },
                                    },
                                    {
                                        title: "Collection Method",
                                        field: "collection.method",
                                        display: {
                                            defaultValue: "-",
                                        },
                                    },
                                    {
                                        title: "Preparation Method",
                                        field: "processing.preparationMethod",
                                        display: {
                                            defaultValue: "-",
                                        },
                                    },
                                    {
                                        title: "Creation Date",
                                        field: "creationDate",
                                        display: {
                                            format: creationDate => UtilsNew.dateFormatter(creationDate, "D MMM YYYY, h:mm:ss a"),
                                        }
                                    },
                                    {
                                        title: "Status",
                                        field: "status.id",
                                        display: {
                                            defaultValue: "-",
                                        },
                                    },
                                ],
                            },
                        },
                    ]
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
                                    <individual-grid
                                        .opencgaSession="${this.opencgaSession}"
                                        .individuals="${family?.members || []}"
                                        .config="${{
                                            showSelectCheckbox: false,
                                            showToolbar: false
                                        }}">
                                    </individual-grid>
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
