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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import "../commons/forms/data-form.js";
import "../commons/image-viewer.js";

export default class FamilySummary extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            family: {
                type: Object,
            },
            familyId: {
                type: String,
            },
            individualId: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this._family = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("familyId")) {
            this.familyIdObserver();
        }

        if (changedProperties.has("individualId")) {
            this.individualIdObserver();
        }

        if (changedProperties.has("family")) {
            this.familyObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    familyIdObserver() {
        this._family = null;
        if (this.familyId && this.opencgaSession) {
            this.opencgaSession.opencgaClient.families()
                .info(this.familyId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._family = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    individualIdObserver() {
        this._family = null;
        if (this.individualId && this.opencgaSession) {
            this.opencgaSession.opencgaClient.families()
                .search({
                    members: this.individualId,
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    // We use the first family found
                    this._family = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    familyObserver() {
        this._family = {...this.family};
    }

    render() {
        if (!this.opencgaSession || !this._family) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._family || {}}"
                .config="${this._config || {}}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                titleVisible: false,
                buttonsVisible: false,
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "General",
                    elements: [
                        {
                            title: "Family ID",
                            type: "complex",
                            display: {
                                template: "${id} (UUID: ${uuid})",
                                style: {
                                    id: {
                                        "font-weight": "bold",
                                    }
                                },
                            },
                        },
                        {
                            title: "Family Name",
                            field: "name"
                        },
                        {
                            title: "Disorders",
                            field: "disorders",
                            type: "list",
                            display: {
                                contentLayout: "vertical",
                                format: disorder => CatalogGridFormatter.disorderFormatter([disorder]),
                                defaultValue: "N/A"
                            }
                        },
                        {
                            title: "Phenotypes",
                            field: "phenotypes",
                            type: "list",
                            display: {
                                // visible: !this._config?.hiddenFields?.includes("phenotypes"),
                                // contentLayout: "bullets",
                                // render: phenotype => {
                                //     let id = phenotype.id;
                                //     if (phenotype.id.startsWith("HP:")) {
                                //         id = html`<a class="text-decoration-none" href="https://hpo.jax.org/app/browse/term/${phenotype.id}" target="_blank">${phenotype.id}</a>`;
                                //     }
                                //     return html`${phenotype.name} (${id})`;
                                // },
                                contentLayout: "vertical",
                                format: phenotype => CatalogGridFormatter.phenotypesFormatter([phenotype]),
                                defaultValue: "N/A"
                            }
                        },
                        {
                            title: "Expected Size",
                            field: "expectedSize"
                        },
                        {
                            title: "Creation Date",
                            field: "creationDate",
                            display: {
                                format: date => UtilsNew.dateFormatter(date)
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                        }
                    ]
                },
                {
                    title: "Family Members",
                    elements: [
                        {
                            title: "List of Members:",
                            field: "members",
                            type: "table",
                            display: {
                                defaultValue: "-",
                                columns: [
                                    {
                                        title: "Individual ID",
                                        field: "id",
                                        display: {
                                            style: {
                                                "font-weight": "bold"
                                            }
                                        }
                                    },
                                    {
                                        title: "Sex",
                                        field: "sex",
                                        display: {
                                            format: sex => sex.id
                                        }
                                    },
                                    {
                                        title: "Father ID",
                                        field: "father.id",
                                    },
                                    {
                                        title: "Mother ID",
                                        field: "mother.id",
                                    },
                                    {
                                        title: "Disorders",
                                        field: "disorders",
                                        type: "list",
                                        display: {
                                            defaultValue: "-",
                                            format: disorder => CatalogGridFormatter.disorderFormatter([disorder])
                                        }
                                    },
                                    {
                                        title: "Phenotypes",
                                        field: "phenotypes",
                                        type: "list",
                                        display: {
                                            defaultValue: "-",
                                            format: phenotype => CatalogGridFormatter.phenotypesFormatter([phenotype])
                                        }
                                    },
                                ]
                            }
                        },
                        {
                            title: "Pedigree",
                            type: "image",
                            field: "pedigreeGraph.base64",
                        },
                    ]
                }
            ]
        };
    }

}

customElements.define("family-summary", FamilySummary);
