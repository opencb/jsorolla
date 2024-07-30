/*
 * Copyright 2015-2024 OpenCB
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
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import ClinicalAnalysisUtils from "../clinical-analysis-utils.js";
import "../clinical-analysis-comment-editor.js";
import "../../commons/forms/data-form.js";
import "../../commons/forms/text-field-filter.js";
import "../../commons/forms/select-field-filter.js";

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
            for (const group of this.opencgaSession.study.groups) {
                if (group.id === "@members") {
                    this._users.push(...group.userIds.filter(user => user !== "*"));
                }
            }
        }
    }

    clinicalAnalysisObserver() {
        if (this.opencgaSession && this.clinicalAnalysis) {
            this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
            this.requestUpdate();
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
                <select-field-filter
                    .data="${ClinicalAnalysisUtils.getInterpretationStatuses()}"
                    .value="${status.id}"
                    .classes="${this.updateParams.status ? "updated" : ""}"
                    @filterChange="${e => {
                        e.detail.param = "interpretation.status.id";
                        this.onFieldChange(e);
                    }}">
                </select-field-filter>
                ${status.description ?
                        html`<span class="d-block text-secondary" style="padding: 0px 5px">${status.description}</span>` :
            null
                }
            </div>`;
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "interpretation.status.id":
            case "interpretation.analyst.id":
                const field = e.detail.param.split(".")[1];
                if (this._clinicalAnalysis.interpretation[field]?.id !== e.detail.value && e.detail.value !== null) {
                    this.clinicalAnalysis.interpretation[field].id = e.detail.value;
                    this.updateParams[field] = {
                        id: e.detail.value
                    };
                } else {
                    this.clinicalAnalysis[field].id = this._clinicalAnalysis[field].id;
                    delete this.updateParams[field];
                }
                break;
            case "interpretation.description":
                if (this._clinicalAnalysis.interpretation.description !== e.detail.value && e.detail.value !== null) {
                    this.clinicalAnalysis.interpretation.description = e.detail.value;
                    this.updateParams.description = e.detail.value;
                } else {
                    this.clinicalAnalysis[e.detail.param] = this._clinicalAnalysis[e.detail.param].id;
                    delete this.updateParams.description;
                }
                break;
        }
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onCommentChange(e) {
        this.commentsUpdate = e.detail;
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
                        elementLabelStyle: "padding-top: 0px", // form add control-label which has an annoying top padding
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
                                    const sex = (proband.sex && proband.sex !== "UNKNOWN") ? `(${proband.sex})` : "";
                                    const sampleIds = proband.samples.map(sample => sample.id).join(", ");
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
                                render: disorder => UtilsNew.renderHTML(CatalogGridFormatter.disorderFormatter([disorder]))
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
                                width: "9",
                                updated: this.updateParams.analyst ?? false
                            }
                        },
                        {
                            name: "Status",
                            field: "interpretation.status",
                            type: "custom",
                            display: {
                                render: status => this.renderStatus(status),
                            }
                        },
                        {
                            name: "Description",
                            field: "interpretation.description",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 3,
                                updated: this.updateParams.description ?? false
                            }
                        },
                        {
                            name: "Comments",
                            field: "interpretation.comments",
                            type: "custom",
                            display: {
                                render: comments => html`
                                    <clinical-analysis-comment-editor .comments="${comments}"
                                                                      @commentChange="${e => this.onCommentChange(e)}">
                                    </clinical-analysis-comment-editor>`
                            }
                        }
                    ]
                },
            ],
        };
    }

    onClear(e) {
        this.clinicalAnalysis = JSON.parse(JSON.stringify(this._clinicalAnalysis));
        this.updateParams = {};
        this.commentsUpdate = {};
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onRun(e) {
        if (this.commentsUpdate) {
            if (this.commentsUpdate.added?.length > 0) {
                this.updateParams.comments = this.commentsUpdate.added;
            }
        }

        if (this.updateParams && UtilsNew.isNotEmpty(this.updateParams)) {
            this._updateOrDeleteComments(false);

            this.opencgaSession.opencgaClient.clinical().updateInterpretation(this.clinicalAnalysis.id, this.clinicalAnalysis.interpretation.id, this.updateParams, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this._postUpdate(response);
                })
                .catch(response => {
                    console.error("An error occurred updating Interpretation: ", response);
                });
        } else {
            this._updateOrDeleteComments(true);
        }
    }

    _updateOrDeleteComments(notify) {
        if (this.commentsUpdate?.updated?.length > 0) {
            this.opencgaSession.opencgaClient.clinical()
                .updateInterpretation(
                    this.clinicalAnalysis.id,
                    this.clinicalAnalysis.interpretation.id,
                    {comments: this.commentsUpdate.updated},
                    {commentsAction: "REPLACE", study: this.opencgaSession.study.fqn}
                )
                .then(response => {
                    if (notify && this.commentsUpdate?.deleted?.length === 0) {
                        this._postUpdate(response);
                    }
                })
                .catch(response => {
                    console.error("An error occurred updating Interpretation: ", response);
                });
        }
        if (this.commentsUpdate?.deleted?.length > 0) {
            this.opencgaSession.opencgaClient.clinical()
                .updateInterpretation(
                    this.clinicalAnalysis.id,
                    this.clinicalAnalysis.interpretation.id,
                    {comments: this.commentsUpdate.deleted},
                    {commentsAction: "REMOVE", study: this.opencgaSession.study.fqn}
                )
                .then(response => {
                    if (notify) {
                        this._postUpdate(response);
                    }
                })
                .catch(response => {
                    console.error("An error occurred updating Interpretation: ", response);
                });
        }
    }

    _postUpdate(response) {
        // FIXME This should net be needed because the event below
        this.updateParams = {};
        this.commentsUpdate = {};
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();

        Swal.fire({
            title: "Success",
            icon: "success",
            html: "Interpretation info updated successfully"
        });

        this.dispatchEvent(new CustomEvent("clinicalAnalysisUpdate", {
            detail: {
                clinicalAnalysis: this.clinicalAnalysis
            },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        if (!this.clinicalAnalysis) {
            return "";
        }

        return html`
            <data-form
                .data="${this.clinicalAnalysis}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onRun}">
            </data-form>
        `;
    }

}

customElements.define("clinical-interpretation-editor", ClinicalInterpretationEditor);
