/**
 * Copyright 2015-2022 OpenCB
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
import LitUtils from "../commons/utils/lit-utils.js";
import UtilsNew from "../../core/utilsNew.js";
import Types from "../commons/types.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import "../commons/forms/data-form.js";
import "../study/annotationset/annotation-set-view.js";
import "../loading-spinner.js";

export default class DiseasePanelSummary extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            diseasePanel: {
                type: Object
            },
            diseasePanelId: {
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
        this.diseasePanel = {};
        this.isLoading = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("diseasePanelId")) {
            this.isLoading = true;
            this.diseasePanelIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }

        super.update(changedProperties);
    }

    diseasePanelIdObserver() {
        if (this.diseasePanelId && this.opencgaSession) {
            console.log("loading: ", this.diseasePanelId);
            const query = {
                study: this.opencgaSession.study.fqn,
            };
            let error;
            this.opencgaSession.opencgaClient.panels().info(this.diseasePanelId, query)
                .then(response => {
                    this.diseasePanel = response.responses[0].results[0];
                    this.isLoading = false;
                })
                .catch(reason => {
                    this.diseasePanel = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = {...this.getDefaultConfig(), ...this.config};
                    this.requestUpdate();
                    LitUtils.dispatchCustomEvent(this, "diseasePanelSearch", this.diseasePanel, {}, error);
                });
            this.diseasePanelId = "";
        }
    }

    onFilterChange(e) {
        // This must call diseasePanelIdObserver function
        this.diseasePanelId = e.detail.value;
    }

    notify(error) {
        this.dispatchEvent(new CustomEvent("diseasePanelSearch", {
            detail: {
                value: this.diseasePanel,
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
            return html`
                <loading-spinner></loading-spinner>
            `;
        }

        return html`
            <data-form
                .data=${this.diseasePanel}
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            title: "Summary",
            icon: "",
            display: {
                buttonsVisible: false,
                collapsable: true,
                titleVisible: false,
                titleWidth: 2,
                defaultValue: "-"
            },
            sections: [
                // {
                //     title: "Search",
                //     display: {
                //         visible: diseasePanel => !diseasePanel?.id,
                //     },
                //     elements: [
                //         {
                //             title: "diseasePanel ID",
                //             field: "diseasePanelId",
                //             type: "custom",
                //             display: {
                //                 render: () => html`
                //                     <sample-id-autocomplete
                //                         .value="${this.sample?.id}"
                //                         .opencgaSession="${this.opencgaSession}"
                //                         .config="${{
                //                             select2Config: {
                //                                 multiple: false
                //                             }
                //                         }}"
                //                         @filterChange="${e => this.onFilterChange(e)}">
                //                     </sample-id-autocomplete>
                //                 `,
                //             }
                //         }
                //     ]
                // },
                {
                    title: "General",
                    collapsed: false,
                    display: {
                        visible: diseasePanel => diseasePanel?.id,
                    },
                    elements: [
                        {
                            title: "Disease Panel ID",
                            type: "custom",
                            display: {
                                visible: diseasePanel => diseasePanel?.id,
                                render: data => {
                                    if (data?.source?.project === "PanelApp") {
                                        return html`
                                            <a href="${BioinfoUtils.getPanelAppLink(data.source.id)}" title="Panel ID: ${data.id}" target="_blank">
                                                ${data?.id ?? "-"} <i class="fas fa-external-link-alt" style="padding-left: 5px"></i>
                                            </a> (UUID: ${data.uuid})`;
                                    }
                                    return data?.id ?? "-";
                                }
                                // render: data => html`<span style="font-weight: bold">${data.id}</span> (UUID: ${data.uuid})`,
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                            defaultValue: "N/A",
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
                            title: "# Genes",
                            field: "stats.numberOfGenes",
                            defaultValue: "N/A",
                        },
                        {
                            title: "# Regions",
                            field: "stats.numberOfRegions",
                            defaultValue: "N/A",
                        },
                        {
                            title: "# Variants",
                            field: "stats.numberOfVariants",
                            defaultValue: "N/A",
                        },
                        {
                            title: "Creation Date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: field => {
                                    return field? html`${UtilsNew.dateFormatter(field)}`: "N/A";
                                },
                            },
                        },
                        // {
                        //     title: "Phenotypes",
                        //     field: "phenotypes",
                        //     type: "list",
                        //     defaultValue: "N/A",
                        //     display: {
                        //         contentLayout: "bullets",
                        //         render: phenotype => {
                        //             let id = phenotype?.id;
                        //             if (phenotype?.id?.startsWith("HP:")) {
                        //                 id = html`<a href="https://hpo.jax.org/app/browse/term/${phenotype.id}" target="_blank">${phenotype.id}</a>`;
                        //             }
                        //             return html`${phenotype?.name} (${id})`;
                        //         },
                        //     }
                        // },
                    ]
                }
            ]
        });
    }

}

customElements.define("disease-panel-summary", DiseasePanelSummary);
