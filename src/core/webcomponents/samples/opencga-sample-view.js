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
import UtilsNew from "../../utilsNew.js";
import "../commons/view/data-form.js";


export default class OpencgaSampleView extends LitElement {

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
            sampleId: {
                type: String
            },
            sample: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "osv" + UtilsNew.randomString(6);

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    sampleIdObserver() {
        if (this.sampleId) {
            const query = {
                study: this.opencgaSession.study.fqn,
                includeIndividual: true
            };
            let _this = this;
            this.opencgaSession.opencgaClient.samples().info(this.sampleId, query)
                .then(function(response) {
                    _this.sample = response.responses[0].results[0];
                    _this.requestUpdate();
                })
                .catch(function(reason) {
                    console.error(reason);
                });
        }
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                // mode: {
                //     type: "modal",
                //     width: 1024
                // },
                buttons: {
                    show: false,
                    // cancelText: "Clearrr",
                    // okText: "Okk",
                },
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
                            name: "Sample ID",
                            type: "custom",
                            display: {
                                render: data => html`<span style="font-weight: bold">${data.id}</span> (UUID: ${data.uuid})`
                            }
                        },
                        {
                            name: "Individual ID",
                            field: "individualId"
                        },
                        {
                            name: "Files",
                            field: "fileIds",
                            type: "list",
                            display: {
                                defaultValue: "Files not found or empty"
                            }
                        },
                        {
                            name: "Somatic",
                            field: "somatic",
                            display: {
                                defaultValue: "false"
                            }
                        },
                        {
                            name: "Version",
                            field: "version",
                        },
                        // {
                        //     name: "Release",
                        //     field: "release"
                        // },
                        {
                            name: "Status",
                            field: "internal.status",
                            type: "custom",
                            display: {
                                render: field => html`${field.name} (${UtilsNew.dateFormatter(field.date)})`
                            }
                        },
                        {
                            name: "Creation Date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: field => html`${UtilsNew.dateFormatter(field)}`
                            }
                        },
                        {
                            name: "Modification Date",
                            field: "modificationDate",
                            type: "custom",
                            display: {
                                render: field => field?.name ? html`${field.name} (${UtilsNew.dateFormatter(field.modificationDate)})` : ""
                            }
                        },
                        {
                            name: "Description",
                            field: "description"
                        }
                    ]
                },
                {
                    title: "Phenotypes",
                    elements: [
                        {
                            name: "List of phenotypes",
                            field: "phenotypes",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        name: "ID", field: "id"
                                    },
                                    {
                                        name: "Name", field: "name"
                                    },
                                    {
                                        name: "Source", field: "source"
                                    }
                                ],
                                defaultValue: "No phenotypes found"
                            }
                        }
                    ]
                }
            ]
        };
    }

    render() {
        return html`
            <data-form .data=${this.sample} .config="${this._config}"></data-form>
        `;
    }

}

customElements.define("opencga-sample-view", OpencgaSampleView);
