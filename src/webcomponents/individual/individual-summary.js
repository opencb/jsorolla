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
import "../commons/filters/catalog-search-autocomplete.js";
import "../loading-spinner.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";

export default class IndividualSummary extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            individual: {
                type: Object,
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
        this._individual = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("individualId")) {
            this.individualIdObserver();
        }

        if (changedProperties.has("individual")) {
            this.individualObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    individualIdObserver() {
        this._individual = null;
        if (this.individualId && this.opencgaSession) {
            this.opencgaSession.opencgaClient.individuals()
                .info(this.individualId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._individual = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    individualObserver() {
        this._individual = {...this.individual};
    }

    render() {
        if (!this.opencgaSession || !this._individual) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._individual}"
                .config="${this._config || {}}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Individual Overview",
            display: {
                titleVisible: true,
                buttonsVisible: false,
                separationClassName: "mb-1",
                layout: [
                    {
                        className: "row",
                        sections: [
                            {
                                id: "general",
                                className: "col-6",
                            },
                            {
                                id: "metadata",
                                className: "col-6",
                            },
                        ],
                    },
                    {
                        id: "disorders-phenotypes",
                    },
                    {
                        id: "samples",
                    },
                ],
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "general",
                    display: {
                        titleWidth: 4,
                        className: "border border-1 gorder-gray-200 rounded-3 p-3 bg-white",
                        separationClassName: "mb-3",
                    },
                    elements: [
                        {
                            type: "text",
                            text: "General Information",
                            display: {
                                className: "mb-2 fs-5 fw-bold",
                            },
                        },
                        {
                            title: "ID",
                            field: "id",
                        },
                        {
                            id: "name",
                            title: "Name",
                            field: "name",
                            display: {
                                defaultValue: "-",
                            },
                        },
                        {
                            id: "father",
                            title: "Father ID",
                            field: "father.id",
                            display: {
                                defaultValue: "-",
                            },
                        },
                        {
                            id: "mother",
                            title: "Mother ID",
                            field: "mother.id",
                            display: {
                                defaultValue: "-",
                            },
                        },
                        {
                            id: "sex",
                            title: "Reported Sex (Karyotypic)",
                            type: "complex",
                            display: {
                                defaultValue: "Not specified",
                                template: "${sex.id} (${karyotypicSex})"
                            },
                        },
                        {
                            title: "Inferred Karyotypic Sex",
                            field: "qualityControl",
                            display: {
                                format: qualityControl => {
                                    return qualityControl?.inferredSexReports?.length > 0 ? qualityControl.inferredSexReports[0].inferredKaryotypicSex : "-";
                                },
                            },
                        },
                    ],
                },
                {
                    id: "metadata",
                    display: {
                        className: "border border-1 gorder-gray-200 rounded-3 p-3 bg-white",
                        separationClassName: "mb-3",
                        titleWidth: 4,
                    },
                    elements: [
                        {
                            type: "text",
                            text: "Metadata",
                            display: {
                                className: "mb-2 fs-5 fw-bold",
                            },
                        },
                        {
                            title: "UUID",
                            field: "uuid",
                            type: "custom",
                            display: {
                                render: uuid => html`
                                    <code class="text-break">${uuid || "-"}</code>
                                `,
                                defaultValue: "-",
                            },
                        },
                        {
                            title: "Version",
                            field: "version",
                            display: {
                                defaultValue: "-",
                            },
                        },
                        {
                            title: "Release",
                            field: "release",
                            display: {
                                defaultValue: "-",
                            },
                        },
                        {
                            title: "Creation Date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: creationDate => creationDate ? UtilsNew.dateFormatter(creationDate) : "-",
                            },
                        },
                        {
                            title: "Modification Date",
                            field: "modificationDate",
                            type: "custom",
                            display: {
                                render: modificationDate => modificationDate ? UtilsNew.dateFormatter(modificationDate) : "-",
                            },
                        },
                    ],
                },
                {
                    id: "disorders-phenotypes",
                    display: {
                        titleWidth: 2,
                        className: "border border-1 gorder-gray-200 rounded-3 p-3 bg-white",
                        separationClassName: "mb-3",
                        layout: [
                            {
                                id: "title",
                            },
                            {
                                className: "row",
                                elements: [
                                    {
                                        id: "disorders",
                                        className: "col-6",
                                    },
                                    {
                                        id: "phenotypes",
                                        className: "col-6",
                                    },
                                ],
                            },
                        ],
                    },
                    elements: [
                        {
                            id: "title",
                            type: "text",
                            text: "Disorders & Phenotypes",
                            display: {
                                className: "mb-2 fs-5 fw-bold",
                            },
                        },
                        {
                            id: "disorders",
                            field: "disorders",
                            title: "Disorders",
                            type: "list",
                            display: {
                                titleWidth: 2,
                                listClassName: "mb-0 ps-3",
                                contentLayout: "bullets",
                                defaultLayout: "vertical",
                                defaultValue: individual => html`
                                    <div class="alert alert-light border-0 mb-0 d-flex flex-column align-items-center gap-1">
                                        <i class="fas fa-info-circle fs-3"></i>
                                        <div class="text-break">No disorders available for individual <b>${individual.name || individual.id}</b>.</div>
                                    </div>
                                `,
                                template: "${name} (${id})",
                                link: {
                                    "id": id => {
                                        return BioinfoUtils.getOntologyLink(id);
                                    },
                                },
                            },
                        },
                        {
                            id: "phenotypes",
                            field: "phenotypes",
                            title: "Phenotypes",
                            type: "list",
                            display: {
                                titleWidth: 2,
                                listClassName: "mb-0 ps-3",
                                contentLayout: "bullets",
                                defaultLayout: "vertical",
                                defaultValue: individual => html`
                                    <div class="alert alert-light border-0 mb-0 d-flex flex-column align-items-center gap-1">
                                        <i class="fas fa-info-circle fs-3"></i>
                                        <div class="text-break">No phenotypes available for individual <b>${individual.name || individual.id}</b>.</div>
                                    </div>
                                `,
                                transform: phenotypes => {
                                    return (phenotypes || []).sort(item => item?.status === "OBSERVED" ? -1 : 1);
                                },
                                template: "${name} (${id})",
                                link: {
                                    "id": id => {
                                        return BioinfoUtils.getOntologyLink(id);
                                    },
                                }
                            },
                        },
                    ],
                },
                {
                    id: "samples",
                    display: {
                        className: "border border-1 gorder-gray-200 rounded-3 p-3 bg-white",
                        separationClassName: "mb-0",
                    },
                    elements: [
                        {
                            type: "text",
                            text: "Samples",
                            display: {
                                className: "mb-2 fs-5 fw-bold",
                            },
                        },
                        {
                            field: "samples",
                            type: "table",
                            display: {
                                className: "table-borderless table-grid",
                                headerCellClassName: "bg-white",
                                bodyRowClassName: "bg-gray-100",
                                defaultValue: individual => html`
                                    <div class="alert alert-light border-0 mb-0 d-flex flex-column align-items-center gap-1">
                                        <i class="fas fa-info-circle fs-3"></i>
                                        <div class="text-break">No samples available for individual <b>${individual.name || individual.id}</b>.</div>
                                    </div>
                                `,
                                columns: [
                                    {
                                        title: "Sample ID",
                                        field: "id",
                                        display: {
                                            style: {
                                                "font-weight": "bold"
                                            }
                                        }
                                    },
                                    {
                                        title: "Somatic",
                                        field: "somatic",
                                        type: "custom",
                                        display: {
                                            headerCellClassName: "text-center",
                                            bodyCellClassName: "text-center",
                                            render: somatic => html`
                                                <i class="fas ${somatic ? "fa-check": "fa-times"}"></i>
                                            `,
                                        },
                                    },
                                    {
                                        title: "Cohorts",
                                        field: "cohortIds",
                                        type: "list",
                                        display: {
                                            contentLayout: "horizontal",
                                            listClassName: "d-flex align-items-center flex-wrap",
                                            listItemClassName: "badge bg-secondary text-white me-1",
                                            defaultValue: "-",
                                        },
                                    },
                                    {
                                        title: "Phenotypes",
                                        field: "phenotypes",
                                        type: "list",
                                        display: {
                                            contentLayout: "bullets",
                                            defaultValue: "-",
                                            format: phenotype => CatalogGridFormatter.phenotypesFormatter([phenotype]),
                                        },
                                    },
                                ],
                            },
                        },
 
                    ],
                },
            ],
        };
    }

}

customElements.define("individual-summary", IndividualSummary);
