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
import UtilsNew from "../../../core/utilsNew.js";
import {NotificationQueue} from "../../../core/NotificationQueue.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import "../filters/clinical-status-filter.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/disease-panel-filter.js";

export default class ClinicalInterpretationCreate extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalAnalysis: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            mode: {
                type: String
            },
            // config: {
            //     type: Object
            // }
        };
    }

    _init() {
        this.mode = "";
        this.interpretation = {};
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            // We store the available users from opencgaSession in 'clinicalAnalysis._users'
            this._users = this.opencgaSession?.study ? OpencgaCatalogUtils.getUsers(this.opencgaSession.study) : [];
            this.initClinicalInterpretation();

            this.requestUpdate();
        }

        // if (changedProperties.has("config")) {
        //     this._config = {...this.getDefaultConfig(), ...this.config};
        // }
        super.update(changedProperties);
    }

    initClinicalInterpretation() {
        this.interpretation = {
            clinicalAnalysisId: this.clinicalAnalysis.id,
            analyst: {
                id: this.opencgaSession?.user?.id
            },
            panels: this.clinicalAnalysis.panels?.length > 0 ? this.clinicalAnalysis?.panels.map(panel => {
                return {id: panel.id};
            }) : [],
            comments: [],
        };
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "analyst.id":
                this.interpretation.analyst = {
                    id: e.detail.value
                };
                break;
            case "panels.id":
                const [field, prop] = param.split(".");
                if (e.detail.value) {
                    this.interpretation[field] = e.detail.value.split(",").map(value => ({[prop]: value}));
                } else {
                    delete this.interpretation[field];
                }
                break;
            case "_comments":
                this.interpretation.comments = [
                    {
                        message: e.detail.value
                    }
                ];
                break;
            default:
                this.interpretation[param] = e.detail.value;
                break;
        }

        this.interpretation = {...this.interpretation};
        this.requestUpdate();
    }

    notifyClinicalAnalysisWrite() {
        this.dispatchEvent(new CustomEvent("clinicalAnalysisUpdate", {
            detail: {
                id: this.interpretation.id,
                clinicalAnalysis: this.interpretation
            },
            bubbles: true,
            composed: true
        }));
    }

    onClear() {
        this.initClinicalInterpretation();
        this.requestUpdate();
    }

    onSubmit() {
        try {
            // remove private fields
            const data = {...this.interpretation};

            this.opencgaSession.opencgaClient.clinical().createInterpretation(this.clinicalAnalysis.id, data, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    new NotificationQueue().push(`Clinical Interpretation ${response.responses[0].results[0].id} created successfully`, null, "success");
                    this.notifyClinicalAnalysisWrite();
                    this.onClear();
                })
                .catch(response => {
                    console.error(response);
                    UtilsNew.notifyError(response);
                });
        } catch (response) {
            console.log(response);
            UtilsNew.notifyError(response);
        }
    }

    render() {
        return html`
            <data-form
                .data="${this.interpretation}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            id: "clinical-interpretation",
            title: "Create Interpretation",
            icon: "fas fa-file-medical",
            type: "form",
            requires: "2.2.0",
            description: "Create a new interpretation for this case",
            links: [
                {
                    title: "OpenCGA",
                    url: "http://docs.opencb.org/display/opencga/Sample+Stats",
                    icon: ""
                }
            ],
            buttons: {
                show: true,
                clearText: "Clear",
                submitText: "Create",
            },
            display: {
                mode: {
                    type: this.mode,
                },
                width: "10",
                showTitle: false,
                infoIcon: "",
                labelAlign: "left",
                labelWidth: "4",
                defaultLayout: "horizontal"
            },
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            name: "Interpretation ID",
                            field: "id",
                            type: "input-text",
                            defaultValue: this.clinicalAnalysis.id,
                            display: {
                                disabled: true
                            }
                        },
                        {
                            name: "Assigned To",
                            field: "analyst.id",
                            type: "select",
                            defaultValue: this.opencgaSession?.user?.id,
                            allowedValues: () => this._users,
                            display: {}
                        },
                        {
                            name: "Status",
                            field: "status",
                            type: "custom",
                            display: {
                                render: status => html`
                                    <clinical-status-filter
                                        .status="${status?.id}"
                                        .statuses="${this.opencgaSession.study.internal?.configuration?.clinical?.interpretation?.status[this.clinicalAnalysis.type.toUpperCase()]}"
                                        .multiple=${false}
                                        @filterChange="${e => {
                                            e.detail.param = "status.id";
                                    this.onFieldChange(e);
                                }}">
                                    </clinical-status-filter>`
                            }
                        },
                        {
                            name: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                render: panels => {
                                    return html`
                                        <disease-panel-filter
                                            .opencgaSession="${this.opencgaSession}"
                                            .diseasePanels="${this.opencgaSession.study?.panels}"
                                            .panel="${panels?.map(p => p.id).join(",")}"
                                            .showExtendedFilters="${false}"
                                            @filterChange="${e => this.onFieldChange(e, "panels.id")}">
                                        </disease-panel-filter>
                                    `;
                                }
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 2,
                                placeholder: "Add a description to this case..."
                            }
                        },
                        {
                            name: "Comment",
                            field: "_comments",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 2,
                                placeholder: "Initial comment..."
                                // render: comments => html`
                                //     <clinical-analysis-comment-editor .comments="${comments}" .opencgaSession="${this.opencgaSession}"></clinical-analysis-comment-editor>`
                            }
                        },
                    ]
                },
            ]
        };
    }

}

customElements.define("clinical-interpretation-create", ClinicalInterpretationCreate);
