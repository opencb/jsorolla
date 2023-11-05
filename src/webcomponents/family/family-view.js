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
            defaultValue: "-"
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
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    settingsObserver() {
        this._config = this.getDefaultConfig();
        if (this.settings?.fields?.length) {
            this._config.hiddenFields = null;
            this._config = UtilsNew.mergeDataFormConfig(this._config, this.settings.fields);
        } else if (this.settings?.hiddenFields?.length) {
            this._config.hiddenFields = this.settings.hiddenFields;
            this._config = {...this._config, ...this.getDefaultConfig()}; // this is needed as we need to relauch getDefaultConfig() with the updated `hiddenFields` array
        }
        this.requestUpdate();
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
                            type: "custom",
                            display: {
                                render: data => `<span style="font-weight: bold">${data.id}</span> (UUID: ${data.uuid})`,
                            }
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
                                format: disorder => CatalogGridFormatter.disorderFormatter(disorder),
                                defaultValue: "N/A"
                            }
                        },
                        {
                            title: "Phenotypes",
                            field: "phenotypes",
                            type: "list",
                            display: {
                                visible: !this.settings?.hiddenFields?.includes("phenotypes"),
                                contentLayout: "vertical",
                                // render: phenotype => {
                                format: phenotype => {
                                    let id = phenotype.id;
                                    if (phenotype.id.startsWith("HP:")) {
                                        id = `<a href="https://hpo.jax.org/app/browse/term/${phenotype.id}" target="_blank">${phenotype.id}</a>`;
                                    }
                                    return `${phenotype.name} (${id})`;
                                },
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
                            // type: "custom",
                            display: {
                                visible: !this.settings?.hiddenFields?.includes("creationDate"),
                                // render: field => `${UtilsNew.dateFormatter(field)}`,
                                format: field => `${UtilsNew.dateFormatter(field)}`,
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                            display: {
                                visible: !this._config?.hiddenFields?.includes("description"),
                            }
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
                                        // formatter: value => value?.id || value || "Not specified",
                                        display: {
                                            format: sex => sex.id
                                        }
                                    },
                                    {
                                        title: "Father ID",
                                        field: "father.id",
                                        // formatter: value => value ?? "-"
                                    },
                                    {
                                        title: "Mother ID",
                                        field: "mother.id",
                                        // formatter: value => value ?? "-"
                                    },
                                    {
                                        title: "Disorders",
                                        field: "disorders",
                                        type: "list",
                                        // formatter: values => values?.length ? `${values.map(d => d.id).join(", ")}` : "-",
                                        display: {
                                            format: disorder => CatalogGridFormatter.disorderFormatter([disorder])
                                        }
                                    },
                                    {
                                        title: "Phenotypes",
                                        field: "phenotypes",
                                        type: "list",
                                        // formatter: values => values?.length ? `${values.map(d => d.id).join(", ")}` : "-",
                                        display: {
                                            format: phenotype => CatalogGridFormatter.phenotypesFormatter([phenotype])
                                        }
                                    }
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
                            display: {
                                visible: !this.settings?.hiddenFields?.includes("pedigreeGraph.base64"),
                            }
                        },
                    ]
                }
            ]
        });
    }

}

customElements.define("family-view", FamilyView);
