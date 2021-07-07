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


class ClinicalAnalysisEditor extends LitElement {

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
            clinicalAnalysis: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
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

            this.flags = this.opencgaSession.study.configuration.clinical.flags[this.clinicalAnalysis.type.toUpperCase()].map(flag => flag.id);
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
        let statuses;
        const configStatuses = this.opencgaSession.study?.configuration?.clinical?.status[this.clinicalAnalysis.type];
        if (configStatuses && configStatuses.length > 0) {
            statuses = configStatuses;
        } else {
            statuses = ClinicalAnalysisUtils.getStatuses();
        }

        return html`
            <div class="">
                <select-field-filter .data="${statuses}" .value="${status.id}"
                                     .classes="${this.updateParams.status ? "updated" : ""}"
                                     @filterChange="${e => {e.detail.param = "status.id"; this.onFieldChange(e)}}">
                </select-field-filter>
                ${status.description ?
            html`<span class="help-block" style="padding: 0px 5px">${status.description}</span>` :
            null
        }
            </div>`;
    }

    renderPanels(selectedPanels) {
        const panels = this.opencgaSession.study.panels;
        const selectedValues = selectedPanels?.map(panel => panel.id).join(",");
        return html`
            <div class="">
                <select-field-filter .data="${panels}" 
                                     .value="${selectedValues}"
                                     .multiple="${true}"
                                     .classes="${this.updateParams.panels ? "updated" : ""}"
                                     @filterChange="${e => {
                                        e.detail.param = "panels.id";
                                        this.onFieldChange(e);
                                    }}">
                </select-field-filter>
            </div>`;
    }

    renderFlags(flags) {
        const studyFlags = this.opencgaSession.study.configuration.clinical.flags[this.clinicalAnalysis.type.toUpperCase()].map(flag => flag.id);
        const selectedValues = flags.map(flag => flag.id).join(",");
        return html`
            <div class="">
                <select-field-filter .data="${studyFlags}" 
                                     .value="${selectedValues}"
                                     .multiple="${true}"
                                     .classes="${this.updateParams.flags ? "updated" : ""}"
                                     @filterChange="${e => {
                                         e.detail.param = "flags.id";
                                         this.onFieldChange(e);
                                     }}">
                </select-field-filter>
            </div>`;
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "locked":
            case "description":
                if (this._clinicalAnalysis[e.detail.param] !== e.detail.value && e.detail.value !== null) {
                    this.clinicalAnalysis[e.detail.param] = e.detail.value;
                    this.updateParams[e.detail.param] = e.detail.value;
                } else {
                    this.clinicalAnalysis[e.detail.param] = this._clinicalAnalysis[e.detail.param].id;
                    delete this.updateParams[e.detail.param];
                }
                break;
            case "status.id":
            case "priority.id":
            case "analyst.id":
                const field = e.detail.param.split(".")[0];
                if (this._clinicalAnalysis[field]?.id !== e.detail.value && e.detail.value !== null) {
                    this.clinicalAnalysis[field].id = e.detail.value;
                    this.updateParams[field] = {
                        id: e.detail.value
                    };
                } else {
                    this.clinicalAnalysis[field].id = this._clinicalAnalysis[field].id;
                    delete this.updateParams[field];
                }
                break;
            case "flags.id":
                if (!this._clinicalAnalysis?.flags) {
                    this._clinicalAnalysis = {
                        flags: []
                    };
                }

                const index = this._clinicalAnalysis.flags.findIndex(flag => flag.id === e.detail.value);
                if (index === -1 && e.detail.value !== null) {
                    this.clinicalAnalysis.flags.push({id: e.detail.value});
                    if (!this.updateParams?.flags) {
                        this.updateParams.flags = [];
                    }
                    for (const flag of this.clinicalAnalysis.flags) {
                        this.updateParams.flags.push({id: flag.id});
                    }
                } else {
                    this.updateParams.flags.splice(index, 1);
                }
                if (this.updateParams.flags?.length === 0) {
                    delete this.updateParams.flags;
                }
                break;
            case "panels.id":
                if (!this._clinicalAnalysis?.panels) {
                    this._clinicalAnalysis = {
                        panels: []
                    };
                }

                const panelIndex = this._clinicalAnalysis.panels.findIndex(panel => panel.id === e.detail.value);
                if (panelIndex === -1 && e.detail.value !== null) {
                    this.clinicalAnalysis.panels.push({id: e.detail.value});
                    if (!this.updateParams?.panels) {
                        this.updateParams.panels = [];
                    }
                    for (const panel of this.clinicalAnalysis.panels) {
                        this.updateParams.panels.push(panel.id);
                    }
                } else {
                    this.updateParams.panels.splice(panelIndex, 1);
                }
                if (this.updateParams.panels?.length === 0) {
                    delete this.updateParams.panels;
                }
                break;
        }
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onCommentChange(e) {
        this.commentsUpdate = e.detail
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
                            name: "Case ID",
                            // field: "id",
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
                                            ${panels.map(panel => html`
                                                <div style="margin: 5px 0px">
                                                    <a href="https://panelapp.genomicsengland.co.uk/panels/${panel.source.id}/" target="_blank">
                                                        ${panel.name} (${panel.source.project} v${panel.source.version})
                                                    </a>
                                                </div>
                                            `)}`;
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
                            // defaultValue: false,
                            display: {
                                width: "9",
                                updated: this.updateParams.locked ?? false
                                // onText: "YES",
                                // activeClass: "btn-danger"
                            }
                        },
                        {
                            name: "Status",
                            field: "status",
                            type: "custom",
                            display: {
                                width: "9",
                                updated: this.updateParams.status ?? false,
                                render: status => this.renderStatus(status)
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
                                updated: this.updateParams.priority ?? false
                            }
                        },
                        {
                            name: "Analyst",
                            field: "analyst.id",
                            type: "select",
                            defaultValue: this.clinicalAnalysis?.analyst?.id ?? this.clinicalAnalysis?.analyst?.assignee,
                            allowedValues: () => this._users,
                            display: {
                                width: "9",
                                updated: this.updateParams.analyst ?? false
                            }
                        },
                        {
                            name: "Due Date",
                            field: "dueDate",
                            type: "input-date",
                            display: {
                                width: "9",
                                render: date => moment(date, "YYYYMMDDHHmmss").format("DD/MM/YYYY"),
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
                                updated: this.updateParams.panels ?? false
                            }
                        },
                        {
                            name: "Flags",
                            field: "flags",
                            type: "custom",
                            display: {
                                render: flags => this.renderFlags(flags),
                                updated: this.updateParams.flags ?? false
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 3,
                                updated: this.updateParams.description ?? false
                            }
                        },
                        {
                            name: "Comments",
                            field: "comments",
                            type: "custom",
                            display: {
                                render: comments => html`
                                    <clinical-analysis-comment-editor .comments="${comments}" 
                                                                      @commentChange="${e => this.onCommentChange(e)}">
                                    </clinical-analysis-comment-editor>`
                            }
                        }
                    ]
                }
            ]
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

            this.opencgaSession.opencgaClient.clinical().update(this.clinicalAnalysis.id, this.updateParams, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this._postUpdate(response);
                })
                .catch(response => {
                    console.error("An error occurred updating clinicalAnalysis: ", response);
                });
        } else {
            this._updateOrDeleteComments(true);
        }
    }

    _updateOrDeleteComments(notify) {
        if (this.commentsUpdate?.updated?.length > 0) {
            this.opencgaSession.opencgaClient.clinical().update(this.clinicalAnalysis.id, {comments: this.commentsUpdate.updated}, {commentsAction: "REPLACE", study: this.opencgaSession.study.fqn})
                .then(response => {
                    if (notify && this.commentsUpdate?.deleted?.length === 0) {
                        this._postUpdate(response);
                    }
                })
                .catch(response => {
                    console.error("An error occurred updating clinicalAnalysis: ", response);
                });
        }
        if (this.commentsUpdate?.deleted?.length > 0) {
            this.opencgaSession.opencgaClient.clinical().update(this.clinicalAnalysis.id, {comments: this.commentsUpdate.deleted}, {commentsAction: "REMOVE", study: this.opencgaSession.study.fqn})
                .then(response => {
                    if (notify) {
                        this._postUpdate(response);
                    }
                })
                .catch(response => {
                    console.error("An error occurred updating clinicalAnalysis: ", response);
                });
        }
    }

    _postUpdate(response) {
        Swal.fire({
            title: "Success",
            icon: "success",
            html: "Case info updated successfully"
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
            <data-form  .data="${this.clinicalAnalysis}" 
                        .config="${this._config}" 
                        @fieldChange="${e => this.onFieldChange(e)}" 
                        @clear="${this.onClear}" 
                        @submit="${this.onRun}">
            </data-form>
        `;
    }

}

customElements.define("clinical-analysis-editor", ClinicalAnalysisEditor);
