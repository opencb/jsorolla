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
import UtilsNew from "../../core/utilsNew.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import FormUtils from "../commons/forms/form-utils.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import "./clinical-analysis-comment-editor.js";
import "./filters/clinical-priority-filter.js";
import "./filters/clinical-flag-filter.js";
import "../commons/forms/data-form.js";
import "../commons/filters/disease-panel-filter.js";

import LitUtils from "../commons/utils/lit-utils";
import NotificationUtils from "../commons/utils/notification-utils.js";

class ClinicalAnalysisUpdate extends LitElement {

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
            clinicalAnalysis: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
            },
            opencgaSession: {
                type: Object
            }
        };
    }

    _init() {
        this.config = this.getDefaultConfig();
        this.updateParams = {};
        this.commentsUpdate = {};
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    clinicalAnalysisObserver() {
        if (this.opencgaSession && this.clinicalAnalysis) {
            this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
            this.flags = this.opencgaSession.study.internal.configuration?.clinical.flags[this.clinicalAnalysis.type.toUpperCase()]
                .map(flag => flag.id);
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    opencgaSessionObserver() {
        this.users = OpencgaCatalogUtils.getUsers(this.opencgaSession.study);
    }

    onCommentChange(e) {
        this.commentsUpdate = e.detail;
    }

    updateOrDeleteComments(notify) {
        if (this.commentsUpdate?.updated?.length > 0) {
            this.opencgaSession.opencgaClient.clinical()
                .update(this.clinicalAnalysis.id, {comments: this.commentsUpdate.updated}, {commentsAction: "REPLACE", study: this.opencgaSession.study.fqn})
                .then(response => {
                    if (notify && this.commentsUpdate?.deleted?.length === 0) {
                        this.postUpdate(response);
                    }
                })
                .catch(response => {
                    console.error("An error occurred updating clinicalAnalysis: ", response);
                });
        }
        if (this.commentsUpdate?.deleted?.length > 0) {
            this.opencgaSession.opencgaClient.clinical()
                .update(this.clinicalAnalysis.id, {comments: this.commentsUpdate.deleted}, {commentsAction: "REMOVE", study: this.opencgaSession.study.fqn})
                .then(response => {
                    if (notify) {
                        this.postUpdate(response);
                    }
                })
                .catch(response => {
                    console.error("An error occurred updating clinicalAnalysis: ", response);
                });
        }
    }

    postUpdate(response) {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
            message: "Case info updated successfully",
        });

        // Reset values after success update
        this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
        this.updateParams = {};

        LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
            clinicalAnalysis: this.clinicalAnalysis
        });
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "locked":
            case "panelLock":
            case "dueDate":
            case "description":
                this.updateParams = FormUtils
                    .updateScalar(this._clinicalAnalysis, this.clinicalAnalysis, this.updateParams, e.detail.param, e.detail.value);
                break;
            case "status.id":
            case "priority.id":
            case "analyst.id":
                this.updateParams = FormUtils
                    .updateObject(this._clinicalAnalysis, this.clinicalAnalysis, this.updateParams, e.detail.param, e.detail.value);
                break;
            case "panels.id":
            case "flags.id":
                this.updateParams = FormUtils
                    .updateObjectArray(this._clinicalAnalysis, this.clinicalAnalysis, this.updateParams, e.detail.param, e.detail.value, e.detail.data);
                break;
            case "comments":
                this.updateParams = FormUtils.updateArraysObject(
                    this._clinicalAnalysis,
                    this.clinicalAnalysis,
                    this.updateParams,
                    e.detail.param,
                    e.detail.value
                );
                this.updateParams.comments = this.updateParams.comments.filter(comment => !comment.author);
                break;
        }
        // Enable this only when a dynamic property in the config can change
        // this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onClear() {
        // First update config
        this.config = this.getDefaultConfig();

        // Reset all values
        this.clinicalAnalysis = JSON.parse(JSON.stringify(this._clinicalAnalysis));
        this.updateParams = {};
        this.commentsUpdate = {};
    }

    onSubmit() {
        if (this.commentsUpdate) {
            if (this.commentsUpdate.added?.length > 0) {
                this.updateParams.comments = this.commentsUpdate.added;
            }
        }

        if (this.updateParams && UtilsNew.isNotEmpty(this.updateParams)) {
            this.updateOrDeleteComments(false);

            this.opencgaSession.opencgaClient.clinical()
                .update(this.clinicalAnalysis.id, this.updateParams, {
                    study: this.opencgaSession.study.fqn,
                    flagsAction: "SET",
                    panelsAction: "SET",
                })
                .then(response => {
                    this.postUpdate(response);
                })
                .catch(response => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                    // console.error("An error occurred updating clinicalAnalysis: ", response);
                });
        } else {
            this.updateOrDeleteComments(true);
        }
    }

    render() {
        if (!this.clinicalAnalysis) {
            return "";
        }

        return html`
            <data-form
                .data="${this.clinicalAnalysis}"
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
            id: "clinical-analysis",
            title: "Case Editor",
            icon: "fas fa-user-md",
            buttons: {
                clearText: "Cancel",
                okText: "Update Case",
            },
            display: {
                width: 8,
                titleVisible: false,
                titleWidth: 4,
                defaultLayout: "horizontal",
                buttonsVisible: true,
                buttonsWidth: 8,
                buttonsAlign: "right",
            },
            sections: [
                {
                    elements: [
                        {
                            type: "notification",
                            text: "Some changes have been done in the form. Not saved, changes will be lost",
                            display: {
                                visible: () => !UtilsNew.isObjectValuesEmpty(this.updateParams),
                                notificationType: "warning",
                            }
                        }
                    ]
                },
                {
                    id: "summary",
                    title: "Summary",
                    display: {
                        style: "background-color:#f3f3f3;border-left:4px solid #0c2f4c;padding:16px;",
                    },
                    elements: [
                        {
                            title: "Case ID",
                            type: "custom",
                            display: {
                                render: clinicalAnalysis => html`
                                    <label>
                                        ${clinicalAnalysis.id}
                                    </label>
                                    <span style="padding-left: 50px">
                                        <i class="far fa-calendar-alt"></i>
                                        <label>Creation Date:</label> ${UtilsNew.dateFormatter(clinicalAnalysis?.creationDate)}
                                    </span>
                                    <span style="margin: 0 20px">
                                        <i class="far fa-calendar-alt"></i>
                                        <label>Due date:</label> ${UtilsNew.dateFormatter(clinicalAnalysis?.dueDate)}
                                    </span>
                                `,
                            }
                        },
                        {
                            title: "Proband",
                            field: "proband",
                            type: "custom",
                            display: {
                                render: proband => {
                                    const sex = (proband?.sex?.id !== "UNKNOWN") ? `(${proband.sex.id || proband.sex})` : "(Sex not reported)";
                                    const sampleIds = proband.samples.map(sample => sample.id).join(", ");
                                    return html`
                                        <span style="padding-right: 25px">
                                            ${proband.id} ${sex}
                                        </span>
                                        <span style="font-weight: bold; padding-right: 10px">
                                            Sample(s):
                                        </span>
                                        <span>${sampleIds}</span>
                                    `;
                                }
                            }
                        },
                        {
                            title: "Clinical Condition",
                            field: "disorder",
                            type: "custom",
                            display: {
                                render: disorder => UtilsNew.renderHTML(CatalogGridFormatter.disorderFormatter(disorder)),
                            }
                        },
                        {
                            title: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                render: panels => {
                                    let panelHtml = "-";
                                    if (panels?.length > 0) {
                                        panelHtml = html`
                                            ${panels.map(panel => {
                                                if (panel.source?.project?.toUpperCase() === "PANELAPP") {
                                                    return html`
                                                        <div style="margin: 5px 0px">
                                                            <a href="${BioinfoUtils.getPanelAppLink(panel.source.id)}" target="_blank">
                                                                ${panel.name} (${panel.source.project} v${panel.source.version})
                                                            </a>
                                                        </div>`;
                                                } else {
                                                    return html`<div>${panel.id}</div>`;
                                                }
                                            })}`;
                                    }
                                    return html`<div>${panelHtml}</div>`;
                                }
                            }
                        },
                        {
                            title: "Analysis Type",
                            field: "type",
                        },
                        {
                            title: "Interpretation ID",
                            field: "interpretation",
                            type: "custom",
                            display: {
                                render: interpretation => html`
                                    <span style="font-weight: bold; margin-right: 10px">
                                        ${interpretation?.id}
                                    </span>
                                    <span style="color: grey; padding-right: 40px">
                                        version ${interpretation?.version}
                                    </span>
                                `,
                            }
                        }
                    ]
                },
                {
                    id: "management",
                    title: "Management",
                    elements: [
                        {
                            title: "Lock",
                            field: "locked",
                            type: "toggle-switch",
                        },
                        {
                            title: "Status",
                            field: "status",
                            type: "custom",
                            display: {
                                render: status => html`
                                    <clinical-status-filter
                                        .status="${status.id}"
                                        .statuses="${this.opencgaSession.study.internal?.configuration?.clinical?.status[this.clinicalAnalysis.type.toUpperCase()]}"
                                        .multiple=${false}
                                        .classes="${this.updateParams.status ? "updated" : ""}"
                                        .disabled="${!!this.clinicalAnalysis?.locked}"
                                        @filterChange="${e => {
                                            e.detail.param = "status.id";
                                            this.onFieldChange(e);
                                        }}">
                                    </clinical-status-filter>
                                `,
                            }
                        },
                        {
                            title: "Priority",
                            field: "priority.id",
                            type: "custom",
                            display: {
                                render: priority => html`
                                    <clinical-priority-filter
                                        .priority="${priority}"
                                        .priorities="${this.opencgaSession.study.internal?.configuration?.clinical?.priorities}"
                                        .multiple=${false}
                                        .classes="${this.updateParams.priority ? "updated" : ""}"
                                        .disabled="${!!this.clinicalAnalysis?.locked}"
                                        @filterChange="${e => {
                                            e.detail.param = "priority.id";
                                            this.onFieldChange(e);
                                        }}">
                                    </clinical-priority-filter>
                                `,
                            }
                        },
                        {
                            title: "Analyst",
                            field: "analyst.id",
                            type: "select",
                            defaultValue: this.clinicalAnalysis?.analyst?.id ?? this.clinicalAnalysis?.analyst?.assignee,
                            allowedValues: () => this.users,
                            display: {
                                disabled: clinicalAnalysis => !!clinicalAnalysis?.locked,
                            }
                        },
                        {
                            title: "Due Date",
                            field: "dueDate",
                            type: "input-date",
                            display: {
                                disabled: clinicalAnalysis => !!clinicalAnalysis?.locked,
                            },
                        }
                    ]
                },
                {
                    id: "general",
                    title: "General",
                    elements: [
                        {
                            title: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                // disabled: clinicalAnalysis => !!clinicalAnalysis?.locked,
                                render: panels => {
                                    return html`
                                        <disease-panel-filter
                                            .opencgaSession="${this.opencgaSession}"
                                            .diseasePanels="${this.opencgaSession.study?.panels}"
                                            .panel="${panels.map(panel => panel.id).join(",")}"
                                            .showExtendedFilters="${false}"
                                            .classes="${this.updateParams.panels ? "updated" : ""}"
                                            .disabled="${!!this.clinicalAnalysis?.locked || !!this.clinicalAnalysis?.panelLock}"
                                            @filterChange="${e => {
                                                e.detail.param = "panels.id";
                                                this.onFieldChange(e);
                                            }}">
                                        </disease-panel-filter>
                                    `;
                                }
                            }
                        },
                        {
                            title: "Disease Panel Lock",
                            field: "panelLock",
                            type: "toggle-switch",
                            display: {
                                helpMessage: "All existing interpretations must contain at least one of the Clinical Analysis panels to enable Disease Panel Lock.",
                                disabled: clinicalAnalysis => {
                                    if (clinicalAnalysis?.locked) {
                                        return true;
                                    }

                                    const interpretations = [
                                        clinicalAnalysis.interpretation,
                                        ...clinicalAnalysis.secondaryInterpretations,
                                    ];

                                    return interpretations.some(interpretation => {
                                        // Josemi 20220518 NOTE: interpretations should contain at least one panel from the clinical analysis
                                        // to enable the disease panels lock switch
                                        if (!interpretation?.panels || interpretation?.panels?.length < 1) {
                                            return true;
                                        }

                                        // We only need to find ONE panel in the interpretation that is not in the case panels for disabling
                                        // the disease panels lock
                                        return interpretation?.panels.some(panel => {
                                            return clinicalAnalysis?.panels?.findIndex(p => p.id === panel.id) === -1;
                                        });
                                    });
                                },
                            },
                        },
                        {
                            title: "Flags",
                            field: "flags",
                            type: "custom",
                            display: {
                                render: flags => html`
                                    <clinical-flag-filter
                                        .flag="${flags?.map(f => f.id).join(",")}"
                                        .flags="${this.opencgaSession.study.internal?.configuration?.clinical?.flags[this.clinicalAnalysis.type.toUpperCase()]}"
                                        .multiple=${true}
                                        .classes="${this.updateParams.flags ? "updated" : ""}"
                                        .disabled="${!!this.clinicalAnalysis?.locked}"
                                        @filterChange="${e => {
                                            e.detail.param = "flags.id";
                                            this.onFieldChange(e);
                                        }}">
                                    </clinical-flag-filter>
                                `,
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 3,
                                disabled: clinicalAnalysis => !!clinicalAnalysis?.locked,
                            }
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
                                view: comment => html`
                                    <div style="margin-bottom:1rem;">
                                        <div style="display:flex;margin-bottom:0.5rem;">
                                            <div style="padding-right:1rem;">
                                                <i class="fas fa-comment-dots"></i>
                                            </div>
                                            <div style="font-weight:bold">
                                                ${comment.author || "-"} - ${UtilsNew.dateFormatter(comment.date)}
                                            </div>
                                        </div>
                                        <div style="width:100%;">
                                            <div style="margin-bottom:0.5rem;">${comment.message || "-"}</div>
                                            <div class="text-muted">Tags: ${(comment.tags || []).join(" ") || "-"}</div>
                                        </div>
                                    </div>
                                `,
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
                            ]
                        },
                        // {
                        //     title: "Comments",
                        //     field: "comments",
                        //     type: "custom",
                        //     display: {
                        //         render: comments => html`
                        //             <clinical-analysis-comment-editor
                        //                 .opencgaSession=${this.opencgaSession}
                        //                 .comments="${comments}"
                        //                 .disabled="${!!this.clinicalAnalysis?.locked}"
                        //                 @commentChange="${e => this.onCommentChange(e)}">
                        //             </clinical-analysis-comment-editor>
                        //         `,
                        //     }
                        // }
                    ]
                }
            ]
        };
    }

}

customElements.define("clinical-analysis-update", ClinicalAnalysisUpdate);
