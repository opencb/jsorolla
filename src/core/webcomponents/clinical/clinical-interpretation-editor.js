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

import {html, LitElement} from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import ClinicalAnalysisUtils from "./clinical-analysis-utils.js";
import "./clinical-analysis-comment-editor.js";
import "../commons/view/data-form.js";
import "../commons/filters/text-field-filter.js";


class ClinicalInterpretationEditor extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.updateParams = {};
    }

    connectedCallback() {
        super.connectedCallback();

        this.updateParams = {};
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    opencgaSessionObserver() {
        this._users = [];
        if (this.opencgaSession && this.opencgaSession.study) {
            for (let group of this.opencgaSession.study.groups) {
                if (group.id === "@members") {
                    this._users.push(...group.userIds.filter(user => user !== "*"));
                }
            }
        }
    }

    clinicalAnalysisObserver() {
        if (this.opencgaSession && this.clinicalAnalysis) {
            this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
            // this.requestUpdate();
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    this.clinicalAnalysisObserver();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    renderStatus(status) {
        return html`
            <div class="">
                <select-field-filter .data="${ClinicalAnalysisUtils.getInterpretationStatuses()}" .value="${status.id}" 
                        @filterChange="${e => {e.detail.param = "interpretation.status.id"; this.onFieldChange(e)}}">
                </select-field-filter>
                ${status.description
            ? html`<span class="help-block" style="padding: 0px 5px">${status.description}</span>`
            : null
        }
            </div>`;
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "interpretation.status.id":
            case "interpretation.analyst.id":
                debugger
                let field = e.detail.param.split(".")[1];
                if (this._clinicalAnalysis.interpretation[field] && this._clinicalAnalysis.interpretation[field].id !== e.detail.value && e.detail.value !== null) {
                    this.clinicalAnalysis.interpretation[field].id = e.detail.value;
                    this.updateParams[field] = {
                        id: e.detail.value
                    };
                } else {
                    delete this.updateParams[field].id;
                }
                if (UtilsNew.isEmpty(this.updateParams[field])) {
                    delete this.updateParams[field];
                }
                break;
            case "interpretation.description":
                if (this._clinicalAnalysis.interpretation.description !== e.detail.value && e.detail.value) {
                    this.clinicalAnalysis.interpretation.description = e.detail.value;
                    this.updateParams.description = e.detail.value;
                } else {
                    delete this.updateParams.description;
                }
                break;
            case "interpretation.comments":
                if (!this.clinicalAnalysis.interpretation.comments) {
                    this.clinicalAnalysis.interpretation = {
                        comments: []
                    };
                }
                if (e.detail.value?.message) {
                    if (this.clinicalAnalysis.interpretation.comments?.length === 0) {
                        this.clinicalAnalysis.interpretation.comments.push(e.detail.value);
                    } else {
                        this.clinicalAnalysis.interpretation.comments[this.clinicalAnalysis.interpretation.comments.length - 1] = e.detail.value;
                    }
                    this.updateParams.comments = [e.detail.value];
                } else {
                    delete this.updateParams.comments;
                }
                break;
        }
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            id: "clinical-analysis",
            title: "Case Editor",
            icon: "fas fa-user-md",
            type: "form",
            buttons: {
                show: true,
                clearText: "Cancel",
                okText: "Save",
                classes: "col-md-offset-4 col-md-3"
            },
            display: {
                width: "8",
                showTitle: false,
                infoIcon: "",
                labelAlign: "left",
                labelWidth: "4",
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    id: "summary",
                    title: "Summary",
                    display: {
                        style: "background-color: #f3f3f3; border-left: 4px solid #0c2f4c; margin: 15px 0px; padding-top: 10px",
                        elementLabelStyle: "padding-top: 0px", // forms add control-label which has an annoying top padding
                    },
                    elements: [
                        {
                            name: "Interpretation ID",
                            field: "interpretation",
                            type: "custom",
                            display: {
                                render: interpretation => html`
                                    <span style="font-weight: bold; margin-right: 10px">${interpretation.id}</span> 
                                    <span style="color: grey; padding-right: 40px">version ${interpretation.version}</span> 
                                    <span><i class="far fa-calendar-alt"></i> ${UtilsNew.dateFormatter(interpretation?.modificationDate)}</span>`
                            }
                        },
                        {
                            name: "Proband",
                            field: "proband",
                            type: "custom",
                            display: {
                                render: proband => {
                                    let sex = (proband.sex && proband.sex !== "UNKNOWN") ? `(${proband.sex})` : "";
                                    let sampleIds = proband.samples.map(sample => sample.id).join(", ");
                                    return html`
                                        <span style="padding-right: 25px">${proband.id} ${sex}</span>
                                        <span style="font-weight: bold; padding-right: 10px">Sample(s):</span><span>${sampleIds}</span>`;
                                }
                            }
                        },
                        {
                            name: "Disorder",
                            field: "disorder",
                            type: "custom",
                            display: {
                                render: disorder => UtilsNew.renderHTML(CatalogGridFormatter.disorderFormatter(disorder))
                            }
                        },
                        {
                            name: "Analysis Type",
                            field: "type",
                            display: {
                            }
                        },
                        {
                            name: "Primary Findings",
                            field: "interpretation.primaryFindings",
                            type: "custom",
                            display: {
                                render: primaryFindings => html`<span style="font-weight: bold">${primaryFindings?.length}</span>`
                            }
                        },
                    ]
                },
                {
                    id: "general",
                    title: "General",
                    elements: [
                        {
                            name: "Analyst",
                            field: "interpretation.analyst.id",
                            type: "select",
                            defaultValue: this.clinicalAnalysis?.analyst?.id ?? this.clinicalAnalysis?.analyst?.assignee,
                            allowedValues: () => this._users,
                            display: {
                                width: "9"
                            }
                        },
                        {
                            name: "Status",
                            field: "interpretation.status",
                            type: "custom",
                            display: {
                                render: status => this.renderStatus(status)
                            }
                        },
                        {
                            name: "Description",
                            field: "interpretation.description",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 3
                            }
                        },
                        {
                            name: "Comments",
                            field: "interpretation.comments",
                            type: "custom",
                            display: {
                                render: comments => html`
                                    <clinical-analysis-comment-editor .comments="${comments}"
                                                                      .opencgaSession="${this.opencgaSession}"
                                                                      @fieldChange="${e => this.onFieldChange({
                                                                          detail: {
                                                                              param: "interpretation.comments",
                                                                              value: e.detail.value
                                                                          }
                                                                      })}">
                                    </clinical-analysis-comment-editor>\``
                            }
                        }
                    ]
                },
            ],
        };
    }

    onRun(e) {
        if (this.updateParams && UtilsNew.isNotEmpty(this.updateParams)) {
            this.opencgaSession.opencgaClient.clinical().updateInterpretation(this.clinicalAnalysis.id, this.clinicalAnalysis.interpretation.id, this.updateParams, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    console.log(response);
                    this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
                    this.updateParams = {};
                    this.requestUpdate();

                    Swal.fire({
                        title: "Success",
                        icon: "success",
                        html: "Interpretation info updated successfully"
                    });
                })
                .catch(response => {
                    console.error("An error occurred updating Interpretation: ", response);
                });
        }
    }

    render() {
        if (!this.clinicalAnalysis) {
            return "";
        }

        return html`
            <data-form  .data="${this.clinicalAnalysis}" 
                        .config="${this._config}" 
                        @fieldChange="${e => this.onFieldChange(e)}" 
                        @clear="${this.onClear}" 
                        @submit="${this.onRun}">
            </data-form>
        `;
    }

}

customElements.define("clinical-interpretation-editor", ClinicalInterpretationEditor);
