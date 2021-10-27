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
import "../commons/forms/data-form.js";
import "../commons/filters/individual-id-autocomplete.js";

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

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                collapsable: true,
                showTitle: false,
                labelWidth: 2,
                defaultValue: "-",
                defaultLayout: "horizontal"
            },
            sections: [
                {
                    title: "Search",
                    display: {
                        visible: individual => !individual?.id
                    },
                    elements: [
                        {
                            name: "Individual ID",
                            field: "individualId",
                            type: "custom",
                            display: {
                                render: () => html `
                                    <individual-id-autocomplete
                                        .value="${this.sample?.id}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config=${{
                                            select2Config: {
                                                multiple: false
                                            }
                                        }}
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </individual-id-autocomplete>`
                            }
                        }
                    ]
                },
                {
                    title: "General",
                    collapsed: false,
                    display: {
                        visible: individual => individual?.id
                    },
                    elements: [
                        {
                            name: "Sample ID",
                            type: "custom",
                            display: {
                                render: data => html`<span style="font-weight: bold">${data.id}</span> (UUID: ${data.uuid})`
                            }
                        },
                        {
                            name: "Name",
                            field: "name"
                        },
                        {
                            name: "Father ID",
                            field: "father.id",
                            type: "basic"
                        },
                        {
                            name: "Mother ID",
                            field: "mother.id",
                            type: "basic"
                        },
                        {
                            name: "Reported Sex (Karyotypic)",
                            type: "complex",
                            display: {
                                template: "${sex} (${karyotypicSex})",
                            }
                        },
                        {
                            name: "Inferred Karyotypic Sex",
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
                                    return html`${disorder.name} (${id})`;
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
                                    return html`${phenotype.name} (${id})`;
                                },
                                defaultValue: "N/A"
                            }
                        },
                        {
                            name: "Life Status",
                            field: "lifeStatus"
                        },
                        {
                            name: "Version",
                            field: "version"
                        },
                        {
                            name: "Status",
                            field: "internal.status",
                            type: "custom",
                            display: {
                                render: field => field ? html`${field.name} (${UtilsNew.dateFormatter(field.date)})` : "-"
                            }
                        },
                        {
                            name: "Creation Date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: field => field ? html`${UtilsNew.dateFormatter(field)}` : "-"
                            }
                        },
                        {
                            name: "Modification Date",
                            field: "modificationDate",
                            type: "custom",
                            display: {
                                render: field => field ? html`${UtilsNew.dateFormatter(field)}` : "-"
                            }
                        },
                        {
                            name: "Description",
                            field: "description"
                        }
                    ]
                },
                {
                    title: "Samples",
                    display: {
                        visible: individual => individual?.id
                    },
                    elements: [
                        {
                            name: "List of samples",
                            field: "samples",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        name: "Samples ID", field: "id"
                                    },
                                    {
                                        name: "Somatic", field: "somatic", defaultValue: "false"
                                    },
                                    {
                                        name: "Phenotypes",
                                        field: "phenotypes",
                                        type: "custom",
                                        defaultValue: "-",
                                        display: {
                                            render: data => data?.length ? html`${data.map(d => d.id).join(", ")}` : "-"
                                        }
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
        if (this.isLoading) {
            return html`
                <h2>Loading Info...</h2>
            `;
        }

        return html`
            <data-form
                .data=${this.individual}
                .config="${this._config}">
            </data-form>
        `;
    }

}

customElements.define("individual-view", IndividualView);
