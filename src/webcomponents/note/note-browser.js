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
import CatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import "../commons/opencga-browser.js";
import "../commons/forms/toggle-radio.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "./note-grid.js";
import "./note-detail.js";

export default class NoteBrowser extends LitElement {

    constructor() {
        super();
        // Set status and init private properties
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            query: {
                type: Object
            },
            settings: {
                type: Object
            }
        };
    }

    #init() {
        this.COMPONENT_ID = "note-browser";
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
            return html`<div>Not valid session</div>`;
        }
        return html`
            <opencga-browser
                resource="NOTE"
                .opencgaSession="${this.opencgaSession}"
                .query="${this.query}"
                .config="${this._config}"
                @noteUpdate="${this.onNoteUpdate}">
            </opencga-browser>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Note Browser",
            icon: "fab fa-searchengin",
            views: [
                {
                    id: "table-tab",
                    name: "Table result",
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
                                @selectrow="${e => params.onClickRow(e, "note")}"
                                @noteUpdate="${e => params.onComponentUpdate(e, "note")}"
                                @settingsUpdate="${() => this.onSettingsUpdate()}">
                            </note-grid>
                            ${params?.detail?.note ? html`
                                <note-detail
                                    .opencgaSession="${params.opencgaSession}"
                                    .noteId="${params.detail?.note?.id}"
                                    .noteScope="${params?.detail?.note?.scope}"
                                    .config="${params.config.filter.detail}">
                                </note-detail>
                            ` : nothing}
                        `;
                    }
                },
            ],
            filter: {
                searchButton: false,
                sections: [
                    {
                        title: "Section title",
                        collapsed: false,
                        filters: [
                            {
                                id: "scope",
                                name: "Scope",
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
                                                    <span>You are allowd to see only <b>PUBLIC</b> notes fron current organization.</span>
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
                            },
                            {
                                id: "id",
                                name: "Note ID",
                                type: "string",
                                render: (onFilterChange, query, opencgaSession) => {
                                    const resource = query?.scope === "ORGANIZATION" ? "NOTE_ORGANIZATION" : "NOTE_STUDY";
                                    return html`
                                        <catalog-search-autocomplete
                                            .resource="${resource}"
                                            .value="${query?.id}"
                                            .opencgaSession="${opencgaSession}"
                                            @filterChange="${e => onFilterChange("id", e.detail.value)}">
                                        </catalog-search-autocomplete>
                                    `;
                                },
                            },
                            {
                                id: "visibility",
                                name: "Visibility",
                                allowedValues: ["PUBLIC", "PRIVATE"],
                                multiple: true,
                                description: ""
                            },
                            {
                                id: "date",
                                name: "Date",
                                description: ""
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
                detail: {
                    title: "Note",
                    showTitle: true,
                    items: [
                        {
                            id: "note-view",
                            name: "Overview",
                            active: true,
                            render: (note, active, opencgaSession) => html`
                                <note-view
                                    .note="${note}"
                                    .active="${active}"
                                    .opencgaSession="${opencgaSession}">
                                </note-view>
                            `,
                        },
                        {
                            id: "json-view",
                            name: "JSON Data",
                            render: (note, active, opencgaSession) => html`
                                <json-viewer
                                    .data="${note}"
                                    .active="${active}">
                                </json-viewer>
                            `,
                        }
                    ]
                }
            }
        };
    }

}

customElements.define("note-browser", NoteBrowser);
