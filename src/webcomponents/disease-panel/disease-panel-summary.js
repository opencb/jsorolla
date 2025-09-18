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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import "../commons/forms/data-form.js";
import "../study/annotationset/annotation-set-view.js";

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
        this._diseasePanel = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("diseasePanelId")) {
            this.diseasePanelIdObserver();
        }

        if (changedProperties.has("diseasePanel")) {
            this.diseasePanelObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    diseasePanelIdObserver() {
        this._diseasePanel = null;
        if (this.diseasePanelId && this.opencgaSession) {
            this.opencgaSession.opencgaClient.panels()
                .info(this.diseasePanelId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._diseasePanel = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    diseasePanelObserver() {
        this._diseasePanel = {...this.diseasePanel};
    }

    render() {
        if (!this.opencgaSession || !this._diseasePanel) {
            return nothing;
        }

        return html`
            <data-form
                .data=${this._diseasePanel}
                .config="${this._config || {}}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                titleVisible: false,
                buttonsVisible: false,
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "General",
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
                                format: disorder => {
                                    return UtilsNew.renderHTML(CatalogGridFormatter.disorderFormatter([disorder], false));
                                },
                                defaultValue: "-",
                            },
                        },
                        {
                            title: "Number of Genes",
                            field: "stats.numberOfGenes",
                            defaultValue: "-",
                        },
                        {
                            title: "Number of Regions",
                            field: "stats.numberOfRegions",
                            defaultValue: "-",
                        },
                        {
                            title: "Number of Variants",
                            field: "stats.numberOfVariants",
                            defaultValue: "-",
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
                            defaultValue: "-",
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("disease-panel-summary", DiseasePanelSummary);
