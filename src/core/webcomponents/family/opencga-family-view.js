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
import "../commons/view/pedigree-view.js";

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
            individualId: {
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
        this.family = {};
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            //this.individualIdObserver();
        }

        if (changedProperties.has("familyId")) {
            this.familyIdObserver();
        }

        if (changedProperties.has("individualId")) {
            this.individualIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    familyIdObserver() {
        if (this.opencgaSession && this.familyId) {
            this.opencgaSession.opencgaClient.families().info(this.familyId, {study: this.opencgaSession.study.fqn})
                .then( response => {
                    this.family = response.getResult(0);
                    this.requestUpdate();
                })
                .catch(function(reason) {
                    console.error(reason);
                });
        }
    }

    individualIdObserver() {
        if (this.opencgaSession && this.individualId) {
            this.opencgaSession.opencgaClient.families().search({members: this.individualId, study: this.opencgaSession.study.fqn})
                .then( response => {
                    this.family = response.getResult(0); // TODO FIXME it takes into account just the first family
                    this.requestUpdate();
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
                defaultValue: "-"
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
                            field: "name"
                        },
                        {
                            name: "Disorders",
                            field: "disorders",
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
                            field: "phenotypes",
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
                            name: "Creation Date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                visible: data => application.appConfig === "opencb",
                                render: field => html`${UtilsNew.dateFormatter(field)}`
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            display: {
                                visible: data => application.appConfig === "opencb"
                            }
                        }
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
                                layout: "horizontal",
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
                                        name: "Disorders",
                                        field: "disorders",
                                        type: "custom",
                                        display: {
                                            render: data => data?.length ? html`${data.map(d => d.id).join(", ")}` : "-"
                                        }
                                    },
                                    {
                                        name: "Phenotypes",
                                        field: "phenotypes",
                                        type: "custom",
                                        defaultValue: "-",
                                        display: {
                                            render: data => data?.length ? html`${data.map(d => d.id).join(", ")}` : "-"
                                        }
                                    },
                                    {
                                        name: "Life Status", field: "lifeStatus"
                                    }
                                ]
                            }
                        },
                        {
                            name: "Pedigree",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                visible: data => application.appConfig === "opencb", //TODO pedigree doesnt work with families with over 2 generations
                                render: data => html`<pedigree-view .family="${this.family}"></pedigree-view>`
                            }
                        }
                    ]
                }
            ]
        };
    }

    render() {
        return html`
            <data-form .data=${this.family} .config="${this._config}"></data-form>
        `;
    }

}

customElements.define("opencga-family-view", OpencgaFamilyView);
