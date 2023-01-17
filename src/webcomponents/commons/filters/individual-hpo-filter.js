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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../utils/lit-utils";

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
            disabled: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.phenotypes = [];
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("individual")) {
            this.phenotypes = this.individual?.phenotypes?.filter(phenotype => phenotype.id?.startsWith("HP:"));
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    filterChange(e) {
        const detail = {
            param: "trait",
            value: this.phenotypes.map(phenotype => phenotype.id).join(",")
        };
        LitUtils.dispatchCustomEvent(this, "filterChange", this.phenotypes.map(phenotype => phenotype.id).join(","));
    }

    render() {
        return html`
            <label style="padding-top: 0; font-weight: normal;margin: 0">
                <input
                    type="checkbox"
                    class="${this._prefix}_ctCheckbox"
                    value="${"aaa"}"
                    ?disabled="${this.phenotypes?.length === 0 || this.disabled}"
                    @click="${this.filterChange}">
                <span style="margin: 0 5px" title="${this.phenotypes?.join(", ") || ""}">Select HPOs (${this.phenotypes.length} HPO terms found)</span>
            </label>
        `;
    }

    getDefaultConfig() {
        return {
        };
    }

}

customElements.define("individual-hpo-filter", IndividualHpoFilter);
