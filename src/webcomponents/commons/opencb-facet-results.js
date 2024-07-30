/*
 * Copyright 2015-2024 OpenCB
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
import {RestResponse} from "../../core/clients/rest-response.js";
import UtilsNew from "../../core/utils-new.js";
import PolymerUtils from "../PolymerUtils.js";
import "./opencga-facet-result-view.js";
import "../loading-spinner.js";
import NotificationUtils from "./utils/notification-utils.js";

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
            // Static data. Non currently used (query is being used instead)
            data: {
                type: Object
            },
            loading: {
                type: Boolean
            },
            resource: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "facet-results" + UtilsNew.randomString(6);

        this._showInitMessage = true;

        this.facets = new Set();
        this.facetActive = true;

        this._config = this.getDefaultConfig();

        this.facetResults = [];
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") && this.active) {
            this.queryObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        if (changedProperties.has("active") && this.active) {
            console.warn("fire http req"); // TODO check if query has changed before
            // this.fetchDefaultData();
        }
    }

    async queryObserver() {
        // executedQuery in opencga-variant-browser has changed so, if requested,  we have to repeat the facet query
        this.facetResults = [];
        this.requestUpdate();
        await this.updateComplete;
        if (this.query) {
            this.loading = true;
            this.errorState = false;
            this.requestUpdate();
            await this.updateComplete;
            this.endpoint(this.resource).aggregationStats(this.query, {})
                .then(restResponse => {
                    this.errorState = false;

                    // Remove all categories with an empty 'value' (no id)
                    const results = restResponse.responses[0].results;
                    for (const result of results) {
                        result.buckets = result.buckets.filter(bucket => !!bucket.value);
                    }
                    this.facetResults = results || [];
                })
                .catch(response => {
                    if (response instanceof RestResponse || response instanceof Error) {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                    } else {
                        this.errorState = [{name: "Generic Error", message: JSON.JSON.stringify(response)}];
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                            title: this.errorState[0].name,
                            message: this.errorState[0].message,
                        });
                    }
                })
                .finally(() => {
                    this.loading = false;
                    this.requestUpdate();
                });
        }
    }

    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    endpoint(resource) {
        switch (resource) {
            case "VARIANT":
                return this.opencgaSession.opencgaClient.variants();
            case "FILE":
                return this.opencgaSession.opencgaClient.files();
            case "SAMPLE":
                return this.opencgaSession.opencgaClient.samples();
            case "INDIVIDUAL":
                return this.opencgaSession.opencgaClient.individuals();
            case "COHORT":
                return this.opencgaSession.opencgaClient.cohorts();
            case "FAMILY":
                return this.opencgaSession.opencgaClient.families();
            case "CLINICAL_ANALYSIS":
                return this.opencgaSession.opencgaClient.clinical();
            case "JOB":
                return this.opencgaSession.opencgaClient.jobs();
            default:
                throw new Error("Resource not recognized");
        }
    }

    clearPlots() {
        if (UtilsNew.isNotUndefined(this.results) && this.results.length > 0) {
            for (const result of this.results) {
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

    getDefaultConfig() {
        return {
        };
    }

    render() {
        return html`
        <style>
            #loading {
                text-align: center;
                margin-top: 40px;
            }
        </style>
        <div>
            ${this.loading ? html`
                <div id="loading">
                    <loading-spinner></loading-spinner>
                </div>
            ` : null }
            ${this.errorState?.length ? html`
                <div id="error" class="alert alert-danger" role="alert">
                    ${this.errorState.map(error => html`<p><strong>${error.name}</strong></p><p>${error.message}</p>`)}
                </div>
            ` : null}

            ${this.facetResults.length ? this.facetResults.map(item => item.aggregationName && item.aggregationValues ? html`
                <div>
                    <h3>${item.name}</h3>
                    <div class="facet-result-single-value">
                        <span class="aggregation-name">${item.aggregationName}</span>
                        <span class="aggregation-values">${item.aggregationValues}</span>
                    </div>
                </div>
            ` : html`
                <div>
                    <h3>${item.name}</h3>
                    <opencga-facet-result-view .facetResult="${item}"
                            .config="${this.facetConfig}"
                            ?active="${this.facetActive}">
                    </opencga-facet-result-view>
                </div>
            `) : null}

            ${!this.facetResults.length && !this.loading && !this.errorState ?
                !this.query ? html`
                    <div class="alert alert-info d-flex align-items-center" role="alert">
                        <i class="fas fa-3x fa-info-circle flex-shrink-0 me-2"></i>
                        <div>Please select the aggregation fields in the Aggregation Tab on the left and then click on <b>Search</b> button.</div>
                    </div>
                ` : html`
                    <div class="alert alert-warning d-flex align-items-center" role="alert">
                        <i class="fas fa-3x fa-exclamation-circle flex-shrink-0 me-2"></i>
                        <div>Empty results</div>
                    </div>
            ` : null}
        </div>
    `;
    }

}

customElements.define("opencb-facet-results", OpencbFacetResults);
