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
import LitUtils from "../commons/utils/lit-utils.js";
import Types from "../commons/types.js";
import "../commons/forms/data-form.js";
import "../loading-spinner.js";
import "../study/annotationset/annotation-set-view.js";
import GridCommons from "../commons/grid-commons.js";

export default class CohortView extends LitElement {

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
                type: Object
            },
            cohortId: {
                type: String
            },
            search: {
                type: Boolean
            },
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.cohort = {};
        this.search = false;
        this.isLoading = false;

        this.displayConfigDefault = {
            buttonsVisible: false,
            collapsable: true,
            titleAlign: "left",
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
        if (changedProperties.has("cohortId")) {
            this.cohortIdObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    async updated(changedProperties) {
        if (changedProperties.has("cohort")) {
            // Wait for the 'data-form' to render before painting the table.
            const dataForm = await document.querySelector("data-form");
            this.renderTableSample(dataForm);
        }
    }

    cohortIdObserver() {
        if (this.cohortId && this.opencgaSession) {
            const params = {
                study: this.opencgaSession.study.fqn,
            };
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.cohorts()
                .info(this.cohortId, params)
                .then(response => {
                    this.cohort = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.cohort = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "cohortSearch", this.cohort, {}, error);
                    this.#setLoading(false);
                });
        } else {
            this.cohort = {};
        }
    }

    renderTableSample(component) {
        const columns = [
            {
                id: "sample",
                title: "Samples ID",
                field: "id",
                sortable: true,
            },
            {
                id: "somatic",
                title: "Somatic",
                field: "somatic",
                sortable: true,
            },
            {
                id: "phenotypes",
                title: "Phenotypes",
                field: "phenotypes",
                sortable: true,
                formatter: (value, row) => {
                    return row?.phenotypes?.length > 0 ? row.phenotypes.map(d => d.id).join(", ") : "-";
                }
            }
        ];

        // Get the table inside data-form.
        this.table = $(component.querySelector("#tableCustom"));
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: columns,
            data: this.cohort?.samples,
            sidePagination: "local",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            search: true,
            searchAlign: "left",
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            gridContext: this,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
        });
    }

    onFilterChange(e) {
        this.cohortId = e.detail.value;
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.cohort?.id && this.search === false) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    No Cohort ID found.
                </div>
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
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "Search",
                    display: {
                        visible: cohort => !cohort?.id && this.search === true,
                    },
                    elements: [
                        {
                            title: "Cohort ID",
                            // field: "cohortId",
                            type: "custom",
                            display: {
                                render: () => html `
                                    <catalog-search-autocomplete
                                        .value="${this.cohort?.id}"
                                        .resource="${"COHORT"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </catalog-search-autocomplete>`,
                            },
                        },
                    ],
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
                            field: "id",
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
                            },
                        },
                        {
                            title: "Creation date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: field => html`${UtilsNew.dateFormatter(field)}`,
                            },
                        },
                        {
                            title: "Modification Date",
                            field: "modificationDate",
                            type: "custom",
                            display: {
                                render: field => html`${UtilsNew.dateFormatter(field)}`,
                            },
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
                                        sortable: true,
                                    },
                                    {
                                        id: "somatic",
                                        title: "Somatic",
                                        field: "somatic",
                                        sortable: true,
                                    },
                                    {
                                        id: "phenotypes",
                                        title: "Phenotypes",
                                        field: "phenotypes",
                                        sortable: true,
                                        formatter: (value, row) => {
                                            return row?.phenotypes?.length > 0 ? row.phenotypes.map(d => d.id).join(", ") : "-";
                                        }
                                    }
                                ],
                                pagination: true,
                                searchable: true,
                            },
                        }
                    ],
                },
            ],
        });
    }

}

customElements.define("cohort-view", CohortView);

