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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";
import "../../commons/opencga-active-filters.js";
import "../../commons/filters/select-field-filter.js";
import "../../loading-spinner.js";
import "../../commons/tool-header.js";
import "./rga-gene-view.js";
import "./rga-individual-view.js";
import "./rga-variant-view.js";

export default class RgaBrowser extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
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
            facetQuery: {
                type: Object
            },
            selectedFacet: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "facet" + UtilsNew.randomString(6);

        this.query = {};
        this.preparedQuery = {};
        this.executedQuery = {};

        this.checkProjects = false;

        this.activeFilterAlias = {
        };
        this.selectedFacet = {};
        this.selectedFacetFormatted = {};
        this.activeTab = {"gene-tab": true};
        this.detail = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
        $(".bootstrap-select", this).selectpicker();
        UtilsNew.initTooltip(this);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("selectedFacet")) {
            this.selectedFacetObserver();
        }
    }

    opencgaSessionObserver() {
        if (this.opencgaSession && this.opencgaSession.project) {
            this.checkProjects = true;
            this.query = {study: this.opencgaSession.study.fqn};

            // TODO FIXME
            /** temp fix this.onRun(): when you switch study this.facetQuery contains the old study when you perform a new Aggregation query.
             *  As a consequence, we need to update preparedQuery as this.onRun() uses it (without it the old study is in query in table result as well)
             */
            this.preparedQuery = {study: this.opencgaSession.study.fqn};
            this.onRun();

            // this.requestUpdate().then(() => $(".bootstrap-select", this).selectpicker());
        } else {
            this.checkProjects = false;
        }
    }

    queryObserver() {
        if (this.opencgaSession) {
            if (this.query) {
                this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
                this.executedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
            } else {
                this.preparedQuery = {study: this.opencgaSession.study.fqn};
                this.executedQuery = {study: this.opencgaSession.study.fqn};
            }
        }
        // onServerFilterChange() in opencga-active-filters drops a filterchange event when the Filter dropdown is used
        this.dispatchEvent(new CustomEvent("queryChange", {
                detail: this.preparedQuery
            }
        ));
        this.detail = {};
        this.requestUpdate();
    }

    notifySearch(query) {
        this.dispatchEvent(new CustomEvent("querySearch", {
            detail: {
                query: query
            },
            bubbles: true,
            composed: true
        }));
    }

    async onRun() {
        // this event keeps in sync the query object in opencga-browser with the general one in iva-app (this.queries)
        // it is also in charge of update executedQuery (notifySearch -> onQueryFilterSearch() on iva-app.js -> this.queries updated -> queryObserver() in opencga-browser).
        // if we want to dismiss the general query feature (that is browsers remembering your last query even if you change view) replace the following line with:
        // this.executedQuery = {...this.preparedQuery}; this.requestUpdate();
        this.notifySearch(this.preparedQuery);

        /*if (Object.keys(this.selectedFacet).length) {
            this.facetQuery = {
                ...this.preparedQuery,
                study: this.opencgaSession.study.fqn,
                // timeout: 60000,
                field: Object.values(this.selectedFacetFormatted).map(v => v.formatted).join(";")
            };
            this._changeView("facet-tab");
        } else {
            this.facetQuery = null;
        }*/
    }

    onClickPill(e) {
        this._changeView(e.currentTarget.dataset.id);
    }

    _changeView(tabId) {
        $(".content-pills", this).removeClass("active");
        $(".content-tab", this).removeClass("active");
        for (const tab in this.activeTab) this.activeTab[tab] = false;
        $(`button.content-pills[data-id=${tabId}]`, this).addClass("active");
        $("#" + tabId, this).addClass("active");
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    getDefaultConfig() {
        // return BrowserConf.config;
        return {
            title: "Recessive Gene Analysis Browser",
            icon: "fas fa-dna",
            active: false,
            searchButtonText: "Search",
            views: [
                {
                    id: "gene-tab",
                    name: "Gene",
                    icon: "fa fa-table",
                    active: true,
                    // TODO move specific configuration here?
                },
                {
                    id: "individual-tab",
                    name: "Individuals",
                    icon: "fas fa-table",
                },
                {
                    id: "variant-tab",
                    name: "Variant",
                    icon: "fas fa-table",
                }
            ]
        };
    }

    render() {
        return html`
            ${this.checkProjects ? html`
                <tool-header title="${this._config.title}" icon="${this._config.icon}"></tool-header>
                
                <!-- tabs buttons -->
                <div class="btn-group content-pills" role="toolbar" aria-label="toolbar">
                    <div class="btn-group" role="group" style="margin-left: 0px">
                        ${this._config.views && this._config.views.length ? this._config.views.map(tab => html`
                                    <button type="button" class="btn btn-success ripple content-pills ${tab.active ? "active" : ""}" ?disabled=${tab.disabled} @click="${this.onClickPill}" data-id="${tab.id}">
                                        <i class="${tab.icon ?? "fa fa-table"} icon-padding" aria-hidden="true"></i> ${tab.name}
                                    </button>
                                `) : html`No view has been configured`}
                    </div>
                </div>

                ${this.activeTab["gene-tab"] ? html`
                    <rga-gene-view .opencgaSession="${this.opencgaSession}" .active="${this.activeTab["gene-tab"]}"></rga-gene-view>
                ` : null}

                ${this.activeTab["individual-tab"] ? html`
                    <rga-individual-view .opencgaSession="${this.opencgaSession}" .active="${this.activeTab["individual-tab"]}"></rga-individual-view>
                ` : null}

                ${this.activeTab["variant-tab"] ? html`
                    <rga-variant-view .opencgaSession="${this.opencgaSession}" .active="${this.activeTab["individual-tab"]}"></rga-variant-view>
                ` : null}

            ` : html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue</h3>
                </div>
            `}
        `;
    }

}

customElements.define("rga-browser", RgaBrowser);
