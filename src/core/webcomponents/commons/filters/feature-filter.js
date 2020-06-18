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
import UtilsNew from "../../../utilsNew.js";

/*
* TODO handle GENES
* **/

export default class FeatureFilter extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            query: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "feaf-" + UtilsNew.randomString(6) + "_";
        this.separator = ",";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(_changedProperties) {
        // XRefs, Gene and Variant Ids
        if (_changedProperties.has("query")) {
            if (this.query["xref"]) {
                this.value = this.query["xref"];
            } else if (this.query.ids) {
                this.value = this.query.ids;
            } else if (this.query.gene) {
                this.value = this.query.gene;
            } else {
                this.value = "";
            }
            this.requestUpdate();
        }
    }

    onFilterChange(key, value) {
        const event = new CustomEvent("filterChange", {
            detail: {
                value: value
            }
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            fields: item => ({
                name: item.name
            }),
            dataSource: (query, process) => {
                this.cellbaseClient.get("feature", "id", query.toUpperCase(), "starts_with", {limit: 20}, {})
                    .then(restResponse => {
                        process(restResponse.response[0].result.map(this._config.fields));
                    });
            }
        };
    }

    render() {
        return html`<select-field-filter-autocomplete .config=${this._config} .value="${this.value}" @filterChange="${e => this.onFilterChange("id", e.detail.value)}"></select-field-filter-autocomplete>`;
    }

}

customElements.define("feature-filter", FeatureFilter);
