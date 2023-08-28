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
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import UtilsNew from "../../core/utils-new.js";
import Types from "../commons/types.js";
import "../commons/forms/data-form.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../study/annotationset/annotation-set-view.js";
import "../loading-spinner.js";
import PdfBuilder, {stylePdf} from "../../core/pdf-builder.js";
export default class SampleView extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            sample: {
                type: Object,
            },
            sampleId: {
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
        this.sample = {};
        this.search = false;
        this.isLoading = false;

        this.displayConfigDefault = {
            buttonsVisible: false,
            collapsable: true,
            titleVisible: false,
            titleWidth: 2,
            defaultValue: "-",
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    sampleIdObserver() {
        if (this.sampleId && this.opencgaSession) {
            const params = {
                study: this.opencgaSession.study.fqn,
                includeIndividual: true,
            };
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.samples()
                .info(this.sampleId, params)
                .then(response => {
                    this.sample = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.sample = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "sampleSearch", this.sample, {query: {includeIndividual: true}}, error);
                    this.#setLoading(false);
                });
        } else {
            this.sample = {};
        }
    }

    onFilterChange(e) {
        this.sampleId = e.detail.value;
    }

    onDownloadPdf() {
        const dataFormConf = this.getDefaultConfig();
        const pdfDocument = new PdfBuilder(this.sample, dataFormConf);
        pdfDocument.exportToPdf();
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.sample?.id && this.search === false) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    Sample ID not found.
                </div>
            `;
        }

        return html`
            <button class="btn btn-primary" style="margin-bottom:14px; display: ${UtilsNew.isNotEmpty(this.sample) ? "block": "none"}"
                @click="${this.onDownloadPdf}">
                <i class="fas fa-file-pdf"></i>
                Export PDF (Beta)
            </button>
            <data-form
                .data="${this.sample}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            title: "Summary",
            icon: "",
            display: this.displayConfig || this.displayConfigDefault,
            displayDoc: {
                headerTitle: {
                    title: `Sample ${this.sample?.id}`,
                    display: {
                        classes: "h1",
                        propsStyle: {
                            ...stylePdf({
                                alignment: "center",
                                bold: true,
                            })
                        },
                    },
                },
                watermark: {
                    text: "Demo",
                    color: "blue",
                    opacity: 0.3,
                    bold: true,
                    italics: false
                },
            },
            sections: [
                {
                    title: "Search",
                    display: {
                        visible: sample => !sample?.id && this.search === true,
                        showPDF: false,
                    },
                    elements: [
                        {
                            title: "Sample ID",
                            // field: "sampleId",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <catalog-search-autocomplete
                                        .value="${this.sample?.id}"
                                        .resource="${"SAMPLE"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </catalog-search-autocomplete>
                                `,
                            },
                        },
                    ],
                },
                {
                    title: "General",
                    collapsed: false,
                    display: {
                        visible: sample => sample?.id,
                    },
                    elements: [
                        {
                            title: "Sample ID",
                            type: "custom",
                            display: {
                                visible: sample => sample?.id,
                                render: data => `<span style="font-weight: bold">${data.id}</span> (UUID: ${data.uuid})`,
                            },
                        },
                        {
                            title: "Individual ID",
                            field: "individualId"
                        },
                        {
                            title: "Files",
                            field: "fileIds",
                            type: "list",
                            display: {
                                defaultValue: "Files not found or empty",
                                contentLayout: "bullets",
                            },
                        },
                        {
                            title: "Somatic",
                            field: "somatic",
                            display: {
                                defaultValue: "false",
                            },
                        },
                        {
                            title: "Version",
                            field: "version",
                        },
                        {
                            title: "Status",
                            field: "internal.status",
                            type: "custom",
                            display: {
                                render: field => `${field?.name} (${UtilsNew.dateFormatter(field?.date)})`,
                            },
                        },
                        {
                            title: "Creation Date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: field => `${UtilsNew.dateFormatter(field)}`,
                            },
                        },
                        {
                            title: "Modification Date",
                            field: "modificationDate",
                            type: "custom",
                            display: {
                                render: field => `${UtilsNew.dateFormatter(field)}`,
                            },
                        },
                        {
                            title: "Description",
                            field: "description",
                            defaultValue: "N/A",
                        },
                        {
                            title: "Phenotypes",
                            field: "phenotypes",
                            type: "list",
                            defaultValue: "N/A",
                            display: {
                                // showPDF: false,
                                contentLayout: "bullets",
                                render: phenotype => {
                                    let id = phenotype?.id;
                                    if (phenotype?.id?.startsWith("HP:")) {
                                        id = `<a href="${BioinfoUtils.getHpoLink(phenotype.id)}" target="_blank">
                                        ${phenotype.id}</a>`;
                                    }
                                    return phenotype?.name ? `${phenotype.name} (${id})` : `${id}`;
                                },
                            },
                        },
                        /*
                            {
                                title: "Annotation sets",
                                field: "annotationSets",
                                type: "custom",
                                display: {
                                    render: field => html`<annotation-sets-view .annotationSets="${field}"></annotation-sets-view>`
                                }
                            }
                        */
                    ],
                },
            ],
        });
    }

}

customElements.define("sample-view", SampleView);
