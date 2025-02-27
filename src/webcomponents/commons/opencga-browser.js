/*
 * Copyright 2015-2016 OpenCB
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
import LitUtils from "./utils/lit-utils.js";
import WebUtils from "./utils/web-utils.js";
import {guardPage} from "./html-utils.js";
import "./opencga-browser-filter.js";
import "../loading-spinner.js";
import "./tool-header.js";
import "./grid-notifications.js";

export default class OpencgaBrowser extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            resource: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            // cellbaseClient: {
            //     type: Object
            // },
            query: {
                type: Object
            },
            // query object sent to Opencga client (includes this.selectedFacet serialised)
            facetQuery: {
                type: Object
            },
            // complex object that keeps track of the values of all facets
            selectedFacet: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();

        this.query = {};
        this.preparedQuery = {};
        this.executedQuery = {};
        this.searchActive = true;
        this.notifications = [];

        this.activeView = "";

        this.activeFilterAlias = {};

        this.selectedFacet = {};
        this.preparedFacetQueryFormatted = {};
        this.detail = null;
    }

    firstUpdated() {
        UtilsNew.initTooltip(this);
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("query") || changedProperties.has("opencgaSession")) {
            this.queryObserver();
        }
        // if (changedProperties.has("selectedFacet")) {
        //     this.facetQueryBuilder();
        // }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        if (this?.opencgaSession?.study?.fqn) {
            this.preparedQuery = {...this._config?.filter?.defaultFilter};
            this.executedQuery = {...this._config?.filter?.defaultFilter};
            this.detail = null;
            this.searchActive = false;

            this.facetQuery = null;
            this.preparedFacetQueryFormatted = null;
        }
    }

    queryObserver() {
        if (this?.opencgaSession?.study?.fqn) {
            // NOTE UtilsNew.objectCompare avoid repeating remote requests.
            if (!UtilsNew.isEmpty(this.query) && !UtilsNew.objectCompare(this.query, this.executedQuery)) {
                this.preparedQuery = {...this.query};
                this.executedQuery = {...this.query};

                // onServerFilterChange() in opencga-active-filters fires an activeFilterChange event when the Filter dropdown is used
                LitUtils.dispatchCustomEvent(this, "queryChange", undefined, this.preparedQuery);
                this.detail = null;
                this.searchActive = false;
            }
        }
    }

    configObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };

        if (this._config?.views) {
            const defaultActiveView = this._config.views.find(view => view.active);
            if (defaultActiveView) {
                this.activeView = defaultActiveView.id;
            }
        }
    }

    notifySearch(query) {
        LitUtils.dispatchCustomEvent(this, "querySearch", undefined, {
            query: query
        });
    }

    onChangeView(id) {
        this.activeView = id;
        this.requestUpdate();
    }

    onQueryComplete(event) {
        this.notifications = WebUtils.getResponseEvents(event.detail.response);
        this.searchActive = true;
        this.requestUpdate();
    }

    onQuerySearch(e) {
        this.preparedQuery = e.detail.query;
        this.executedQuery = e.detail.query;
        this.searchActive = false;
        this.detail = null;
        this.notifySearch(this.preparedQuery);
        this.requestUpdate();
    }

    onQueryClear() {
        this.preparedQuery = {};
        this.executedQuery = {};
        this.searchActive = false;
        this.detail = null;
        this.notifySearch(this.preparedQuery);
        this.requestUpdate();
    }

    onQueryChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onClickRow(e) {
        this.detail = e.detail.row;
        this.requestUpdate();
    }

    onComponentUpdate() {
        this.detail = null;
        this.requestUpdate();
    }

    renderView() {
        if (!this._config.views) {
            return html`No view has been configured`;
        }

        return this._config.views.map(view => html`
            <div id="${view.id}" class="${this.activeView === view.id ? "d-block" : "d-none"}">
                ${view.render({
                    opencgaSession: this.opencgaSession,
                    config: this._config,
                    executedQuery: this.executedQuery,
                    detail: this.detail,
                    resource: this.resource,
                    facetQuery: this.facetQuery,
                    facetResults: this.facetResults,
                    eventNotifyName: this.eventNotifyName,
                    active: this.activeView === view.id,
                    onClickRow: event => this.onClickRow(event),
                    onComponentUpdate: event => this.onComponentUpdate(event),
                    onQueryComplete: event => this.onQueryComplete(event),
                    onQuerySearch: event => this.onQuerySearch(event),
                })}
            </div>
        `);
    }

    renderHeaderRightContent() {
        return html`
            <div class="d-flex gap-1 align-items-stretch">
                <!-- View buttons -->
                <div class="d-flex align-items-center border bg-gray-100 rounded-2">
                    ${(this._config.views || []).map(view => html`
                        <button
                            class="${`btn ${this.activeView === view.id ? "active bg-primary text-white" : ""}`}"
                            @click="${() => this.onChangeView(view.id)}">
                            <i class="fa ${view.icon} me-2"></i>
                            <strong>${view.name}</strong>
                        </button>
                    `)}
                </div>
                <div class="w-px bg-gray-200 mx-1"></div>
                <grid-notifications
                    class="d-flex align-items-stretch"
                    .notifications="${this.notifications || []}">
                </grid-notifications>
            </div>
        `;
    }

    render() {
        if (!this.opencgaSession?.study?.fqn) {
            return guardPage();
        }

        return html`
            ${this._config.showHeader ? html`
                <tool-header
                    .title="${this._config.title || ""}"
                    .rightContent="${this.renderHeaderRightContent()}">
                </tool-header>
            ` : nothing}

            <opencga-browser-filter
                .preparedQuery="${this.preparedQuery}"
                .executedQuery="${this.executedQuery}"
                .resource="${this.resource}"
                .opencgaSession="${this.opencgaSession}"
                .searchActive="${!!this.searchActive}"
                .config="${this._config.filter}"
                @queryClear="${this.onQueryClear}"
                @queryChange="${this.onQueryChange}"
                @querySearch="${this.onQuerySearch}">
            </opencga-browser-filter>

            ${this.renderView()}
        `;
    }

    getDefaultConfig() {
        return {
            showHeader: true,
            searchButtonText: "Search",
        };
    }

}

customElements.define("opencga-browser", OpencgaBrowser);
