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
import PdfBuilder from "../../../core/pdf-builder.js";
import PdfUtils from "../../commons/utils/pdf-utils.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import "./variant-interpreter-grid.js";
import "./variant-interpreter-rearrangement-grid.js";
import "../../commons/forms/data-form.js";
import "../../commons/simple-chart.js";
import "../../loading-spinner.js";
import "../../file/file-preview.js";
import "../../file/file-upload-beta.js";

import "../../commons/html-viewer.js";


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
        this._reportJson = {};
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

    postUpdate(response) {
        // NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
            message: "Saved successfully",
        });

        // Reset values after success update
        this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
        this._config = this.getDefaultConfig();

        LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
            id: this.clinicalAnalysis.interpretation.id, // maybe this not would be necessary
            clinicalAnalysis: this.clinicalAnalysis
        });

        this.requestUpdate();
    }

    notifyError(response) {
        if (typeof response == "string") {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                message: response
            });
        } else {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
        }
        console.error("An error occurred saving report: ", response);
    }

    // It might not need to be a component.
    openUploadModal() {
        console.log("Open modal");
        this.openModalTest = true;
        this.requestUpdate();
    }

    // pdfMake
    onGeneratePDFMake(download, data) {
        const docDefinition = {
            watermark: {text: "Draft Report", color: "blue", opacity: 0.3, bold: true, italics: false},
            content: [
                PdfUtils.titleText(
                    "INFORME GENÉTICO", {
                        bold: true,
                        alignment: "center"
                    }),
                {
                    columns: [
                        [
                            PdfUtils.headerText("1. Datos Personales del Paciente\n"),
                            {
                                table: {
                                    widths: [230],
                                    body: [
                                        [PdfUtils.fieldText("Nombre: ", this._reportData.patient.name)],
                                        [PdfUtils.fieldText("Apellidos: ", this._reportData.patient.lastName)],
                                        [PdfUtils.fieldText("Fecha Nacimiento: ", UtilsNew.dateFormatter(this._reportData.patient.birthDate))],
                                        [PdfUtils.fieldText("Edad: ", this._reportData.patient.age)],
                                        [PdfUtils.fieldText("Código Sistema Salud: ", this._reportData.patient.cipa)],
                                        [PdfUtils.fieldText("Tipo de Mustra: ", this._reportData.clinicalAnalysis.sample.type)],
                                        [PdfUtils.fieldText("Fecha de Extracción: ", this._reportData.clinicalAnalysis.sample.extractionDate)],
                                        [PdfUtils.fieldText("Razón Extracción: ", this._reportData.clinicalAnalysis.sample.reason)]
                                    ]
                                },
                                layout: "headerVerticalBlueLine"
                            },
                        ],
                        [
                            PdfUtils.headerText("2. Datos Personales del Paciente\n"),
                            {
                                table: {
                                    widths: [230],
                                    body: [
                                        [PdfUtils.fieldText("N. Petición: ", this._reportData.clinicalAnalysis.request.id)],
                                        [PdfUtils.fieldText("Fecha de Petición: ", UtilsNew.dateFormatter(this._reportData.clinicalAnalysis.sample.requestDate))],
                                        [PdfUtils.fieldText("Dr/Dra: ", ["nombre_doctor\n", "Unidad\n", "Nombre del hopital\n", "direction del hopital\n", "CP del hospital\n"])],
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
                        PdfUtils.headerText("3. Descripción del Estudio\n\n"),
                        PdfUtils.fieldText("Razón del Estudio: ", this._reportData.study.reason),
                        PdfUtils.fieldText("Projecto: ", this._reportData.study.project),
                        PdfUtils.fieldText("Análisis: ", this._reportData.study.currentAnalysis),
                        PdfUtils.fieldText("Genes Prioritarios: ", this._reportData.study.genePriority),
                    ],
                    margin: [0, 10]
                },
                {
                    stack: [
                        {
                            text: "4. Metodologia Empleada\n\n",
                            style: "header"
                        },
                        PdfUtils.htmlToPdf(this._reportData.study.method.description?.replaceAll("h2", "b")),
                    ],
                    margin: [0, 10]
                },
                {
                    stack: [
                        {
                            text: "5. Resultados",
                            style: "header",
                            margin: [0, 10]
                        },
                        {
                            text: "No se than encontrado variants para mostrar (tabla)\n\n"
                        },
                        PdfUtils.htmlToPdf(this._reportData.mainResults.templateResult + " " + this._reportData.mainResults.summaryResult)
                    ],
                    margin: [0, 10]
                },
                {
                    stack: [
                        {
                            text: "6. Interpretación de Resultados\n\n",
                            style: "header"
                        },
                        PdfUtils.htmlToPdf(this._reportData.interpretation ?? ""),
                    ],
                    margin: [0, 10]
                },
                {
                    text: "7. Notas\n\n",
                    style: "header"
                },
                PdfUtils.htmlToPdf(this._reportData.notes ?? ""),
                {
                    stack: [
                        {
                            text: "Apéndice\n\n",
                            style: "header"
                        },
                        {
                            ...PdfUtils.htmlToPdf(this._reportData?.appendix?? ""),
                            // alignment: "justify", // if the content is empty this will crash
                        }
                    ],
                    margin: [0, 10]
                },
                {
                    columns: [
                        [
                            PdfUtils.fieldText("Responsable Lab Genética Molecular:", this._reportData.clinicalAnalysis.lab?.responsible),
                            PdfUtils.fieldText("Facultive", this._reportData.clinicalAnalysis.lab?.facultative.join(",")),
                            PdfUtils.fieldText("Contacto", this._reportData.clinicalAnalysis.lab?.email)
                        ],
                        [
                            PdfUtils.fieldText("Validado por", this._reportData.clinicalAnalysis.lab?.validation),
                            PdfUtils.fieldText("Fecha", UtilsNew.dateFormatter(this._reportData.clinicalAnalysis.lab?.date)),
                        ]
                    ]
                }
                // {text: "page break -----", pageBreak: "before"},
            ]
        };
        const pdfDocument = new PdfBuilder(docDefinition);
        if (download) {
            pdfDocument.pdfBlob(blob => {
                // aprroach #1
                let status = "Start";
                const file = new File([blob], data.name, {type: blob.type});
                data.file = file;
                console.log("Uploading....", data);
                // new Approach #2 in progress
                // const file = new File([blob], "testing_pdfFileExample_3.pdf", {type: blob.type});
                // const formData = new FormData();
                // formData.append("file", file);
                // Object.keys(data).forEach(key => formData.append(key, data[key]));
                this.opencgaSession.opencgaClient.files()
                    .upload(data)
                    .then(response => {
                        console.log("Uploaded file....", response);
                        status = "DONE";
                    })
                    .catch(reason =>{
                        console.log("Error:", reason);
                        status = "FAIL";
                    })
                    .finally(()=>{
                        const fileUploaded = {
                            path: "/",
                            fileName: data.name,
                            upload_status: status,
                            sample: "",
                            description: data.description,
                            title: "",
                            tag: "",
                            comments: []
                        };
                        let reportTestData = this.clinicalAnalysis?.interpretation?.attributes?.reportTest;
                        reportTestData = {
                            ...reportTestData,
                            report_files: reportTestData?.report_files? [...reportTestData?.report_files, fileUploaded] : [fileUploaded],
                        };
                        this.opencgaSession.opencgaClient.clinical()
                            .updateInterpretation(this.clinicalAnalysis.id, this.clinicalAnalysis.interpretation.id,
                                {"attributes": {"reportTest": reportTestData}}, {study: this.opencgaSession.study.fqn})
                            .then(response => {
                                this.postUpdate(response);
                                console.log("Saved Attributes");
                            })
                            .catch(response => {
                                console.log("Error Attributes", response);
                                // In this scenario notification does not raise any errors because none of the conditions shown in notificationManager.response are present.
                                this.notifyError(response);
                            });
                    });
            });
        } else {
            pdfDocument.open();
        }
    }

    initGenerateJsonA(reportData) {
        const {
            patient, notes, study, interpretations, clinicalAnalysis, mainResults,
        } = reportData;
        const patientElements = {
            name: {
                label: "Nombre",
                content: patient?.name
            },
            lastName: {
                label: "Apellidos",
                content: patient?.lastName
            },
            birth: {
                label: "Fecha de Nacimiento",
                content: UtilsNew.dateFormatter(patient?.birthDate)
            },
            age: {
                label: "Edad",
                content: patient?.age
            },
            ssn: {
                label: "Código Sistema de Salud",
                content: patient?.cipa
            },
            typeSample: {
                label: "Tipo de Muestra",
                content: clinicalAnalysis.sample?.type
            },
            extractionDate: {
                label: "Fecha de Extracción",
                content: patient?.name
            },
            reason: {
                label: "Motivo",
                content: clinicalAnalysis.sample.reason
            }
        };
        const doctorInfo = field => `
            <p>${field?.name?? ""}</p>
            <p>${field?.specialization?? ""}</p>
            <p>${field?.hospitalName?? ""}</p>
            <p>${field?.address?? ""}</p>
            <p>${field?.code??""}</p>
        `;
        const clinicalElements = {
            requestId: {
                label: "N. Petición",
                content: clinicalAnalysis.request?.id
            },
            requestDate: {
                label: "Fecha de Petición",
                content: clinicalAnalysis.sample?.requestDate
            },
            doctor: {
                label: "Fecha de Petición",
                content: doctorInfo(clinicalAnalysis.request?.doctor)
            },
        };

        const fieldTextTemplate = element => `<label><b>${element?.label ?? ""}</b></label> <span>${element?.content}</span><br/>`;
        const boxTemplate = (id, elements, classes) => `<div class='${classes ?? ""}' id='${id}'>${Object.keys(elements).map(key => fieldTextTemplate(elements[key])).join("")}</div>`;
        const studyElements = {
            reason: {
                label: "Razón del Estudio",
                content: study.description
            },
            project: {
                label: "Proyecto",
                content: study.project
            },
            analyst: {
                label: "Análisis",
                content: study.currentAnalysis
            },
            genePriority: {
                label: "Genes Prioritarios",
                content: study.genePriority
            }
        };
        const methodologyHtml = this._reportData.study.method.description?.replaceAll("h2", "b");
        const resultsHtml = `<div>${mainResults.templateResult}</div><div>${mainResults.summaryResult}</div>`;

        const primaryFindingReported = this._clinicalAnalysis?.interpretation?.primaryFindings?.filter(
            primaryFinding => primaryFinding?.status === "REPORTED");
        const variantsReported = interpretations.variants.filter(variant => primaryFindingReported.findIndex(primaryFinding => primaryFinding.id === variant.id) > -1);
        const variantsHtml = variantsReported
            .map(variant => `<div id='${variant.id}'>${interpretations._variantsKeys?.map(key => variant[key]).join(" ")}</div>`).join("");
        const interpretationsHtml = `<div id='intro'>${interpretations.intro}</div>${variantsHtml}`;
        const variantElements = variantsReported
            .map(variant => ({
                label: variant.title,
                content: `<div id='${variant.id}'>${interpretations._variantsKeys?.map(key => variant[key]).join(" ")}</div>`
            }));

        const signsElements = {
            responsible: {
                label: "Responsable Lab Genética Molecular",
                content: clinicalAnalysis?.lab?.responsible
            },
            facultive: {
                label: "Facultivos",
                content: clinicalAnalysis?.lab?.facultative.join()
            },
            contact: {
                label: "Responsable Lab Genética Molecular",
                content: clinicalAnalysis?.lab?.email
            },
            validation: {
                label: "Validado por",
                content: clinicalAnalysis?.lab?.validation
            },
            date: {
                label: "Fecha",
                content: clinicalAnalysis?.lab?.date
            },
        };

        const _jsonReport =
            {
                "_wantedKeys": [
                    "patient",
                    "clinical",
                    "study",
                    "method",
                    "results",
                    "interpretations",
                    "technicalNotes",
                    "coverage"
                ],
                "_metadata": {
                    "author": this.opencgaSession.user?.id,
                    "date": UtilsNew.getDatetime()
                },
                "_style": `
                    .container-grid {
                        display:grid;
                        grid-template-columns: 1fr 1fr;
                        grid-gap: 10px;
                    }

                    .box-blue-line {
                        background-color:#f3f3f3;
                        border-left: 4px solid #0c2f4c;
                        padding:16px;
                    }
                `,
                "_header": "Informe Genético",
                "patient": {
                    "_wantedElements": Object.keys(patientElements),
                    "title": "Datos Personales del Paciente",
                    "summary": "",
                    "elements": {...patientElements},
                    "htmlRendered": boxTemplate("patient", patientElements, "box-blue-line")
                },
                "clinical": {
                    "_wantedElements": Object.keys(clinicalElements),
                    "title": "Información y detalles de la solicitud de diagnóstico",
                    "summary": "",
                    "elements": {...clinicalElements},
                    "htmlRendered": boxTemplate("clinical", clinicalElements, "box-blue-line")
                },
                "study": {
                    "_wantedElements": Object.keys(studyElements),
                    "title": "Descripción del estudio",
                    "summary": "",
                    "elements": {...studyElements},
                    "htmlRendered": boxTemplate("study", studyElements)
                },
                "method": {
                    "title": "Metodología empleada",
                    "content": methodologyHtml,
                    "htmlRendered": methodologyHtml
                },
                "results": {
                    "title": "Resultado",
                    "content": resultsHtml,
                    "htmlRendered": resultsHtml
                },
                "interpretations": {
                    "title": "Interpretacion",
                    "summary": "",
                    "elements": variantElements,
                    "htmlRendered": interpretationsHtml
                },
                "technicalNotes": {
                    "title": "Notas",
                    "content": notes,
                    "htmlRendered": notes
                },
                "coverage": {
                    "title": "Estadística de cobertura",
                    "content": ""
                },
                "appendix": {
                    "_wantedKeys": [],
                    "coverageMetrics": "",
                    "qc": "",
                    "otherVariants": ""
                },
                "signs": {
                    "_wantedElements": Object.keys(signsElements),
                    "title": "",
                    "summary": "",
                    "elements": {...signsElements},
                    "htmlRendered": boxTemplate("signs", signsElements)
                },
            };

        _jsonReport.htmlRendered = this.generateReportHtml(_jsonReport);
        return _jsonReport;
    }

    initGenerateJsonB(reportData) {
        const {
            patient, notes, study, interpretations, clinicalAnalysis, mainResults,
        } = reportData;
        const patientElements = {
            name: {
                label: "Nombre",
                content: patient?.name
            },
            lastName: {
                label: "Apellidos",
                content: patient?.lastName
            },
            birth: {
                label: "Fecha de Nacimiento",
                content: UtilsNew.dateFormatter(patient?.birthDate)
            },
            age: {
                label: "Edad",
                content: patient?.age
            },
            ssn: {
                label: "Código Sistema de Salud",
                content: patient?.cipa
            },
            typeSample: {
                label: "Tipo de Muestra",
                content: clinicalAnalysis.sample?.type
            },
            extractionDate: {
                label: "Fecha de Extracción",
                content: patient?.name
            },
            reason: {
                label: "Motivo",
                content: clinicalAnalysis.sample.reason
            }
        };
        const doctorInfo = field => `
            <p>${field?.name?? ""}</p>
            <p>${field?.specialization?? ""}</p>
            <p>${field?.hospitalName?? ""}</p>
            <p>${field?.address?? ""}</p>
            <p>${field?.code??""}</p>
        `;
        const clinicalElements = {
            requestId: {
                label: "N. Petición",
                content: clinicalAnalysis.request?.id
            },
            requestDate: {
                label: "Fecha de Petición",
                content: clinicalAnalysis.sample?.requestDate
            },
            doctor: {
                label: "Fecha de Petición",
                content: doctorInfo(clinicalAnalysis.request?.doctor)
            },
        };

        const fieldTextTemplate = element => `<label><b>${element?.label ?? ""}</b></label> <span>${element?.content}</span><br/>`;
        const boxTemplate = (id, elements, classes) => `<div class='${classes ?? ""}' id='${id}'>${Object.keys(elements).map(key => fieldTextTemplate(elements[key])).join("")}</div>`;
        const studyElements = {
            reason: {
                label: "Razón del Estudio",
                content: study.description
            },
            project: {
                label: "Proyecto",
                content: study.project
            },
            analyst: {
                label: "Análisis",
                content: study.currentAnalysis
            },
            genePriority: {
                label: "Genes Prioritarios",
                content: study.genePriority
            }
        };
        const methodologyHtml = this._reportData.study.method.description?.replaceAll("h2", "b");
        const resultsHtml = `<div>${mainResults.templateResult}</div><div>${mainResults.summaryResult}</div>`;

        const primaryFindingReported = this._clinicalAnalysis?.interpretation?.primaryFindings?.filter(
            primaryFinding => primaryFinding?.status === "REPORTED");
        const variantsReported = interpretations.variants.filter(variant => primaryFindingReported.findIndex(primaryFinding => primaryFinding.id === variant.id) > -1);
        const variantsHtml = variantsReported
            .map(variant => `<div id='${variant.id}'>${interpretations._variantsKeys?.map(key => variant[key]).join(" ")}</div>`).join("");
        const interpretationsHtml = `<div id='intro'>${interpretations.intro}</div>${variantsHtml}`;
        const variantElements = variantsReported
            .map(variant => ({
                label: variant.title,
                content: `<div id='${variant.id}'>${interpretations._variantsKeys?.map(key => variant[key]).join(" ")}</div>`
            }));

        const signsElements = {
            responsible: {
                label: "Responsable Lab Genética Molecular",
                content: clinicalAnalysis?.lab?.responsible
            },
            facultive: {
                label: "Facultivos",
                content: clinicalAnalysis?.lab?.facultative.join()
            },
            contact: {
                label: "Responsable Lab Genética Molecular",
                content: clinicalAnalysis?.lab?.email
            },
            validation: {
                label: "Validado por",
                content: clinicalAnalysis?.lab?.validation
            },
            date: {
                label: "Fecha",
                content: clinicalAnalysis?.lab?.date
            },
        };

        const _jsonReport =
            {
                "_wantedKeys": [
                    "patient",
                    "clinical",
                    "study",
                    "method",
                    "results",
                    "interpretations",
                    "technicalNotes",
                    "coverage"
                ],
                "_metadata": {
                    "author": this.opencgaSession.user?.id,
                    "date": UtilsNew.getDatetime()
                },
                "_style": `
                    .container-grid {
                        display:grid;
                        grid-template-columns: 1fr 1fr;
                        grid-gap: 10px;
                    }

                    .box-blue-line {
                        background-color:#f3f3f3;
                        border-left: 4px solid #0c2f4c;
                        padding:16px;
                    }
                `,
                "_header": "Informe Genético",
                "patient": {
                    "_wantedElements": Object.keys(patientElements),
                    "title": "Datos Personales del Paciente",
                    "summary": "",
                    "elements": {...patientElements},
                    "htmlRendered": boxTemplate("patient", patientElements, "box-blue-line")
                },
                "clinical": {
                    "_wantedElements": Object.keys(clinicalElements),
                    "title": "Información y detalles de la solicitud de diagnóstico",
                    "summary": "",
                    "elements": {...clinicalElements},
                    "htmlRendered": boxTemplate("clinical", clinicalElements, "box-blue-line")
                },
                "study": {
                    "_wantedElements": Object.keys(studyElements),
                    "title": "Descripción del estudio",
                    "summary": "",
                    "elements": {...studyElements},
                    "htmlRendered": boxTemplate("study", studyElements)
                },
                "method": {
                    "title": "Metodología empleada",
                    "content": methodologyHtml,
                    "htmlRendered": methodologyHtml
                },
                "results": {
                    "title": "Resultado",
                    "content": resultsHtml,
                    "htmlRendered": resultsHtml
                },
                "interpretations": {
                    "title": "Interpretacion",
                    "summary": "",
                    "elements": variantElements,
                    "htmlRendered": interpretationsHtml
                },
                "technicalNotes": {
                    "title": "Notas",
                    "content": notes,
                    "htmlRendered": notes
                },
                "coverage": {
                    "title": "Estadística de cobertura",
                    "content": ""
                },
                "appendix": {
                    "_wantedKeys": [],
                    "coverageMetrics": "",
                    "qc": "",
                    "otherVariants": ""
                },
                "signs": {
                    "_wantedElements": Object.keys(signsElements),
                    "title": "",
                    "summary": "",
                    "elements": {...signsElements},
                    "htmlRendered": boxTemplate("signs", signsElements)
                },
            };

        _jsonReport.htmlRendered = this.generateReportHtmlB(_jsonReport);
        return _jsonReport;
    }

    generateReportHtml(reportJson) {
        const sectionTemplateHtml = section => `<section><h2>${section?.title}</h2>${section?.htmlRendered?? ""}</section>`;
        const content = `
            <style>${reportJson._style}</style>
                <h1 style="text-align:center">
                    ${reportJson._header}
                </h1>
                <div style="transform:scale(0.9)">
                    <div class="container-grid">
                    ${reportJson._wantedKeys.filter(key => key == "patient" || key == "clinical").map(key => `${sectionTemplateHtml(reportJson[key])}`).join("")}
                    </div>
                    ${reportJson._wantedKeys.filter(key => key !== "patient" && key !== "clinical").map(key => `${sectionTemplateHtml(reportJson[key])}`).join("")}
                </div>
        `;
        return content;
    }

    generateReportHtmlB(reportJson) {
        const sectionTemplateHtml = section => `<section><h2>${section?.title}</h2>${section?.htmlRendered?? ""}</section>`;
        const content = `
            <style>${reportJson._style}</style>
                <h1 style="text-align:center">
                    ${reportJson._header}
                </h1>
                <div style="transform:scale(0.9)">
                    <div class="container-grid">
                    ${reportJson._wantedKeys.filter(key => key == "patient" || key == "clinical").map(key => `${sectionTemplateHtml(reportJson[key])}`).join("")}
                    </div>
                    ${reportJson._wantedKeys.filter(key => key !== "patient" && key !== "clinical").map(key => `${sectionTemplateHtml(reportJson[key])}`).join("")}
                </div>
        `;
        return content;
    }

    onSaveJsonReport() {
        const _reportJson = this.initGenerateJson(this._reportData);
        this._reportData = {
            ...this._reportData,
            _report: [...this._reportData?._report, _reportJson]
        };
        console.log("Attributes:", this._reportData);
        this.opencgaSession.opencgaClient.clinical()
            .updateInterpretation(this.clinicalAnalysis.id, this.clinicalAnalysis.interpretation.id,
                {"attributes": {"reportTest": this._reportData}}, {study: this.opencgaSession.study.fqn})
            .then(response => {
                this.postUpdate(response);
                console.log("Saved Attributes");
            })
            .catch(response => {
                console.log("Error Attributes", response);
                // In this scenario notification does not raise any errors because none of the conditions shown in notificationManager.response are present.
                this.notifyError(response);
            });
    }

    previewHtmlReport(template) {
        switch (template) {
            case "A":
                this._reportJson = this.initGenerateJsonA(this._reportData);
                break;
            case "sanger":
                this._reportJson = this.initGenerateJsonB(this._reportData);
                break;
        }

        this.openNav();
        this.requestUpdate();
    }


    openNav() {
        document.getElementById("mySidenav-right").style.width = "40%";
    }

    closeNav() {
        document.getElementById("mySidenav-right").style.width = "0";
    }

    renderSideNavReport() {
        const sideNavStyles = html `
            <style>
                body {
                    transition: background-color .5s;
                }

                .sidenav-right {
                    height: 100%;
                    width: 0;
                    position: fixed;
                    z-index: 1;
                    top: 0;
                    right: 0;
                    background-color: #fff;
                    overflow-x: hidden;
                    transition: 0.5s;
                    /* padding-top: 60px; */
                    box-shadow: 5px 10px 18px #888888;
                }

                .sidenav-right a {
                    padding: 8px 8px 8px 32px;
                    text-decoration: none;
                    font-size: 25px;
                    color: #818181;
                    display: block;
                    transition: 0.3s;
                }

                .sidenav-right a:hover {
                    color: #f1f1f1;
                }

                .sidenav-right .closebtn {
                    position: absolute;
                    top: 0;
                    right: 25px;
                    font-size: 36px;
                    margin-right: 50px;
                }

                .item-center {
                    display:flex;
                    justify-content: center;
                    align-items: center;
                    gap:2px;
                }

                @media screen and (max-height: 450px) {
                    .sidenav-right {padding-top: 15px;}
                    .sidenav-right a {font-size: 18px;}
                }
            </style>
        `;
        return html `
            ${sideNavStyles}
            <div id="mySidenav-right" class="sidenav-right">
                <a href="javascript:void(0)" class="closebtn" @click="${this.closeNav}">&times;</a>
                    <html-viewer
                        .contentHtml="${this._reportJson.htmlRendered}">
                    </html-viewer>
            </div>
        `;
    }

    render() {
        if (!this.clinicalAnalysis) {
            return html`
                <loading-spinner></loading-spinner>
            `;
        }

        return html`
            <div style="display:flex;gap:2px">
                <button type="button" class="btn btn-primary"
                @click="${() => this.onGeneratePDFMake()}">
                Generate PDF (Beta)
                </button>
                <button type="button" class="btn btn-primary"
                    @click="${() => this.openUploadModal()}">
                    Saved PDF (Beta)
                </button>
                <button type="button" class="btn btn-primary"
                    @click="${() => this.onSaveJsonReport()}">
                    Save Json Report (Beta)
                </button>
                <div class="dropdown">
                    <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">Preview html (Beta)
                        <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu" style="cursor:pointer">
                        <li><a @click="${() => this.previewHtmlReport("A")}">Plantilla A</a></li>
                        <li><a @click="${() => this.previewHtmlReport("sanger")}">Plantilla Sanger</a></li>
                    </ul>
                </div>
            </div>

            ${this.renderSideNavReport()}
            <data-form
                .data="${this._reportData}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @submit="${e => this.onRun(e)}">
            </data-form>
            <file-upload-beta
                .data="${this._clinicalAnalysis}"
                .opencgaSession="${this.opencgaSession}"
                ?openModal="${this.openModalTest}"
                @onUploadFile="${e => this.onGeneratePDFMake(true, e.detail.value)}"
                @onCloseModal="${() => {
            this.openModalTest = false;
            this.requestUpdate();
        }}">
            </file-upload-beta>
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
                    elements: [
                        titleElement("4. Methodology used"),
                        // titleElement("4.1 Study Reason", "16"),
                        {
                            field: "study.method.description",
                            type: "rich-text",
                            display: {
                                disabled: false
                            }
                        },
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
                                    const variantsReported = this.clinicalAnalysis?.interpretation?.primaryFindings?.filter(
                                        variant => variant?.status === "REPORTED");
                                    return UtilsNew.isNotEmptyArray(variantsReported) ?
                                        html`
                                            <variant-interpreter-grid
                                                review
                                                .clinicalAnalysis=${this.clinicalAnalysis}
                                                .clinicalVariants="${variantsReported}"
                                                .opencgaSession="${this.opencgaSession}"
                                                .config=${{
                                            showExport: false,
                                            showSettings: false,
                                            showActions: false,
                                            showEditReview: false,
                                            detailView: false,
                                        }
                                            }>
                                            </variant-interpreter-grid>
                                        `:
                                        "No reported variants to display";
                                }
                            }
                        },
                        {
                            field: "mainResults",
                            type: "custom",
                            display: {
                                disabled: false,
                                preview: true,
                                render: data => {
                                    const resultContent = (data?.templateResult ?? "") + "" + (data?.resultsSummary ?? "");
                                    return html`
                                    <rich-text-editor
                                        .data="${resultContent}"
                                        .config="${{
                                        disabled: false,
                                        preview: true,
                                    }}">
                                    </rich-text-editor>
                                    `;
                                }
                            }
                        },
                    ]
                },
                {
                    id: "interpretation",
                    // title: "6. Interpretation results",
                    elements: [
                        titleElement("6. Interpretation results"),
                        // {
                        //     field: "interpretation",
                        //     type: "rich-text",
                        //     display: {
                        //         disabled: false
                        //     }
                        // },
                        {
                            field: "interpretations",
                            type: "custom",
                            display: {
                                disabled: false,
                                preview: true,
                                render: interpretations => {
                                    const primaryFindingReported = this._clinicalAnalysis?.interpretation?.primaryFindings?.filter(
                                        primaryFinding => primaryFinding?.status === "REPORTED");
                                    const variantsReported = interpretations.variants.filter(variant => primaryFindingReported.findIndex(primaryFinding => primaryFinding.id === variant.id) > -1);
                                    const variantsHtml = variantsReported
                                        .map(variant => `<b>${variant.title}</b></br><div id='${variant.id}'>${interpretations._variantsKeys?.map(key => variant[key]).join(" ")}</div>`).join("");
                                    const interpretationsHtml = `<div id='intro'>${interpretations.intro}</div>${variantsHtml}`;
                                    return html`
                                    <rich-text-editor
                                        .data="${interpretationsHtml}"
                                        .config="${{
                                        disabled: false,
                                        preview: true,
                                    }}">
                                    </rich-text-editor>
                                    `;
                                }
                            }
                        },
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
                                    <p><b>${data?.clinicalAnalysis?.lab?.name}</b> ${data.clinicalAnalysis?.lab?.responsible}</p>
                                    <p><b>Fac:</b> ${data?.clinicalAnalysis?.lab?.facultative?.join()}</p>
                                    <p><b>Contacto:</b> ${data?.clinicalAnalysis?.lab?.email}</p>
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
                                        <p><b>Validado por:</b> ${data?.clinicalAnalysis?.lab?.validation}</p>
                                        <p><b>Fecha de:</b> ${UtilsNew.dateFormatter(data?.clinicalAnalysis?.lab?.date)}</p>
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
