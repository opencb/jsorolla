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
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils";
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/forms/data-form.js";
import "../commons/filters/individual-id-autocomplete.js";
import "../loading-spinner.js";
import {data} from "jquery";


// Temporary name class, real name will be IndividualView
export default class NewIndividualView extends LitElement {

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
        // if (changedProperties.has("config")) {
        //     this._config = {...this.getDefaultConfig(), ...this.config};
        // }

        if (changedProperties.has("individualId")) {
            this.isLoading = true;
            this.individualIdObserver();
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
                    LitUtils.dispatchCustomEvent(this, "individualSearch", this.individual, null, error);
                });
            this.individualId = "";
        }
    }

    onFilterChange(e) {
        this.individualId = e.detail.value;
    }

    renderEvidences(value) {
        if (!value || !value?.length) {
            return "-";
        }
        const status = ["OBSERVED", "NOT_OBSERVED", "UNKNOWN"];
        const tooltip = [...value].sort((a, b) => status.indexOf(a.status) - status.indexOf(b.status)).map(phenotype => {
            const result = [];
            if (phenotype.name) {
                result.push(UtilsNew.escapeHtml(phenotype.name));
                // Check if we have also the phenotype ID --> add the '-' separator
                if (phenotype.id && phenotype.id !== phenotype.name) {
                    result.push("-");
                }
            }
            // Add phenotype ID if exists
            if (phenotype.id && phenotype.id !== phenotype.name) {
                if (phenotype.source && phenotype.source.toUpperCase() === "HPO") {
                    result.push(`
                        <a target="_blank" href="https://hpo.jax.org/app/browse/terms/${phenotype.id}">${phenotype.id}</a>`);
                } else {
                    result.push(phenotype.id);
                }
            }
            // Add phenotype status if exists
            if (phenotype.status) {
                result.push(`(${phenotype.status})`);
            }
            return html`<p>${result.join(" ")}</p>`;
        }).join("");
        if (value && value.length > 0) {
            return html`<a tooltip-title="Phenotypes" tooltip-text='${tooltip}'> ${value.length} term${value.length > 1 ? "s" : ""} found</a>`;
        } else {
            // TODO Think about this
            return html`<div>${tooltip}</div>`;
        }
    }

    renderSamplesTab(samples) {

        const generateSampleConfig = sample => ({
            id: sample.id,
            name: sample.id,
            render: () => html`
                <sample-view
                    .sampleId="${sample.id}"
                    .opencgaSession="${this.opencgaSession}">
                </sample-view>`
        });

        const configTabs = samples?.map(sample => generateSampleConfig(sample));

        return html `
            <detail-tabs
                .config="${{items: configTabs}}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <data-form
                .data=${this.individual}
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
                                    <individual-id-autocomplete
                                        .value="${this.sample?.id}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config=${{multiple: false}}
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </individual-id-autocomplete>
                                `,
                            }
                        }
                    ]
                },
                {
                    title: "General Information",
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
                                    <span style="font-weight: bold">${data.id}</span>
                                    <span style="margin: 0 20px">
                                        <b>Version:</b> ${data.version}
                                    </span>
                                    <span style="margin: 0 20px">
                                        <b>UUID:</b> ${data.uuid}
                                    </span>
                                `,
                            },
                        },
                        {
                            title: "Name",
                            field: "name",
                            defaultValue: "N/A"
                        },
                        {
                            title: "Father ID",
                            type: "custom",
                            display: {
                                render: data => {
                                    const father = data.father?.id ? data.father?.id : "N/A";
                                    const uuid = data.father?.uuid ? html `(UUID: ${data.father.uuid})` : "";
                                    return html`
                                        <span style="font-weight: bold">${father}</span> ${uuid}
                                `;
                                },
                            },
                        },
                        {
                            title: "Mother ID",
                            type: "custom",
                            display: {
                                render: data => {
                                    const mother = data.mother?.id ? data.mother?.id : "N/A";
                                    const uuid = data.mother?.uuid ? html `(UUID: ${data.mother.uuid})` : "";
                                    return html`
                                        <span style="font-weight: bold">${mother}</span> ${uuid}
                                    `;
                                }
                            },
                        },
                        {
                            title: "Sex",
                            type: "custom",
                            display: {
                                render: data => {
                                    const sexId = data.sex.id ? data.sex.id : "N/A";
                                    const karyotypicSex = data.karyotypicSex ? `(${data.karyotypicSex})`: "";
                                    const inferredKaryotypicSex = data?.qualityControl?.inferredSexReports && data.qualityControl.inferredSexReports?.length > 0 ?
                                        data.qualityControl.inferredSexReports[0].inferredKaryotypicSex : "N/A";
                                    return html`
                                        <span>${sexId}</span> ${karyotypicSex}
                                    `;
                                },
                            }
                        },
                        {
                            title: "Ethnicity",
                            field: "ethnicity.name",
                            defaultValue: "N/A"
                        },
                        {
                            title: "Location",
                            type: "custom",
                            display: {
                                render: data => {
                                    const address = data.location?.address ? `${data.location.address},` : "";
                                    const postalCode = data.location?.postalCode ? `${data.location.postalCode},`: "";
                                    const city = data.location?.city ? `${data.location.city} ` : "";
                                    const state = data.location?.state ? `${data.location.state} ` : "";
                                    const country = data.location?.country ? `(${data.location.country})` : "";
                                    if (!(address && postalCode && city && state && country)) {
                                        return "N/A";
                                    }
                                    return html`
                                        <span>
                                            ${address} ${postalCode} ${city} ${state} ${country}
                                        </span>
                                    `;
                                },
                            }
                        },
                        {
                            title: "Status",
                            field: "status.name",
                            defaultValue: "N/A"
                        },
                        {
                            title: "Created on",
                            type: "custom",
                            display: {
                                render: data => {
                                    const creationDate = data.creationDate ? UtilsNew.dateFormatter(data.creationDate): "N/A";
                                    const modificationDate = data.modificationDate ? `(Last modified on ${UtilsNew.dateFormatter(data.modificationDate)})`: "N/A";
                                    return html `
                                        ${creationDate} ${modificationDate}
                                    `;
                                }
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                            defaultValue: "N/A"
                        }
                    ]
                },
                {
                    title: "Phenotypes",
                    display: {
                        visible: individual => individual?.phenotypes,
                    },
                    elements: [
                        {
                            field: "phenotypes",
                            type: "table",
                            display: {
                                defaultValue: "Not Phenotypes",
                                errorMessage: "Error",
                                columns: [
                                    {
                                        title: "ID",
                                        type: "custom",
                                        display: {
                                            render: phenotype => html`<span style="font-weight: bold">${phenotype.id}</span>`,
                                        },
                                    },
                                    {
                                        title: "Name",
                                        field: "name",
                                        defaultValue: "N/A"
                                    },
                                    {
                                        title: "Source",
                                        field: "source  ",
                                        defaultValue: "N/A"
                                    },
                                    {
                                        title: "Status",
                                        field: "status.name",
                                        defaultValue: "N/A"
                                    },
                                    {
                                        title: "Description",
                                        field: "description",
                                        defaultValue: "N/A"
                                    },
                                ]
                            }
                        }
                    ]
                },
                {
                    title: "Disorders",
                    display: {
                        visible: individual => individual?.disorders,
                    },
                    elements: [
                        {
                            field: "disorders",
                            type: "table",
                            display: {
                                defaultValue: "Not Disorders",
                                errorMessage: "Error",
                                columns: [
                                    {
                                        title: "ID",
                                        type: "custom",
                                        display: {
                                            render: disorder => html`<span style="font-weight: bold">${disorder.id}</span>`,
                                        },
                                    },
                                    {
                                        title: "Name",
                                        field: "name",
                                        defaultValue: "N/A"
                                    },
                                    {
                                        title: "Source",
                                        field: "source  ",
                                        defaultValue: "N/A"
                                    },
                                    {
                                        title: "Status",
                                        field: "status.name",
                                        defaultValue: "N/A"
                                    },
                                    {
                                        title: "Evidences",
                                        type: "custom",
                                        display: {
                                            render: disorder => this.renderEvidences(disorder.evidences)
                                        },
                                        defaultValue: "N/A"
                                    },
                                    {
                                        title: "Description",
                                        field: "description",
                                        defaultValue: "N/A"
                                    },
                                ]
                            }
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
                            type: "custom",
                            display: {
                                render: individual => this.renderSamplesTab(individual.samples)
                            }
                        }
                    ]
                }
            ]
        });
    }

}

customElements.define("new-individual-view", NewIndividualView);
