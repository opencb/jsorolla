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
import ClinicalAnalysisUtils from "../../clinical/clinical-analysis-utils.js";
import "./variant-interpreter-qc-summary.js";
import "./variant-interpreter-qc-variant-stats.js";
import "./variant-interpreter-qc-inferred-sex.js";
import "./variant-interpreter-qc-relatedness.js";
import "./variant-interpreter-qc-mendelian-errors.js";
import "./variant-interpreter-qc-signature.js";
import "./variant-interpreter-qc-alignment-stats.js";
import "./variant-interpreter-qc-gene-coverage-stats.js";
import "./interpretation-grid.js";
import "./interpretation-history.js";
import "../../commons/view/data-form.js";
import "../../commons/filters/text-field-filter.js";

import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";


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

        this.clinicalAnalysisUtils = new ClinicalAnalysisUtils();
    }

    connectedCallback() {
        super.connectedCallback();

        this.catalogGridFormatter = new CatalogGridFormatter(this.opencgaSession);
        this.clinicalAnalysisUtils = new ClinicalAnalysisUtils();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
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

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    clinicalAnalysisObserver() {

    }

    onFilterChange(field, value) {
        console.log(field, value)
    }

    renderComments(comments) {
        const _comments = comments.map( (comment, i) => html`
                <div class="container-fluid comment-wrapper">
                    <div class="row">
                        <div class="col-md-4 col-sx">
                            <div>
                                <text-field-filter placeholder=${"Type"} .value="${comment.type}" @filterChange="${e => this.onFilterChange("type", e.detail.value)}"></text-field-filter>
                            </div>
                            <!--<div>
                                <text-field-filter placeholder=${"Author"} .value="${comment.author}" @filterChange="${e => this.onFilterChange("element.field", e.detail.value)}"></text-field-filter>
                            </div> -->
                            <div>
                                <div class='input-group date' id="${this._prefix}DuePickerDate" data-field="${""}">
                                    <input type='text' id="${this._prefix}date" class="${this._prefix}Input form-control" data-field="${comment.date}" ?disabled="${true}" >
                                    <span class="input-group-addon">
                                        <span class="fa fa-calendar"></span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-8 col-dx">
                            <text-field-filter .rows=${3} .value="${comment.message}" @filterChange="${e => this.onFilterChange("message", e.detail.value)}"></text-field-filter>
                        </div>
                    </div>
                     <button type="button" class="close-button btn btn-danger btn-small ripple" @click="${() => this.deleteComment(i)}"><i class="fas fa-times"></i></button>
                </div>`);

        return html`${_comments} <button type="button" class="btn btn-default ripple" @click="${() => this.addEmptyComment()}">Add new Comment</button>`
    }

    addEmptyComment = () => {
        this.clinicalAnalysis.comments.push({});
        this.clinicalAnalysis = {...this.clinicalAnalysis}
        this.requestUpdate();
    }

    deleteComment = i => {
        this.clinicalAnalysis.comments = [...this.clinicalAnalysis.comments.slice(0, i), ...this.clinicalAnalysis.comments.slice(i + 1)];
        this.clinicalAnalysis = {...this.clinicalAnalysis}
        this.requestUpdate();
    }

    renderStatus(status) {
        // <text-field-filter placeholder="Name" .value="${status.name}" @filterChange="${e => this.onFilterChange("status.name", e.detail.value)}"></text-field-filter>
        return html`
            <div class="">
                <div style="padding-bottom: 10px">
                    <select-field-filter .data="${ClinicalAnalysisUtils.getStatuses()}" 
                        @filterChange="${e => this.onFilterChange("status", e.detail.value)}">
                    </select-field-filter>
                </div>
                <div class="">
                    <text-field-filter placeholder="Message" .value="${status.description}" @filterChange="${e => this.onFilterChange("status.name", e.detail.value)}"></text-field-filter>
                </div>
            </div>`
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "lock":
                this.clinicalAnalysis.lock = e.detail.value;
                break;
        }
        // this.clinicalAnalysis
        // debugger
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
                // form: {
                //     layout: "horizontal"
                // },
                width: "6",
                showTitle: false,
                infoIcon: "",
                labelAlign: "left",
                labelWidth: "3",
                defaultLayout: "horizontal",
                // layout: [
                //     {
                //         id: "",
                //         classes: "",
                //         sections: [
                //             {
                //                 id: "summary",
                //                 classes: "col-md-6"
                //             },
                //             {
                //                 id: "management",
                //                 classes: "col-md-6"
                //             }
                //         ]
                //     },
                //     {
                //         id: "general",
                //         classes: "col-md-6"
                //     }
                // ]
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
                            field: "lock",
                            type: "toggle",
                            defaultValue: false,
                            display: {
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
                                // width: 9,
                            }
                        },
                        {
                            name: "Analyst",
                            field: "analyst.id",
                            type: "select",
                            defaultValue: this.clinicalAnalysis?.analyst?.id ?? this.clinicalAnalysis?.analyst?.assignee,
                            allowedValues: () => this._users,
                            display: {
                                // width: 9,
                            }
                        },
                        {
                            name: "Due Date",
                            field: "dueDate",
                            type: "input-date",
                            //defaultValue: moment().format("YYYYMMDDHHmmss"),
                            display: {
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
                            field: "internal.status",
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
                                // width: 9,
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                // width: 9,
                                rows: 2
                            }
                        },
                        {
                            name: "Creation Date",
                            field: "creationDate",
                            type: "input-text",
                            defaultValue: "today",
                            display: {
                                // width: 9,
                                visible: this.mode === "update",
                                disabled: true
                            }
                        },
                        {
                            name: "Comments",
                            field: "comments",
                            type: "custom",
                            display: {
                                render: comments => this.renderComments(comments)
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

    render() {
        if (!this.clinicalAnalysis) {
            return "";
        }

        return html`
            <data-form   .data="${this.clinicalAnalysis}" 
                        .config="${this._config}" 
                        @fieldChange="${e => this.onFieldChange(e)}" 
                        @clear="${this.onClear}" 
                        @submit="${this.onRun}">
            </data-form>
        `;
    }

}

customElements.define("interpretation-editor", InterpretationEditor);
