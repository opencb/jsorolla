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
import FormUtils from "../../commons/forms/form-utils";

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
            interpretation: {
                type: Object
            },
            interpretationId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            mode: {
                type: String
            },
            buttonsConfig: {
                type: Object
            },
        };
    }

    _init() {
        this.config = this.getDefaultConfig();
        this.updateParams = {};
        this.mode = "";
        this.buttonsConfigDefault = {
            show: true,
            clearText: "Clear",
            okText: "Update",
        };
    }

    update(changedProperties) {
        if (changedProperties.has("interpretation")) {
            this.interpretationObserver();
        }
        if (changedProperties.has("interpretationId")) {
            this.interpretationIdObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("mode")) {
            this.config = this.getDefaultConfig();
        }
        if (changedProperties.has("buttonsConfig")) {
            this.buttonsConfig = {...this.buttonsConfigDefault, ...this.buttonsConfig};
            this.config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    interpretationObserver() {
        if (this.opencgaSession && this.interpretation) {
            this._interpretation = JSON.parse(JSON.stringify(this.interpretation));
        }
    }

    interpretationIdObserver() {
        if (this.opencgaSession && this.interpretationId) {
            this.opencgaSession.opencgaClient.clinical().infoInterpretation(this.interpretationId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.interpretation = response.responses[0].results[0];
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    opencgaSessionObserver() {
        this.users = [];
        if (this.opencgaSession?.study?.groups) {
            for (const group of this.opencgaSession.study.groups) {
                if (group.id === "@members") {
                    this.users.push(...group.userIds.filter(user => user !== "*"));
                    break;
                }
            }
        }
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "description":
                this.updateParams = FormUtils
                    .updateScalar(this._interpretation, this.interpretation, this.updateParams, param, e.detail.value);
                break;
            case "status.id":
            case "analyst.id":
                this.updateParams = FormUtils
                    .updateObject(this._interpretation, this.interpretation, this.updateParams, param, e.detail.value);
                break;
            case "panels.id":
                this.updateParams = FormUtils
                    .updateObjectArray(this._interpretation, this.interpretation, this.updateParams, param, e.detail.value, e.detail.data);
                break;
        }
        // Enable this only when a dynamic property in the config can change
        // this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    notifyClinicalAnalysisWrite() {
        this.dispatchEvent(new CustomEvent("clinicalAnalysisUpdate", {
            detail: {
                id: this.interpretation.id,
                interpretation: this.interpretation
            },
            bubbles: true,
            composed: true
        }));
    }

    onClear() {
        // First update config
        this.config = this.getDefaultConfig();

        // Reset all values
        this.interpretation = JSON.parse(JSON.stringify(this._interpretation));
        this.updateParams = {};
        this.commentsUpdate = {};
    }

    onSubmit() {
        try {
            // remove private fields
            const data = {...this.interpretation};

            this.opencgaSession.opencgaClient.clinical().updateInterpretation(this.interpretation.id, data, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    new NotificationQueue().push(`Clinical Interpretation ${response.responses[0].results[0].id} updated successfully`, null, "success");
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
                .config="${this.config}"
                .updateParams="${this.updateParams}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            id: "clinical-interpretation",
            title: "Edit Interpretation",
            icon: "fas fa-edit",
            type: "form",
            requires: "2.2.0",
            description: "Update an interpretation",
            links: [
                {
                    title: "OpenCGA",
                    url: "http://docs.opencb.org/display/opencga/Sample+Stats",
                    icon: ""
                }
            ],
            buttons: this.buttonsConfig,
            display: {
                mode: {
                    type: this.mode,
                    buttonClass: "btn btn-default btn-small ripple"
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
                            defaultValue: this.interpretation?.id,
                            display: {
                                disabled: true
                            }
                        },
                        {
                            name: "Assigned To",
                            field: "analyst.id",
                            type: "select",
                            defaultValue: this.opencgaSession?.user?.id,
                            allowedValues: () => this.users,
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
                                placeholder: "Add a description to this interpretation..."
                            }
                        },
                        {
                            name: "Comments",
                            field: "comments",
                            type: "custom",
                            display: {
                                render: comments => html`
                                    <clinical-analysis-comment-editor
                                        .comments="${comments}"
                                        .disabled="${!!this.clinicalAnalysis?.locked}"
                                        @commentChange="${e => this.onCommentChange(e)}">
                                    </clinical-analysis-comment-editor>
                                `,
                            }
                        }
                    ]
                },
            ]
        };
    }

}

customElements.define("clinical-interpretation-update", ClinicalInterpretationCreate);
