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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "../commons/opencga-browser.js";
import "./clinical-analysis-grid.js";
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
            query: {
                type: Object,
            },
            opencgaSession: {
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
    }

    onSettingsUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    onClinicalAnalysisUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
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
            title: "Case Interpreter Portal",
            views: [
                {
                    id: "table-tab",
                    name: "Table",
                    icon: "fa fa-table",
                    active: true,
                    render: params => html`
                        <clinical-analysis-grid
                            .toolId="${this.COMPONENT_ID}"
                            .opencgaSession="${params.opencgaSession}"
                            .config="${params.config.filter.result.grid}"
                            .eventNotifyName="${params.eventNotifyName}"
                            .query="${params.executedQuery}"
                            .active="${params.active}"
                            @queryComplete="${e => params.onQueryComplete(e)}"
                            @rowUpdate="${e => params.onComponentUpdate(e)}"
                            @clinicalAnalysisUpdate="${e => params.onComponentUpdate(e)}"
                            @settingsUpdate="${() => this.onSettingsUpdate()}">
                        </clinical-analysis-grid>
                    `,
                },
                {
                    id: "group",
                    name: "Group By",
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
                {
                    id: "aggregate",
                    name: "Aggregation Stats",
                    icon: "fas fa-chart-bar",
                    active: false,
                    render: params => html`
                        <aggregation-stats
                            resource="${params.resource}"
                            .query="${params.executedQuery}"
                            .active="${params.active}"
                            .opencgaSession="${params.opencgaSession}"
                            .config="${params.config.aggregation}">
                        </aggregation-stats>
                    `,
                },
            ],
            filter: {
                sections: [
                    {
                        filters: [
                            {
                                id: "id",
                                title: "Clinical Analysis ID",
                                type: "string",
                                placeholder: "CA-1234,CA-2345...",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "family",
                                title: "Family ID",
                                type: "string",
                                placeholder: "FAM123, FAM124...",
                                description: "",
                            },
                            {
                                id: "proband",
                                title: "Proband ID",
                                placeholder: "PRO-1234, PRO-2345...",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "sample",
                                title: "Sample ID",
                                placeholder: "HG01879, HG01880, HG01881...",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "disorders",
                                title: "Disorder",
                                quick: true,
                            },
                            {
                                id: "type",
                                title: "Case Type",
                                description: "",
                                multiple: true,
                                allowedValues: ["SINGLE", "FAMILY", "CANCER"],
                                quick: true,
                            },
                            {
                                id: "status",
                                title: "Status",
                                description: ""
                            },
                            {
                                id: "priority",
                                title: "Priority",
                                description: ""
                            },
                            {
                                id: "flags",
                                title: "Flags",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "analysts",
                                title: "Analysts",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "creationDate",
                                title: "Creation Date",
                                description: ""
                            },
                            {
                                id: "dueDate",
                                title: "Due Date",
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
            },
            aggregation: {
                default: ["disorders"],
                display: {
                    showNested: false
                },
                sections: [
                    {
                        name: "Sample Attributes",
                        // collapsed: false,
                        fields: [
                            {
                                id: "studyId",
                                name: "Study id",
                                type: "string",
                                description: "Study [[user@]project:]study where study and project can be either the ID or UUID"
                            },
                            {
                                id: "creationYear",
                                name: "Creation Year",
                                type: "string",
                                description: "Creation year"
                            },
                            {
                                id: "creationMonth",
                                name: "Creation Month",
                                type: "category",
                                allowedValues: ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"],
                                description: "Creation month (JANUARY, FEBRUARY...)"
                            },
                            {
                                id: "creationDay",
                                name: "Creation Day",
                                type: "category",
                                allowedValues: [
                                    "1", "2", "3", "4", "5",
                                    "6", "7", "8", "9", "10",
                                    "11", "12", "13", "14", "15",
                                    "16", "17", "18", "19", "20",
                                    "21", "22", "23", "24", "25",
                                    "26", "27", "28", "29", "30", "31"],
                                description: "Creation day"
                            },
                            {
                                id: "creationDayOfWeek",
                                name: "Creation Day Of Week",
                                type: "category",
                                allowedValues: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
                                description: "Creation day of week (MONDAY, TUESDAY...)"
                            },
                            {
                                id: "disorders",
                                name: "Disorders",
                                type: "string",
                                description: "Disorders"
                            },
                            {
                                id: "status",
                                name: "Status",
                                type: "category",
                                allowedValues: ["READY", "DELETED"],
                                description: "Status"
                            },
                        ]
                    },
                    {
                        name: "Advanced",
                        fields: [
                            {
                                id: "field",
                                name: "Field",
                                type: "string",
                                description: "List of fields separated by semicolons, e.g.: studies;type. For nested fields use >>, e.g.: studies>>biotype;type;numSamples[0..10]:1"
                            }
                        ]
                    }
                ]
            },
            // TODO recheck (they come from clinical-analysis-browser and used in opencga-clinical-analysis-filter and opencga-clinical-analysis-grid now they have been moved in config)
            analyses: [],
            analysis: {},
        };
    }

}

customElements.define("clinical-analysis-browser", ClinicalAnalysisBrowser);
