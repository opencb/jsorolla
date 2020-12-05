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
        return html`
            <div class="">
                <select-field-filter .data="${ClinicalAnalysisUtils.getStatuses()}" .value="${status.id}"
                                     .classes="${this.updateParams.status ? "updated" : ""}"
                                     @filterChange="${e => {e.detail.param = "status.id"; this.onFieldChange(e)}}">
                </select-field-filter>
                ${status.description
                    ? html`<span class="help-block" style="padding: 0px 5px">${status.description}</span>`
                    : null
                }
            </div>`;
    }

    renderFlags(flags) {
        let studyFlags = this.opencgaSession.study.configuration.clinical.flags[this.clinicalAnalysis.type.toUpperCase()].map(flag => flag.id);
        let selectedValues = flags.map(flag => flag.id).join(",");
        return html`
            <div class="">
                <select-field-filter .data="${studyFlags}" .value="${selectedValues}"
                                     .classes="${this.updateParams.flags ? "updated" : ""}"
                                     @filterChange="${e => {e.detail.param = "flags.id"; this.onFieldChange(e)}}">
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
                let field = e.detail.param.split(".")[0];
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

                let index = this._clinicalAnalysis.flags.findIndex(flag => flag.id === e.detail.value);
                if (index === -1 && e.detail.value !== null) {
                    this.clinicalAnalysis.flags.push({id: e.detail.value});
                    if (!this.updateParams?.flags) {
                        this.updateParams.flags = [];
                    }
                    for (let flag of this.clinicalAnalysis.flags) {
                        this.updateParams.flags.push({id: flag.id});
                    }
                } else {
                    this.updateParams.flags.splice(index, 1);
                }
                if (this.updateParams.flags?.length === 0) {
                    delete this.updateParams.flags;
                }
                break;
        }
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onCommentChange(e) {
        if (e.detail) {
            switch (e.detail.action.toUpperCase()) {
                case "ADD":
                    if (e.detail.value?.message) {
                        // if (this.clinicalAnalysis.comments?.length === 0) {
                        //     this.clinicalAnalysis.comments.push(e.detail.value);
                        // } else {
                        // debugger
                        //     this.clinicalAnalysis.comments[this.clinicalAnalysis.comments.length - 1] = e.detail.value;
                        // }
                        this.updateParams.comments = {
                            add: [e.detail.value]
                        };
                    } else {
                        delete this.updateParams.comments;
                    }
                    break;
                case "EDIT":
                    break;
                case "DELETE":
                    if (!this.updateParams.comments?.delete) {
                        this.updateParams.comments = {
                            delete: []
                        };
                    }

                    this.updateParams.comments.delete.push(e.detail.value);
                    break;
            }
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
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
                            name: "Flags",
                            field: "flags",
                            type: "custom",
                            display: {
                                render: flags => this.renderFlags(flags)
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
                                                                      .opencgaSession="${this.opencgaSession}"
                                                                      @fieldChange="${e => this.onCommentChange(e)}">
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
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();

        Swal.fire({
            title: "Cancel",
            icon: "success",
            html: "Changes cancel"
        });
    }

    onRun(e) {
        let options = {study: this.opencgaSession.study.fqn};

        if (this.updateParams && UtilsNew.isNotEmpty(this.updateParams)) {
            if (this.updateParams.comments) {
                let comments = [];
                if (this.clinicalAnalysis.comments) {
                    if (this.updateParams.comments.add) {
                        comments = [...this.clinicalAnalysis.comments, this.updateParams.comments.add[0]];
                    }
                    if (this.updateParams.comments.delete) {
                        for (let comment of this.updateParams.comments.delete) {
                            let index = this.clinicalAnalysis.comments.findIndex(c => c.date === comment.date);
                            comments.splice(index, 1);
                        }
                    }
                } else {
                    this.clinicalAnalysis.comments = this.updateParams.comments.add;
                }

                this.clinicalAnalysis.comments = comments;
                this.updateParams.comments = this.updateParams.comments.add;
                // options.commentsAction = "SET";
            }

            this.opencgaSession.opencgaClient.clinical().update(this.clinicalAnalysis.id, this.updateParams, options)
                .then(response => {
                    console.log(response);
                    this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));

                    this.updateParams = {};
                    this._config = {...this.getDefaultConfig(), ...this.config};
                    this.requestUpdate();

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

customElements.define("clinical-analysis-editor", ClinicalAnalysisEditor);
