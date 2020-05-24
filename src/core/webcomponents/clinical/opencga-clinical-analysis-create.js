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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
import "../commons/view/data-form.js";
import {NotificationQueue} from "../Notification.js";


export default class OpencgaClinicalAnalysisCreate extends LitElement {

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
        this._prefix = "oga-" + UtilsNew.randomString(6);

        this.clinicalAnalysis = {
            // id: "AN-3",
            // disorder: {id: "OMIM:300125"}
            // type: "Cancer",
            // flags: ["low_tumour_purity", "uniparental_isodisomy"],
            // description: "Description"
        };
        this.mode = "create";
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            // We store the available users from opencgaSession in 'clinicalAnalysis._users'
            this.clinicalAnalysis._users = [];
            if (this.opencgaSession && this.opencgaSession.study) {
                for (let group of this.opencgaSession.study.groups) {
                    if (group.id === "@members") {
                        this.clinicalAnalysis._users = group.userIds.filter(user => user !== "*");
                        this.clinicalAnalysis = {...this.clinicalAnalysis};
                    }
                }
            }

            this.requestUpdate();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "type":
                this.clinicalAnalysis.type = e.detail.value.toUpperCase();
                break;
            case "proband.id":
                let _proband = this.clinicalAnalysis.family.members.filter(d => d.id === e.detail.value);
                this.clinicalAnalysis.proband = _proband[0];
                this.clinicalAnalysis.disorder = _proband[0].disorders && _proband[0].disorders.length > 0 ? _proband[0].disorders[0] : null;
                break;
            case "disorder.id":
                let _disorder = this.clinicalAnalysis.proband.disorders.filter(d => d.id === e.detail.value);
                this.clinicalAnalysis.disorder = _disorder[0];
                break;
            case "dueDate":
                this.clinicalAnalysis.dueDate = UtilsNew.getDatetime(e.detail.value);
                break;
            case "analyst.responsible":
                this.clinicalAnalysis.analyst = {responsible: e.detail.value};
                break;
            default:
                this.clinicalAnalysis[e.detail.param] = e.detail.value;
                break;
        }

        this.clinicalAnalysis = {...this.clinicalAnalysis};
        this.requestUpdate();
    }

    onFamilyChange(e) {
        if (e.detail.value) {
            let _this = this;
            this.opencgaSession.opencgaClient.families().info(e.detail.value, {study: this.opencgaSession.study.fqn})
                .then( response => {
                    _this.clinicalAnalysis.family = response.responses[0].results[0];

                    _this.clinicalAnalysis.type = "FAMILY";

                    // Select as proband the first son/daughter with a disorder
                    if (_this.clinicalAnalysis.family && _this.clinicalAnalysis.family.members) {
                        for (let member of _this.clinicalAnalysis.family.members) {
                            if (member.disorders && member.disorders.length > 0 && member.father.id && member.mother.id) {
                                _this.clinicalAnalysis.proband = member;
                                break;
                            }
                        }
                    }

                    if (_this.clinicalAnalysis.proband && _this.clinicalAnalysis.proband.disorders) {
                        if (_this.clinicalAnalysis.proband.disorders.length === 1) {
                            _this.clinicalAnalysis.disorder = _this.clinicalAnalysis.proband.disorders[0];
                        }
                    }

                    _this.clinicalAnalysis = {..._this.clinicalAnalysis};
                    _this.requestUpdate();
                })
                .catch(function(reason) {
                    console.error(reason);
                });
        }
    }

    onCancerChange(e) {
        if (e.detail.value) {
            let _this = this;
            this.opencgaSession.opencgaClient.individuals().info(e.detail.value, {study: this.opencgaSession.study.fqn})
                .then( response => {
                    _this.clinicalAnalysis.proband = response.responses[0].results[0];

                    _this.clinicalAnalysis.type = "CANCER";

                    if (_this.clinicalAnalysis.proband && _this.clinicalAnalysis.proband.disorders) {
                        if (_this.clinicalAnalysis.proband.disorders.length === 1) {
                            _this.clinicalAnalysis.disorder = _this.clinicalAnalysis.proband.disorders[0];
                        }
                    }

                    _this.clinicalAnalysis = {..._this.clinicalAnalysis};
                    _this.requestUpdate();
                })
                .catch(function(reason) {
                    console.error(reason);
                });
        }
    }

    getDefaultConfig() {
        return {
            id: "knockout",
            title: "Knockout Analysis",
            icon: "",
            requires: "2.0.0",
            description: "Sample Variant Stats description",
            links: [
                {
                    title: "OpenCGA",
                    url: "http://docs.opencb.org/display/opencga/Sample+Stats",
                    icon: ""
                }
            ],
            display: {
                infoIcon: "",
                defaultLayout: "vertical",
                buttons: {
                    show: true,
                    clearText: "Clear",
                    submitText: "Submit"
                }
            },
            sections: [
                {
                    title: "Case Info",
                    display: {
                        collapsed: false,
                    },
                    elements: [
                        {
                            name: "Analysis ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            // validate: () => {},
                            defaultValue: "",
                            display: {
                                layout: "vertical",
                                width: 3,
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

                            }
                        },
                        {
                            name: "Interpretation Flags",
                            field: "flags",
                            type: "select",
                            allowedValues: ["mixed_chemistries", "low_tumour_purity", "uniparental_isodisomy", "uniparental_heterodisomy",
                                "unusual_karyotype", "suspected_mosaicism", "low_quality_sample"],
                            display: {
                                width: "",
                                tooltip: ""
                            }
                        },
                    ]
                },
                {
                    title: "Family, Proband and Disease",
                    display: {
                        collapsed: false,
                        visible: data => {
                            if (data.type) {
                                return data.type.toUpperCase() === "FAMILY";
                            } else {
                                return true;
                            }
                        },
                    },
                    elements: [
                        {
                            name: "Select Family",
                            field: "family.id",
                            type: "custom",
                            display: {
                                render: (data) => {
                                    return html`<family-id-autocomplete .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onFamilyChange(e)}"></family-id-autocomplete>`
                                }
                            }
                        },
                        {
                            name: "Select the Proband",
                            field: "proband.id",
                            type: "select",
                            allowedValues: "family.members",
                            required: true,
                            display: {
                                // apply: (member) => `${member.id}`,
                                errorMessage: "No family selected"
                            }
                        },
                        {
                            name: "Select a Disorder",
                            field: "disorder.id",
                            type: "select",
                            allowedValues: "proband.disorders",
                            required: true,
                            display: {
                                apply: (disorder) => `${disorder.name} (${disorder.id})`,
                                errorMessage: "No family selected"
                            }
                        },
                        {
                            name: "Members",
                            field: "family.members",
                            type: "custom",
                            display: {
                                width: 10,
                                render: (data) => {
                                    if (data.family && data.family.members) {
                                        return html`
                                            <opencga-individual-grid .opencgaSession="${this.opencgaSession}" 
                                                                     .individuals="${data.family.members}" 
                                                                     @filterChange="${e => this.onFamilyChange(e)}">
                                            </opencga-individual-grid>
                                        `;
                                    }
                                },
                                errorMessage: "No family selected"
                            }
                        },
                        {
                            name: "Pedigree",
                            type: "custom",
                            display: {
                                render: data => {
                                    if (data.family) {
                                        return html`<pedigree-view .family="${data.family}"></pedigree-view>`
                                    }
                                },
                                errorMessage: "No family selected"
                            }
                        }
                    ]
                },
                {
                    title: "Cancer Proband",
                    collapsed: false,
                    display: {
                        visible: data => {
                            return data.type && data.type.toUpperCase() === "CANCER"
                        }
                    },
                    elements: [
                        {
                            name: "Select individual",
                            type: "custom",
                            display: {
                                render: data => {
                                    return html`<individual-id-autocomplete .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onCancerChange(e)}"></individual-id-autocomplete>`
                                }
                            }
                        },
                        {
                            name: "Select a Disorder",
                            field: "disorder.id",
                            type: "select",
                            allowedValues: "proband.disorders",
                            required: true,
                            display: {
                                apply: (disorder) => `${disorder.name} (${disorder.id})`,
                                errorMessage: "No proband selected"
                            }
                        },
                        {
                            name: "Samples",
                            field: "proband.samples",
                            type: "custom",
                            display: {
                                width: 10,
                                render: (data) => {
                                    if (data.proband && data.proband.samples) {
                                        return html`
                                            <opencga-sample-grid .opencgaSession="${this.opencgaSession}" 
                                                                     .samples="${data.proband.samples}">
                                            </opencga-sample-grid>
                                        `;
                                    }
                                },
                                errorMessage: "No family selected"
                            }
                        },
                    ]
                },
                {
                    title: "Case Management",
                    elements: [
                        {
                            name: "Priority",
                            field: "priority",
                            type: "select",
                            allowedValues: ["Urgent", "High", "Medium", "Low"],
                            defaultValue: "Medium",
                            display: {

                            }
                        },
                        {
                            name: "Assigned To",
                            field: "analyst.responsible",
                            type: "select",
                            allowedValues: "_users",
                            display: {
                            }
                        },
                        {
                            name: "Creation Date",
                            field: "creationDate",
                            type: "input-text",
                            defaultValue: "today",
                            display: {
                                visible: this.mode === "update",
                                disabled: true
                            }
                        },
                        {
                            name: "Due Date",
                            field: "dueDate",
                            type: "input-date",
                            defaultValue: "",
                            display: {
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 2
                            }
                        },
                    ]
                },
                // {
                //     title: "Job Info",
                //     id: "knockout-$DATE",
                //     tags: "",
                //     description: "",
                //     button: "Run",
                //     validate: function(params) {
                //         alert("test:" + params);
                //     },
                // }
            ],
            execute: (opencgaSession, data, params) => {
                // Prepare the data for the REST create
                delete data._users;
                data.proband = {
                    id: data.proband?.id
                };
                if (data.type === "FAMILY") {
                    data.family = {
                        id: data.family.id,
                        members: data.family.members.map(e => {return {id: e.id}}),
                    };
                }


                if (this.mode === "create") {
                    opencgaSession.opencgaClient.clinical().create(data, {study: opencgaSession.study.fqn})
                        .then(function(response) {
                            // _this.onClear();
                            new NotificationQueue().push(`Family ${response.responses[0].results[0].id} created successfully`, null,"success");
                        })
                        .catch(function(response) {
                            console.error(response);
                            new NotificationQueue().push(response.error, null, "ERROR");
                        });
                } else {
                    opencgaSession.opencgaClient.clinical().update(data, {study: opencgaSession.study.fqn})
                        .then(function(response) {
                            // _this.onClear();
                            new NotificationQueue().push(`Family ${response.responses[0].results[0].id} created successfully`, null,"success");
                        })
                        .catch(function(response) {
                            console.error(response);
                            new NotificationQueue().push(response.error, null, "ERROR");
                        });
                }

            },
            result: {
                render: job => {

                }
            }
        };
    }

    onClear() {
        let _clinicalAnalysis = {_users: this.clinicalAnalysis._users};
        this.clinicalAnalysis = {..._clinicalAnalysis};
        this.requestUpdate();
    }

    onRun() {
        this._config.execute(this.opencgaSession, this.clinicalAnalysis);
    }

    render() {
        return html`
           <data-form   .data="${this.clinicalAnalysis}" 
                        .config="${this._config}" 
                        @fieldChange="${e => this.onFieldChange(e)}" 
                        @clear="${this.onClear}" 
                        @run="${this.onRun}">
            </data-form>
        `;
    }
}

customElements.define("opencga-clinical-analysis-create", OpencgaClinicalAnalysisCreate);
