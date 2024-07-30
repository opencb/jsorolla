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
import LitUtils from "../utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../forms/select-field-filter.js";

export default class ConsequenceTypeSelectFilter extends LitElement {

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
            ct: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this._ct = []; // this.ct is a comma separated list, this._ct is an array of the same data
        this.presetSelected = new Map();
        // this.isChecked = {};
        this.options = [];
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
        this.options = this._config.categories.map(item => item.title ?
            {
                id: item.title.toUpperCase(),
                fields: item.terms.map(term => this.mapTerm(term))
            } :
            this.mapTerm(item)
        );
    }

    // eslint-disable-next-line no-unused-vars
    firstUpdated(changedProperties) {
        // Display SO terms in the badgers
        UtilsNew.initTooltip(this);
    }

    update(changedProperties) {
        if (changedProperties.has("ct")) {
            this.consequenceTypesObserver();
        }

        super.update(changedProperties);
    }

    consequenceTypesObserver() {
        if (this.ct) {
            this._ct = this.ct.split(",");

            // Josemi 2022-01-27 NOTE: this implementation has been reverted. We need to discuss this behavior in the future.
            // See issue https://github.com/opencb/jsorolla/issues/376
            // Add active presets using selected CT terms
            // this.presetSelected = new Map(); // Reset active presets
            // (this._config.alias || []).forEach(preset => {
            //     const allTermsSelected = preset.terms.every(term => this._ct.includes(term));
            //     if (allTermsSelected) {
            //         this.presetSelected.set(preset.name, preset);
            //     }
            // });

            // NOTE (Nacho 2022-01-31): we need to check if any ALREADY select alias is incomplete to remove it.
            // But we keep NOT selecting a new alias even all its terms are selected.
            const aliasToBeDeleted = [];
            for (const key of this.presetSelected.keys()) {
                for (const value of this.presetSelected.get(key).terms) {
                    if (!this._ct.includes(value)) {
                        aliasToBeDeleted.push(key);
                        break;
                    }
                }
            }
            for (const alias of aliasToBeDeleted) {
                this.presetSelected.delete(alias);
            }
        } else {
            this._ct = [];
            this.presetSelected.clear();
        }
    }

    mapTerm(term) {
        // TODO think about this badge:
        // <span class='badge badge-light' style="color: ${CONSEQUENCE_TYPES.style[term.impact]}">${term.impact}</span>
        return {
            id: term.name,
            name: `${term.name}  <span class="badge text-bg-secondary">${term.id}</span>`
        };
    }

    onPresetSelect(preset, e) {
        if (preset && this._config.alias) {
            const aliasSelect = this._config.alias.find(alias => alias.name === preset);

            if (aliasSelect) {
                // 1. Add/delete selected presets
                if (e.currentTarget.checked) {
                    // Just keep track of the selected preset
                    this.presetSelected.set(aliasSelect.name, aliasSelect);
                } else {
                    // Remove preset selection and all its terms
                    this.presetSelected.delete(aliasSelect.name);
                    this._ct = this._ct.filter(ct => !aliasSelect.terms.includes(ct));
                }

                // 2. Add all terms from the still selected presets, just in case some shared terms were deleted
                const ctSet = new Set(this._ct);
                for (const key of this.presetSelected.keys()) {
                    for (const term of this.presetSelected.get(key).terms) {
                        ctSet.add(term);
                    }
                }
                this._ct = [...ctSet];

                // 3. Update display
                this.requestUpdate();

                // 4. Notify changes
                this.filterChange();
            } else {
                console.error("Consequence type preset not found: ", preset);
            }
        }
    }

    onFilterChange(e) {
        // 1. Set selected values
        const ctSet = new Set(e.detail.value?.split(",") || []);
        this._ct = [...ctSet];

        // 2. Remove any preset election, this is not compatible with manual selection
        for (const key of this.presetSelected.keys()) {
            const allTermsSelected = this.presetSelected.get(key).terms.every(ct => this._ct.indexOf(ct) > -1);
            if (!allTermsSelected) {
                this.presetSelected.delete(key);
            }
        }

        // 3. Update disaply
        this.requestUpdate();

        // 4. Notify changes
        this.filterChange();
    }

    filterChange() {
        LitUtils.dispatchCustomEvent(this, "filterChange", this._ct.join(","));
    }

    getDefaultConfig() {
        return CONSEQUENCE_TYPES;
    }

    render() {
        return html`
            <!-- Render the different aliases configured -->
            <div class="mb-3">
                ${this._config.alias && this._config.alias.length > 0 ? html`
                    <label class="form-label">Add terms from a preset configuration:</label>
                    ${this._config.alias.map(alias => {
                        const id = `${this._prefix}${alias.name.replace(/ |[()]|/g, "")}`;
                        return html`
                            <div class="form-check">
                                <label class="form-check-label" for="${id}">
                                    <input
                                        type="checkbox"
                                        class="form-check-input ${this._prefix}_ctCheckbox"
                                        id="${id}"
                                        name="layout"
                                        value="${alias.name}"
                                        .checked="${this.presetSelected.has(alias.name)}"
                                        @click="${e => this.onPresetSelect(alias.name, e)}">
                                    <span>${alias.name} </span>
                                </label>
                                <span class="badge rounded-pill text-bg-secondary" tooltip-title="Terms" tooltip-text="${alias.terms.join("<br>")}">
                                    ${alias.terms?.length} terms
                                </span>
                            </div>
                        `;
                    })}
                ` : null}
            </div>

            <div class="mb-3">
                <label class="form-label">Or select terms manually:</label>
                <select-field-filter
                    .data="${this.options}"
                    .value="${this._ct}"
                    .config="${{multiple: true}}"
                    @filterChange="${this.onFilterChange}">
                </select-field-filter>
            </div>
        `;
    }

}

customElements.define("consequence-type-select-filter", ConsequenceTypeSelectFilter);
