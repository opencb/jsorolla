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
import LitUtils from "../commons/utils/lit-utils.js";
import Types from "../commons/types.js";
import PdfBuilder, {stylePdf} from "../commons/forms/pdf-builder.js";
import "../commons/forms/data-form.js";
import "../loading-spinner.js";
import "../study/annotationset/annotation-set-view.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter";

export default class CohortView extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            cohort: {
                type: Object
            },
            cohortId: {
                type: String
            },
            search: {
                type: Boolean
            },
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.cohort = {};
        this.search = false;
        this.isLoading = false;

        this.displayConfigDefault = {
            buttonsVisible: false,
            collapsable: true,
            titleAlign: "left",
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
        if (changedProperties.has("cohortId")) {
            this.cohortIdObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    cohortIdObserver() {
        if (this.cohortId && this.opencgaSession) {
            const params = {
                study: this.opencgaSession.study.fqn,
            };
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.cohorts()
                .info(this.cohortId, params)
                .then(response => {
                    this.cohort = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.cohort = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "cohortSearch", this.cohort, {}, error);
                    this.#setLoading(false);
                });
        } else {
            this.cohort = {};
        }
    }

    onFilterChange(e) {
        this.cohortId = e.detail.value;
    }

    onDownloadPdf() {
        const dataFormConf = this.getDefaultConfig();
        const pdfDocument = new PdfBuilder(this.cohort, dataFormConf);
        pdfDocument.exportToPdf();
    }


    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.cohort?.id && this.search === false) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    No Cohort ID found.
                </div>
            `;
        }

        return html`
<!--
            <button class="btn btn-primary" style="margin-bottom:14px; display: $UtilsNew.isNotEmpty(this.cohort) ? "block": "none"}"
                @click="$this.onDownloadPdf}">
                <i class="fas fa-file-pdf"></i>
                Export PDF (Beta)
            </button>
-->
            <data-form
                .data=${this.cohort}
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            title: "Summary",
            icon: "",
            display: this.displayConfig || this.displayConfigDefault,
            // displayDoc: {
            //     headerTitle: {
            //         title: `Cohort ${this.cohort?.id}`,
            //         display: {
            //             classes: "h1",
            //             propsStyle: {
            //                 ...stylePdf({
            //                     alignment: "center",
            //                     bold: true,
            //                 })
            //             },
            //         },
            //     },
            //     watermark: {
            //         text: "Demo",
            //         color: "blue",
            //         opacity: 0.3,
            //         bold: true,
            //         italics: false
            //     },
            // },
            sections: [
                {
                    title: "Search",
                    display: {
                        visible: cohort => !cohort?.id && this.search === true,
                        showPDF: false,
                    },
                    elements: [
                        {
                            title: "Cohort ID",
                            // field: "cohortId",
                            type: "custom",
                            display: {
                                render: () => html `
                                    <catalog-search-autocomplete
                                        .value="${this.cohort?.id}"
                                        .resource="${"COHORT"}"
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
                        visible: cohort => cohort?.id,
                    },
                    elements: [
                        // available types: basic (optional/default), complex, list (horizontal and vertical), table, plot, custom
                        {
                            title: "Cohort Id",
                            type: "complex",
                            display: {
                                template: "${id} (UUID: ${uuid})",
                                style: {
                                    id: {
                                        "font-weight": "bold",
                                    },
                                },
                            },
                        },
                        {
                            title: "Cohort Type",
                            field: "type",
                        },
                        {
                            title: "Description",
                            field: "description",
                        },
                        {
                            title: "Status",
                            type: "complex",
                            display: {
                                template: "${internal.status.id} (${internal.status.date})",
                                format: {
                                    "internal.status.date": date => UtilsNew.dateFormatter(date),
                                }
                            },
                        },
                        {
                            title: "Creation Date",
                            field: "creationDate",
                            display: {
                                format: date => UtilsNew.dateFormatter(date),
                            },
                        },
                        {
                            title: "Modification Date",
                            field: "modificationDate",
                            display: {
                                format: date => UtilsNew.dateFormatter(date),
                            },
                        },
                        {
                            title: "Annotation sets",
                            field: "annotationSets",
                            type: "custom",
                            // FIXME: fix export to PDF
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
                        {
                            title: "Samples",
                            field: "samples",
                            type: "table",
                            // FIXME: fix export to PDF
                            display: {
                                columns: [
                                    {
                                        id: "sample",
                                        title: "Samples ID",
                                        field: "id",
                                        // width: "*",
                                        // sortable: true,
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
                                // pagination: true,
                                // search: true,
                            },
                        }
                    ],
                },
            ],
        });
    }

}

customElements.define("cohort-view", CohortView);

