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
import UtilsNew from "../../../utilsNew.js";
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import ClinicalAnalysisUtils from "../../clinical/clinical-analysis-utils.js";
import "./clinical-analysis-comments.js";
import "../../commons/view/data-form.js";
import "../../commons/filters/text-field-filter.js";


class InterpretationEditor extends LitElement {

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
        this.catalogGridFormatter = new CatalogGridFormatter(this.opencgaSession);
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
                <div style="padding-bottom: 10px">
                    <select-field-filter .data="${ClinicalAnalysisUtils.getStatuses()}" .value="${status.name}" 
                        @filterChange="${e => {e.detail.param = "status.name"; this.onFieldChange(e)}}">
                    </select-field-filter>
                </div>
                <div class="">
                    <text-field-filter placeholder="Message" .value="${status.description}" 
                        @filterChange="${e => {e.detail.param = "status.description"; this.onFieldChange(e)}}"></text-field-filter>
                </div>
            </div>`
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "locked":
            case "priority":
            case "description":
                if (this._clinicalAnalysis[e.detail.param] !== e.detail.value && e.detail.value) {
                    this.clinicalAnalysis[e.detail.param] = e.detail.value;
                    this.updateParams[e.detail.param] = e.detail.value;
                } else {
                    delete this.updateParams[e.detail.param];
                }
                break;
            case "analyst.id":
                if (this._clinicalAnalysis?.analyst.id !== e.detail.value && e.detail.value) {
                    this.clinicalAnalysis.analyst.id = e.detail.value;
                    this.updateParams.analyst = {
                        id: e.detail.value
                    };
                } else {
                    delete this.updateParams["analyst"];
                }
                break;
            case "status.name":
            case "status.description":
                // We need to pass all status field to the REST web service
                this.updateParams.status = {
                    name: this.clinicalAnalysis.status.name,
                    description: this.clinicalAnalysis.status.description
                };
                let field = e.detail.param.split(".")[1];
                if (this._clinicalAnalysis?.status[field] !== e.detail.value && e.detail.value) {
                    this.clinicalAnalysis.status[field] = e.detail.value;
                    this.updateParams.status[field] = e.detail.value;
                } else {
                    delete this.updateParams.status[field];
                }
                if (UtilsNew.isEmpty(this.updateParams.status)) {
                    delete this.updateParams.status;
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
                clearText: "Clear",
                okText: "Save"
            },
            display: {
                width: "6",
                showTitle: false,
                infoIcon: "",
                labelAlign: "left",
                labelWidth: "3",
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    id: "summary",
                    title: "Summary",
                    elements: [
                        {
                            name: "Case ID",
                            field: "id",
                            display: {
                            }
                        },
                        {
                            name: "Proband",
                            field: "proband.id",
                            display: {
                            }
                        },
                        {
                            name: "Disorder",
                            field: "disorder",
                            type: "custom",
                            display: {
                                render: disorder => UtilsNew.renderHTML(this.catalogGridFormatter.disorderFormatter(disorder))
                            }
                        },
                        {
                            name: "Analysis Type",
                            field: "type",
                            display: {
                                visible: !this._config?.hiddenFields?.includes("type"),
                            }
                        },
                    ]
                },
                {
                    id: "management",
                    title: "Management",
                    elements: [
                        {
                            name: "Lock",
                            field: "locked",
                            type: "toggle",
                            defaultValue: false,
                            display: {
                                width: "9"
                                // activeName: "YES"
                                // activeClass: "btn-danger"
                            }
                        },
                        {
                            name: "Priority",
                            field: "priority",
                            type: "select",
                            allowedValues: ["URGENT", "HIGH", "MEDIUM", "LOW"],
                            defaultValue: "MEDIUM",
                            display: {
                                width: "9"
                            }
                        },
                        {
                            name: "Analyst",
                            field: "analyst.id",
                            type: "select",
                            defaultValue: this.clinicalAnalysis?.analyst?.id ?? this.clinicalAnalysis?.analyst?.assignee,
                            allowedValues: () => this._users,
                            display: {
                                width: "9"
                            }
                        },
                        {
                            name: "Due Date",
                            field: "dueDate",
                            type: "input-date",
                            display: {
                                width: "9",
                                render: date => moment(date, "YYYYMMDDHHmmss").format("DD/MM/YYYY")
                            }
                        },
                    ]
                },
                {
                    id: "general",
                    title: "General",
                    elements: [
                        {
                            name: "Status",
                            field: "status",
                            type: "custom",
                            display: {
                                render: status => this.renderStatus(status)
                            }
                        },
                        {
                            name: "Interpretation Flags",
                            field: "flags",
                            type: "select",
                            multiple: true,
                            allowedValues: ["mixed_chemistries", "low_tumour_purity", "uniparental_isodisomy", "uniparental_heterodisomy",
                                "unusual_karyotype", "suspected_mosaicism", "low_quality_sample"],
                            display: {
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 2
                            }
                        },
                        {
                            name: "Creation Date",
                            field: "creationDate",
                            type: "input-text",
                            defaultValue: "today",
                            display: {
                                visible: this.mode === "update",
                                disabled: true
                            }
                        },
                        {
                            name: "Comments",
                            field: "comments",
                            type: "custom",
                            display: {
                                // render: comments => this.renderComments(comments)
                                render: comments => html`
                                    <clinical-analysis-comments .comments="${comments}" .opencgaSession="${this.opencgaSession}"></clinical-analysis-comments>
                                `
                            }
                        }
                    ]
                },

            ],
            execute: (opencgaSession, clinicalAnalysis, params) => {
                // Prepare the data for the REST create
                // TODO validate data!
                let data = {...clinicalAnalysis};
                console.log("EXECUTE");

                /*opencgaSession.opencgaClient.clinical().update(data, {study: opencgaSession.study.fqn})
                    .then(function(response) {
                        new NotificationQueue().push(`Clinical analysis ${response.responses[0].results[0].id} created successfully`, null, "success");
                        _this.notifyClinicalAnalysisWrite();
                        _this.onClear();
                    })
                    .catch(restResponse => {
                        console.error(restResponse);
                        if (restResponse.getEvents?.("ERROR")?.length) {
                            new NotificationQueue().push("Error creating Clinical Analysis", restResponse.getEvents("ERROR").map(error => error.message).join("<br>"), "ERROR");
                        } else {
                            new NotificationQueue().push("Error creating Clinical Analysis", null, "ERROR");
                        }
                    });*/
            },
            result: {
                render: job => {

                }
            }
        };
    }

    onRun(e) {
        if (this.updateParams && UtilsNew.isNotEmpty(this.updateParams)) {
            this.opencgaSession.opencgaClient.clinical().update(this.clinicalAnalysis.id, this.updateParams, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    console.log(response);
                    this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
                    this.updateParams = {};
                    Swal.fire({
                        title: "Success",
                        icon: "success",
                        html: "Case info updated successfully"
                    });
                })
                .catch(response => {
                    console.error("An error occurred updating clinicalAnalysis: ", response);
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

customElements.define("interpretation-editor", InterpretationEditor);
