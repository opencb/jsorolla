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

import {html, LitElement} from "lit";
import LitUtils from "../utils/lit-utils";
import "../forms/select-dropdown.js";

export default class IndividualHpoFilter extends LitElement {

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
            individual: {
                type: Object
            },
            value: {
                type: String,
            },
            disabled: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._phenotypes = [];
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("individual")) {
            this._phenotypes = (this.individual?.phenotypes || []).filter(phenotype => {
                return phenotype.id?.startsWith("HP:");
            });
        }
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
        super.update(changedProperties);
    }

    onFilterChange(event) {
        event.stopPropagation();
        LitUtils.dispatchCustomEvent(this, "filterChange", event.detail.value);
    }

    render() {
        return html`
            <select-dropdown
                .values="${this._phenotypes}"
                .value="${this.value || ""}"
                ?multiple="${true}"
                ?selectAll="${true}"
                ?search="${this._phenotypes?.length > 25}"
                ?disabled="${this._phenotypes?.length === 0 || this.disabled}"
                @filterChange="${event => this.onFilterChange(event)}">
            </select-dropdown>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("individual-hpo-filter", IndividualHpoFilter);
