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
import UtilsNew from "../../../core/utilsNew.js";
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
        this.isChecked = {};
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

    firstUpdated(_changedProperties) {
        UtilsNew.initTooltip(this);
    }

    updated(changedProperties) {
        if (changedProperties.has("ct")) {
            if (this.ct) {
                this._ct = this.ct.split(",");
                // Select the checkboxes
                for (const alias of this._config.alias) {
                    this.isChecked[alias.name] = alias.terms.every(v => this._ct.indexOf(v) > -1);
                }
            } else {
                this._ct = [];
                this.isChecked = {};
            }
            this.requestUpdate();
        }
    }

    mapTerm(term) {
        return {id: term.name, name: `${term.name} <span class='badge badge-light' style="color: ${CONSEQUENCE_TYPES.style[term.impact]}">${term.impact}</span> <span class="badge badge-light">${term.id}</span>`};
    }

    onFilterChange(e) {
        this.filterChange(e.detail.value);
    }

    onPresetSelect(preset, e) {
        if (preset && this._config.alias) {
            const aliasSelect = this._config.alias.find(alias => alias.name === preset);

            if (aliasSelect) {
                if (e.currentTarget.checked) {
                    const ctSet = new Set(this._ct);
                    for (const term of aliasSelect.terms) {
                        ctSet.add(term);
                    }
                    this._ct = [...ctSet];
                } else {
                    this._ct = this._ct.filter(selected => !aliasSelect.terms.includes(selected));
                }
                this.filterChange(this._ct.join(","));
            } else {
                console.error("Consequence type rpeset not found: ", preset);
            }
        }
    }

    filterChange(cts) {
        this._ct = cts?.split(",") ?? [];
        this.updateCheckboxes();
        const event = new CustomEvent("filterChange", {
            detail: {
                value: cts
            }
        });
        this.dispatchEvent(event);
    }

    /*  Updates the state of all checkboxes in case of item selected from the dropdown and in case of click on a checkbox,
        including indeterminate state (which is visual only, the real state is still true/false).
     */
    updateCheckboxes() {
        for (const alias of this._config.alias) {
            this.isChecked[alias.name] = alias.terms.every(v => this._ct.indexOf(v) > -1);
            // $(`.${this._prefix}_ctCheckbox`).prop("indeterminate", false);

            if (!this.isChecked[alias.name]) {
                const id = `${this._prefix}${alias.name.replace(/ |[()]|/g, "")}`;
                $(`#${id}`).prop("indeterminate", alias.terms.some(v => this._ct.indexOf(v) > -1));
            }
        }
        this.isChecked = {...this.isChecked};
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            alias: [
                {
                    name: "Loss-of-Function (LoF)",
                    description: "Filter Loss-of-Function variants",
                    terms: CONSEQUENCE_TYPES.lof
                },
                {
                    name: "Missense",
                    description: "Filter Missense variants",
                    terms: ["missense_variant"]
                },
                {
                    name: "Protein Altering",
                    description: "Filter Protein Altering variants",
                    terms: CONSEQUENCE_TYPES.pa
                },
                {
                    name: "Coding Sequence",
                    description: "Filter Coding variants",
                    terms: ["missense_variant", "synonymous_variant", "stop_lost", "start_lost", "initiator_codon_variant",
                        "terminator_codon_variant", "frameshift_variant", "inframe_insertion", "inframe_deletion", "incomplete_terminal_codon_variant"]
                }
            ],
            categories: CONSEQUENCE_TYPES.categories
        };
    }

    render() {
        return html`
            <!-- Render the different aliases configured -->
            <div class="form-group">
                ${this._config.alias && this._config.alias.length > 0 ? html`
                    <div style="margin: 5px 0px">
                        <span>Select a preset configuration:</span>
                    </div>
                    ${this._config.alias.map(alias => html`
                        <div style="margin: 5px 0px">
                            <label class="text" for="${this._prefix}${alias.name}" style="font-weight: normal">
                                <input type="checkbox"
                                       class="${this._prefix}_ctCheckbox"
                                       id="${this._prefix}${alias.name.replace(/ |[()]|/g, "")}"
                                       name="layout"
                                       value="${alias.name}"
                                       .checked="${this.isChecked[alias.name]}"
                                       @click="${e => this.onPresetSelect(alias.name, e)}">
                                <span style="margin: 0px 5px">${alias.name} </span>
                            </label>
                            <span tooltip-title="Terms" tooltip-text="${alias.terms.join(", ")}" class="badge badge-secondary">${alias.terms?.length} terms</a>
                        </div>`)
                    }
                    ` : null
                }
            </div>

            <div class="form-group">
                <div style="margin: 5px 0px">
                    <span>Custom consequence types selection:</span>
                </div>
                <select-field-filter multiple liveSearch=${"true"} .data="${this.options}" .value=${this._ct}
                    @filterChange="${this.onFilterChange}">
                </select-field-filter>
            </div>
        `;
    }

}

customElements.define("consequence-type-select-filter", ConsequenceTypeSelectFilter);
