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
import Types from "../commons/types.js";
import "../commons/forms/data-form.js";
import "../loading-spinner.js";
import "../study/annotationset/annotation-set-view.js";

export default class CohortView extends LitElement {

    constructor() {
        super();

        this._init();
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
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.cohort = {};
        this.isLoading = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("cohortId")) {
            this.cohortIdObserver();
        }

        if (changedProperties.has("config")) {
            this.configObserver();
        }

        super.update(changedProperties);
    }

    cohortIdObserver() {
        if (this.cohortId && this.opencgaSession) {
            this.isLoading = true;
            let error;
            this.opencgaSession.opencgaClient.cohorts().info(this.cohortId, {study: this.opencgaSession.study.fqn})
                .then(res => {
                    this.cohort = res.responses[0].results[0];
                    this.isLoading = false;
                })
                .catch(reason => {
                    this.cohort = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = {...this.getDefaultConfig(), ...this._config};
                    this.requestUpdate();
                    this.notify(error);
                });
            this.cohortId = "";
        }
    }

    onFilterChange(e) {
        this.cohortId = e.detail.value;
    }

    notify(error) {
        this.dispatchEvent(new CustomEvent("cohortSearch", {
            detail: {
                value: this.cohort,
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
                .data=${this.cohort}
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
                titleAlign: "left",
                titleVisible: false,
                titleWidth: 2,
                defaultValue: "-",
            },
            sections: [
                {
                    title: "Search",
                    display: {
                        visible: cohort => !cohort?.id
                    },
                    elements: [
                        {
                            title: "Cohort ID",
                            field: "cohortId",
                            type: "custom",
                            display: {
                                render: () => html `
                                    <cohort-id-autocomplete
                                        .value="${this.cohort?.id}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{
                                            select2Config: {
                                                multiple: false
                                            }
                                        }}"
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </cohort-id-autocomplete>
                                `,
                            }
                        }
                    ]
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
                            field: "id"
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
                            field: "internal.status",
                            type: "custom",
                            display: {
                                render: field => html`${field?.name} (${UtilsNew.dateFormatter(field?.date)})`,
                            }
                        },
                        {
                            title: "Creation date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: field => html`${UtilsNew.dateFormatter(field)}`,
                            }
                        },
                        {
                            title: "Modification Date",
                            field: "modificationDate",
                            type: "custom",
                            display: {
                                render: field => html`${UtilsNew.dateFormatter(field)}`,
                            }
                        },
                        {
                            title: "Annotation sets",
                            field: "annotationSets",
                            type: "custom",
                            defaultValue: "N/A",
                            display: {
                                render: field => html`
                                    <annotation-set-view
                                        .annotationSets="${field}">
                                    </annotation-set-view>
                                `,
                            }
                        }
                    ]
                },
                {
                    title: "Samples",
                    display: {
                        visible: cohort => cohort?.id,
                    },
                    elements: [
                        {
                            title: "List of samples",
                            field: "samples",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        title: "Samples ID",
                                        field: "id",
                                    },
                                    {
                                        title: "Somatic",
                                        field: "somatic",
                                        defaultValue: "false",
                                    },
                                    {
                                        title: "Phenotypes",
                                        field: "phenotypes",
                                        type: "custom",
                                        defaultValue: "-",
                                        display: {
                                            render: data => data?.length ? html`${data.map(d => d.id).join(", ")}` : "-",
                                        }
                                    }
                                ],
                                defaultValue: "No phenotypes found",
                            }
                        }
                    ]
                }
            ]
        });
    }

}

customElements.define("cohort-view", CohortView);

