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
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "../commons/utils/lit-utils.js";
import Types from "../commons/types.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import "../commons/forms/data-form.js";
import "../study/annotationset/annotation-set-view.js";
import "../loading-spinner.js";

export default class DiseasePanelSummary extends LitElement {

    constructor() {
        super();

        this.#init();
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
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.diseasePanel = {};
        this.isLoading = false;

        this.displayConfigDefault = {
            collapsable: true,
            titleVisible: false,
            titleWidth: 2,
            defaultValue: "-",
            defaultLayout: "horizontal",
            buttonsVisible: false,
            showTitle: false,
            labelWidth: 3,
            pdf: false,
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("diseasePanelId")) {
            this.diseasePanelIdObserver();
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

    diseasePanelIdObserver() {
        if (this.diseasePanelId && this.opencgaSession) {
            const params = {
                study: this.opencgaSession.study.fqn,
            };
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.panels().info(this.diseasePanelId, params)
                .then(response => {
                    this.diseasePanel = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.diseasePanel = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = {...this.getDefaultConfig(), ...this.config};
                    LitUtils.dispatchCustomEvent(this, "diseasePanelSearch", this.diseasePanel, {
                        status: {
                            // true if error is defined and not empty
                            error: !!error,
                            message: error
                        }}, error);
                    this.#setLoading(false);
                });
        } else {
            this.diseasePanel = {};
        }
    }

    onFilterChange(e) {
        this.diseasePanelId = e.detail.value;
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.diseasePanel?.id) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle pe-2"></i>
                    No Disease Panel ID found.
                </div>
            `;
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
            display: this.displayConfig || this.displayConfigDefault,
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
                            type: "complex",
                            display: {
                                template: "${id} (UUID: ${uuid})",
                                link: {
                                    id: (id, data) => data?.source?.project === "PanelApp"? BioinfoUtils.getPanelAppLink(data.source.id) : false,
                                },
                            }
                        },
                        {
                            title: "Disorders",
                            field: "disorders",
                            type: "list",
                            display: {
                                contentLayout: "vertical",
                                format: disorder => CatalogGridFormatter.disorderFormatter([disorder]),
                                defaultValue: "N/A",
                            },
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
