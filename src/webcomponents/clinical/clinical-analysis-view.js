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
import "../commons/view/pedigree-view.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";


export default class ClinicalAnalysisView extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            settings: {
                type: Object
            }
        };
    }

    _init() {
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
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
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    if (response.responses[0].numResults === 1) {
                        this.clinicalAnalysis = response.responses[0].results[0];
                        // this.requestUpdate();
                    }
                })
                .catch(function (reason) {
                    console.error(reason);
                });
        }
    }

    render() {
        return this.clinicalAnalysis ? html`
            <data-form
                .data=${this.clinicalAnalysis}
                .config="${this._config}">
            </data-form>
        ` : "";
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            // comes from external settings
            // hiddenFields: [],
            display: {
                collapsable: true,
                titleVisible: false,
                defaultValue: "-",
                defaultLayout: "horizontal",
                buttonsVisible: false,
                layout: [
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
            },
            sections: [
                {
                    id: "detail",
                    title: "Details",
                    display: {
                        collapsed: false,
                        titleWidth: 3
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
                                render: disorder => UtilsNew.renderHTML(CatalogGridFormatter.disorderFormatter(disorder)),
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
                        titleWidth: 3
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
                                    if (phenotypes) {
                                        return [...phenotypes].sort((a, b) => a.status === "OBSERVED" ? -1 : 1).map(phenotype => html`
                                            ${phenotype.source && phenotype.source.toUpperCase() === "HPO" ?
                                                html`<li>${phenotype.name} (<a target="_blank" href="https://hpo.jax.org/app/browse/term/${phenotype.id}">${phenotype.id}</a>) - ${phenotype.status}</li>` :
                                                html`<li>${phenotype.id} - ${phenotype.status}</li>`}`
                                        );
                                    }
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
                                        defaultValue: "-",
                                    },
                                    {
                                        title: "Preparation Method",
                                        field: "processing.preparationMethod",
                                        defaultValue: "-",
                                    },
                                    {
                                        title: "Somatic",
                                        field: "somatic",
                                    },
                                    {
                                        title: "Creation Date",
                                        field: "creationDate",
                                        type: "custom", // this is not needed. feels right though
                                        display: {
                                            render: creationDate => html`${moment(creationDate, "YYYYMMDDHHmmss").format("D MMM YY")}`
                                        }
                                    },
                                    {
                                        title: "Status",
                                        field: "status.name",
                                        defaultValue: "-",
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
                        visible: data => data.type === "FAMILY",
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
                        //     title: "Members JSON",
                        //     field: "family.members",
                        //     type: "json"
                        // },
                        {
                            title: "Pedigree",
                            type: "custom",
                            display: {
                                // TODO at the moment pedigree doesn't work with families with over 2 generations
                                visible: !this._config?.hiddenFields?.includes("pedigree"),
                                layout: "vertical",
                                render: clinicalAnalysis => html`
                                    <pedigree-view .family="${clinicalAnalysis.family}"></pedigree-view>
                                `,
                            },
                        }
                    ]
                },
                {
                    id: "files",
                    title: "Files",
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
