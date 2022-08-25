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
            this.isLoading = true;
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
                    this.isLoading = false;
                    this.requestUpdate();
                    LitUtils.dispatchCustomEvent(this, "diseasePanelSearch", this.diseasePanel, {
                        status: {
                            // true if error is defined and not empty
                            error: !!error,
                            message: error
                        }}, error);
                });
            this.diseasePanelId = "";
        }
    }

    onFilterChange(e) {
        // This must call diseasePanelIdObserver function
        this.diseasePanelId = e.detail.value;
    }

    render() {
        if (this.isLoading) {
            return html`
                <loading-spinner></loading-spinner>`;
        }

        return html`
            <data-form
                .data=${this.diseasePanel}
                .config="${this._config}">
            </data-form>`;
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
                            }
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
                            title: "Number of Genes",
                            field: "stats.numberOfGenes",
                            defaultValue: "N/A",
                        },
                        {
                            title: "Number of Regions",
                            field: "stats.numberOfRegions",
                            defaultValue: "N/A",
                        },
                        {
                            title: "Number of Variants",
                            field: "stats.numberOfVariants",
                            defaultValue: "N/A",
                        },
                        {
                            title: "Creation/Modification Date",
                            // field: "creationDate",
                            type: "custom",
                            display: {
                                render: field => {
                                    const creationDate = UtilsNew.dateFormatter(field?.creationDate);
                                    const modificationDate = field.modificationDate ? UtilsNew.dateFormatter(field?.modificationDate) : "-";
                                    return field ? html`${creationDate}/${modificationDate}`: "N/A";
                                },
                            },
                        },
                        {
                            title: "Description",
                            field: "description",
                            defaultValue: "N/A",
                        },
                    ]
                }
            ]
        });
    }

}

customElements.define("disease-panel-summary", DiseasePanelSummary);
