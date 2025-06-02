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
import CatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import "../commons/opencga-browser.js";
import "../commons/forms/toggle-radio.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "./note-grid.js";

export default class NoteBrowser extends LitElement {

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
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            settings: {
                type: Object
            }
        };
    }

    #init() {
        this.COMPONENT_ID = "note-browser";
        this._query = {scope: "STUDY"};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        super.update(changedProperties);
    }

    queryObserver() {
        this._query = {scope: "STUDY", ...this.query};
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
        // this._config = UtilsNew.mergeTableSetting(this._config, this.settings);

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

    onNoteUpdate() {
        this.settingsObserver();
        this.requestUpdate();
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <opencga-browser
                resource="NOTE"
                .opencgaSession="${this.opencgaSession}"
                .query="${this._query}"
                .config="${this._config}"
                @noteUpdate="${this.onNoteUpdate}">
            </opencga-browser>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Note Browser",
            views: [
                {
                    id: "table-tab",
                    name: "Table",
                    icon: "fa fa-table",
                    active: true,
                    render: params => {
                        return html`
                            <note-grid
                                .toolId="${this.COMPONENT_ID}"
                                .opencgaSession="${params.opencgaSession}"
                                .query="${params.executedQuery}"
                                .search="${params.executedQuery}"
                                .config="${params.config.filter.result.grid}"
                                .eventNotifyName="${params.eventNotifyName}"
                                .active="${true}"
                                @queryComplete="${e => params.onQueryComplete(e)}"
                                @noteUpdate="${e => params.onComponentUpdate(e, "note")}"
                                @settingsUpdate="${() => this.onSettingsUpdate()}">
                            </note-grid>
                        `;
                    }
                },
            ],
            filter: {
                sections: [
                    {
                        title: "Section title",
                        collapsed: false,
                        filters: [
                            {
                                id: "scope",
                                title: "Scope",
                                render: (onFilterChange, query, opencgaSession) => {
                                    const value = (query?.scope || "study").toLowerCase();
                                    const allowedValues = [
                                        {id: "STUDY", text: "Study"},
                                        {id: "ORGANIZATION", text: "Organization"},
                                    ];
                                    return html`
                                        <div class="mb-2">
                                            ${value === "study" && !CatalogUtils.isAdmin(opencgaSession.study, opencgaSession.user.id) ? html`
                                                <div class="alert alert-warning">
                                                    <span>You are allowed to see only <b>PUBLIC</b> notes from current study.</span>
                                                </div>
                                            ` : nothing}
                                            ${value === "organization" && !CatalogUtils.isOrganizationAdmin(opencgaSession.organization, opencgaSession.user.id) ? html`
                                                <div class="alert alert-warning">
                                                    <span>You are allowed to see only <b>PUBLIC</b> notes from current organization.</span>
                                                </div>
                                            ` : nothing}
                                            <div class="row">
                                                <toggle-radio
                                                    .value="${query?.scope || "STUDY"}"
                                                    .data="${allowedValues}"
                                                    @filterChange="${e => onFilterChange("scope", e.detail.value)}">
                                                </toggle-radio>
                                            </div>
                                        </div>
                                    `;
                                },
                                quick: true,
                            },
                            {
                                id: "id",
                                title: "Note ID",
                                type: "string",
                                render: (onFilterChange, query, opencgaSession) => {
                                    const resource = query?.scope === "ORGANIZATION" || query?.scope === "NOTE_ORGANIZATION" ? "NOTE_ORGANIZATION" : "NOTE_STUDY";
                                    return html`
                                        <catalog-search-autocomplete
                                            .resource="${resource}"
                                            .value="${query?.id}"
                                            .opencgaSession="${opencgaSession}"
                                            @filterChange="${e => onFilterChange("id", e.detail.value)}">
                                        </catalog-search-autocomplete>
                                    `;
                                },
                                quick: true,
                            },
                            {
                                id: "noteType",
                                title: "Note Type",
                                allowedValues: [
                                    "VARIANT",
                                    "GENE",
                                    "TRANSCRIPT",
                                    "PROTEIN",
                                    "JOB",
                                    "FILE",
                                    "SAMPLE",
                                    "INDIVIDUAL",
                                    "FAMILY",
                                    "COHORT",
                                    "DISEASE_PANEL",
                                    "CLINICAL_ANALYSIS",
                                    "WORKFLOW",
                                    "ORGANIZATION",
                                    "OTHER",
                                    "UNKNOWN",
                                ],
                                multiple: true,
                                description: "",
                                quick: true,
                            },
                            {
                                id: "visibility",
                                title: "Visibility",
                                allowedValues: ["PUBLIC", "PRIVATE"],
                                multiple: true,
                                description: "",
                                quick: true,
                            },
                            {
                                id: "tags",
                                title: "Tags",
                                render: (onFilterChange, query, opencgaSession) => {
                                    const resource = (query?.scope === "ORGANIZATION" || query?.scope === "NOTE_ORGANIZATION") ? "NOTE_ORGANIZATION" : "NOTE_STUDY";
                                    const tagsFilterConfig = {
                                        preprocessResults: results => {
                                            return results.map(result => result.tags)
                                                .flat()
                                                .map(tag => ({id: tag}));
                                        },
                                    };
                                    return html`
                                        <catalog-search-autocomplete
                                            .resource="${resource}"
                                            .value="${query?.tags}"
                                            .searchField="${"tags"}"
                                            .query="${{include: "tags"}}"
                                            .opencgaSession="${opencgaSession}"
                                            .config="${tagsFilterConfig}"
                                            @filterChange="${e => onFilterChange("tags", e.detail.value)}">
                                        </catalog-search-autocomplete>
                                    `;
                                },
                                quick: true,
                            },
                            {
                                id: "date",
                                title: "Creation Date",
                                description: "",
                                quick: true,
                            },
                        ]
                    }
                ],
                examples: [],
                result: {
                    grid: {
                        pageSize: 10,
                        pageList: [5, 10, 25],
                        multiSelection: false,
                        showSelectCheckbox: false,
                        showToolbar: true,
                        showCreate: true,
                        showExport: false,
                        showSettings: true,
                        exportTabs: ["download", "link", "code"]
                    }
                },
            },
        };
    }

}

customElements.define("note-browser", NoteBrowser);
