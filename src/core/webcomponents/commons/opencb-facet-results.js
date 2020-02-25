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

import {LitElement, html} from "/web_modules/lit-element.js";
import Utils from "./../../utils.js";
import UtilsNew from "../../utilsNew.js";
import PolymerUtils from "../PolymerUtils.js";
import "./../../loading-spinner.js";


class OpencbFacetResults extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            populationFrequencies: {
                type: Object
            },
            config: {
                type: Object
            },
            active: {
                type: Boolean
            },
            data: {
                type: Object
            },
            loading: {
                type: Boolean
            },
            errorState: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "facet-results" + Utils.randomString(6);

        this._showInitMessage = true;

        this.facets = new Set();
        this.facetActive = true;

        this._config = this.getDefaultConfig();

        this.data = [];
    }

    firstUpdated(_changedProperties) {
        $(".bootstrap-select", this).selectpicker();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("query")) {
            this.propertyObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        if (changedProperties.has("active") && this.active) {
            console.warn("fire http req") //TODO check if query has changed before (this.facetResults.length)
            //this.fetchDefaultData();
        }
    }

    propertyObserver(opencgaSession, query) {
        // this.clear();
        //PolymerUtils.show(this._prefix + "Warning");
    }

    queryObserver() {
        console.log("queryObserver  in facet!")
        //executedQuery in opencga-variant-browser has changed so, if requested,  we have to repeat the facet query
        this.facetResults = [];
        this.fetchDefaultData();
    }

    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    clearPlots() {
        if (UtilsNew.isNotUndefined(this.results) && this.results.length > 0) {
            for (let result of this.results) {
                PolymerUtils.removeElement(this._prefix + result.name + "Plot");
            }
        }
        this.results = [];
    }

    clear() {
        this.clearPlots();
        this.chromosome = "";

        this.facets = new Set();
        this.facetFilters = [];

        PolymerUtils.hide(this._prefix + "Warning");

        this.facetFields = [];
        this.facetRanges = [];
        this.facetFieldsName = [];
        this.facetRangeFields = [];
        this._showInitMessage = true;

        this.requestUpdate();
    }

    //TODO add default configuration for file, sample, individual, family, cohort, clinical analysis
    getDefaultConfig() {
        return {
        };
    }

    render() {
        return html`
        <style include="jso-styles">
            option:disabled {
                font-size: 0.85em;
                font-weight: bold;
            }

            .active-filter-button:hover {
                text-decoration: line-through;
            }
            .deletable:hover {
                text-decoration: line-through;
            }
            #loading {
                text-align: center;
                margin-top: 40px;
            }
        </style>

        <div class="row">
            ${this.loading ? html`
                <div id="loading">
                    <loading-spinner></loading-spinner>
                </div>
            ` : null }
            ${this.errorState ? html`
                <div id="error" class="alert alert-danger" role="alert">
                    ${this.errorState}
                </div>
            ` : null}
            ${this.data && this.data.length ? this.data.map(item => html`
                <div>
                    <h3>${item.name}</h3>
                    <opencga-facet-result-view .facetResult="${item}"
                            .config="${this.facetConfig}"
                            ?active="${this.facetActive}">
                    </opencga-facet-result-view>
                </div>
            `) : html``}
        </div>
    `;
    }
}

customElements.define("opencb-facet-results", OpencbFacetResults);
