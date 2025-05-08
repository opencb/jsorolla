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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import "../commons/forms/data-form.js";
import "../study/annotationset/annotation-set-view.js";

export default class CohortSummary extends LitElement {

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
                type: Object,
            },
            cohortId: {
                type: String,
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
        this._cohort = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("cohortId")) {
            this.cohortIdObserver();
        }

        if (changedProperties.has("cohort")) {
            this.cohortObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    cohortIdObserver() {
        this._cohort = null;
        if (this.cohortId && this.opencgaSession) {
            this.opencgaSession.opencgaClient.cohorts()
                .info(this.cohortId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._cohort = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    cohortObserver() {
        this._cohort = {...this.cohort};
    }

    render() {
        if (!this.opencgaSession || !this._cohort) {
            return nothing;
        }

        return html`
            <data-form
                .data=${this._cohort || {}}
                .config="${this._config || {}}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Summary",
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
                            display: {
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
                            display: {
                                columns: [
                                    {
                                        id: "sample",
                                        title: "Samples ID",
                                        field: "id",
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
                                            defaultValue: "-",
                                            format: phenotype => CatalogGridFormatter.phenotypesFormatter([phenotype]),
                                        },
                                    },
                                ],
                            },
                        }
                    ],
                },
            ],
        };
    }

}

customElements.define("cohort-summary", CohortSummary);

