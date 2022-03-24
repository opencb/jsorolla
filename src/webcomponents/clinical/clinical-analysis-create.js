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
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import UtilsNew from "../../core/utilsNew.js";
import "../commons/forms/data-form.js";
import "../commons/filters/disease-panel-filter.js";
import "./filters/clinical-priority-filter.js";
import "./filters/clinical-flag-filter.js";


export default class ClinicalAnalysisCreate extends LitElement {

    constructor() {
        super();

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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.clinicalAnalysis = {};
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            // We store the available users from opencgaSession in 'clinicalAnalysis._users'
            this.clinicalAnalysis._users = [];
            if (this.opencgaSession?.study) {
                this._users = OpencgaCatalogUtils.getUsers(this.opencgaSession.study);
                this.initClinicalAnalysis();
            }

            this.requestUpdate();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    initClinicalAnalysis() {
        this.clinicalAnalysis = {
            type: "SINGLE",
            priority: "MEDIUM",
            analyst: {
                id: this.opencgaSession?.user?.id
            },
            // dueDate: moment().format("YYYYMMDDHHmmss"),
            _users: this._users,
            comments: []
        };
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "type":
                this.clinicalAnalysis.type = e.detail.value.toUpperCase();
                break;
            case "proband.id":
                this.clinicalAnalysis.proband = this.clinicalAnalysis.family.members.find(d => d.id === e.detail.value);
                if (this.clinicalAnalysis.proband?.disorders?.length > 0) {
                    this.clinicalAnalysis.disorder = {id: this.clinicalAnalysis.proband.disorders[0].id};
                }
                break;
            case "disorder.id":
                if (e.detail.value) {
                    if (this.clinicalAnalysis.proband?.disorders?.length > 0) {
                        const disorder = this.clinicalAnalysis.proband.disorders.find(d => e.detail.value === `${d.name} (${d.id})`);
                        this.clinicalAnalysis.disorder = {
                            id: disorder.id
                        };
                    }
                } else {
                    delete this.clinicalAnalysis.disorder;
                }
                break;
            case "analyst.id":
                this.clinicalAnalysis.analyst = {
                    id: e.detail.value
                };
                break;
            case "panels.id":
            case "flags.id":
                const [field, prop] = param.split(".");
                if (e.detail.value) {
                    this.clinicalAnalysis[field] = e.detail.value.split(",").map(value => ({[prop]: value}));
                } else {
                    delete this.clinicalAnalysis[field];
                }
                break;
            default:
                this.clinicalAnalysis[param] = e.detail.value;
                break;
        }

        this.clinicalAnalysis = {...this.clinicalAnalysis};
        this.requestUpdate();
    }

    onCustomFieldChange(field, e) {
        this.onFieldChange({detail: {value: e.detail.value, param: field}});
    }

    onIndividualChange(e) {
        if (e.detail.value) {
            this.clinicalAnalysis.type = "SINGLE";
            this.opencgaSession.opencgaClient.individuals().info(e.detail.value, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis.proband = response.responses[0].results[0];

                    if (this.clinicalAnalysis.proband?.disorders?.length === 1) {
                        this.clinicalAnalysis.disorder = {id: this.clinicalAnalysis.proband.disorders[0].id};
                    }

                    this.clinicalAnalysis = {...this.clinicalAnalysis};
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        } else {
            // Single Analyisis Configuration
            // Empty disorder and samples field when remove item from proband field.
            this.clinicalAnalysis = {
                ...this.clinicalAnalysis,
                proband: null,
            };
            this.requestUpdate();
        }
    }

    onFamilyChange(e) {
        if (e.detail.value) {
            this.clinicalAnalysis.type = "FAMILY";
            this.opencgaSession.opencgaClient.families().info(e.detail.value, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis.family = response.responses[0].results[0];

                    // Select as proband the first son/daughter with a disorder
                    if (this.clinicalAnalysis.family && this.clinicalAnalysis.family.members) {
                        for (const member of this.clinicalAnalysis.family.members) {
                            if (member.disorders && member.disorders.length > 0 && member.father.id && member.mother.id) {
                                this.clinicalAnalysis.proband = member;
                                break;
                            }
                        }
                    }

                    if (this.clinicalAnalysis.proband?.disorders?.length === 1) {
                        this.clinicalAnalysis.disorder = {id: this.clinicalAnalysis.proband.disorders[0].id};
                    }

                    this.clinicalAnalysis = {...this.clinicalAnalysis};
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        } else {
            // Empty family fields
            this.clinicalAnalysis = {
                ...this.clinicalAnalysis,
                proband: null,
                family: null,
            };
            this.requestUpdate();
        }
    }

    onCancerChange(e) {
        if (e.detail.value) {
            this.clinicalAnalysis.type = "CANCER";
            this.opencgaSession.opencgaClient.individuals().info(e.detail.value, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis.proband = response.responses[0].results[0];

                    if (this.clinicalAnalysis.proband?.disorders?.length === 1) {
                        this.clinicalAnalysis.disorder = {id: this.clinicalAnalysis.proband.disorders[0].id};
                    }

                    this.clinicalAnalysis = {...this.clinicalAnalysis};
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        } else {
            // Empty disorder and samples field when remove item from proband field.
            this.clinicalAnalysis = {
                ...this.clinicalAnalysis,
                proband: null,
            };
            this.requestUpdate();
        }
    }

    onCommentChange(e) {
        this.commentsUpdate = e.detail;
    }

    notifyClinicalAnalysisWrite() {
        LitUtils.dispatchCustomEvent(this, "clinicalAnalysisCreate", null, {
            id: this.clinicalAnalysis.id,
            clinicalAnalysis: this.clinicalAnalysis
        }, null);
    }

    onClear() {
        this.initClinicalAnalysis();
        this.requestUpdate();
    }

    onSubmit() {
        // Prepare the data for the REST create
        const data = {...this.clinicalAnalysis};

        // remove private fields
        delete data._users;

        data.proband = {
            id: this.clinicalAnalysis.proband?.id ? this.clinicalAnalysis.proband.id : null
        };

        if (data.type === "FAMILY") {
            data.family = {
                id: this.clinicalAnalysis.family.id,
                members: this.clinicalAnalysis.family.members.map(e => ({id: e.id}))
            };
        }

        // Fix comments field --> convert to array of messages
        // if (data.comments) {
        //     data.comments = [
        //         {message: data.comments},
        //     ];
        // }
        if (this.commentsUpdate) {
            data.comments = this.commentsUpdate.value;
        }

        // Clear dueDate field if not provided a valid value
        if (!data.dueDate) {
            delete data.dueDate;
        }

        this.opencgaSession.opencgaClient.clinical().create(data, {study: this.opencgaSession.study.fqn, createDefaultInterpretation: true})
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Clinical analysis created",
                    message: `The clinical analysis ${data.id} has been created successfully`,
                });
                this.notifyClinicalAnalysisWrite();
                this.onClear();
            })
            .catch(response => {
                // console.error(response);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    render() {
        if (!this.opencgaSession?.study) {
            return html `
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue</h3>
                </div>
            `;
        }

        return html`
            <data-form
                .data="${this.clinicalAnalysis}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            id: "clinical-analysis",
            title: "Create Case",
            icon: "fas fa-user-md",
            requires: "2.0.0",
            description: "Sample Variant Stats description",
            display: {
                buttonsWidth: 8,
                buttonClearText: "Clear",
                buttonOkText: "Create Clinical Analysis",
                width: 8,
                titleVisible: false,
                titleAlign: "left",
                titleWidth: 4,
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            title: "",
                            type: "notification",
                            text: "Some changes have been done in the form. Not saved, changes will be lost",
                            display: {
                                visible: () => Object.keys(this.clinicalAnalysis).length > 0,
                                notificationType: "warning",
                            }
                        },
                        {
                            title: "Case ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            // validation: () => {},
                            defaultValue: "",
                            display: {
                                placeholder: "eg. AN-3",
                            },
                            validation: {
                                validate: id => id && !id.includes(" "),
                                message: "ID must not contain spaces and other special chars",
                            },
                        },
                        {
                            title: "Analysis Type",
                            field: "type",
                            type: "select",
                            allowedValues: ["SINGLE", "FAMILY", "CANCER"],
                            defaultValue: "FAMILY",
                        },
                        {
                            title: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                render: panels => html`
                                    <disease-panel-filter
                                        .opencgaSession="${this.opencgaSession}"
                                        .diseasePanels="${this.opencgaSession.study?.panels}"
                                        .panel="${panels?.map(p => p.id).join(",")}"
                                        .showExtendedFilters="${false}"
                                        .showSelectedPanels="${false}"
                                        @filterChange="${e => this.onFieldChange(e, "panels.id")}">
                                    </disease-panel-filter>
                                `,
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
                                        @filterChange="${e => this.onFieldChange(e, "flags.id")}">
                                    </clinical-flag-filter>
                                `,
                            },
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 2,
                                placeholder: "Add a description to this case..."
                            },
                        }
                    ]
                },
                {
                    title: "Single Analysis Configuration",
                    display: {
                        visible: data => data.type && data.type.toUpperCase() === "SINGLE",
                    },
                    elements: [
                        {
                            title: "Select Proband",
                            field: "proband.id",
                            type: "custom",
                            required: true,
                            display: {
                                render: probandId => {
                                    return html`
                                        <individual-id-autocomplete
                                            .value="${probandId}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config=${{
                                                addButton: false,
                                                multiple: false
                                            }} @filterChange="${e => this.onIndividualChange(e)}">
                                        </individual-id-autocomplete>
                                    `;
                                },
                            },
                        },
                        {
                            title: "Select Disorder",
                            field: "disorder.id",
                            type: "select",
                            allowedValues: "proband.disorders",
                            display: {
                                apply: disorder => `${disorder.name} (${disorder.id})`,
                                errorMessage: "No disorders available",
                            }
                        },
                        {
                            title: "Samples",
                            field: "proband.samples",
                            type: "table",
                            display: {
                                // defaultLayout: "vertical",
                                errorMessage: "No proband selected",
                                errorClassName: "",
                                columns: [
                                    {
                                        title: "ID",
                                        type: "custom",
                                        display: {
                                            render: sample => html`<span style="font-weight: bold">${sample.id}</span>`,
                                        },
                                    },
                                    {
                                        title: "Files",
                                        field: "fileIds",
                                        type: "custom",
                                        display: {
                                            render: fileIds => {
                                                const fileVcfs = fileIds.filter(file => file.includes(".vcf")).join("<br>");
                                                return UtilsNew.renderHTML(`${fileVcfs}`);
                                            },
                                        },
                                    },
                                    {
                                        title: "Status",
                                        field: "status.name",
                                        defaultValue: "-",
                                    },
                                ]
                            }
                        }
                    ]
                },
                {
                    title: "Family Analysis Configuration",
                    display: {
                        visible: data => data.type && data.type.toUpperCase() === "FAMILY",
                    },
                    elements: [
                        {
                            title: "Select Family",
                            field: "family.id",
                            type: "custom",
                            required: true,
                            display: {
                                render: () => html`
                                    <family-id-autocomplete
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{
                                            addButton: false,
                                            multiple: false
                                        }}"
                                        @filterChange="${e => this.onFamilyChange(e)}">
                                    </family-id-autocomplete>
                                `,
                            },
                        },
                        {
                            title: "Select Proband",
                            field: "proband.id",
                            type: "select",
                            allowedValues: "family.members",
                            required: true,
                            display: {
                                errorMessage: "No family selected",
                            },
                        },
                        {
                            title: "Select Disorder",
                            field: "disorder.id",
                            type: "select",
                            allowedValues: "proband.disorders",
                            display: {
                                apply: disorder => `${disorder.name} (${disorder.id})`,
                                errorMessage: "No disorders available",
                            },
                        },
                        {
                            title: "Members",
                            field: "family.members",
                            type: "table",
                            display: {
                                width: 12,
                                // defaultLayout: "vertical",
                                errorMessage: "No family selected",
                                errorClassName: "",
                                columns: [
                                    {
                                        title: "Individual",
                                        type: "custom",
                                        display: {
                                            render: individual => html`
                                                <div style="font-weight: bold">${individual.id}</div>
                                                <div class="help-block">
                                                    ${individual.sex?.id || individual.sex || "Not specified"} (${individual.karyotypicSex || "Not specified"})
                                                </div>
                                            `,
                                        },
                                    },
                                    {
                                        title: "Sample",
                                        field: "samples",
                                        type: "custom",
                                        display: {
                                            render: samples => html`${samples[0].id}`,
                                        },
                                    },
                                    {
                                        title: "Father",
                                        field: "father.id",
                                    },
                                    {
                                        title: "Mother",
                                        field: "mother.id",
                                    },
                                    {
                                        title: "Disorders",
                                        field: "disorders",
                                        type: "custom",
                                        display: {
                                            render: disorders => {
                                                if (disorders && disorders.length > 0) {
                                                    let id = disorders[0].id;
                                                    const name = disorders[0].name;
                                                    if (id?.startsWith("OMIM:")) {
                                                        id = html`<a href="https://omim.org/entry/${id.split(":")[1]}" target="_blank">${id}</a>`;
                                                    }
                                                    return html`${name} (${id})`;
                                                } else {
                                                    return html`<span>N/A</span>`;
                                                }
                                            }
                                        }
                                    }
                                ]

                            }
                        },
                        {
                            title: "Pedigree",
                            type: "custom",
                            display: {
                                // defaultLayout: "vertical",
                                // visible: data => application.appConfig === "opencb", // TODO pedigree doesnt work with families with over 2 generations
                                render: data => {
                                    if (data.family) {
                                        return html`<pedigree-view .family="${data.family}"></pedigree-view>`;
                                    }
                                },
                                errorMessage: "No family selected",
                            }
                        }
                    ]
                },
                {
                    title: "Cancer Analysis Configuration",
                    collapsed: false,
                    display: {
                        visible: data => data.type && data.type.toUpperCase() === "CANCER",
                    },
                    elements: [
                        {
                            title: "Select Proband",
                            type: "custom",
                            required: true,
                            display: {
                                render: () => html`
                                    <individual-id-autocomplete
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{
                                            addButton: false,
                                            multiple: false
                                        }}"
                                        @filterChange="${e => this.onCancerChange(e)}">
                                    </individual-id-autocomplete>
                                `,
                            },
                        },
                        {
                            title: "Select Disorder",
                            field: "disorder.id",
                            type: "select",
                            allowedValues: "proband.disorders",
                            display: {
                                apply: disorder => `${disorder.name} (${disorder.id})`,
                                errorMessage: "No disorders available",
                            }
                        },
                        {
                            title: "Samples",
                            field: "proband.samples",
                            type: "table",
                            display: {
                                errorClassName: "",
                                errorMessage: "No proband selected",
                                columns: [
                                    {
                                        title: "ID",
                                        type: "custom",
                                        display: {
                                            render: sample => html`<span style="font-weight: bold">${sample.id}</span>`,
                                        }
                                    },
                                    {
                                        title: "Files",
                                        field: "fileIds",
                                        type: "custom",
                                        display: {
                                            render: fileIds => html`${fileIds.join("\n")}`,
                                        },
                                    },
                                    {
                                        title: "Somatic",
                                        field: "somatic",
                                    },
                                    {
                                        title: "Status",
                                        field: "status.name",
                                        defaultValue: "-",
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    title: "Management Information",
                    elements: [
                        {
                            title: "Priority",
                            field: "priority",
                            type: "custom",
                            display: {
                                render: priority => html`
                                    <clinical-priority-filter
                                        .priority="${priority}"
                                        .priorities="${this.opencgaSession.study.internal?.configuration?.clinical?.priorities}"
                                        .multiple="${false}"
                                        @filterChange="${e => this.onCustomFieldChange("priority", e)}">
                                    </clinical-priority-filter>
                                `,
                            }
                        },
                        {
                            title: "Assigned To",
                            field: "analyst.id",
                            type: "select",
                            defaultValue: this.opencgaSession?.user?.id,
                            allowedValues: "_users",
                        },
                        {
                            title: "Due Date",
                            field: "dueDate",
                            type: "input-date",
                        },
                        // {
                        //     title: "Comment",
                        //     field: "comments",
                        //     type: "input-text",
                        //     defaultValue: "",
                        //     display: {
                        //         rows: 2,
                        //         placeholder: "Initial comment...",
                        //     },
                        //
                        {
                            title: "Comments",
                            field: "comments",
                            type: "custom",
                            display: {
                                render: comments => html`
                                    <clinical-analysis-comment-editor
                                        .comments="${comments}"
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

customElements.define("clinical-analysis-create", ClinicalAnalysisCreate);
