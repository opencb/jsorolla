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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import Types from "../commons/types.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import "../commons/forms/data-form.js";
import "../commons/image-viewer.js";
import "../loading-spinner.js";
import LitUtils from "../commons/utils/lit-utils";

export default class FamilyView extends LitElement {

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
            search: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object,
            },
            settings: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.family = {};
        this.search = false;

        this.isLoading = false;
        this.displayConfigDefault = {
            buttonsVisible: false,
            collapsable: true,
            titleVisible: false,
            titleWidth: 2,
            defaultValue: "-",
            pdf: false,
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("familyId")) {
            this.familyIdObserver();
        }
        if (changedProperties.has("individualId")) {
            this.individualIdObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig
            };
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    familyIdObserver() {
        if (this.familyId && this.opencgaSession) {
            const params = {
                study: this.opencgaSession.study.fqn,
            };
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.families()
                .info(this.familyId, params)
                .then(response => {
                    this.family = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.family = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "familySearch", this.family, {query: {...params}}, error);
                    this.#setLoading(false);
                });
        } else {
            this.family = {};
        }
    }

    individualIdObserver() {
        if (this.individualId && this.opencgaSession) {
            const params = {
                members: this.individualId,
                study: this.opencgaSession.study.fqn
            };
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.families()
                .search(params)
                .then(response => {
                    // We use the first family found
                    this.family = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.family = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "familySearch", this.family, {query: {...params}}, error);
                    this.#setLoading(false);
                });
        } else {
            this.familyId = {};
        }
    }

    onFilterChange(e) {
        this.familyId = e.detail.value;
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.family?.id && this.search === false) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    No Family ID found.
                </div>
            `;
        }

        return html`
            <data-form
                .data="${this.family}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            title: "Summary",
            icon: "",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "Search",
                    display: {
                        visible: family => !family?.id && this.search === true,
                    },
                    elements: [
                        {
                            title: "Family ID",
                            // field: "familyId",
                            type: "custom",
                            display: {
                                render: () => html `
                                    <catalog-search-autocomplete
                                        .value="${this.family?.id}"
                                        .resource="${"FAMILY"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </catalog-search-autocomplete>
                                `,
                            }
                        }
                    ]
                },
                {
                    title: "General",
                    collapsed: false,
                    display: {
                        visible: family => family?.id,
                    },
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
                    display: {
                        visible: family => family?.id,
                        defaultValue: "-"
                    },
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
                                            format: disorder => CatalogGridFormatter.disorderFormatter([disorder])
                                        }
                                    },
                                    {
                                        title: "Phenotypes",
                                        field: "phenotypes",
                                        type: "list",
                                        display: {
                                            format: phenotype => CatalogGridFormatter.phenotypesFormatter([phenotype])
                                        }
                                    },
                                ]
                            }
                        },
                        // {
                        //     title: "Pedigree",
                        //     type: "custom",
                        //     display: {
                        //         render: () => html`
                        //             <image-viewer
                        //                 .data="${this.family?.pedigreeGraph?.base64}">
                        //             </image-viewer>
                        //         `,
                        //     }
                        // },
                        {
                            title: "Pedigree",
                            type: "image",
                            field: "pedigreeGraph.base64",
                        },
                    ]
                }
            ]
        });
    }

}

customElements.define("family-view", FamilyView);
