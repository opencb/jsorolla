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
import UtilsNew from "../../../core/utils-new.js";

import "../filters/clinical-status-filter.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/disease-panel-filter.js";

export default class ClinicalInterpretationUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalInterpretation: {
                type: Object
            },
            clinicalInterpretationId: {
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

    #init() {
        this.clinicalInterpretation = {};
        this.clinicalInterpretationId = "";
        this.mode = "";

        this.displayConfig = {
            titleWidth: 3,
            modalButtonClassName: "btn-primary btn-sm",
            titleVisible: false,
            titleAlign: "left",
            defaultLayout: "horizontal",
            buttonsVisible: true,
            buttonsWidth: 8,
            buttonsAlign: "right",
        };
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        // if (changedProperties.has("interpretation")) {
        //     this.interpretationObserver();
        // }
        // if (changedProperties.has("interpretationId")) {
        //     this.interpretationIdObserver();
        // }
        // if (changedProperties.has("clinicalAnalysis")) {
        //     this.config = this.getDefaultConfig();
        // }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
            // this.users = OpencgaCatalogUtils.getUsers(this.opencgaSession.study);
        }
        if (changedProperties.has("mode")) {
            this._config = this.getDefaultConfig();
        }
        if (changedProperties.has("displayConfig")) {
            // this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            // this.config = this.getDefaultConfig();
            this.displayConfig = {...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }


    // interpretationObserver() {
    //     if (this.opencgaSession && this.interpretation) {
    //         this._interpretation = JSON.parse(JSON.stringify(this.interpretation));
    //     }
    // }

    clinicalInterpretationIdObserver(e) {
        this.interpretation = e.detail.value;

        /*
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
        */
    }

    opencgaSessionObserver() {
        this.users = OpencgaCatalogUtils.getUsers(this.opencgaSession.study);
    }


    // onCommentChange(e) {
    //     this.commentsUpdate = e.detail;
    // }

    // FIXME: think about this
    // updateOrDeleteComments(notify) {
    //     const clinicalAnalysisId = this.interpretation.clinicalAnalysisId;
    //     const interpretationId = this.interpretation.id;
    //
    //     // Question: updated?
    //     if (this.commentsUpdate?.updated?.length > 0) {
    //         this.opencgaSession.opencgaClient.clinical()
    //             .updateInterpretation(clinicalAnalysisId, interpretationId, {comments: this.commentsUpdate.updated}, {commentsAction: "REPLACE", study: this.opencgaSession.study.fqn})
    //             .then(response => {
    //                 if (notify && this.commentsUpdate?.deleted?.length === 0) {
    //                     this.postUpdate(response, "");
    //                 }
    //             })
    //             .catch(response => {
    //                 console.error("An error occurred updating clinicalAnalysis: ", response);
    //             });
    //     }
    //
    // }
    /*
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
            case "comments":
                this.updateParams = FormUtils.updateArraysObject(
                    this._interpretation,
                    this.interpretation,
                    this.updateParams,
                    e.detail.param,
                    e.detail.value
                );

                if (this.updateParams.comments) {
                    this.updateParams.comments = this.updateParams.comments
                        .filter(comment => !comment.author)
                        .map(comment => {
                            // eslint-disable-next-line no-param-reassign
                            comment.tags = Array.isArray(comment.tags) ? comment.tags : (comment.tags || "").split(" ");
                            return comment;
                        });
                }

                break;
        }
        // Enable this only when a dynamic property in the config can change
        // this.config = this.getDefaultConfig();
        this.requestUpdate();
    }
*/

    // postUpdate(response, id) {
    //     console.log("response: ", response);
    //     NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
    //         title: "Clinical interpretation updated",
    //         message: `The clinical interpretation ${id} has been updated successfully`,
    //     });
    //     this.notifyClinicalAnalysisWrite();
    //     this.onClear();
    // }

    // notifyClinicalAnalysisWrite() {
    //     LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
    //         id: this.interpretation.id,
    //         clinicalAnalysis: this.interpretation, // FIXME: Clinical Analysis = this.interpretation?
    //     });
    // }

    // onClear() {
    //     // First update config
    //     this.config = this.getDefaultConfig();
    //
    //     // Reset all values
    //     this.interpretation = JSON.parse(JSON.stringify(this._interpretation));
    //     this.updateParams = {};
    //     this.commentsUpdate = {};
    // }

    // onSubmit() {
    //     // const data = {...this.updateParams};
    //     const clinicalAnalysis = this.interpretation.clinicalAnalysisId;
    //     const id = this.interpretation.id;
    //
    //     // FIXME: consider this code
    //     if (this.commentsUpdate) {
    //         if (this.commentsUpdate.added?.length > 0) {
    //             this.updateParams.comments = this.commentsUpdate.added;
    //         }
    //     }
    //
    //     if (this.updateParams && UtilsNew.isNotEmpty(this.updateParams)) {
    //         this.updateOrDeleteComments(false);
    //
    //         this.opencgaSession.opencgaClient.clinical().updateInterpretation(clinicalAnalysis, id, this.updateParams, {
    //             study: this.opencgaSession.study.fqn,
    //             panelsAction: "SET",
    //         }).then(response => {
    //             this.postUpdate(response, id);
    //         }).catch(response => {
    //             // console.error(response);
    //             NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
    //         });
    //     } else {
    //         this.updateOrDeleteComments(true);
    //     }
    // }

    render() {
        return html`
            <opencga-update
                .resource="${"CLINICAL-INTERPRETATION"}"
                .component="${this.clinicalInterpretation}"
                .componentId="${this.clinicalInterpretationId}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}"
                @componentIdObserver="${this.clinicalInterpretationIdObserver}">
            </opencga-update>
        `;
    }

    getDefaultConfig() {
        return {
            id: "clinical-interpretation",
            title: "Edit Interpretation",
            // icon: "fas fa-edit",
            type: this.mode,
            description: "Update an interpretation",
            display: this.displayConfig,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        // {
                        //     type: "notification",
                        //     text: "Some changes have been done in the form. Not saved, changes will be lost",
                        //     display: {
                        //         visible: () => !UtilsNew.isObjectValuesEmpty(this.updateParams),
                        //         notificationType: "warning",
                        //     }
                        // },
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
                            field: "status.id",
                            type: "custom",
                            display: {
                                render: (statusId, dataFormFilterChange, updateParams) => {
                                    // .disabled="${!!this._clinicalAnalysis?.locked}"
                                    return html`
                                        <clinical-status-filter
                                                .status="${statusId}"
                                                .statuses="${this.opencgaSession.study.internal?.configuration?.clinical?.interpretation?.status[this.clinicalAnalysis?.type?.toUpperCase()]}"
                                                .multiple=${false}
                                                .classes="${updateParams?.["status.id"] ? "selection-updated" : ""}"
                                                .disabled="${updateParams?.locked?.after ?? !!this.clinicalAnalysis?.locked}"
                                                @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                        </clinical-status-filter>
                                    `;
                                }
                                /*
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
                                */
                            }
                        },
                        {
                            title: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                render: (panels, dataFormFilterChange, updateParams) => {
                                    // CAUTION: check if the panelLock condition is the same as clinical-analysis-update.js
                                    const panelLock = !!this.clinicalAnalysis?.panelLock;
                                    const panelList = panelLock ? this.clinicalAnalysis?.panels : this.opencgaSession.study?.panels;
                                    const handlePanelsFilterChange = e => {
                                        e.detail.value = e.detail.value
                                            ?.split(",")
                                            .filter(panelId => panelId)
                                            .map(panelId => ({id: panelId}));
                                        dataFormFilterChange(e.detail.value);
                                    };
                                    return html`
                                        <disease-panel-filter
                                            .opencgaSession="${this.opencgaSession}"
                                            .diseasePanels="${panelList}"
                                            .panel="${panels?.map(panel => panel.id).join(",")}"
                                            .showExtendedFilters="${false}"
                                            .showSelectedPanels="${false}"
                                            .classes="${updateParams.panels ? "selection-updated" : ""}"
                                            .disabled="${panelLock}"
                                            @filterChange="${e => handlePanelsFilterChange(e)}">
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
                                rows: 3,
                                placeholder: "Add a description to this interpretation...",
                            },
                        },
                        {
                            title: "Comments",
                            field: "comments",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                // collapsable: false,
                                // maxNumItems: 5,
                                showEditItemListButton: false,
                                showDeleteItemListButton: false,
                                view: comment => {
                                    // eslint-disable-next-line no-param-reassign
                                    // comment.tags = Array.isArray(comment.tags) ? comment.tags : (comment.tags || "").split(/,\s*/);
                                    const tags = UtilsNew.commaSeparatedArray(comment.tags)
                                        .join(", ") || "-";
                                    return html `
                                    <div style="margin-bottom:1rem;">
                                        <div style="display:flex;margin-bottom:0.5rem;">
                                            <div style="padding-right:1rem;">
                                                <i class="fas fa-comment-dots"></i>
                                            </div>
                                            <div style="font-weight:bold">
                                                ${comment.author || this.opencgaSession?.user?.id || "-"} -
                                                ${UtilsNew.dateFormatter(comment.date || UtilsNew.getDatetime())}
                                            </div>
                                        </div>
                                        <div style="width:100%;">
                                            <div style="margin-bottom:0.5rem;">${comment.message || "-"}</div>
                                            <div class="text-muted">Tags: ${tags}</div>
                                        </div>
                                    </div>
                                `;
                                }
                            },
                            elements: [
                                {
                                    title: "Message",
                                    field: "comments[].message",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add comment...",
                                        rows: 3
                                    }
                                },
                                {
                                    title: "Tags",
                                    field: "comments[].tags",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add tags..."
                                    }
                                },

                            ],
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-interpretation-update", ClinicalInterpretationUpdate);
