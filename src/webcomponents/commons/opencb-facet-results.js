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
import "./opencga-facet-result-view.js";

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
            data: {
                type: Array
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.data = [];
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        // if (changedProperties.has("data")) {
        //     this.queryObserver();
        // }
        super.update(changedProperties);
    }

    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    render() {
        if (!this.data || this.data.length === 0) {
            return html`
                <div class="alert alert-info d-flex align-items-center" role="alert">
                    <i class="fas fa-3x fa-info-circle flex-shrink-0 me-2"></i>
                    <div>
                        Please select the aggregation fields in the Aggregation Tab on the left and then click on <b>Search</b> button.
                    </div>
                </div>
            `
        }

        return html`
            <div>
                ${this.data.map(item => item.aggregationName && item.aggregationValues ? html`
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
                        <opencga-facet-result-view
                            .facetResult="${item}"
                            .config="${this.facetConfig}"
                            ?active="${this.facetActive}">
                        </opencga-facet-result-view>
                    </div>
                `)
                }
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("opencb-facet-results", OpencbFacetResults);
