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
import "../commons/view/data-view.js";
import "../commons/view/pedigree-view.js";


export default class OpencgaClinicalAnalysisView extends LitElement {

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
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("clinicalAnalysisId")){
            this.clinicalAnalysisIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.clinicalAnalysisId) {
            const _this = this;
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(function(response) {
                    if (response.responses[0].numResults === 1) {
                        _this.clinicalAnalysis = response.responses[0].results[0];
                        _this.requestUpdate();
                    }
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
                    title: "Case Summary",
                    collapsed: false,
                    elements: [
                        {
                            name: "Analysis ID",
                            field: "id"
                        },
                        {
                            name: "Proband",
                            field: "proband.id"
                        },
                        {
                            name: "Disorder",
                            field: "disorder",
                            type: "custom",
                            display: {
                                render: disorder => {
                                    let id = disorder.id;
                                    if (disorder.id.startsWith("OMIM:")) {
                                        id = html`<a href="https://omim.org/entry/${disorder.id.split(":")[1]}" target="_blank">${disorder.id}</a>`;
                                    }
                                    return html`${disorder.name || "-"} (${id})`
                                },
                            }
                        },
                        {
                            name: "Analysis Type",
                            field: "type"
                        },
                        {
                            name: "Flags",
                            field: "flags",
                            type: "list",
                            display: {
                                separator: ", "
                            }
                        },
                        {
                            name: "Status",
                            field: "status.name"
                        },
                        {
                            name: "Priority",
                            field: "priority",
                            type: "custom",
                            display: {
                                render: field => {
                                    let colors = {"URGENT": "red", "HIGH": "darkorange"};
                                    return html`<span style="color: ${colors[field]}">${field}</span>`
                                }
                            }
                        },
                        {
                            name: "Assigned To",
                            field: "analyst.assignee"
                        },
                        {
                            name: "Creation date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: field => html`${moment(field, "YYYYMMDDHHmmss").format("D MMM YY")}`
                            }
                        },
                        {
                            name: "Due date",
                            field: "dueDate",
                            type: "custom",
                            display: {
                                render: field => html`${moment(field, "YYYYMMDDHHmmss").format("D MMM YY")}`
                            }
                        },
                        {
                            name: "Description",
                            field: "description"
                        }
                    ]
                },
                {
                    title: "Proband",
                    elements: [
                        {
                            name: "Proband",
                            field: "proband.id"
                        },
                        {
                            name: "Sex (Karyotypic)",
                            type: "complex",
                            display: {
                                template: "${proband.sex} (${proband.karyotypicSex})",
                            }
                        },
                        {
                            name: "Date of Birth",
                            type: "complex",
                            display: {
                                template: "${proband.dateOfBirth} (${proband.lifeStatus})",
                            }
                        },
                        {
                            name: "Disorders",
                            field: "proband.disorders",
                            type: "list",
                            display: {
                                contentLayout: "bullets",
                                render: disorder => {
                                    let id = disorder.id;
                                    if (disorder.id.startsWith("OMIM:")) {
                                        id = html`<a href="https://omim.org/entry/${disorder.id.split(":")[1]}" target="_blank">${disorder.id}</a>`;
                                    }
                                    return html`${disorder.name} (${id})`
                                },
                                defaultValue: "N/A"
                            }
                        },
                        {
                            name: "Phenotypes",
                            field: "proband.phenotypes",
                            type: "list",
                            display: {
                                contentLayout: "bullets",
                                render: phenotype => {
                                    let id = phenotype.id;
                                    if (phenotype.id.startsWith("HP:")) {
                                        id = html`<a href="https://hpo.jax.org/app/browse/term/${phenotype.id}" target="_blank">${phenotype.id}</a>`;
                                    }
                                    return html`${phenotype.name} (${id})`
                                },
                                defaultValue: "N/A"
                            }
                        },
                        {
                            name: "Samples",
                            field: "proband.samples",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        name: "ID", field: "id"
                                    },
                                    {
                                        name: "Files", field: "filedIds"
                                    },
                                    {
                                        name: "Collection Method", field: "collection.method", defaultValue: "-"
                                    },
                                    {
                                        name: "Preparation Method", field: "processing.preparationMethod", defaultValue: "-"
                                    },
                                    {
                                        name: "Somatic", field: "somatic"
                                    },
                                    {
                                        name: "Creation Date",
                                        field: "creationDate",
                                        type: "custom", // this is not needed. feels right though
                                        display: {
                                            render: field => html`${UtilsNew.dateFormatter(field)}`
                                        }
                                    },
                                    {
                                        name: "Status", field: "status.name", defaultValue: "-"
                                    }
                                ],
                                defaultValue: "No sample found"
                            }
                        }
                    ]
                },
                {
                    title: "Family",
                    elements: [
                        {
                            name: "Family ID",
                            field: "family.id"
                        },
                        {
                            name: "Name",
                            field: "family.name"
                        },
                        {
                            name: "Members",
                            field: "family.members",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        name: "Individual ID", field: "id"
                                    },
                                    {
                                        name: "Sex", field: "sex"
                                    },
                                    {
                                        name: "Father", field: "father", display: {
                                            render: father => html`${father ? father.id : "-"}`
                                        }
                                    },
                                    {
                                        name: "Mother", field: "mother", display: {
                                            render: mother => html`${mother ? mother.id : "-"}`
                                        }
                                    },
                                    {
                                        name: "Disorders", field: "disorders", display: {
                                            render: disorders => {
                                                let phenotypesHtml = [];
                                                for (let disorder of disorders) {
                                                    let id = disorder.id;
                                                    if (disorder.id && disorder.id.startsWith("OMIM:")) {
                                                        id = html`<div>${disorder.name} (<a href="https://omim.org/entry/${disorder.id.split(":")[1]}" target="_blank">${disorder.id}</a>)</div>`;
                                                    }
                                                    phenotypesHtml.push(id);
                                                }
                                                return phenotypesHtml;
                                            },
                                        }
                                    },
                                    {
                                        name: "Phenotypes", field: "phenotypes", display: {
                                            render: phenotypes => {
                                                let phenotypesHtml = [];
                                                for (let phenotype of phenotypes) {
                                                    let id = phenotype.id;
                                                    if (phenotype.id && phenotype.id.startsWith("HP:")) {
                                                        id = html`<div>${phenotype.name} (<a href="https://hpo.jax.org/app/browse/term/${phenotype.id}" target="_blank">${phenotype.id}</a>)</div>`;
                                                    }
                                                    phenotypesHtml.push(id);
                                                }
                                                return phenotypesHtml;
                                            },
                                        }
                                    },
                                    {
                                        name: "Life Status", field: "lifeStatus"
                                    },
                                    {
                                        name: "Year of Birth", field: "dateOfBirth", defaultValue: "-"
                                    },
                                ],
                                defaultValue: "No sample found"
                            }
                        },
                        {
                            name: "Pedigree",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                render: data => html`<pedigree-view .family="${this.clinicalAnalysis.family}"></pedigree-view>`
                            }
                        }
                    ]
                }
            ]
        }
    }

    render() {
        return html`
            <data-view .data=${this.clinicalAnalysis} .config="${this._config}"></data-view>
        `;
    }

}

customElements.define("opencga-clinical-analysis-view", OpencgaClinicalAnalysisView);
