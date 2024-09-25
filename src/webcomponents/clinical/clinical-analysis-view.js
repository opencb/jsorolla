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
import LitUtils from "../commons/utils/lit-utils";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import WebUtils from "../commons/utils/web-utils.js";
import "../commons/forms/data-form.js";
import "../commons/image-viewer.js";

export default class ClinicalAnalysisView extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalAnalysis: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
            },
            search: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object
            },
            settings: {
                type: Object
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.clinicalAnalysis = {};
        this.search = false;
        this.isLoading = false;

        this.displayConfigDefault = {
            collapsable: true,
            titleVisible: false,
            defaultValue: "-",
            // defaultLayout: "horizontal",
            buttonsVisible: false,
            layout: [
                {
                    id: "search",
                    className: ""
                },
                {
                    id: "",
                    className: "row mb-5",
                    sections: [
                        {
                            id: "detail",
                            className: "col-md-6"
                        },
                        {
                            id: "proband",
                            className: "col-md-6"
                        }
                    ]
                },
                {
                    id: "family",
                    className: ""
                },
                {
                    id: "files",
                    className: ""
                }
            ],
            pdf: false,
        };
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        if (changedProperties.has("displayConfig") || changedProperties.has("opencgaSession")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig
            };
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    settingsObserver() {
        this._config = {...this.getDefaultConfig()};
        if (this.settings?.fields?.length) {
            this._config.hiddenFields = null;
            this._config = UtilsNew.mergeDataFormConfig(this._config, this.settings.fields);
        } else if (this.settings?.hiddenFields?.length) {
            this._config.hiddenFields = this.settings.hiddenFields;
            this._config = {...this._config, ...this.getDefaultConfig()}; // this is needed as we need to relauch getDefaultConfig() with the updated `hiddenFields` array
        }
        this.requestUpdate();
    }

    clinicalAnalysisIdObserver() {
        if (this.clinicalAnalysisId && this.opencgaSession) {
            const params = {
                study: this.opencgaSession.study.fqn
            };
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.clinical()
                .info(this.clinicalAnalysisId, params)
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.clinicalAnalysis = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "clinicalAnalysisSearch", this.clinicalAnalysis, {}, error);
                    this.#setLoading(false);
                });
        } else {
            this.clinicalAnalysis = {};
        }
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    onFilterChange(e) {
        this.clinicalAnalysisId = e.detail.value;
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.clinicalAnalysis?.id && this.search === false) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle pe-2"></i>
                    No clinical Analysis ID found.
                </div>
            `;
        }

        return html`
            <data-form
                .data=${this.clinicalAnalysis}
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            // comes from external settings
            // hiddenFields: [],
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    id: "search",
                    title: "Search",
                    display: {
                        visible: job => !job?.id && this.search === true,
                    },
                    elements: [
                        {
                            title: "Clinical Analysis ID",
                            // field: "clinicalAnalysisId",
                            type: "custom",
                            display: {
                                render: () => html `
                                    <catalog-search-autocomplete
                                        .value="${this.clinicalAnalysis?.id}"
                                        .resource="${"CLINICAL_ANALYSIS"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </catalog-search-autocomplete>`,
                            },
                        },
                    ],
                },
                {
                    id: "detail",
                    title: "Details",
                    display: {
                        collapsed: false,
                        titleWidth: 3,
                        visible: clinicalAnalysis => clinicalAnalysis?.id
                    },
                    elements: [
                        {
                            title: "Case ID",
                            field: "id",
                        },
                        {
                            title: "Proband",
                            field: "proband.id",
                        },
                        {
                            title: "Disorder",
                            type: "complex",
                            display: {
                                template: "${disorder}",
                                format: {
                                    disorder: disorder => CatalogGridFormatter.disorderFormatter([disorder]),
                                },
                                defaultValue: "N/A",
                            },
                        },
                        {
                            title: "Analysis Type",
                            field: "type",
                            display: {
                                visible: !this._config?.hiddenFields?.includes("type"),
                            },
                        },
                        {
                            title: "Flags",
                            field: "flags",
                            type: "list",
                            display: {
                                visible: !this._config?.hiddenFields?.includes("flags"),
                                separator: " ",
                                contentLayout: "horizontal",
                                template: "${id}",
                                className: {
                                    "id": "badge text-bg-secondary",
                                },
                            }
                        },
                        {
                            title: "Status",
                            field: "status.id",
                        },
                        {
                            title: "Priority",
                            type: "complex",
                            display: {
                                template: "${priority.id}",
                                className: {
                                    "priority.id": (id, data) => `badge ${WebUtils.getClinicalAnalysisPriorityColour(data?.priority?.rank)}`,
                                },
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                            display: {
                                errorMessage: "-",
                            },
                        },
                        {
                            title: "Assigned To",
                            field: "analysts",
                            type: "list",
                            display: {
                                contentLayout: "bullets",
                                visible: !this._config?.hiddenFields?.includes("analyst.assignee") && !this._config?.hiddenFields?.includes("analyst.id"),
                                format: analyst => analyst.id,
                            },
                        },
                        {
                            title: "Creation Date",
                            field: "creationDate",
                            display: {
                                format: date => UtilsNew.dateFormatter(date)
                            },
                        },
                        {
                            title: "Due date",
                            field: "dueDate",
                            display: {
                                format: date => UtilsNew.dateFormatter(date)
                            },
                        }
                    ]
                },
                {
                    id: "proband",
                    title: "Proband",
                    display: {
                        titleWidth: 3,
                        visible: clinicalAnalysis => clinicalAnalysis?.id
                    },
                    elements: [
                        {
                            title: "Proband",
                            field: "proband.id"
                        },
                        {
                            title: "Sex (Karyotypic)",
                            field: "proband",
                            display: {
                                defaultValue: "Not specified",
                                format: proband => `${proband?.sex?.id ?? proband?.sex} (${proband?.karyotypicSex})`
                            },
                        },
                        {
                            title: "Date of Birth",
                            field: "proband.dateOfBirth",
                        },
                        {
                            title: "Life Status",
                            field: "proband.lifeStatus",
                        },
                        {
                            title: "Disorders",
                            field: "proband.disorders",
                            type: "list",
                            display: {
                                defaultValue: "-",
                                contentLayout: "bullets",
                                transform: disorders => (disorders || []).map(disorder => ({disorder})),
                                template: "${disorder.name} (${disorder.id})",
                                link: {
                                    "disorder.id": id => id.startsWith("OMIM:") ?
                                        BioinfoUtils.getOmimOntologyLink(id) :
                                        "",
                                },
                            },
                        },
                        {
                            title: "Phenotypes",
                            field: "proband.phenotypes",
                            type: "list",
                            display: {
                                defaultValue: "-",
                                contentLayout: "bullets",
                                transform: phenotypes => (phenotypes || [])
                                    .sort(item => item?.status === "OBSERVED" ? -1 : 1)
                                    .map(phenotype => ({phenotype})),
                                template: "${phenotype.name} (${phenotype.id}) - ${phenotype.status}",
                                link: {
                                    "phenotype.id": id => id.startsWith("HP:") ? BioinfoUtils.getHpoLink(id) : id,
                                }
                            },
                        },
                        {
                            title: "Samples",
                            field: "proband.samples",
                            type: "table",
                            style: {
                                "margin-top": "1em",
                            },
                            display: {
                                // defaultValue: "No sample found",
                                defaultLayout: "vertical",
                                headerStyle: {
                                    background: "#f5f5f5",
                                    lineHeight: "0.5"
                                },
                                columns: [
                                //     {
                                //         title: "ID",
                                //         field: "id",
                                //         formatter: (sampleId, sample) => {
                                //             let somaticHtml = "";
                                //             if (typeof sample.somatic !== "undefined") {
                                //                 somaticHtml = sample.somatic ? "Somatic" : "Germline";
                                //             }
                                //             return `
                                //                 <div>
                                //                     <span style="font-weight: bold; margin: 5px 0">${sampleId}</span>
                                //                     ${somaticHtml ? `<span class="help-block" style="margin: 5px 0">${somaticHtml}</span>` : nothing}
                                //                 </div>
                                //             `;
                                //         },
                                //     },
                                    {
                                        title: "ID",
                                        type: "complex",
                                        display: {
                                            defaultValue: "-",
                                            template: "${id} ${somatic}",
                                            format: {
                                                "somatic": (somatic, sample) => sample.somatic ? "Somatic" : "Germline",
                                            },
                                            className: {
                                                "somatic": "form-text"
                                            },
                                            style: {
                                                "id": {
                                                    "font-weight": "bold"
                                                },
                                                "somatic": {
                                                    "margin": "5px 0"
                                                },
                                            }
                                        },
                                    },
                                    {
                                        title: "Files",
                                        field: "fileIds",
                                        type: "list",
                                        display: {
                                            defaultValue: "-",
                                            contentLayout: "vertical",
                                        },
                                    },
                                    {
                                        title: "Collection Method",
                                        field: "collection.method",
                                        display: {
                                            defaultValue: "-",
                                        },
                                    },
                                    {
                                        title: "Preparation Method",
                                        field: "processing.preparationMethod",
                                        display: {
                                            defaultValue: "-",
                                        },
                                    },
                                    {
                                        title: "Creation Date",
                                        field: "creationDate",
                                        display: {
                                            format: creationDate => UtilsNew.dateFormatter(creationDate, "D MMM YYYY, h:mm:ss a"),
                                        }
                                    },
                                    {
                                        title: "Status",
                                        field: "status.id",
                                        display: {
                                            defaultValue: "-",
                                        },
                                    },
                                ],
                            },
                        },
                    ]
                },
                {
                    id: "family",
                    title: "Family",
                    display: {
                        visible: clinicalAnalysis => clinicalAnalysis?.id && clinicalAnalysis.type === "FAMILY",
                    },
                    elements: [
                        {
                            title: "Family ID",
                            field: "family.id"
                        },
                        {
                            title: "Name",
                            field: "family.name"
                        },
                        {
                            title: "Members",
                            field: "family",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: family => {
                                    if (family && family.members) {
                                        const individualGridConfig = {
                                            showSelectCheckbox: false,
                                            showToolbar: false
                                        };
                                        return html`
                                            <individual-grid
                                                .opencgaSession="${this.opencgaSession}"
                                                .individuals="${family.members}"
                                                .config="${individualGridConfig}"
                                                @filterChange="${e => this.onFamilyChange(e)}">
                                            </individual-grid>
                                        `;
                                    }
                                },
                                errorMessage: "No family selected",
                            },
                        },
                        // {
                        //     title: "Pedigree",
                        //     type: "custom",
                        //     display: {
                        //         render: clinicalAnalysis => html`
                        //             <image-viewer
                        //                 .data="${clinicalAnalysis?.family?.pedigreeGraph?.base64}">
                        //             </image-viewer>
                        //         `,
                        //     },
                        // },
                        {
                            title: "Pedigree",
                            type: "image",
                            field: "family.pedigreeGraph.base64",
                        },

                    ]
                },
                {
                    id: "files",
                    title: "Files",
                    display: {
                        visible: clinicalAnalysis => clinicalAnalysis?.id,
                    },
                    elements: [
                        {
                            type: "table",
                            field: "files",
                            display: {
                                columns: [
                                    {
                                        title: "Name",
                                        field: "name",
                                    },
                                    {
                                        title: "Size",
                                        field: "size",
                                        display: {
                                            format: size => UtilsNew.getDiskUsage(size),
                                        },
                                    },
                                    {
                                        title: "Format",
                                        field: "format",
                                    },
                                    {
                                        title: "Software",
                                        field: "software",
                                        display: {
                                            format: software => software?.name ? `${software.name} (${software.version || "-"})` : "-",
                                        },
                                    },
                                    {
                                        title: "Creation Date",
                                        field: "creationDate",
                                        display: {
                                            format: creationDate => UtilsNew.dateFormatter(creationDate, "D MMM YYYY, h:mm:ss a"),
                                        }
                                    },
                                ],
                            },
                        }
                    ]
                }
            ]
        };
    }

}

customElements.define("clinical-analysis-view", ClinicalAnalysisView);
