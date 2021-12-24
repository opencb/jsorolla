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
import "../../commons/forms/data-form.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import "../filters/clinical-priority-filter.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";

export default class OpencgaClinicalAnalysisWriter extends LitElement {

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
            clinicalAnalysis: {
                type: Object
            },
            mode: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.mode = "create";
        this.clinicalAnalysis = {};
        this.checkProjects = false;
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            // We store the available users from opencgaSession in 'clinicalAnalysis._users'
            this.clinicalAnalysis._users = [];
            if (this.opencgaSession && this.opencgaSession.study) {
                this.checkProjects = true;
                const _users = OpencgaCatalogUtils.getUsers(this.opencgaSession.study);
                this.clinicalAnalysis = {
                    type: "SINGLE",
                    priority: "MEDIUM",
                    analyst: {
                        id: this.opencgaSession?.user?.id
                    },
                    dueDate: moment().format("YYYYMMDDHHmmss"),
                    comments: [],
                    _users: _users
                };
            } else {
                this.checkProjects = false;
            }

            this.requestUpdate();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "type":
                this.clinicalAnalysis.type = e.detail.value.toUpperCase();
                break;
            case "proband.id":
                const _proband = this.clinicalAnalysis.family.members.filter(d => d.id === e.detail.value);
                this.clinicalAnalysis.proband = _proband[0];
                this.clinicalAnalysis.disorder = _proband[0].disorders && _proband[0].disorders.length > 0 ? _proband[0].disorders[0] : null;
                break;
            case "disorder.id":
                const _disorder = this.clinicalAnalysis.proband.disorders.filter(d => d.id === e.detail.value);
                this.clinicalAnalysis.disorder = _disorder[0];
                break;
            case "analyst.id":
                this.clinicalAnalysis.analyst = {
                    id: e.detail.value
                };
                break;
            case "_comments":
                this.clinicalAnalysis.comments = [
                    {
                        message: e.detail.value
                    }
                ];
                break;
            default:
                this.clinicalAnalysis[e.detail.param] = e.detail.value;
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

                    if (this.clinicalAnalysis.proband && this.clinicalAnalysis.proband.disorders?.length === 1) {
                        this.clinicalAnalysis.disorder = this.clinicalAnalysis.proband.disorders[0];
                    }

                    this.clinicalAnalysis = {...this.clinicalAnalysis};
                    this.requestUpdate();
                })
                .catch(function (reason) {
                    console.error(reason);
                });
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

                    if (this.clinicalAnalysis.proband && this.clinicalAnalysis.proband.disorders?.length === 1) {
                        this.clinicalAnalysis.disorder = this.clinicalAnalysis.proband.disorders[0];
                    }

                    this.clinicalAnalysis = {...this.clinicalAnalysis};
                    this.requestUpdate();
                })
                .catch(function (reason) {
                    console.error(reason);
                });
        }
    }

    onCancerChange(e) {
        if (e.detail.value) {
            this.clinicalAnalysis.type = "CANCER";
            this.opencgaSession.opencgaClient.individuals().info(e.detail.value, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis.proband = response.responses[0].results[0];
                    if (this.clinicalAnalysis.proband && this.clinicalAnalysis.proband.disorders?.length === 1) {
                        this.clinicalAnalysis.disorder = this.clinicalAnalysis.proband.disorders[0];
                    }

                    this.clinicalAnalysis = {...this.clinicalAnalysis};
                    this.requestUpdate();
                })
                .catch(function (reason) {
                    console.error(reason);
                });
        }
    }

    notifyClinicalAnalysisWrite() {
        const eventName = this.mode === "create" ? "clinicalAnalysisCreate" : "clinicalanalysischange";
        this.dispatchEvent(new CustomEvent(eventName, {
            detail: {
                id: this.clinicalAnalysis.id,
                clinicalAnalysis: this.clinicalAnalysis
            },
            bubbles: true,
            composed: true
        }));
    }

    renderPanels(selectedPanels) {
        const panels = this.opencgaSession.study.panels;
        const selectedValues = selectedPanels?.map(panel => panel.id).join(",");
        return html`
            <div class="">
                <select-field-filter .data="${panels}"
                                     .value="${selectedValues}"
                                     .multiple="${true}"
                                     @filterChange="${e => {
                                        e.detail.param = "panels.id";
                                        this.onFieldChange(e);
                                    }}">
                </select-field-filter>
            </div>`;
    }

    getDefaultConfig() {
        return {
            id: "clinical-analysis",
            title: "Create Case",
            icon: "fas fa-user-md",
            type: "form",
            requires: "2.0.0",
            description: "Sample Variant Stats description",
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
                submitText: "Create"
            },
            display: {
                width: "8",
                showTitle: false,
                infoIcon: "",
                labelAlign: "left",
                labelWidth: "4",
                defaultLayout: "horizontal"
            },
            sections: [
                {
                    title: "General Information",
                    display: {
                    },
                    elements: [
                        {
                            name: "Case ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            // validate: () => {},
                            defaultValue: "",
                            display: {
                                placeholder: "eg. AN-3",
                                disabled: () => this.mode === "update",
                                // showList: true,
                                // fileUpload: true
                                errorMessage: ""
                            }
                        },
                        {
                            name: "Analysis Type",
                            field: "type",
                            type: "select",
                            allowedValues: ["SINGLE", "FAMILY", "CANCER"],
                            defaultValue: "FAMILY",
                            errorMessage: "No found...",
                            display: {
                                disabled: () => this.mode === "update"
                            }
                        },
                        {
                            name: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                render: panels => this.renderPanels(panels)
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
                        }
                    ]
                },
                {
                    title: "Single Analysis Configuration",
                    display: {
                        visible: data => data.type && data.type.toUpperCase() === "SINGLE"
                    },
                    elements: [
                        {
                            name: "Select Proband",
                            field: "proband.id",
                            type: "custom",
                            display: {
                                visible: data => this.mode === "create",
                                render: data => {
                                    return html`
                                        <individual-id-autocomplete
                                            .opencgaSession="${this.opencgaSession}" ?disabled=${this.mode === "update"} .config=${{
                                                    addButton: false,
                                                    multiple: false
                                                }} @filterChange="${e => this.onIndividualChange(e)}">
                                        </individual-id-autocomplete>`;
                                }
                            }
                        },
                        {
                            name: "Select Disorder",
                            field: "disorder.id",
                            type: "select",
                            allowedValues: "proband.disorders",
                            required: true,
                            display: {
                                apply: disorder => `${disorder.name} (${disorder.id})`,
                                errorMessage: "No proband selected"
                            }
                        },
                        {
                            name: "Samples",
                            field: "proband.samples",
                            type: "table",
                            display: {
                                defaultLayout: "vertical",
                                errorMessage: "No proband selected",
                                errorClasses: "",
                                columns: [
                                    {
                                        name: "ID", type: "custom",
                                        display: {
                                            render: sample => html`
                                                <div><span style="font-weight: bold">${sample.id}</span></div>`
                                        }
                                    },
                                    {
                                        name: "Files", field: "fileIds", type: "custom",
                                        display: {
                                            render: fileIds => html`${fileIds.join("<br>")}`
                                        }
                                    },
                                    {
                                        name: "Status", field: "status.name", defaultValue: "-"
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    title: "Family Analysis Configuration",
                    display: {
                        visible: data => data.type && data.type.toUpperCase() === "FAMILY"
                    },
                    elements: [
                        {
                            name: "Select Family",
                            field: "family.id",
                            type: "custom",
                            display: {
                                visible: data => this.mode === "create",
                                render: data => {
                                    return html`
                                        <family-id-autocomplete
                                            .opencgaSession="${this.opencgaSession}" ?disabled=${this.mode === "update"} .config=${{
                                        addButton: false,
                                        multiple: false
                                    }} @filterChange="${e => this.onFamilyChange(e)}">
                                        </family-id-autocomplete>`;
                                }
                            }
                        },
                        {
                            name: "Select Family",
                            field: "family.id",
                            type: "basic",
                            display: {
                                visible: data => this.mode === "update"
                            }
                        },
                        {
                            name: "Select Proband",
                            field: "proband.id",
                            type: "select",
                            allowedValues: "family.members",
                            required: true,
                            display: {
                                errorMessage: "No family selected"
                            }
                        },
                        {
                            name: "Select Disorder",
                            field: "disorder.id",
                            type: "select",
                            allowedValues: "proband.disorders",
                            required: true,
                            display: {
                                apply: disorder => `${disorder.name} (${disorder.id})`,
                                errorMessage: "No family selected"
                            }
                        },
                        {
                            name: "Members",
                            field: "family.members",
                            type: "table",
                            display: {
                                width: "12",
                                defaultLayout: "vertical",
                                errorMessage: "No family selected",
                                errorClasses: "",
                                columns: [
                                    {
                                        name: "Individual", type: "custom",
                                        display: {
                                            render: individual => html`
                                                <div><span style="font-weight: bold">${individual.id}</span></div>
                                                <div><span class="help-block">${individual.sex} (${individual.karyotypicSex})</span></div>`
                                        }
                                    },
                                    {
                                        name: "Sample", field: "samples", type: "custom",
                                        display: {
                                            render: samples => html`${samples[0].id}`
                                        }
                                    },
                                    {
                                        name: "Father", field: "father.id"
                                    },
                                    {
                                        name: "Mother", field: "mother.id"
                                    },
                                    {
                                        name: "Disorders", field: "disorders", type: "custom",
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
                        // {
                        //     name: "Members",
                        //     field: "family",
                        //     type: "custom",
                        //     display: {
                        //         width: "12",
                        //         defaultLayout: "vertical",
                        //         render: (family) => {
                        //             if (family && family.members) {
                        //                 let individualGridConfig = {
                        //                     showSelectCheckbox: false,
                        //                     showToolbar: false
                        //                 };
                        //                 return html`
                        //                     <individual-grid .opencgaSession="${this.opencgaSession}"
                        //                                              .individuals="${family.members}"
                        //                                              .config="${individualGridConfig}"
                        //                                              @filterChange="${e => this.onFamilyChange(e)}">
                        //                     </individual-grid>
                        //                 `;
                        //             }
                        //         },
                        //         errorMessage: "No family selected"
                        //     }
                        // },
                        {
                            name: "Pedigree",
                            type: "custom",
                            display: {
                                defaultLayout: "vertical",
                                // visible: data => application.appConfig === "opencb", // TODO pedigree doesnt work with families with over 2 generations
                                render: data => {
                                    if (data.family) {
                                        return html`<pedigree-view .family="${data.family}"></pedigree-view>`;
                                    }
                                },
                                errorMessage: "No family selected"
                            }
                        }
                    ]
                },
                {
                    title: "Cancer Analysis Configuration",
                    collapsed: false,
                    display: {
                        visible: data => {
                            return data.type && data.type.toUpperCase() === "CANCER";
                        }
                    },
                    elements: [
                        {
                            name: "Select Proband",
                            type: "custom",
                            display: {
                                render: data => {
                                    return html`<individual-id-autocomplete .opencgaSession="${this.opencgaSession}" .config=${{
                                        addButton: false,
                                        multiple: false
                                    }} @filterChange="${e => this.onCancerChange(e)}"></individual-id-autocomplete>`;
                                }
                            }
                        },
                        {
                            name: "Select Disorder",
                            field: "disorder.id",
                            type: "select",
                            allowedValues: "proband.disorders",
                            required: true,
                            display: {
                                apply: disorder => `${disorder.name} (${disorder.id})`,
                                errorMessage: "No proband selected"
                            }
                        },
                        {
                            name: "Samples",
                            field: "proband.samples",
                            type: "table",
                            display: {
                                width: "12",
                                defaultLayout: "vertical",
                                errorMessage: "No proband selected",
                                errorClasses: "",
                                columns: [
                                    {
                                        name: "ID", type: "custom",
                                        display: {
                                            render: sample => html`
                                                <div><span style="font-weight: bold">${sample.id}</span></div>`
                                        }
                                    },
                                    {
                                        name: "Files", field: "fileIds", type: "custom",
                                        display: {
                                            render: fileIds => html`${fileIds.join("<br>")}`
                                        }
                                    },
                                    {
                                        name: "Somatic", field: "somatic"
                                    },
                                    {
                                        name: "Status", field: "status.name", defaultValue: "-"
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
                            name: "Priority",
                            field: "priority",
                            type: "custom",
                            allowedValues: ["URGENT", "HIGH", "MEDIUM", "LOW"],
                            defaultValue: "MEDIUM",
                            display: {
                                render: priority => html`
                                    <clinical-priority-filter
                                        .config=${{multiple: false}}
                                        .priorities="${[...Object.values(this.opencgaSession.study.configuration?.clinical?.priorities || {})]}"
                                        @filterChange="${e => this.onCustomFieldChange("priority", e)}"
                                        .priority="${priority}">
                                    </clinical-priority-filter>`
                            }
                        },
                        {
                            name: "Assigned To",
                            field: "analyst.assignee",
                            type: "select",
                            defaultValue: this.opencgaSession?.user?.id,
                            allowedValues: "_users",
                            display: {
                            }
                        },
                        {
                            name: "Due Date",
                            field: "dueDate",
                            type: "input-date",
                            display: {
                                render: date => moment(date, "YYYYMMDDHHmmss").format("DD/MM/YYYY")
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
                        }
                    ]
                }
            ]
        };
    }

    execute(opencgaSession, clinicalAnalysis) {
        // Prepare the data for the REST create
        try {
            const data = {...clinicalAnalysis};

            // remove private fields
            delete data._users;

            data.proband = {
                id: clinicalAnalysis.proband ? clinicalAnalysis.proband.id : null
            };

            if (clinicalAnalysis?.disorder?.id) {
                data.disorder = {
                    id: clinicalAnalysis.disorder.id
                };
            }

            if (data.flags) {
                data.flags = clinicalAnalysis.flags.split(",");
            }

            if (data.type === "FAMILY") {
                data.family = {
                    id: clinicalAnalysis.family.id,
                    members: clinicalAnalysis.family.members.map(e => ({id: e.id}))
                };
            }

            if (this.mode === "create") {
                opencgaSession.opencgaClient.clinical().create(data, {
                    study: opencgaSession.study.fqn,
                    createDefaultInterpretation: true
                })
                    .then(() => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            // message: `Clinical analysis ${response.responses[0].results[0].id} created successfully`,
                            message: "Clinical analysis created successfully",
                        });
                        this.notifyClinicalAnalysisWrite();
                        this.onClear();
                    })
                    .catch(response => {
                        // console.error(response);
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                    });
            } else {
                opencgaSession.opencgaClient.clinical().update(data, {
                    study: opencgaSession.study.fqn
                })
                    .then(() => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            // message: `Clinical analysis ${response.responses[0].results[0].id} created successfully`,
                            message: "Clinical analysis created successfully",
                        });
                        this.notifyClinicalAnalysisWrite();
                        this.onClear();
                    })
                    .catch(response => {
                        // console.log(response);
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                    });
            }
        } catch (response) {
            // console.log(response);
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
        }
    }

    onClear() {
        this.clinicalAnalysis = {_users: this.clinicalAnalysis._users};
        this.requestUpdate();
    }

    onRun() {
        this.execute(this.opencgaSession, this.clinicalAnalysis);
    }

    render() {
        return this.checkProjects ? html`
            <data-form
                .data="${this.clinicalAnalysis}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onRun}">
            </data-form>
        ` : html`
            <div class="guard-page">
                <i class="fas fa-lock fa-5x"></i>
                <h3>No public projects available to browse. Please login to continue</h3>
            </div>
        `;
    }

}

customElements.define("opencga-clinical-analysis-writer", OpencgaClinicalAnalysisWriter);
