/*
 * Copyright 2015-2016 OpenCB
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
import UtilsNew from "../../../core/utils-new.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import Types from "../../commons/types.js";
import "./variant-interpreter-grid.js";
import "./variant-interpreter-rearrangement-grid.js";
import "../../commons/forms/data-form.js";
import "../../commons/simple-chart.js";
import "../../loading-spinner.js";
import "../../file/file-preview.js";
import PdfBuilder from "../../../core/pdf-builder.js";
import PdfUtils from "../../commons/utils/pdf-utils.js";

class CaseSmsReport extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalAnalysisId: {
                type: String
            },
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
        this._reportData = {};
        this._config = this.getDefaultConfig();
    }


    firstUpdated(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
    }

    // updated(changedProperties) {
    //     if (changedProperties.has("clinicalAnalysis")) {
    //         this.clinicalAnalysisObserver();
    //     }
    // }


    update(changedProperties) {
        // if (changedProperties.has("clinicalAnalysisId")) {
        //     this.clinicalAnalysisIdObserver();
        // }

        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        super.update(changedProperties);
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        console.log("onChange", param);

    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                })
                .catch(response => {
                    if (typeof response == "string") {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                            message: response
                        });
                    } else {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                    }
                    console.error("An error occurred updating clinicalAnalysis: ", response);
                });
        }
    }

    clinicalAnalysisObserver() {
        if (this.opencgaSession && this.clinicalAnalysis) {
            this._clinicalAnalysis = UtilsNew.objectClone(this.clinicalAnalysis);
            this._reportData = {
                ...this.clinicalAnalysis?.interpretation?.attributes?.reportTest,
                caseInterpretation: this.clinicalAnalysis?.interpretation,
            };
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    // TODO: It's possible this function turn into a component
    renderIndividualSummary(patientData) {
        const _config = Types.dataFormConfig({
            id: "patient-personal-summary",
            display: {
                titleVisible: false,
                titleWidth: 3,
                defaultLayout: "horizontal",
                style: "background-color:#f3f3f3;border-left: 4px solid #0c2f4c;padding:16px",
                buttonsVisible: false,
            },
            sections: [
                {
                    id: "patient-summary",
                    elements: [
                        {
                            title: "Name",
                            field: "patient.name",
                            defaultValue: "N/A"
                        },
                        {
                            title: "Last Name",
                            field: "patient.lastName",
                            defaultValue: "N/A"
                        },
                        {
                            title: "Birth Date",
                            field: "patient.birthDate",
                            type: "custom",
                            display: {
                                render: field => `${UtilsNew.dateFormatter(field)}`
                            }
                        },
                        {
                            title: "Age",
                            field: "patient.age",
                            defaultValue: "N/A"
                        },
                        {
                            title: "CIPA",
                            // field: "info.germlineId",
                            defaultValue: "N/A"
                        },
                        {
                            title: "Sample type",
                            field: "sample.type",
                            defaultValue: "N/A"
                        },
                        {
                            title: "Extration Date",
                            field: "sample.extractionDate",
                            type: "custom",
                            display: {
                                render: field => `${UtilsNew.dateFormatter(field)}`
                            }

                        },
                        {
                            title: "Reason", // Cause
                            field: "sample.reason",
                            defaultValue: "N/A",

                        },
                    ]
                }
            ]
        });


        return html`
            <data-form
                .data="${patientData}"
                .config="${_config}">
            </data-form>
        `;
    }

    renderDiagnosticSummary(requestData) {
        const _config = Types.dataFormConfig({
            id: "diagnostic-details-summary",
            display: {
                titleVisible: false,
                titleWidth: 3,
                defaultLayout: "horizontal",
                style: "background-color:#f3f3f3;border-left: 4px solid #0c2f4c;padding:16px",
                buttonsVisible: false,
            },
            sections: [
                {
                    id: "diagnostic-summary",
                    elements: [
                        {
                            title: "N. Request",
                            field: "request.requestNumber",
                            defaultValue: "N/A"
                        },
                        {
                            title: "Request Date",
                            field: "request.requestDate",
                            type: "custom",
                            display: {
                                render: field => `${UtilsNew.dateFormatter(field)}`
                            },
                            defaultValue: "N/A"
                        },
                        {
                            title: "Dr/Dra.:",
                            field: "request.requestingDoctor",
                            type: "custom",
                            display: {
                                // defaultLayout: "vertical",
                                render: field => {
                                    return html`
                                        <p>${field?.name}</p>
                                        <p>${field?.specialization}</p>
                                        <p>${field?.hospitalName}</p>
                                        <p>${field?.address}</p>
                                        <p>${field?.code}</p>`;
                                }
                            },
                            defaultValue: "N/A"
                        },

                    ]
                }
            ]
        });

        return html`
            <data-form
                .data="${requestData}"
                .config="${_config}">
            </data-form>
        `;
    }

    // pdfMake
    onGeneratePDFMake() {
        const docDefinition = {
            content: [
                PdfUtils.titleText(
                    "GENOMIC REPORT", {
                        bold: true,
                        alignment: "center"
                    }),
                {
                    columns: [
                        [
                            PdfUtils.headerText("1. Patient Personal Details\n"),
                            {
                                table: {
                                    widths: [230],
                                    body: [
                                        [PdfUtils.fieldText("Name: ", this._reportData.patient.name)],
                                        [PdfUtils.fieldText("Last Name: ", this._reportData.patient.lastName)],
                                        [PdfUtils.fieldText("Birth Date: ", UtilsNew.dateFormatter(this._reportData.patient.birthDate))],
                                        [PdfUtils.fieldText("Age: ", this._reportData.patient.age)],
                                        [PdfUtils.fieldText("CIPA: ", this._reportData.patient.cipa)],
                                        [PdfUtils.fieldText("Sample Type: ", this._reportData.sample.type)],
                                        [PdfUtils.fieldText("Extration Date: ", this._reportData.sample.extractionDate)],
                                        [PdfUtils.fieldText("Reason: ", this._reportData.sample.reason)]
                                    ]
                                },
                                layout: "headerVerticalBlueLine"
                            },
                        ],
                        [
                            PdfUtils.headerText("2. Patient Personal Details\n"),
                            {
                                table: {
                                    widths: [230],
                                    body: [
                                        [PdfUtils.fieldText("N. Request: ", this._reportData.request.requestNumber)],
                                        [PdfUtils.fieldText("Request Date: ", UtilsNew.dateFormatter(this._reportData.request.requestDate))],
                                        [PdfUtils.fieldText("Dr/Dra: ", ["Octavia Mountain\n", "Nephrology\n", "Hosp. Gen. Sample\n", "61 Washington Parkway\n", "34000\n"])],
                                    ]
                                },
                                layout: "headerVerticalBlueLine"
                            }
                        ],
                    ],
                    margin: [0, 12],
                },
                {
                    stack: [
                        PdfUtils.headerText("3. Study Description\n\n"),
                        {
                            text:
                                "Clinical diagnosis of autosomal dominant polycystic kidney disease (PQRAD)\n",
                            style: "small"
                        },
                        PdfUtils.fieldText("Project: ", this._reportData.study.project),
                        PdfUtils.fieldText("Current Analysis: ", this._reportData.study.currentAnalysis),
                        PdfUtils.fieldText("Gene Priority: ", this._reportData.study.genePriority),
                    ],
                    margin: [0, 10]
                },
                {
                    stack: [
                        {
                            text: "4. Methodoly used\n\n",
                            style: "header"
                        },
                        {
                            text: "4.1. Study Reason \n\n",
                            style: "subheader"
                        },
                        {
                            text: this._reportData.methodology.description,
                            alignment: "justify"
                        },
                    ],
                    margin: [0, 10]
                },
                {
                    stack: [
                        {
                            text: "5. Results",
                            style: "header",
                            margin: [0, 10]
                        },
                        {
                            text: "No reported variants to display (table)\n\n"
                        },
                        PdfUtils.htmlToPdf(this._reportData.results)
                    ],
                    margin: [0, 10]
                },
                // {
                //     stack: [
                //         {
                //             text: "5. Results",
                //             style: "header",
                //             margin: [0, 10]
                //         },
                //         {
                //             text: "No reported variants to display (table)\n\n"
                //         },
                //         {
                //             text:
                //                 "Variante Probablemente Patogénica en Heterocigosis en el gen PKD1.",
                //             bold: true
                //         },
                //         {
                //             text:
                //                 "Variante de Significado Clínico Incierto (VSCI) en Heterocigosis en el gen REN.",
                //             bold: true
                //         },
                //         {
                //             text: "Variantes en Genes Prioritarios:",
                //             bold: true,
                //             margin: [0, 10]
                //         },
                //         {
                //             ol: [
                //                 {
                //                     text: [
                //                         {
                //                             text:
                //                                 "PKD1 (NM_001009944.2): c.9157G>A;p.Ala3053Thr ",
                //                             bold: true
                //                         },
                //                         "(cambio pendiente de confirmación mediante secuenciación Sanger)"
                //                     ]
                //                 },
                //                 {
                //                     text: [
                //                         {
                //                             text:
                //                                 "REN (NM_000537.3): C.928G>; p.Glu310Gln ",
                //                             bold: true
                //                         },
                //                         "(cambio pendiente de confirmación mediante secuenciación Sanger)"
                //                     ]
                //                 }
                //             ],
                //             margin: [0, 10]
                //         },
                //         {
                //             text: [
                //                 {
                //                     text: "Hallazgos Incidentales: ",
                //                     style: "label"
                //                 },
                //                 "Value"
                //             ]
                //         }
                //     ],
                //     margin: [0, 10]
                // },
                {
                    stack: [
                        {
                            text: "6. Interpretation results\n\n",
                            style: "header"
                        },
                        PdfUtils.htmlToPdf(this._reportData.interpretation),
                    ],
                    margin: [0, 10]
                },

                {
                    text: "7. Notes\n\n",
                    style: "header"
                },
                PdfUtils.htmlToPdf(this._reportData.notes),
                {
                    stack: [
                        {
                            text: "Appendix\n\n",
                            style: "header"
                        },
                        {
                            ...PdfUtils.htmlToPdf(this._reportData.appendix),
                            alignment: "justify",
                        }
                    ],
                    margin: [0, 10]
                },
                {
                    columns: [
                        [
                            PdfUtils.fieldText("Responsable Lab Genética Molecular:", this._reportData.clinicalAnalysis.laboratory.responsible),
                            PdfUtils.fieldText("Facultive", this._reportData.clinicalAnalysis.laboratory.facultive.join()),
                            PdfUtils.fieldText("Contacto", this._reportData.clinicalAnalysis.laboratory.email)
                        ],
                        [
                            PdfUtils.fieldText("Validado por", this._reportData.clinicalAnalysis.laboratory.validation),
                            PdfUtils.fieldText("Fecha", UtilsNew.dateFormatter(this._reportData.clinicalAnalysis.laboratory.date)),
                        ]
                    ]
                }
                // {text: "page break -----", pageBreak: "before"},
            ]
        };
        const pdfDocument = new PdfBuilder(docDefinition);
        pdfDocument.open();
    }

    render() {
        if (!this.clinicalAnalysis) {
            return html`
                <loading-spinner></loading-spinner>
            `;
        }

        return html`
            <button type="button" class="btn btn-primary"
                @click="${() => this.onGeneratePDFMake()}">
                Generate PDF (Beta)
            </button>
            <data-form
                .data="${this._reportData}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @submit="${e => this.onRun(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        const SEPARATOR = {
            type: "separator",
            display: {
                style: "border-top: 1px solid lightgrey;",
            },
        };
        const SUBSTITUTIONS_AND_INDELS_TYPES = ["SNV", "MNV", "INDEL"];
        const REARRANGEMENTS_TYPES = ["BREAKEND", "SV", "DUPLICATION", "TANDEM_DUPLICATION", "TRANSLOCATION", "DELETION", "INSERTION", "INVERSION"];
        const COPY_NUMBER_TYPES = ["COPY_NUMBER", "COPY_NUMBER_GAIN", "COPY_NUMBER_LOSS"];

        // Default grid config
        const defaultGridConfig = {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: true,
            showReview: false,
            showActions: false,

            showSelectCheckbox: false,
            multiSelection: false,
            nucleotideGenotype: true,
            alleleStringLengthMax: 10,

            renderLocal: false,

            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom",
            },

            quality: {
                qual: 30,
                dp: 20,
            },
            // populationFrequencies: ["1kG_phase3:ALL", "GNOMAD_GENOMES:ALL", "GNOMAD_EXOMES:ALL", "UK10K:ALL", "GONL:ALL", "ESP6500:ALL", "EXAC:ALL"]
            evidences: {
                showSelectCheckbox: true,
            },
        };

        const titleElement = (title, size = "24") => {
            return {
                text: title,
                type: "title",
                display: {
                    textStyle: `font-size:${size}px;font-weight: bold;`,
                },
            };
        };

        return Types.dataFormConfig({
            id: "clinical-analysis",
            title: "AcademicGenome.SNZ.v4 CONFIDENTIAL FOR RESEARCH PURPOSES ONLY",
            logo: "img/opencb-logo.png",
            icon: "fas fa-user-md",
            buttons: {
                clearText: "Cancel",
                okText: "Save Report",
            },
            display: {
                width: 12,
                buttonsAlign: "right",
                titleWidth: 3,
                titleVisible: true,
                titleStyle: "padding: 20px 5px",
                titleAlign: "left",
                defaultLayout: "horizontal",
                layout: [
                    {
                        id: "",
                        className: "row",
                        display: {
                            style: "background-color: #f3f3f3; border-left: 3px solid #0c2f4c; margin: 16px 0px; padding: 24px",
                        },
                        sections: [
                            {
                                id: "patient-personal",
                                className: "col-md-6"
                            },
                            {
                                id: "request-detail",
                                className: "col-md-6"
                            },
                        ]
                    },
                    {
                        id: "study-description",
                    },
                    {
                        id: "methodology",
                    },
                    {
                        id: "results",
                    },
                    {
                        id: "interpretation",
                    },
                    // {
                    //     id: "variant-detail-annotation-description",
                    // },
                    {
                        id: "notes",
                    },
                    // {
                    //     id: "qc-info",
                    // },
                    // {
                    //     id: "disclaimer"
                    // },
                    {
                        id: "appendix"
                    },
                    {
                        id: "",
                        className: "row",
                        sections: [
                            {
                                id: "responsible-detail",
                                className: "col-md-6"
                            },
                            {
                                id: "validation-detail",
                                className: "col-md-6"
                            },
                        ]
                    },

                ]
            },
            sections: [
                {
                    id: "patient-personal",
                    // title: "1. Patient personal details",
                    display: {
                        // style: "background-color: #f3f3f3; border-left: 3px solid #0c2f4c; margin: 16px 0px; padding: 24px",
                        titleWidth: 4,
                    },
                    elements: [
                        titleElement("1. Patient Personal Details"),
                        {
                            type: "custom",
                            display: {
                                render: data => {
                                    return html`${this.renderIndividualSummary(data)}`;
                                }
                            }
                        }
                    ]
                },
                {
                    id: "request-detail",
                    // title: "2. Diagnostics Request Info and Details",
                    display: {
                        // style: "background-color: #f3f3f3; border-left: 3px solid #0c2f4c; margin: 16px 0px; padding: 24px",
                        titleWidth: 4,
                    },
                    elements: [
                        titleElement("2. Diagnostics Request Info and Details"),
                        {
                            type: "custom",
                            display: {
                                render: data => {
                                    return html`${this.renderDiagnosticSummary(data)}`;
                                }
                            }
                        }
                    ]
                },
                {
                    id: "study-description",
                    // title: "3. Study Description",
                    display: {
                        width: "6"
                    },
                    elements: [
                        titleElement("3. Study Description"),
                        {
                            title: "Study Reason",
                            field: "study.reason",
                            defaultValue: "Testing"
                        },
                        {
                            title: "Project",
                            field: "study.project",
                            defaultValue: "Testing"
                        },
                        {
                            title: "Current Analysis",
                            field: "study.currentAnalysis",
                            defaultValue: "Testing"
                        },
                        {
                            title: "Gene Priority",
                            field: "study.genePriority",
                            type: "custom",
                            display: {
                                render: field => `${field?.join(", ")}`
                            },
                            defaultValue: "Testing"
                        },
                    ]
                },
                {
                    id: "methodology",
                    // title: "4. Methodology used",
                    elements: [
                        titleElement("4. Methodology used"),
                        // titleElement("4.1 Study Reason", "16"),
                        {
                            field: "methodology.description",
                            type: "rich-text",
                            display: {
                                disabled: false
                            }
                        },
                        // {
                        //     field: "methodology.description",
                        //     type: "custom",
                        //     display: {
                        //         render: description => {
                        //             const textClean = description?.replace(/  +/g, " ");
                        //             return html`
                        //             <text-editor
                        //                 .data="${textClean}">
                        //             </text-editor>`;
                        //         }
                        //     },
                        // },

                    ]
                },
                {
                    id: "results", // free text
                    // title: "5. Results",
                    elements: [
                        titleElement("5. Results"),
                        {
                            type: "custom",
                            display: {
                                render: data => {
                                    const variantsReported = data?.caseInterpretation?.primaryFindings?.filter(
                                        variant => variant?.status === "REPORTED");
                                    return UtilsNew.isNotEmptyArray(variantsReported) ?
                                        html`
                                            <variant-interpreter-grid
                                                review
                                                .clinicalAnalysis=${this.clinicalAnalysis}
                                                .clinicalVariants="${variantsReported}"
                                                .opencgaSession="${this.opencgaSession}"
                                                .config=${{
                                            showExport: true,
                                            showSettings: false,
                                            showActions: false,
                                            showEditReview: false,
                                        }
                                            }>
                                            </variant-interpreter-grid>
                                        `:
                                        "No reported variants to display";
                                }
                            }
                        },
                        {
                            field: "results",
                            type: "rich-text",
                            display: {
                                disabled: false
                            }
                        },
                    ]
                },
                {
                    id: "interpretation",
                    // title: "6. Interpretation results",
                    elements: [
                        titleElement("6. Interpretation results"),
                        {
                            field: "interpretation",
                            type: "rich-text",
                            display: {
                                disabled: false
                            }
                        }
                        // {
                        //     title: "",
                        //     display: {
                        //         defaultLayout: "vertical",
                        //     },
                        //     // field: "info.project",
                        //     defaultValue: "'Global Section'"
                        // },
                        // {
                        //     title: "",
                        //     display: {
                        //         defaultLayout: "vertical",
                        //     },
                        //     // field: "info.project",
                        //     defaultValue: "'section for each variant'"
                        // },
                    ]
                },
                {
                    id: "variant-detail-annotation-description",
                    // title: "7. Detailed variant annotation description",
                    elements: [
                        titleElement("7. Detailed variant annotation description"),
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'Population freq and presence in other DB'"
                        },
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'pathogenicity and ACMGstudy'"
                        },
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'Gen implication in the disease'"
                        },
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'Clinical recommendations'"
                        },
                    ]
                },
                {
                    id: "notes",
                    // title: "8. Notes",
                    elements: [
                        titleElement("7. Notes"),
                        {
                            field: "notes",
                            type: "rich-text",
                            display: {
                                disabled: false
                            }
                            // display: {
                            //     render: data => {
                            //         const textClean = UtilsNew.isEmpty(data)? "": data?.replace(/  +/g, " ");
                            //         return html`
                            //         <text-editor
                            //             .data="${textClean}">
                            //         </text-editor>`;
                            //     }
                            // },
                        },
                    ]
                },
                {
                    id: "qc-info",
                    // title: "9. QC info",
                    elements: [
                        titleElement("9. QC info"),
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'Coverage metrics'"
                        },
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'Coverage plots'"
                        },
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'igv plots'"
                        },
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'chromatogram view'"
                        },
                    ]
                },
                {
                    id: "disclaimer",
                    // title: "10. Disclaimer",
                    elements: [
                        titleElement("10. Disclaimer"),
                        {
                            title: "",
                            // field: "info.project",

                            type: "text",
                            display: {
                                defaultLayout: "vertical",
                            },
                            text: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
                            printer took a galley of type and scrambled it to make a type specimen book. It has survived not
                            only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
                            and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`
                        },
                    ]
                },
                {
                    id: "appendix",
                    // title: "Appendix",
                    elements: [
                        titleElement("Appendix"),
                        {
                            field: "appendix",
                            type: "rich-text",
                            display: {
                                disabled: false
                            }
                        }
                    ]
                },
                {
                    id: "responsible-detail",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: data => {
                                    return html `
                                    <p><b>${data?.clinicalAnalysis?.laboratory?.name}</b> ${data.clinicalAnalysis?.laboratory.responsible}</p>
                                    <p><b>Fac:</b> ${data?.clinicalAnalysis?.laboratory?.facultive?.join()}</p>
                                    <p><b>Contacto:</b> ${data?.clinicalAnalysis?.laboratory?.email}</p>
                                    `;
                                }
                            },
                        }
                    ],
                },
                {
                    id: "validation-detail",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: data => {
                                    return html`
                                        <p><b>Validado por:</b> ${data?.clinicalAnalysis?.laboratory.validation}</p>
                                        <p><b>Fecha de:</b> ${UtilsNew.dateFormatter(data?.clinicalAnalysis?.laboratory.date)}</p>
                                        `;
                                }
                            }
                        }
                    ]
                },

            ]
        });
    }

}

customElements.define("case-sms-report", CaseSmsReport);
