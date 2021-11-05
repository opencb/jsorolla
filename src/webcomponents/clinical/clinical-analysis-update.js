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
import ClinicalAnalysisUtils from "./clinical-analysis-utils.js";
import FormUtils from "../commons/forms/form-utils";
import "./clinical-analysis-comment-editor.js";
import "../commons/forms/data-form.js";
import "../commons/forms/select-field-filter.js";


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

    renderStatus(status) {
        let statuses;
        const configStatuses = this.opencgaSession.study?.internal?.configuration?.clinical?.status[this.clinicalAnalysis.type];
        // TODO remove this code in version 2.3, status MUST come from server always since OpenCGA 2.1
        if (configStatuses?.length > 0) {
            statuses = configStatuses;
        } else {
            statuses = ClinicalAnalysisUtils.getStatuses();
        }

        return html`
            <div>
                <select-field-filter
                    .data="${statuses}" .value="${status.id}"
                    .classes="${this.updateParams.status ? "updated" : ""}"
                    ?disabled="${!!this.clinicalAnalysis?.locked}"
                    @filterChange="${e => {
                        e.detail.param = "status.id";
                        this.onFieldChange(e);
                    }}">
                </select-field-filter>
                ${status.description ? html`
                    <span class="help-block" style="padding: 0px 5px">${status.description}</span>
                ` : null}
            </div>
        `;
    }

    renderPanels(selectedPanels) {
        const studyPanels = this.opencgaSession.study.panels;
        const selectedValues = selectedPanels?.map(panel => panel.id).join(",");
        return html`
            <div>
                <select-field-filter
                    .data="${studyPanels}"
                    .value="${selectedValues}"
                    .multiple="${true}"
                    .classes="${this.updateParams.panels ? "updated" : ""}"
                    ?disabled="${!!this.clinicalAnalysis?.locked}"
                    @filterChange="${e => {
                        e.detail.param = "panels.id";
                        this.onFieldChange(e);
                    }}">
                </select-field-filter>
            </div>`;
    }

    renderFlags(flags) {
        const studyFlags = this.opencgaSession.study.internal.configuration?.clinical.flags[this.clinicalAnalysis.type.toUpperCase()];
        const selectedValues = flags.map(flag => flag.id).join(",");
        return html`
            <div>
                <select-field-filter
                    .data="${studyFlags}"
                    .value="${selectedValues}"
                    .multiple="${true}"
                    .classes="${this.updateParams.flags ? "updated" : ""}"
                    ?disabled="${!!this.clinicalAnalysis?.locked}"
                    @filterChange="${e => {
                        e.detail.param = "flags.id";
                        this.onFieldChange(e);
                    }}">
                </select-field-filter>
            </div>`;
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
        Swal.fire({
            title: "Success",
            icon: "success",
            html: "Case info updated successfully"
        });

        // Reset values after success update
        this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
        this.updateParams = {};

        this.dispatchEvent(new CustomEvent("clinicalAnalysisUpdate", {
            detail: {
                clinicalAnalysis: this.clinicalAnalysis
            },
            bubbles: true,
            composed: true
        }));
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "locked":
            case "panelLock":
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

            this.opencgaSession.opencgaClient.clinical().update(this.clinicalAnalysis.id, this.updateParams, {study: this.opencgaSession.study.fqn, flagsAction: "SET"})
                .then(response => {
                    this.postUpdate(response);
                })
                .catch(response => {
                    console.error("An error occurred updating clinicalAnalysis: ", response);
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
            type: "form",
            buttons: {
                show: true,
                clearText: "Cancel",
                okText: "Update",
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
                        style: "background-color: #f3f3f3; border-left: 4px solid #0c2f4c; padding: 10px",
                        elementLabelStyle: "padding-top: 0px; padding-left: 20px", // form add control-label which has an annoying top padding
                    },
                    elements: [
                        {
                            name: "Case ID",
                            type: "custom",
                            display: {
                                render: clinicalAnalysis => html`
                                    <span style="font-weight: bold; padding-right: 40px">${clinicalAnalysis.id}</span>
                                    <span><i class="far fa-calendar-alt"></i> ${UtilsNew.dateFormatter(clinicalAnalysis?.modificationDate)}</span>`
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
                            name: "Clinical Condition",
                            field: "disorder",
                            type: "custom",
                            display: {
                                render: disorder => UtilsNew.renderHTML(CatalogGridFormatter.disorderFormatter(disorder))
                            }
                        },
                        {
                            name: "Disease Panel",
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
                                                            <a href="https://panelapp.genomicsengland.co.uk/panels/${panel.source.id}/" target="_blank">
                                                                ${panel.name} (${panel.source.project} v${panel.source.version})
                                                            </a>
                                                        </div>`;
                                                } else {
                                                    panelHtml = panel.id;
                                                }
                                            })}`;
                                    }
                                    return html`<div>${panelHtml}</div>`;
                                }
                            }
                        },
                        {
                            name: "Analysis Type",
                            field: "type",
                        },
                        {
                            name: "Interpretation ID",
                            field: "interpretation",
                            type: "custom",
                            display: {
                                render: interpretation => html`
                                    <span style="font-weight: bold; margin-right: 10px">${interpretation?.id}</span>
                                    <span style="color: grey; padding-right: 40px">version ${interpretation?.version}</span>`
                            }
                        }
                    ]
                },
                {
                    id: "management",
                    title: "Management",
                    elements: [
                        {
                            name: "Lock",
                            field: "locked",
                            type: "toggle-switch",
                            display: {
                                width: "9",
                            }
                        },
                        {
                            name: "Status",
                            field: "status",
                            type: "custom",
                            display: {
                                width: "9",
                                render: status => this.renderStatus(status),
                                disabled: () => !!this.clinicalAnalysis?.locked,
                            }
                        },
                        {
                            name: "Priority",
                            field: "priority.id",
                            type: "select",
                            allowedValues: ["URGENT", "HIGH", "MEDIUM", "LOW"],
                            defaultValue: "MEDIUM",
                            display: {
                                width: "9",
                                disabled: () => !!this.clinicalAnalysis?.locked,
                            }
                        },
                        {
                            name: "Analyst",
                            field: "analyst.id",
                            type: "select",
                            defaultValue: this.clinicalAnalysis?.analyst?.id ?? this.clinicalAnalysis?.analyst?.assignee,
                            allowedValues: () => this.users,
                            display: {
                                width: "9",
                                disabled: () => !!this.clinicalAnalysis?.locked,
                            }
                        },
                        {
                            name: "Due Date",
                            field: "dueDate",
                            type: "input-date",
                            display: {
                                width: "9",
                                render: date => moment(date, "YYYYMMDDHHmmss").format("DD/MM/YYYY"),
                                disabled: () => !!this.clinicalAnalysis?.locked,
                            }
                        }
                    ]
                },
                {
                    id: "general",
                    title: "General",
                    elements: [
                        {
                            name: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                render: panels => this.renderPanels(panels),
                                disabled: () => !!this.clinicalAnalysis?.locked,
                            }
                        },
                        {
                            name: "Disease Panel Lock",
                            field: "panelLock",
                            type: "toggle-switch",
                            display: {
                                width: "9",
                                disabled: () => !!this.clinicalAnalysis?.locked,
                            }
                        },
                        {
                            name: "Flags",
                            field: "flags",
                            type: "custom",
                            display: {
                                render: flags => this.renderFlags(flags),
                                disabled: () => !!this.clinicalAnalysis?.locked,
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 3,
                                disabled: () => !!this.clinicalAnalysis?.locked,
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
                }
            ]
        };
    }

}

customElements.define("clinical-analysis-update", ClinicalAnalysisUpdate);
