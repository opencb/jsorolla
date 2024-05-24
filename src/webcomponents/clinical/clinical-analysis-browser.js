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
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/opencga-browser.js";
import "./clinical-analysis-view.js";
import "./clinical-analysis-grid.js";
import "./clinical-analysis-detail.js";
import "./clinical-analysis-group.js";


export default class ClinicalAnalysisBrowser extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object,
            },
            query: {
                type: Object,
            },
            settings: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "clinical-analysis-browser";
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("settings") || changedProperties.has("config")) {
            this.settingsObserver();
        }

        super.update(changedProperties);
    }

    settingsObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...(this.settings || {}),
            ...(this.config || {}),
        };

        // merge filter list, canned filters, detail tabs
        if (this.settings?.menu) {
            this._config.filter = UtilsNew.mergeFiltersAndDetails(this._config.filter, this.settings);
        }

        if (this.settings?.table) {
            const {toolbar, ...otherTableProps} = this.settings.table;
            UtilsNew.setObjectValue(this._config, "filter.result.grid", {
                ...this._config.filter.result.grid,
                ...otherTableProps,
                ...toolbar,
            });
        }

        // Apply user configuration
        UtilsNew.setObjectValue(this._config, "filter.result.grid", {
            ...this._config.filter?.result?.grid,
            ...this.opencgaSession.user?.configs?.IVA?.settings?.[this.COMPONENT_ID]?.grid,
        });

        this.requestUpdate();
    }

    onSettingsUpdate() {
        this.settingsObserver();
    }

    onClinicalAnalysisUpdate() {
        this.settingsObserver();
    }

    render() {
        if (!this._config) {
            return null;
        }

        return html`
            <opencga-browser
                resource="CLINICAL_ANALYSIS"
                .opencgaSession="${this.opencgaSession}"
                .query="${this.query}"
                .config="${this._config}"
                @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
            </opencga-browser>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Clinical Analysis Browser",
            icon: "fab fa-searchengin",
            // searchButtonText: "Search",
            views: [
                {
                    id: "table-tab",
                    name: "Table result",
                    icon: "fa fa-table",
                    active: true,
                    render: params => html `
                        <clinical-analysis-grid
                            .toolId="${this.COMPONENT_ID}"
                            .opencgaSession="${params.opencgaSession}"
                            .config="${params.config.filter.result.grid}"
                            .eventNotifyName="${params.eventNotifyName}"
                            .query="${params.executedQuery}"
                            .active="${params.active}"
                            @selectanalysis="${params.onSelectClinicalAnalysis}"
                            @selectrow="${e => params.onClickRow(e, "clinicalAnalysis")}"
                            @rowUpdate="${e => params.onComponentUpdate(e, "clinicalAnalysis")}"
                            @clinicalAnalysisUpdate="${e => params.onComponentUpdate(e, "clinicalAnalysis")}"
                            @settingsUpdate="${() => this.onSettingsUpdate()}">
                        </clinical-analysis-grid>
                        <clinical-analysis-detail
                            .opencgaSession="${params.opencgaSession}"
                            .config="${params.config.filter.detail}"
                            .clinicalAnalysisId="${params.detail.clinicalAnalysis?.id}">
                        </clinical-analysis-detail>
                    `,
                },
                {
                    id: "group",
                    name: "Group by",
                    icon: "fas fa-layer-group",
                    active: false,
                    render: params => html`
                        <clinical-analysis-group
                            .toolId="${this.COMPONENT_ID}"
                            .opencgaSession="${params.opencgaSession}"
                            .config="${params.config.filter.result.grid}"
                            .query="${params.executedQuery}"
                            .active="${params.active}">
                        </clinical-analysis-group>
                    `,
                },
            ],
            filter: {
                searchButton: false,
                sections: [
                    {
                        name: "section title",
                        filters: [
                            {
                                id: "id",
                                name: "Clinical Analysis ID",
                                type: "string",
                                placeholder: "CA-1234,CA-2345...",
                                description: ""
                            },
                            {
                                id: "family",
                                name: "Family ID",
                                type: "string",
                                placeholder: "FAM123, FAM124...",
                                description: ""
                            },
                            {
                                id: "proband",
                                name: "Proband ID",
                                placeholder: "PRO-1234, PRO-2345...",
                                description: ""
                            },
                            {
                                id: "sample",
                                name: "Sample ID",
                                placeholder: "HG01879, HG01880, HG01881...",
                                description: ""
                            },
                            {
                                id: "type",
                                name: "Case Type",
                                description: "",
                                multiple: true,
                                allowedValues: ["SINGLE", "FAMILY", "CANCER"],
                            },
                            {
                                id: "status",
                                name: "Status",
                                description: ""
                            },
                            {
                                id: "priority",
                                name: "Priority",
                                description: ""
                            },
                            {
                                id: "creationDate",
                                name: "Creation Date",
                                description: ""
                            },
                            {
                                id: "dueDate",
                                name: "Due Date",
                                description: ""
                            }
                        ]
                    }
                ],
                result: {
                    grid: {
                        readOnlyMode: false,
                        pageSize: 10,
                        pageList: [5, 10, 25],
                        detailView: false,
                        multiSelection: false,
                        showActions: true,
                        showCreate: false,
                    }
                },
                detail: {
                    title: "Clinical Analysis",
                    showTitle: true,
                    display: {
                        titleClass: "mt-4",
                        contentClass: "p-3"
                    },
                    items: [
                        {
                            id: "clinical-analysis-view",
                            name: "Overview",
                            active: true,
                            render: (clinicalAnalysis, active, opencgaSession) => html`
                                <clinical-analysis-view
                                    .opencgaSession="${opencgaSession}"
                                    .clinicalAnalysis="${clinicalAnalysis}">
                                </clinical-analysis-view>
                            `,
                        }
                    ]
                }
            },
            // TODO recheck (they come from clinical-analysis-browser and used in opencga-clinical-analysis-filter and opencga-clinical-analysis-grid now they have been moved in config)
            analyses: [],
            analysis: {},
        };
    }

}

customElements.define("clinical-analysis-browser", ClinicalAnalysisBrowser);
