/*
 * Copyright 2015-2023 OpenCB
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


import "./clinical-analysis-comment-editor.js";
import "./filters/clinical-priority-filter.js";
import "./filters/clinical-flag-filter.js";
import "../commons/forms/data-form.js";
import "../commons/filters/disease-panel-filter.js";
import "../file/file-create.js";
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
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
            variantReview: {
                type: Object,
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
        this.clinicalAnalysisId = "";
        this._clinicalAnalysis = {};
        this._config = this.getDefaultConfig();
        this.displayConfig = {
            titleWidth: 3,
            width: 8,
            titleVisible: false,
            defaultLayout: "horizontal",
            buttonsVisible: true,
            buttonsWidth: 8,
            buttonsAlign: "right",
        };
        this.variantAttribute = {};
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
        super.update(changedProperties);
    }

    onFieldChange(e, field) {
        // variant, Bibliography Evidences, Classification, Population,
        // Disease Association, Recommendations, Other...
        const param = field || e.detail.param;
        if (param.includes("attributes")) {
            UtilsNew.setObjectValue(this.variantAttribute, param, e.detail.value);
        }

    }

    clinicalAnalysisObserver() {
        this._clinicalAnalysis = UtilsNew.objectClone(this.clinicalAnalysis);
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    submitReportVariant() {
        // variantID, variantTitle*
        // interpretations[].interpretationId.variants[]
        // variantTitle: variantId hgvs

        const reportTest = {...this._clinicalAnalysis.interpretation.attributes?.reportTest};
        this.variantAttribute.variantId = this.variantReview.id;
        // check reportTest, interpretations and variants
        if (reportTest && reportTest?.interpretations) {
            const interpretationIndex = reportTest.interpretations.findIndex(interpretation => interpretation.id == this._clinicalAnalysis.interpretation.id);
            if (reportTest?.interpretations[interpretationIndex].variants) {
                const variantIndex = reportTest.interpretations[interpretationIndex]
                    .variants.findIndex(variant => variant.id === this.variantReview.id);
                reportTest.interpretations[interpretationIndex].variants[variantIndex] = {
                    ...reportTest.interpretations[interpretationIndex].variants[variantIndex],
                    ...this.variantAttribute
                };
            }
        } else {
            const interpretations = [];
            interpretations.push();
        }


        // if (this.updateCaseParams && UtilsNew.isNotEmpty(this.updateCaseParams)) {
        //     this.opencgaSession.opencgaClient.clinical()
        //         .updateInterpretation(this.clinicalAnalysis.id, this.clinicalAnalysis.interpretation.id,
        //             {attributes: this.updateCaseParams.interpretation.attributes}, {study: this.opencgaSession.study.fqn})
        //         .then(response => {
        //             this.postUpdate(response);
        //         })
        //         .catch(response => {
        //             // In this scenario notification does not raise any errors because none of the conditions shown in notificationManager.response are present.
        //             this.notifyError(response);
        //         });
        // }
    }

    notifyError(response) {
        if (typeof response == "string") {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                message: response
            });
        } else {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
        }
        console.error("An error occurred updating clinicalAnalysis: ", response);
    }

    postUpdate(response) {
        // NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
            message: "Updated successfully",
        });

        // Reset values after success update
        this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
        this.updateCaseParams = {};
        this.updateInterpretationComments = [];
        this._config = this.getDefaultConfig();

        LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
            // id: this.interpretation.id, // maybe this not would be necessary
            clinicalAnalysis: this.clinicalAnalysis
        });

        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data="${this.clinicalAnalysis}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @submit="${e => this.submitReportVariant(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "tabs",
            description: "Update an variant report",
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
                            field: "variant",
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
                            field: "variantEvidences",
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
                            field: "classification",
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
                            field: "populationControl",
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
                            field: "diseaseAssociation",
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
                            field: "recommendations",
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
                            field: "other",
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
