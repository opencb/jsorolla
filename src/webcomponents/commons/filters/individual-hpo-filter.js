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
import "../forms/select-field-filter.js";

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
        this.phenotypes = [];
        this.value = "";
        this.allChecked = false;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("individual")) {
            this.phenotypes = this.individual?.phenotypes?.filter(phenotype => phenotype.id?.startsWith("HP:"));
        }
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.has("value") || changedProperties.has("individual")) {
            const allChecked = (this.phenotypes || []).every(phenotype => {
                return (this.value || "").includes(phenotype.id);
            });

            if (!allChecked && this.allChecked) {
                // eslint-disable-next-line quotes
                this.querySelector(`input[type="checkbox"]`).checked = false;
                this.allChecked = false;
                this.requestUpdate();
            }
        }
    }

    filterChange(e, source) {
        // Check if the event has been fired by checkbox or by selecting some phenotypes
        let value;
        if (source === "ALL") {
            this.allChecked = e.currentTarget.checked;
            if (this.allChecked) {
                value = this.phenotypes
                    .filter(phenotype => !!phenotype.id)
                    .map(phenotype => phenotype.id)
                    .join(",");
            } else {
                value = "";
            }
            this.requestUpdate();
        } else {
            value = e.detail.value;
        }

        LitUtils.dispatchCustomEvent(this, "filterChange", value);
    }

    render() {
        return html`
            <div>
                <label style="padding-top: 0; font-weight: normal;margin: 0">
                    <input
                        type="checkbox"
                        ?disabled="${this.phenotypes?.length === 0 || this.disabled}"
                        @click="${e => this.filterChange(e, "ALL")}">
                    <span style="margin: 0 5px" title="${this.phenotypes?.map(phenotype => phenotype.id).join(",") || ""}">
                        Select all HPOs terms (${this.phenotypes?.length || 0} terms found)
                    </span>
                </label>
            </div>

            <div class="form-group">
                <div style="margin: 10px 0">
                    <span>Or select terms manually:</span>
                </div>
                <select-field-filter
                    .value="${this.value || ""}"
                    .data="${this.phenotypes}"
                    .config="${{
                        multiple: true,
                        liveSearch: this.phenotypes?.length > 25,
                        disabled: this.phenotypes?.length === 0 || this.allChecked || this.disabled
                    }}"
                    @filterChange="${e => this.filterChange(e)}">
                </select-field-filter>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
        };
    }

}

customElements.define("individual-hpo-filter", IndividualHpoFilter);
