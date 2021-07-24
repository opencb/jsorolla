/**
 * Copyright 2015-2019 OpenCB
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
import UtilsNew from "../../core/utilsNew.js";
import "../../core/webcomponents/commons/view/data-form.js";
import "../../core/webcomponents/commons/tool-header.js";

export default class IvaProfile extends LitElement {

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

    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};

    }

    updated(changedProperties) {
        if (changedProperties.has("property")) {
            this.propertyObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
    }

    opencgaSessionObserver() {
        this.requestUpdate();

    }

    onFilterChange(field, value) {
        console.log("field, value", field, value)

    }

    getDefaultConfig() {
        return {
            title: "Your profile",
            icon: "",
            display: {
                collapsable: true,
                showTitle: false,
                labelWidth: 2,
                defaultValue: "-"
            },
            sections: [
                {
                    title: "General",
                    collapsed: false,
                    elements: [
                        {
                            name: "id",
                            field: "user.id"
                        },
                        {
                            name: "Name",
                            field: "user.name"
                        },
                        {
                            name: "Organization",
                            field: "user.organization"
                        },
                        {
                            name: "Account type",
                            field: "user.account.type"
                        },
                        {
                            name: "Status",
                            field: "user.internal.status",
                            type: "custom",
                            display: {
                                render: field => `${field?.name} (${UtilsNew.dateFormatter(field?.date)})`
                            }
                        },
                        {
                            name: "Data release",
                            type: "custom",
                            field: "project.attributes",
                            display: {
                                visible: data => !!data.project?.attributes?.release,
                                render: attributes => attributes?.release
                            }
                        },
                        {
                            name: "Project and studies",
                            field: "projects",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        name: "Id",
                                        field: "id"
                                    },
                                    {
                                        name: "Name",
                                        field: "name"
                                    },
                                    {
                                        name: "Studies",
                                        field: "studies",
                                        type: "custom",
                                        display: {
                                            render: studies => {
                                                return studies.map( study => study.name).join(", ")
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                        /*{
                            name: "Quota",
                            field: "quota",
                            type: "custom",
                            display: {
                                render: field => html`${Object.entries(field).map( ([k, v]) => html`${k}:${v}<br>`)}`
                            }
                        }*/
                    ]
                }
                /*{
                    title: "Administration",
                    collapsed: false,
                    elements: [
                        {
                            name: "User",
                            field: "user.id",
                            type: "custom",
                            display: {
                                render: data => {
                                    const config = {
                                        addButton: false,
                                        fields: item => ({
                                            name: item.id
                                        }),
                                        dataSource: (query, process) => {
                                            this.opencgaSession.opencgaClient.studies().acl(this.opencgaSession.study.fqn).then(restResponse => {
                                                const results = restResponse.getResults();
                                                process(results.map(config.fields));
                                            });
                                        }
                                    };
                                    return html`<select-field-filter-autocomplete .opencgaSession="${this.opencgaSession}" .config=${config} .value="${this.value}" @filterChange="${e => this.onFilterChange("userid", e.detail.value)}"></select-field-filter-autocomplete>`
                                }
                            }
                        },
                        {
                            name: "Permissions",
                            type: "select",
                            multiple: true,
                            defaultValue: ["WRITE_FILES"],
                            allowedValues: ["CONFIDENTIAL_VARIABLE_SET_ACCESS", "EXECUTION",
                                {name: "Files", fields: ["WRITE_FILES", "VIEW_FILE_HEADERS", "VIEW_FILE_CONTENTS", "VIEW_FILES", "DELETE_FILES", "DOWNLOAD_FILES", "UPLOAD_FILES", "WRITE_FILE_ANNOTATIONS", "VIEW_FILE_ANNOTATIONS", "DELETE_FILE_ANNOTATIONS"]},
                                {name: "Jobs", fields: ["VIEW_JOBS", "WRITE_JOBS", "DELETE_JOBS"]},
                                {name: "Sample", fields: ["VIEW_SAMPLES", "WRITE_SAMPLES", "DELETE_SAMPLES", "WRITE_SAMPLE_ANNOTATIONS", "VIEW_SAMPLE_ANNOTATIONS", "DELETE_SAMPLE_ANNOTATIONS"]},
                                {name: "Individual", fields: ["VIEW_INDIVIDUALS", "WRITE_INDIVIDUALS", "DELETE_INDIVIDUALS", "WRITE_INDIVIDUAL_ANNOTATIONS", "VIEW_INDIVIDUAL_ANNOTATIONS", "DELETE_INDIVIDUAL_ANNOTATIONS"]},
                                {name: "Family", fields: ["VIEW_FAMILIES", "WRITE_FAMILIES", "DELETE_FAMILIES", "WRITE_FAMILY_ANNOTATIONS", "VIEW_FAMILY_ANNOTATIONS", "DELETE_FAMILY_ANNOTATIONS"]},
                                {name: "Cohort", fields: ["VIEW_COHORTS", "WRITE_COHORTS", "DELETE_COHORTS", "WRITE_COHORT_ANNOTATIONS", "VIEW_COHORT_ANNOTATIONS", "DELETE_COHORT_ANNOTATIONS"]},
                                {name: "Disease Panels", fields: ["VIEW_PANELS", "WRITE_PANELS", "DELETE_PANELS"]},
                                {name: "Clinical Analysis", fields: ["VIEW_CLINICAL_ANALYSIS", "WRITE_CLINICAL_ANALYSIS", "DELETE_CLINICAL_ANALYSIS"]}]
                        },
                        {
                            name: "Study",
                            field: "study",
                            type: "select",
                            allowedValues: ["study1"],
                            defaultValue: ["study1"],
                            errorMessage: "No found...",
                            display: {
                                width: 9
                            }
                        }
                    ]
                },*/

            ]
        };
    }

    render() {
        return html`
            <div>
                <tool-header title="${this._config.title}" icon="${"fa fa-user-circle"}"></tool-header>
                <div class="container">
                    <div class="row">
                        <div class="col-md-12">
                            <data-form .data=${this.opencgaSession} .config="${this._config}"></data-form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("iva-profile", IvaProfile);
