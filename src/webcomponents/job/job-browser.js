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
import "../commons/opencga-browser.js";
import "../commons/opencb-facet-results.js";
import "../commons/facet-filter.js";
import "./job-grid.js";
import "./job-detail.js";
import "./job-detail-log.js";
import "./job-view.js";

export default class JobBrowser extends LitElement {

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
        };
    }

    #init() {
        this.COMPONENT_ID = "job-browser";
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        super.update(changedProperties);
    }

    settingsObserver() {
        this._config = this.getDefaultConfig();

        // Apply Study settings
        if (this.settings?.menu) {
            this._config.filter = UtilsNew.mergeFiltersAndDetails(this._config?.filter, this.settings);
        }

        // Grid configuration and take out toolbar admin/user settings to grid level.
        if (this.settings?.table) {
            const {toolbar, ...otherTableProps} = this.settings.table;
            UtilsNew.setObjectValue(this._config, "filter.result.grid", {
                ...this._config.filter.result.grid,
                ...otherTableProps,
                ...toolbar,
            });
        }

        // Apply User grid configuration. Only 'pageSize' and 'columns' are set
        UtilsNew.setObjectValue(this._config, "filter.result.grid", {
            ...this._config.filter?.result?.grid,
            ...this.opencgaSession.user?.configs?.IVA?.settings?.[this.COMPONENT_ID]?.grid
        });
    }

    onSettingsUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    onJobUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <opencga-browser
                resource="JOB"
                .opencgaSession="${this.opencgaSession}"
                .query="${this.query}"
                .config="${this._config}"
                @jobUpdate="${this.onJobUpdate}">
            </opencga-browser>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Jobs Browser",
            description: "",
            views: [
                {
                    id: "table-tab",
                    name: "Table View",
                    icon: "fa fa-table",
                    active: true,
                    render: params => html`
                        <job-grid
                            .toolId="${this.COMPONENT_ID}"
                            .opencgaSession="${params.opencgaSession}"
                            .config="${params.config.filter.result.grid}"
                            .query="${params.executedQuery}"
                            .search="${params.executedQuery}"
                            .eventNotifyName="${params.eventNotifyName}"
                            .files="${params.files}"
                            @queryComplete="${e => params.onQueryComplete(e)}"
                            @selectrow="${e => params.onClickRow(e)}"
                            @jobUpdate="${e => params.onComponentUpdate(e)}"
                            @settingsUpdate="${() => this.onSettingsUpdate()}">
                        </job-grid>
                        ${params?.detail ? html`
                            <job-detail
                                .opencgaSession="${params.opencgaSession}"
                                .config="${params.config.filter.detail}"
                                .jobId="${params.detail?.id}">
                            </job-detail>
                        ` : nothing}
                    `,
                },
                {
                    id: "facet-tab",
                    name: "Aggregation Stats",
                    icon: "fas fa-chart-bar",
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
                        title: "Section title",
                        collapsed: false,
                        filters: [
                            {
                                id: "id",
                                title: "Job ID",
                                placeholder: "ID",
                                allowedValues: "",
                                defaultValue: "",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "tool",
                                title: "Analysis Tool ID",
                                placeholder: "Tool",
                                allowedValues: "",
                                defaultValue: "",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "input",
                                title: "Input File Name",
                                placeholder: "e.g.  NA12877.vcf.gz",
                                allowedValues: "",
                                defaultValue: "",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "internalStatus",
                                title: "Status",
                                placeholder: "Status",
                                allowedValues: ["PENDING", "QUEUED", "RUNNING", "DONE", "ERROR", "UNKNOWN", "ABORTED", "DELETED"],
                                multiple: true,
                                defaultValue: "",
                                description: "",
                                quick: true,
                            },
                            {
                                id: "priority",
                                title: "Priority",
                                placeholder: "Priority",
                                allowedValues: ["URGENT", "HIGH", "MEDIUM", "LOW"],
                                multiple: true,
                                defaultValue: "",
                                description: "",
                            },
                            {
                                id: "tags",
                                title: "Tags",
                                placeholder: "Tags",
                                allowedValues: "",
                                defaultValue: "",
                                description: "",
                            },
                            {
                                id: "creationDate",
                                title: "Creation Date",
                                placeholder: "Creation Date",
                                description: "",
                            },
                            {
                                id: "visited",
                                title: "Visited",
                                placeholder: "Visited",
                                allowedValues: ["true", "false"],
                                defaultValue: "",
                                description: "",
                            },
                        ],
                    },
                ],
                examples: [],
                result: {
                    grid: {
                        pageSize: 10,
                        pageList: [5, 10, 25],
                        multiSelection: false,
                        showSelectCheckbox: false,

                        showNew: true,
                        showExport: true,
                        exportTabs: ["download", "link", "code"]
                        // columns list for the dropdown will be added in grid components based on settings.table.columns
                    }
                },
                detail: {
                    title: "Job",
                    showTitle: true,
                    items: [
                        {
                            id: "job-view",
                            name: "Overview",
                            active: true,
                            render: (job, _active, opencgaSession) => html`
                                <job-view
                                    .opencgaSession="${opencgaSession}"
                                    mode="simple"
                                    .job="${job}">
                                </job-view>
                            `,
                        },
                        {
                            id: "job-log",
                            name: "Logs",
                            render: (job, active, opencgaSession) => html`
                                <job-detail-log
                                    .opencgaSession="${opencgaSession}"
                                    .active="${active}"
                                    .job="${job}">
                                </job-detail-log>
                            `,
                        },
                        {
                            id: "json-view",
                            name: "JSON Data",
                            render: (job, active) => html`
                                <json-viewer
                                    .data="${job}"
                                    .active="${active}">
                                </json-viewer>
                            `,
                        },
                    ],
                },
            },
            aggregation: {
                default: ["toolId", "status"],
                display: {
                    showNested: false
                },
                sections: [
                    {
                        name: "Job attributes",
                        fields: [
                            {
                                id: "studyId",
                                name: "Study id",
                                type: "string",
                                description: "Study [[user@]project:]study where study and project can be either the ID or UUID",
                            },
                            {
                                id: "creationYear",
                                name: "Creation Year",
                                type: "string",
                                description: "Creation year",
                            },
                            {
                                id: "creationMonth",
                                name: "Creation Month",
                                type: "category",
                                allowedValues: ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"],
                                description: "Creation month (JANUARY, FEBRUARY...)",
                            },
                            {
                                id: "creationDay",
                                name: "Creation Day",
                                type: "category",
                                allowedValues: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
                                description: "Creation day",
                            },
                            {
                                id: "creationDayOfWeek",
                                name: "Creation Day Of Week",
                                type: "category",
                                allowedValues: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
                                description: "Creation day of week (MONDAY, TUESDAY...)",
                            },
                            {
                                id: "status",
                                name: "Status",
                                type: "category",
                                allowedValues: ["PENDING", "QUEUED", "RUNNING", "DONE", "ERROR", "UNKNOWN", "ABORTED", "DELETED"],
                                description: "Status",
                            },
                            {
                                id: "release",
                                name: "Release",
                                type: "string",
                                description: "Release",
                            },
                            {
                                id: "toolId",
                                name: "Tool Id",
                                type: "string",
                                description: "Tool id",
                            },
                            {
                                id: "toolScope",
                                name: "Tool Scope",
                                type: "category",
                                allowedValues: ["GLOBAL", "PROJECT", "STUDY"],
                                description: "Tool scope",
                            },
                            {
                                id: "toolType",
                                name: "Tool Type",
                                type: "category",
                                allowedValues: ["OPERATION", "ANALYSIS"],
                                description: "Tool type",
                            },
                            {
                                id: "toolResource",
                                name: "Tool Resource",
                                type: "category",
                                allowedValues: ["USER", "PROJECT", "STUDY", "FILE", "SAMPLE", "JOB", "INDIVIDUAL", "COHORT", "DISEASE_PANEL",
                                    "FAMILY", "CLINICAL_ANALYSIS", "INTERPRETATION", "VARIANT", "ALIGNMENT", "CLINICAL", "EXPRESSION", "FUNCTIONAL"],
                                description: "Tool resource",
                            },
                            {
                                id: "userId",
                                name: "User Id",
                                type: "string",
                                description: "User id",
                            },
                            {
                                id: "priority",
                                name: "Priority",
                                type: "category",
                                allowedValues: ["URGENT", "HIGH", "MEDIUM", "LOW"],
                                description: "Priority",
                            },
                            {
                                id: "tags",
                                name: "Tags",
                                type: "string",
                                description: "Tags",
                            },
                            {
                                id: "executorId",
                                name: "Executor Id",
                                type: "string",
                                description: "Executor id",
                            },
                            {
                                id: "executorFramework",
                                name: "Executor Framework",
                                type: "string",
                                description: "Executor framework",
                            },
                        ],
                    },
                    {
                        name: "Advanced",
                        fields: [
                            {
                                id: "field",
                                name: "Field",
                                type: "string",
                                description: "List of fields separated by semicolons, e.g.: studies;type. For nested fields use >>, e.g.: studies>>biotype;type;numSamples[0..10]:1",
                            },
                        ],
                    },
                ],
            },
        };
    }

}

customElements.define("job-browser", JobBrowser);
