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
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import FormUtils from "../../commons/forms/form-utils.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import UtilsNew from "../../../core/utilsNew.js";

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
            displayConfig: {
                type: Object
            },
        };
    }

    _init() {
        this.updateParams = {};
        this.mode = "";

        this.displayConfigDefault = {
            modalButtonClassName: "btn-primary btn-sm",
            buttonsAlign: "right",
            buttonClearText: "Clear",
            buttonOkText: "Update",
            titleVisible: false,
            titleAlign: "left",
            titleWidth: 4,
            defaultLayout: "horizontal"
        };
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("interpretation")) {
            this.interpretationObserver();
        }
        if (changedProperties.has("interpretationId")) {
            this.interpretationIdObserver();
        }
        if (changedProperties.has("clinicalAnalysis")) {
            this.config = this.getDefaultConfig();
        }
        if (changedProperties.has("opencgaSession")) {
            this.users = OpencgaCatalogUtils.getUsers(this.opencgaSession.study);
        }
        if (changedProperties.has("mode")) {
            this.config = this.getDefaultConfig();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
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
                    // console.error("An error occurred fetching clinicalAnalysis: ", response);
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                });
        }
    }

    onCommentChange(e) {
        this.commentsUpdate = e.detail;
    }

    updateOrDeleteComments(notify) {
        const clinicalAnalysisId = this.interpretation.clinicalAnalysisId;
        const interpretationId = this.interpretation.id;

        if (this.commentsUpdate?.updated?.length > 0) {
            this.opencgaSession.opencgaClient.clinical()
                .updateInterpretation(clinicalAnalysisId, interpretationId, {comments: this.commentsUpdate.updated}, {commentsAction: "REPLACE", study: this.opencgaSession.study.fqn})
                .then(response => {
                    if (notify && this.commentsUpdate?.deleted?.length === 0) {
                        this.postUpdate(response, "");
                    }
                })
                .catch(response => {
                    console.error("An error occurred updating clinicalAnalysis: ", response);
                });
        }
        if (this.commentsUpdate?.deleted?.length > 0) {
            this.opencgaSession.opencgaClient.clinical()
                .updateInterpretation(clinicalAnalysisId, interpretationId, {comments: this.commentsUpdate.deleted}, {commentsAction: "REMOVE", study: this.opencgaSession.study.fqn})
                .then(response => {
                    if (notify) {
                        this.postUpdate(response, "");
                    }
                })
                .catch(response => {
                    console.error("An error occurred updating clinicalAnalysis: ", response);
                });
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

    postUpdate(response, id) {
        console.log("response: ", response);
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
            title: "Clinical interpretation updated",
            message: `The clinical interpretation ${id} has been updated successfully`,
        });
        this.notifyClinicalAnalysisWrite();
        this.onClear();
    }

    notifyClinicalAnalysisWrite() {
        LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
            id: this.interpretation.id,
            clinicalAnalysis: this.interpretation,
        });
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
        // const data = {...this.updateParams};
        const clinicalAnalysis = this.interpretation.clinicalAnalysisId;
        const id = this.interpretation.id;

        if (this.commentsUpdate) {
            if (this.commentsUpdate.added?.length > 0) {
                this.updateParams.comments = this.commentsUpdate.added;
            }
        }

        if (this.updateParams && UtilsNew.isNotEmpty(this.updateParams)) {
            this.updateOrDeleteComments(false);

            this.opencgaSession.opencgaClient.clinical().updateInterpretation(clinicalAnalysis, id, this.updateParams, {
                study: this.opencgaSession.study.fqn,
                panelsAction: "SET",
            }).then(response => {
                this.postUpdate(response, id);
            }).catch(response => {
                // console.error(response);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
        } else {
            this.updateOrDeleteComments(true);
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
            type: this.mode,
            description: "Update an interpretation",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            title: "Interpretation ID",
                            field: "id",
                            type: "input-text",
                            defaultValue: this.interpretation?.id,
                            display: {
                                disabled: true,
                            },
                        },
                        {
                            title: "Assigned To",
                            field: "analyst.id",
                            type: "select",
                            defaultValue: this.opencgaSession?.user?.id,
                            allowedValues: () => this.users,
                        },
                        {
                            title: "Status",
                            field: "status",
                            type: "custom",
                            display: {
                                render: status => html`
                                    <clinical-status-filter
                                        .status="${status?.id}"
                                        .statuses="${this.opencgaSession.study.internal?.configuration?.clinical?.interpretation?.status[this.clinicalAnalysis.type.toUpperCase()]}"
                                        .classes="${this.updateParams.status ? "updated" : ""}"
                                        .multiple=${false}
                                        @filterChange="${e => {
                                            e.detail.param = "status.id";
                                            this.onFieldChange(e);
                                        }}">
                                    </clinical-status-filter>
                                `,
                            }
                        },
                        {
                            title: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                render: panels => {
                                    const panelLock = !!this.clinicalAnalysis?.panelLock;
                                    const panelList = panelLock ? this.clinicalAnalysis.panels : this.opencgaSession.study?.panels;
                                    return html`
                                        <disease-panel-filter
                                            .opencgaSession="${this.opencgaSession}"
                                            .diseasePanels="${panelList}"
                                            .panel="${panels?.map(p => p.id).join(",")}"
                                            .showExtendedFilters="${false}"
                                            .showSelectedPanels="${false}"
                                            .classes="${this.updateParams.panels ? "updated" : ""}"
                                            .disabled="${panelLock}"
                                            @filterChange="${e => this.onFieldChange(e, "panels.id")}">
                                        </disease-panel-filter>
                                    `;
                                },
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 2,
                                placeholder: "Add a description to this interpretation...",
                            },
                        },
                        {
                            title: "Comments",
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
