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
        // e.detail
        // debugger
        switch (e.detail.param) {
            case "analyst.responsible":
                this.clinicalAnalysis.analyst = {responsible: e.detail.value}
                break;
            case "disorder.id":
                let _disorder = this.clinicalAnalysis.proband.disorders.filter(d => d.id === e.detail.value);
                this.disorder = _disorder
                break;
            default:
                this.clinicalAnalysis[e.detail.param] = e.detail.value;
                break;
        }

        this.clinicalAnalysis = {...this.clinicalAnalysis};
        this.requestUpdate();
    }

    // onFilterChange(field, e) {
    //     this.clinicalAnalysis[field] = e.detail.value;
    //     this.clinicalAnalysis = {...this.clinicalAnalysis};
    //     debugger
    //     this.requestUpdate();
    // }

    onFamilyChange(e) {
        if (e.detail.value) {
            let _this = this;
            this.opencgaSession.opencgaClient.families().info(e.detail.value, {study: this.opencgaSession.study.fqn})
                .then( response => {
                    // _this.family = response.responses[0].results[0];
                    _this.clinicalAnalysis.family = response.responses[0].results[0];

                    let individualIds = _this.clinicalAnalysis.family.members.map(m => m.id);
                    this.opencgaSession.opencgaClient.individuals().info(individualIds.join(","), {study: _this.opencgaSession.study.fqn})
                        .then( response => {
                            _this.clinicalAnalysis.family.members =  response.responses[0].results;

                            // Select as proband the first son/daughter with a disorder
                            if (_this.clinicalAnalysis.family && _this.clinicalAnalysis.family.members) {
                                for (let member of _this.clinicalAnalysis.family.members) {
                                    if (member.disorders && member.disorders.length > 0 && member.father.id && member.mother.id) {
                                        _this.clinicalAnalysis.proband = member;
                                        break;
                                    }
                                }
                            }

                            let sampleIds = _this.clinicalAnalysis.family.members.map(m => m.samples[0].id);
                            this.opencgaSession.opencgaClient.files().search({study: _this.opencgaSession.study.fqn, samples: sampleIds.join(",")})
                                .then( response => {
                                    _this.clinicalAnalysis.files =  response.responses[0].results;

                                    _this.clinicalAnalysis = {..._this.clinicalAnalysis};
                                    _this.requestUpdate();
                                })
                                .catch(function(reason) {
                                    console.error(reason);
                                });
                        })
                        .catch(function(reason) {
                            console.error(reason);
                        });
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
                defaultLayout: "vertical",
            },
            sections: [
                {
                    title: "Case Info",
                    collapsed: false,
                    elements: [
                        {
                            name: "Analysis ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            defaultValue: "AN-6",
                            display: {
                                placeholder: "eg. AN-3",
                                // disabled: true,
                                // showList: true,
                                // fileUpload: true
                            }
                        },
                        {
                            name: "Analysis Type",
                            field: "type",
                            type: "select",
                            allowedValues: ["Single", "Family", "Cancer"],
                            defaultValue: "Family",
                        },
                        {
                            name: "Interpretation Flags",
                            field: "flags",
                            type: "select",
                            allowedValues: ["mixed_chemistries", "low_tumour_purity", "uniparental_isodisomy", "uniparental_heterodisomy",
                                "unusual_karyotype", "suspected_mosaicism", "low_quality_sample"],
                            display: {
                            }
                        },
                    ]
                },
                {
                    title: "Proband and Disease",
                    collapsed: false,
                    display: {
                        // visible: this.clinicalAnalysisVisible;
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
                            // field: "family.id",
                            type: "custom",
                            display: {
                                render: (data) => {
                                    return html`<family-id-autocomplete .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onFamilyChange(e)}"></family-id-autocomplete>`
                                }
                            }
                        },
                        {
                            name: "Select a Disorder",
                            field: "disorder.id",
                            type: "select",
                            allowedValues: "family.disorders",
                            // defaultValue: "No family selected yet",
                            display: {
                                // width: 3,
                                apply: (disorder) => `${disorder.name} (${disorder.id})`,

                                // values: (data) => {
                                //     if (data.family && data.family.disorders) {
                                //         let disordersIds = data.family.disorders.map(e => e.id);
                                //         let defaultValue = disordersIds && disordersIds.length > 0 ? disordersIds[0] : "";
                                //         return {allowedValues: disordersIds, defaultValue: defaultValue};
                                //     }
                                // },
                            }
                        },
                        {
                            name: "Select the Proband",
                            field: "proband.id",
                            type: "select",
                            allowedValues: "family.members",
                            // defaultValue: "No family selected yet",
                            display: {
                                apply: (member) => `${member.id}`,
                                // values: (data) => {
                                //     if (data.family && data.family.members) {
                                //         let memberIds = data.family.members.map(e => e.id);
                                //         let defaultValue = memberIds && memberIds.length > 0 ? memberIds[0] : "";
                                //         return {allowedValues: memberIds, defaultValue: defaultValue};
                                //     }
                                // },

                            }
                        },
                        {
                            name: "Members",
                            field: "family.members",
                            type: "custom",
                            defaultValue: "No family selected yet",
                            display: {
                                width: 8,
                                render: (members) => {
                                    return html`<opencga-individual-grid .opencgaSession="${this.opencgaSession}" .individuals="${members}" @filterChange="${e => this.onFamilyChange(e)}"></opencga-individual-grid>`
                                },

                            }
                        },
                        {
                            name: "Pedigree",
                            type: "custom",
                            display: {
                                // layout: "vertical",
                                render: data => html`<pedigree-view .family="${this.clinicalAnalysis.family}"></pedigree-view>`
                            }
                        }
                    ]
                },
                {
                    title: "Proband",
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
                                    return html`<individual-id-autocomplete .opencgaSession="${this.opencgaSession}"></individual-id-autocomplete>`
                                }
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
                            name: "Due Date",
                            field: "dueDate",
                            type: "input-date",
                            display: {

                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {

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
                delete data._users;
                debugger
                opencgaSession.opencgaClient.clinical().create(data, {study: opencgaSession.study.fqn})
                    .then(function(response) {
                        // _this.onClear();
                        new NotificationQueue().push(`Family ${response.responses[0].results[0].id} created successfully`, null,"success");
                    })
                    .catch(function(response) {
                        console.error(response);
                        new NotificationQueue().push(response.error, null, "ERROR");
                    });
            },
            result: {
                render: job => {

                }
            }
        };
    }

    onRun() {
        this._config.execute(this.opencgaSession, this.clinicalAnalysis);
    }

    render() {
        // debugger
        return html`
           <data-form .data="${this.clinicalAnalysis}" .config="${this._config}" @fieldChange="${e => this.onFieldChange(e)}"></data-form>
           
           <button type="button" class="ripple btn btn-primary btn-lg" @click="${this.onRun}">Run</button>
        `;
    }
}

customElements.define("opencga-clinical-analysis-create", OpencgaClinicalAnalysisCreate);
