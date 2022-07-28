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
import UtilsNew from "../../core/utilsNew.js";
import Types from "../commons/types.js";
import "../commons/forms/data-form.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../loading-spinner.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";

export default class IndividualView extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            individual: {
                type: Object
            },
            individualId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.individual = {};
        this.isLoading = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("individual")) {
            // to update disorders if has more than one
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        if (changedProperties.has("individualId")) {
            this.isLoading = true;
            this.individualIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    individualIdObserver() {
        if (this.individualId && this.opencgaSession) {
            const query = {
                study: this.opencgaSession.study.fqn,
            };
            let error;
            this.opencgaSession.opencgaClient.individuals().info(this.individualId, query)
                .then(response => {
                    this.individual = response.responses[0].results[0];
                    this.isLoading = false;
                    console.log("individual: ", this.individual);
                })
                .catch(function (reason) {
                    this.individual = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = {...this.getDefaultConfig(), ...this.config};
                    this.requestUpdate();
                    this.notify(error);
                });
            this.individualId = "";
        }
    }

    onFilterChange(e) {
        this.individualId = e.detail.value;
    }

    notify(error) {
        this.dispatchEvent(new CustomEvent("individualSearch", {
            detail: {
                value: this.individual,
                status: {
                    // true if error is defined and not empty
                    error: !!error,
                    message: error
                }
            },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <data-form
                .data="${this.individual}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            title: "Summary",
            icon: "",
            display: {
                collapsable: true,
                titleVisible: false,
                titleWidth: 2,
                defaultValue: "-",
                defaultLayout: "horizontal",
                buttonsVisible: false
            },
            sections: [
                {
                    title: "Search",
                    display: {
                        visible: individual => !individual?.id,
                    },
                    elements: [
                        {
                            title: "Individual ID",
                            field: "individualId",
                            type: "custom",
                            display: {
                                render: () => html `
                                    <catalog-search-autocomplete
                                        .value="${this.sample?.id}"
                                        .resource="${"INDIVIDUAL"}"
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
                        visible: individual => individual?.id,
                    },
                    elements: [
                        {
                            title: "Individual ID",
                            type: "custom",
                            display: {
                                render: data => html`
                                    <span style="font-weight: bold">${data.id}</span> (UUID: ${data.uuid})
                                `,
                            },
                        },
                        {
                            title: "Name",
                            field: "name"
                        },
                        {
                            title: "Father ID",
                            field: "father.id",
                            type: "basic"
                        },
                        {
                            title: "Mother ID",
                            field: "mother.id",
                            type: "basic"
                        },
                        {
                            title: "Reported Sex (Karyotypic)",
                            type: "custom",
                            display: {
                                render: individual => `
                                    ${individual.sex?.id ?? individual.sex ?? "Not specified"} (${individual.karyotypicSex ?? "Not specified"})
                                `,
                            }
                        },
                        {
                            title: "Inferred Karyotypic Sex",
                            type: "custom",
                            display: {
                                render: data => {
                                    if (data?.qualityControl?.inferredSexReports && data.qualityControl.inferredSexReports?.length > 0) {
                                        return data.qualityControl.inferredSexReports[0].inferredKaryotypicSex;
                                    } else {
                                        return "-";
                                    }
                                },
                            }
                        },
                        {
                            title: "Ethnicity",
                            field: "ethnicity.id",
                        },
                        {
                            title: "Disorders",
                            field: "disorders",
                            type: "list",
                            display: {
                                contentLayout: "vertical",
                                render: disorder => UtilsNew.renderHTML(CatalogGridFormatter.disorderFormatter(disorder)),
                                defaultValue: "N/A"
                            }
                        },
                        {
                            title: "Phenotypes",
                            field: "phenotypes",
                            type: "list",
                            display: {
                                contentLayout: "bullets",
                                render: phenotype => {
                                    let id = phenotype.id;
                                    if (phenotype.id.startsWith("HP:")) {
                                        id = html`<a href="https://hpo.jax.org/app/browse/term/${phenotype.id}" target="_blank">${phenotype.id}</a>`;
                                    }
                                    return html`${phenotype.name} (${id})`;
                                },
                                defaultValue: "N/A"
                            }
                        },
                        {
                            title: "Life Status",
                            field: "lifeStatus"
                        },
                        {
                            title: "Version",
                            field: "version"
                        },
                        {
                            title: "Status",
                            field: "internal.status",
                            type: "custom",
                            display: {
                                render: field => field ? html`${field.name} (${UtilsNew.dateFormatter(field.date)})` : "-"
                            }
                        },
                        {
                            title: "Creation Date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: field => field ? html`${UtilsNew.dateFormatter(field)}` : "-"
                            }
                        },
                        {
                            title: "Modification Date",
                            field: "modificationDate",
                            type: "custom",
                            display: {
                                render: field => field ? html`${UtilsNew.dateFormatter(field)}` : "-"
                            }
                        },
                        {
                            title: "Description",
                            field: "description"
                        }
                    ]
                },
                {
                    title: "Samples",
                    display: {
                        visible: individual => individual?.id,
                    },
                    elements: [
                        {
                            title: "List of samples",
                            field: "samples",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        title: "Samples ID",
                                        field: "id",
                                    },
                                    {
                                        title: "Somatic",
                                        field: "somatic",
                                        defaultValue: "false",
                                    },
                                    {
                                        title: "Phenotypes",
                                        field: "phenotypes",
                                        type: "custom",
                                        defaultValue: "-",
                                        display: {
                                            render: data => data?.length ? html`${data.map(d => d.id).join(", ")}` : "-",
                                        },
                                    }
                                ],
                                defaultValue: "No phenotypes found"
                            }
                        }
                    ]
                }
            ]
        });
    }

}

customElements.define("individual-view", IndividualView);
