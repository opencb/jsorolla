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
            defaultLayout: "horizontal",
            buttonsVisible: false,
            layout: [
                {
                    id: "search",
                    className: ""
                },
                {
                    id: "",
                    className: "row",
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
            ]
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
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
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
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
                            field: "disorder",
                            id: "type",
                            type: "custom",
                            display: {
                                render: disorder => UtilsNew.renderHTML(CatalogGridFormatter.disorderFormatter([disorder])),
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
                            type: "custom",
                            display: {
                                visible: !this._config?.hiddenFields?.includes("flags"),
                                render: flags => html`
                                    ${flags.map(flag => html`
                                        <span class="badge badge-secondary">${flag?.id || "-"}</span>
                                    `)}
                                `,
                            }
                        },
                        {
                            title: "Status",
                            field: "status.name",
                            display: {
                                visible: !this._config?.hiddenFields?.includes("status.name") && !!this.opencgaSession?.study?.configuration?.clinical?.status,
                            },
                        },
                        {
                            title: "Description",
                            field: "description",
                            display: {
                                visible: !this._config?.hiddenFields?.includes("description"),
                                errorMessage: "-",
                            },
                        },
                        {
                            title: "Priority",
                            field: "priority",
                            type: "custom",
                            display: {
                                visible: !this._config?.hiddenFields?.includes("priority") && !!this.opencgaSession?.study?.configuration?.clinical?.priorities,
                                render: priority => {
                                    const priorityRankToColor = ["label-danger", "label-warning", "label-primary", "label-info", "label-success", "label-default"];
                                    return html`<span class="label ${priorityRankToColor[priority.rank]}">
                                        ${priority.id}
                                    </span>`;
                                },
                            },
                        },
                        {
                            title: "Assigned To",
                            field: "analyst.id",
                            display: {
                                visible: !this._config?.hiddenFields?.includes("analyst.assignee") && !this._config?.hiddenFields?.includes("analyst.id"),
                            },
                        },
                        {
                            title: "Creation date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                visible: !this._config?.hiddenFields?.includes("creationDate"),
                                render: creationDate => html`${moment(creationDate, "YYYYMMDDHHmmss").format("D MMM YY")}`,
                            },
                        },
                        {
                            title: "Due date",
                            field: "dueDate",
                            type: "custom",
                            display: {
                                visible: !this._config?.hiddenFields?.includes("dueDate"),
                                render: dueDate => html`${moment(dueDate, "YYYYMMDDHHmmss").format("D MMM YY")}`,
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
                            type: "custom",
                            field: "proband",
                            display: {
                                render: proband => `
                                    ${proband?.sex?.id ?? proband?.sex ?? "Not specified"} (${proband?.karyotypicSex ?? "Not specified"})
                                `,
                            },
                        },
                        {
                            title: "Date of Birth",
                            type: "complex",
                            display: {
                                template: "${proband.dateOfBirth} (${proband.lifeStatus})",
                            },
                        },
                        {
                            title: "Disorders",
                            field: "proband.disorders",
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
                                defaultValue: "N/A",
                            },
                        },
                        {
                            title: "Phenotypes",
                            field: "proband.phenotypes",
                            type: "custom",
                            display: {
                                render: phenotypes => {
                                    return (phenotypes || [])
                                        .sort(item => item?.status === "OBSERVED" ? -1 : 1)
                                        .map(phenotype => {
                                            if (phenotype?.source && phenotype?.source?.toUpperCase() === "HPO") {
                                                const url = `https://hpo.jax.org/app/browse/term/${phenotype.id}`;
                                                return html`
                                                    <li>${phenotype.name} (<a target="_blank" href="${url}">${phenotype.id}</a>) - ${phenotype.status}</li>
                                                `;
                                            } else {
                                                return html`
                                                    <li>${phenotype.id} - ${phenotype.status}</li>
                                                `;
                                            }
                                        });
                                },
                                defaultValue: "N/A",
                            },
                        },
                        {
                            title: "Samples",
                            field: "proband.samples",
                            type: "table",
                            display: {
                                defaultLayout: "vertical",
                                columns: [
                                    {
                                        title: "ID",
                                        field: "id",
                                    },
                                    {
                                        title: "Files",
                                        field: "fileIds",
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
                                        formatter: (value, row) => value ?? "-"
                                    },
                                    {
                                        title: "Somatic",
                                        field: "somatic",
                                    },
                                    {
                                        title: "Creation Date",
                                        field: "creationDate",
                                        type: "custom", // this is not needed. feels right though
                                        formatter: value => `${moment(value, "YYYYMMDDHHmmss").format("D MMM YY")}`
                                    },
                                    {
                                        title: "Status",
                                        field: "status.name",
                                        formatter: (value, row) => value ?? "-"
                                    },
                                ],
                                defaultValue: "No sample found",
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
                        {
                            title: "Pedigree",
                            type: "custom",
                            display: {
                                render: clinicalAnalysis => html`
                                    <image-viewer
                                        .data="${clinicalAnalysis?.family?.pedigreeGraph?.base64}">
                                    </image-viewer>
                                `,
                            },
                        }
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
                            title: "File",
                            field: "files",
                            type: "list",
                            display: {
                                contentLayout: "bullets",
                                template: "${name}",
                            },
                        }
                    ]
                }
            ]
        };
    }

}

customElements.define("clinical-analysis-view", ClinicalAnalysisView);
