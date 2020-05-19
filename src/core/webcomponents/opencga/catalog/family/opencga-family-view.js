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
import UtilsNew from "./../../../../utilsNew.js";
import "../../../commons/view/data-view.js";


export default class OpencgaFamilyView extends LitElement {

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
            familyId: {
                type: String
            },
            family: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("familyId")) {
            this.familyIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    familyIdObserver() {
        if (this.familyId) {
            let _this = this;
            this.opencgaSession.opencgaClient.family().info(this.familyId, {study: this.opencgaSession.study.fqn})
                .then( response => {
                    _this.family = response.responses[0].results[0];
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
                collapsable: true,
                showTitle: false,
                labelWidth: 2,
                defaultVale: "-"
            },
            sections: [
                {
                    title: "General",
                    collapsed: false,
                    elements: [
                        {
                            name: "Family ID",
                            type: "custom",
                            display: {
                                render: data => html`<span style="font-weight: bold">${data.id}</span> (UUID: ${data.uuid})`
                            }
                        },
                        {
                            name: "Family Name",
                            field: "Name"
                        },
                        {
                            name: "Disorders",
                            field: "disorders",
                            type: "list",
                            display: {
                                template: "${name} (${id})",
                                contentLayout: "bullets",
                                defaultValue: "N/A"
                            }
                        },
                        {
                            name: "Phenotypes",
                            field: "phenotypes",
                            type: "list",
                            display: {
                                template: "${name} (${id})",
                                contentLayout: "bullets",
                                defaultValue: "N/A"
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
                            name: "Description",
                            field: "description"
                        },
                    ]
                },
                {
                    title: "Family Members",
                    elements: [
                        {
                            name: "List of Members:",
                            field: "members",
                            type: "table",
                            display: {
                                layout: "vertical",
                                columns: [
                                    {
                                        name: "Individual ID", field: "id"
                                    },
                                    {
                                        name: "Sex", field: "sex"
                                    },
                                    {
                                        name: "Father ID", field: "father.id", defaultValue: "-"
                                    },
                                    {
                                        name: "Mother ID", field: "mother.id", defaultValue: "-"
                                    },
                                    {
                                        name: "Disorders", field: "disorders", format: {
                                            render: data => html`${data.map(d => d.id).join(", ")}`
                                        }
                                    },
                                    {
                                        name: "Phenotypes", field: "phenotypes", format: {
                                            render: data => html`${data.map(d => d.id).join(", ")}`
                                        }
                                    },
                                    {
                                        name: "Life Status", field: "lifeStatus"
                                    },
                                ],
                            }
                        },
                    ]
                }
            ]
        };
    }

    render() {
        return html`
            <data-view .data=${this.family} .config="${this._config}"></data-view>
        `;
    }

}

customElements.define("opencga-family-view", OpencgaFamilyView);
