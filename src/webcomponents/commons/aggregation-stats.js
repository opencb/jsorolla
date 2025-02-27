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
import {RestResponse} from "../../core/clients/rest-response.js";
import UtilsNew from "../../core/utils-new.js";
import NotificationUtils from "./utils/notification-utils.js";
import "./facet-filter.js";
import "./facet-results.js";
import "../loading-spinner.js";

class AggregationStats extends LitElement {

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
            resource: {
                type: String
            },
            facet: {
                type: Object
            },
            query: {
                type: Object
            },
            active: {
                type: Boolean
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);

        this.facet = {};
        this.preparedFacetQueryFormatted = {};
        this.facetResults = [];
        this.loading = false;

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("facet") && this.active) {
            this.queryObserver();
        }
        if (changedProperties.has("query") && this.active) {
            this.queryObserver();
        }
        if (changedProperties.has("active") && this.active) {
            this.queryObserver()
        }
        if (changedProperties.has("opencgaSession") && this.active) {
            this.queryObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        super.update(changedProperties);
    }

    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    endpoint(resource) {
        switch (resource) {
            case "VARIANT":
                return this.opencgaSession.opencgaClient.variants();
            case "JOB":
                return this.opencgaSession.opencgaClient.jobs();
            case "FILE":
                return this.opencgaSession.opencgaClient.files();
            case "SAMPLE":
                return this.opencgaSession.opencgaClient.samples();
            case "INDIVIDUAL":
                return this.opencgaSession.opencgaClient.individuals();
            case "FAMILY":
                return this.opencgaSession.opencgaClient.families();
            case "COHORT":
                return this.opencgaSession.opencgaClient.cohorts();
            case "DISEASE_PANEL":
                return this.opencgaSession.opencgaClient.clinical();
            case "CLINICAL_ANALYSIS":
                return this.opencgaSession.opencgaClient.clinical();
            default:
                throw new Error("Resource not recognized");
        }
    }

    onAggregationFieldChange(e) {
        this.preparedFacetQueryFormatted = e.detail.value;
    }

    /**
     * This method creates the facetQuery object to be sent to the client in <opencb-facet-results>
     */
    facetQueryBuilder() {
        if (Object.keys(this.preparedFacetQueryFormatted).length) {
            this.executedFacetQueryFormatted = {...this.preparedFacetQueryFormatted};
            // Build the facet query object
            this.facetQuery = {
                ...this.query,
                study: this.opencgaSession.study.fqn,
                field: Object.values(this.preparedFacetQueryFormatted)
                    .map(v => v.formatted)
                    .join(";")
            };
        } else {
            this.facetQuery = null;
        }
    }

    queryObserver() {
        // 1. Prepare the facet query object
        this.facetQueryBuilder();

        // 2. Execute the facet query
        this.facetResults = [];
        if (this.facetQuery) {
            this.loading = true;
            this.errorState = null;
            this.requestUpdate();

            this.endpoint(this.resource)
                .aggregationStats(this.facetQuery, {})
                .then(restResponse => {
                    this.errorState = null;

                    const results = restResponse.responses[0].results;
                    // Remove all categories with an empty 'value' (no id)
                    for (const result of results) {
                        result.buckets = result.buckets
                            .filter(bucket => !!bucket.value);
                    }
                    this.facetResults = results || [];
                })
                .catch(response => {
                    // this.facetResults = [];
                    if (response instanceof RestResponse || response instanceof Error) {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                    } else {
                        this.errorState = [{name: "Aggregation Error", message: JSON.stringify(response)}];
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

    aggregationClear() {
        this.facet = {};
        this.facetResults = [];
        this.preparedFacetQueryFormatted = {};
    }

    render() {
        return html`
            <style>
                #loading {
                    text-align: center;
                    margin-top: 40px;
                }
            </style>

            <div class="row">
                <div class="col-md-2">
                    <button type="button" class="btn btn-primary w-50 mx-auto d-block my-3" @click="${this.queryObserver}">
                        <strong>Run</strong>
                    </button>
                    <facet-filter
                        .selectedFacet="${this.facet}"
                        .config="${this._config}"
                        @facetQueryChange="${this.onAggregationFieldChange}"
                        @aggregationClear="${this.aggregationClear}">
                    </facet-filter>
                </div>

                <div class="col-md-10">
                    ${this.errorState?.length > 0 ? html`
                        <div id="error" class="alert alert-danger mx-3 my-3" role="alert">
                            ${this.errorState.map(error => html`<p><strong>${error.name}</strong></p><p>${error.message}</p>`)}
                        </div>
                    ` : nothing}

                    <!-- This is important to avoid the default no results message from 'aggregatation-stats-result' component-->
                    ${this.loading ? html`
                        <div id="loading">
                            <loading-spinner></loading-spinner>
                        </div>
                    ` : html`
                        <facet-results
                            .data="${this.facetResults}">
                        </facet-results>
                    `}
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            filter: {
                showNested: false
            }
        };
    }

}

customElements.define("aggregation-stats", AggregationStats);
