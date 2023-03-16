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

import {html, LitElement} from "lit";

import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import "./clinical-analysis-comment-editor.js";
import "./filters/clinical-priority-filter.js";
import "./filters/clinical-flag-filter.js";
import "../commons/forms/data-form.js";
import "../commons/filters/disease-panel-filter.js";
import "../file/file-create.js";
import {construction} from "../commons/under-construction.js";
import Types from "../commons/types";

// WIP: Form BETA
export default class ClinicalAnalysisReportUpdate extends LitElement {

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
                type: Object,
            },
            clinicalAnalysisId: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            }
        };
    }

    #init() {
        this.clinicalAnalysis = {};
        this.clinicalAnalysisId = "";

        this.displayConfig = {
            titleWidth: 3,
            width: 8,
            titleVisible: false,
            defaultLayout: "horizontal",
            buttonsVisible: true,
            buttonsWidth: 8,
            buttonsAlign: "right",
        };
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
        super.update(changedProperties);
    }

    clinicalAnalysisObserver() {
        // this.disordersAllowedValues = (this.clinicalAnalysis?.proband?.disorders?.length > 0) ?
        //     this.clinicalAnalysis?.proband?.disorders?.map(disorder => disorder.id) :
        //     [];
    }

    clinicalAnalysisIdObserver(e) {
        this.clinicalAnalysis = e.detail.value;
    }

    opencgaSessionObserver() {
        this.users = OpencgaCatalogUtils.getUsers(this.opencgaSession.study);
    }

    render() {
        return html`
            <opencga-update
                .resource="${"CLINICAL_ANALYSIS"}"
                .component="${this.clinicalAnalysis}"
                .componentId="${this.clinicalAnalysisId}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}"
                @componentIdObserver="${this.clinicalAnalysisIdObserver}">
            </opencga-update>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "tabs",
            display: {
                buttonsVisible: false,
                buttonOkText: "Save",
                buttonClearText: ""
            },
            sections: [
                {
                    id: "variantReport",
                    title: "Variant",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        {
                            field: "attributes.clinicalReport.variant",
                            type: "rich-text",
                            display: {
                                preview: false,
                            }
                        },
                    ]
                },
                {
                    id: "bibliographyEvidencesReport",
                    title: "Bibliography Evidences",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        {
                            field: "attributes.clinicalReport.bibliographyEvidences",
                            type: "rich-text",
                            display: {
                                preview: false,
                            }
                        },
                    ]
                },
                {
                    id: "classificationReport",
                    title: "Classification",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        {
                            field: "attributes.clinicalReport.classification",
                            type: "rich-text",
                            display: {
                                preview: false,
                            }
                        },
                    ]
                },
                {
                    id: "populationReport",
                    title: "Population",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        {
                            field: "attributes.clinicalReport.population",
                            type: "rich-text",
                            display: {
                                preview: false,
                            }
                        },
                    ]
                },
                {
                    id: "diseaseAssociationReport",
                    title: "Disease Association",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        {
                            field: "attributes.clinicalReport.diseaseAssociation",
                            type: "rich-text",
                            display: {
                                preview: false,
                            }
                        },
                    ]
                },
                {
                    id: "recommendationsReport",
                    title: "Recommendations",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        {
                            field: "attributes.clinicalReport.recommendations",
                            type: "rich-text",
                            display: {
                                preview: false,
                            }
                        },
                    ]
                },
                {
                    id: "otherReports",
                    title: "Other",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: true,
                    },
                    elements: [
                        {
                            field: "attributes.clinicalReport.other",
                            type: "rich-text",
                            display: {
                                preview: false,
                            }
                        },
                    ]
                },
                {
                    id: "uploadReport",
                    title: "Upload files",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: false,
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                placeholder: "e.g. Homo sapiens, ...",
                                render: (clinicalAnalysis, dataFormFilterChange) => html`
                                    <file-create
                                        .data="${clinicalAnalysis}"
                                        .opencgaSession="${this.opencgaSession}">
                                    </file-create>`
                            },
                        },
                    ]
                },
                {
                    id: "previewReports",
                    title: "Preview",
                    display: {
                        titleStyle: "display:none",
                        buttonsVisible: false,
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: () => html `
                                    ${construction}`
                            }
                        },
                    ]
                },
            ]
        });
    }

}

customElements.define("clinical-analysis-report-update", ClinicalAnalysisReportUpdate);
