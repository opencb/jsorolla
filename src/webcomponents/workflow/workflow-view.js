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
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/forms/data-form.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../loading-spinner.js";

export default class WorkflowView extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            workflow: {
                type: Object,
            },
            workflowId: {
                type: String,
            },
            search: {
                type: Boolean,
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
        this.workflow = {};
        this.search = false;

        this.isLoading = false;
        this.displayConfigDefault = {
            collapsable: true,
            titleVisible: false,
            titleWidth: 2,
            defaultValue: "-",
            defaultLayout: "horizontal",
            buttonsVisible: false,
            pdf: false,
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        // to update disorders if it has more than one
        // if (changedProperties.has("workflow")) {
        //     this._config = this.getDefaultConfig();
        // }
        if (changedProperties.has("workflowId")) {
            this.workflowIdObserver();
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

    workflowIdObserver() {
        if (this.workflowId && this.opencgaSession) {
            const params = {
                study: this.opencgaSession.study.fqn,
            };
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.workflows()
                .info(this.workflowId, params)
                .then(response => {
                    this.workflow = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.workflow = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "workflowSearch", this.workflow, {}, error);
                    this.#setLoading(false);
                });
        } else {
            this.workflow = {};
        }
    }

    onFilterChange(e) {
        this.workflowId = e.detail.value;
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.workflow?.id && this.search === false) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    Workflow ID not found.
                </div>
            `;
        }

        return html`
            <data-form
                .data="${this.workflow}"
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
                        visible: workflow => !workflow?.id && this.search === true,
                    },
                    elements: [
                        {
                            title: "Workflow ID",
                            // field: "workflowId",
                            type: "custom",
                            display: {
                                render: () => html `
                                    <catalog-search-autocomplete
                                        .value="${this.sample?.id}"
                                        .resource="${"WORKFLOW"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </catalog-search-autocomplete>`,
                            },
                        },
                    ],
                },
                {
                    title: "General",
                    collapsed: false,
                    display: {
                        visible: workflow => workflow?.id,
                        // layout: [
                        //     {
                        //         id: "name",
                        //         className: ""
                        //     },
                        //     {
                        //         id: "",
                        //         className: "row",
                        //         elements: [
                        //             {
                        //                 id: "father",
                        //                 className: "col-md-6"
                        //             },
                        //             {
                        //                 id: "mother",
                        //                 className: "col-md-6"
                        //             }
                        //         ]
                        //     },
                        //     {
                        //         id: "sex",
                        //         className: ""
                        //     },
                        // ]
                    },
                    elements: [
                        {
                            title: "Workflow ID",
                            // type: "custom",
                            type: "complex",
                            display: {
                                // render: data => `
                                //     <span style="font-weight: bold">${data.id}</span> (UUID: ${data.uuid})
                                // `,
                                template: "${id} (UUID: ${uuid})",
                                // transform: {
                                //     id: id => id.toLowerCase(),
                                // },
                                style: {
                                    id: {
                                        "font-weight": "bold",
                                    }
                                }
                            },
                        },
                        {
                            id: "name",
                            title: "Name",
                            field: "name",
                        },
                        {
                            id: "father",
                            title: "Father ID",
                            field: "father.id",
                            // type: "basic",
                        },
                        {
                            id: "mother",
                            title: "Mother ID",
                            field: "mother.id",
                            // type: "basic",
                        },
                        {
                            id: "sex",
                            title: "Reported Sex (Karyotypic)",
                            // type: "custom",
                            type: "complex",
                            display: {
                                // render: workflow => `
                                //     ${workflow.sex?.id ?? "Not specified"} (${workflow.karyotypicSex ?? "Not specified"})
                                // `,
                                defaultValue: "Not specified",
                                template: "${sex.id} (${karyotypicSex})"
                            },
                        },
                        {
                            title: "Inferred Karyotypic Sex",
                            // type: "custom",
                            field: "qualityControl",
                            display: {
                                // render: data => {
                                //     if (data?.qualityControl?.inferredSexReports?.length > 0) {
                                //         return data.qualityControl.inferredSexReports[0].inferredKaryotypicSex;
                                //     } else {
                                //         return "-";
                                //     }
                                // },
                                format: qualityControl => qualityControl?.inferredSexReports?.length > 0 ? qualityControl.inferredSexReports[0].inferredKaryotypicSex : "-"
                            },
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
                                // render: disorder => CatalogGridFormatter.disorderFormatter(disorder),
                                format: disorder => CatalogGridFormatter.disorderFormatter([disorder]),
                                defaultValue: "N/A",
                            },
                        },
                        {
                            title: "Phenotypes",
                            field: "phenotypes",
                            type: "list",
                            display: {
                                contentLayout: "vertical",
                                // filter: phenotypes => [phenotypes[0]],
                                // transform: phenotypes => phenotypes.map(phenotype => {
                                //     phenotype.id = phenotype.id.toLowerCase();
                                //     return phenotype;
                                // }),
                                // render: phenotype => {
                                //     let id = phenotype.id;
                                //     if (phenotype.id.startsWith("HP:")) {
                                //         id = html`
                                //             <a href="https://hpo.jax.org/app/browse/term/${phenotype.id}" target="_blank">
                                //                 ${phenotype.id}
                                //             </a>
                                //         `;
                                //     }
                                //     return html`${phenotype.name} (${id})`;
                                // },
                                format: phenotype => CatalogGridFormatter.phenotypesFormatter([phenotype]),
                                defaultValue: "N/A",
                            },
                        },
                        {
                            title: "Date of Birth",
                            field: "dateOfBirth",
                            display: {
                                format: date => UtilsNew.dateFormatter(date)
                            },
                        },
                        {
                            title: "Life Status",
                            field: "lifeStatus",
                        },
                        {
                            title: "Version",
                            field: "version",
                        },
                        {
                            title: "Status",
                            type: "complex",
                            display: {
                                // render: field => field ? `${field.name} (${UtilsNew.dateFormatter(field.date)})` : "-"
                                template: "${internal.status.name} (${internal.status.date})",
                                format: {
                                    "internal.status.date": date => UtilsNew.dateFormatter(date)
                                }
                            },
                        },
                        {
                            title: "Creation Date",
                            field: "creationDate",
                            display: {
                                // render: field => field ? UtilsNew.dateFormatter(field) : "-"
                                format: date => UtilsNew.dateFormatter(date)
                            },
                        },
                        {
                            title: "Modification Date",
                            field: "modificationDate",
                            // type: "custom",
                            display: {
                                format: modificationDate => UtilsNew.dateFormatter(modificationDate),
                            },
                        },
                        {
                            title: "Description",
                            field: "description",
                        },
                        /*
                        // Fixme: fix export to pdf
                        {
                            title: "Annotation sets",
                            field: "annotationSets",
                            type: "custom",
                            display: {
                                showPDF: false,
                                render: field => html`
                                    <annotation-set-view
                                        .annotationSets="${field}">
                                    </annotation-set-view>
                                `,
                                defaultValue: "N/A",
                            },
                        },
                        */
                    ],
                },
                {
                    title: "Samples",
                    display: {
                        visible: workflow => workflow?.id,
                    },
                    elements: [
                        {
                            title: "List of samples",
                            field: "samples",
                            type: "table",
                            display: {
                                className: "",
                                style: "",
                                headerClassName: "",
                                headerStyle: "",
                                headerVisible: true,
                                // filter: array => array.filter(item => item.somatic),
                                // transform: array => array.map(item => {
                                //     item.somatic = true;
                                //     return item;
                                // }),
                                defaultValue: "No phenotypes found",
                                columns: [
                                    {
                                        title: "Samples ID",
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
                                    },
                                    {
                                        title: "Phenotypes",
                                        field: "phenotypes",
                                        type: "list",
                                        display: {
                                            contentLayout: "bullets",
                                            format: phenotype => CatalogGridFormatter.phenotypesFormatter([phenotype]),
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        });
    }

}

customElements.define("workflow-view", WorkflowView);
