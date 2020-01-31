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



/**
 * @deprecated
 **/
import {LitElement, html} from "/web_modules/lit-element.js";

export default class OpencgaFacetViewSelector extends LitElement {

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
            terms: {
                type: Array
            },
            variableSets: {
                type: Array
            },
            disabled: {
                type: Boolean
            },
            clear: {
                type: Boolean
            }
        };
    }

    _init() {
        this._prefix = "ofvs-" + Utils.randomString(6) + "_";
        this._showInitMessage = true;
        this.facets = new Set();
        this.facetFilters = [];
        this.disabled = false;
        this.clean = false;
    }

    updated(changedProperties) {
        if (changedProperties.has("terms") || changedProperties.has("variableSets")) {
            this.renderSelector();
        }
        if (changedProperties.has("disabled")) {
            this.renderSelector();
        }
        if (changedProperties.has("clear")) {
            this.clearFieldsObserver();
        }
    }

    // it was connectedCallback()
    firstUpdated(_changedProperties) {

        // Deselect any item selected
        $(`#${this._prefix}-value-select`).selectpicker("val", "");
        $(`#${this._prefix}-term-select`).selectpicker("val", "");

        // Remove span with text from one of the select pickers so it only shows the caret and not the text

        //TODO fix?
        //$(`button[data-id=${this._prefix}-value-select]`)[0].firstElementChild.remove();

        console.log($(`button[data-id=${this._prefix}-value-select]`));
    }

    onSelectedItemChange(e) {
        const input = $(`#${this._prefix}-input`)[0];

        if (e.target.id === `${this._prefix}-value-select`) {
            input.value = e.target.selectedOptions[0].dataset.value;
        } else {
            if (UtilsNew.isNotEmpty(e.target.selectedOptions[0].dataVariable.default)) {
                input.value = e.target.selectedOptions[0].dataVariable.default;
            }
        }

        const term = $(`#${this._prefix}-term-select`)[0].selectedOptions[0];

        this.dispatchEvent(new CustomEvent("variablechange", {
            detail: {
                term: UtilsNew.isNotUndefinedOrNull(term) ? term.dataVariable.tags : "",
                value: input.value
            }
        }
        ));
    }

    onInputTextChange(e) {
        const input = $(`#${this._prefix}-input`)[0];

        // Deselect any item selected
        $(`#${this._prefix}-value-select`).selectpicker("val", "");

        const term = $(`#${this._prefix}-term-select`)[0].selectedOptions[0];

        this.dispatchEvent(new CustomEvent("variablechange", {
            detail: {
                term: UtilsNew.isNotUndefinedOrNull(term) ? term.dataVariable.tags : "",
                value: input.value
            }
        }
        ));
    }

    clearFieldsObserver(clear) {
        if (clear) {
            $(`#${this._prefix}-value-select`).selectpicker("val", "");
            $(`#${this._prefix}-term-select`).selectpicker("val", "");
            $(`#${this._prefix}-input`)[0].value = "";
        }
    }

    disabledObserver(disabled) {
        const picker = $(`#${this._prefix}-ofvs .selectpicker`);
        const input = $(`#${this._prefix}-input`)[0];

        if (typeof picker[0] === "undefined") {
            return;
        }

        if (disabled) {
            picker[0].setAttribute("disabled", true);
            picker[1].setAttribute("disabled", true);
            input.setAttribute("disabled", true);
        } else {
            picker[0].removeAttribute("disabled");
            picker[1].removeAttribute("disabled");
            input.removeAttribute("disabled");
        }

        picker.selectpicker("refresh");
    }

    applyRenderFilters(fields) {
        if (UtilsNew.isUndefinedOrNull(fields) || fields.length === 0) {
            return fields;
        }
        const myFields = [];
        for (let i = 0; i < fields.length; i++) {
            const field = Object.assign({}, fields[i]);
            field["disabled"] = false;
            field["margin"] = 25;
            field["cursor"] = "pointer";
            field["tags"] = field.id;

            myFields.push(field);
        }

        return myFields;
    }

    renderSelector(fields, variableSets) {
        const myFields = this.applyRenderFilters(fields);

        const showTerms = [];
        showTerms.push({
            name: "Data model",
            values: myFields
        });

        if (typeof variableSets !== "undefined" && variableSets.length > 0) {
            for (let i = 0; i < variableSets.length; i++) {
                showTerms.push({
                    name: variableSets[i].id,
                    values: CatalogUIUtils.parseVariableSetVariablesForDisplay(variableSets[i].variables,
                        ["annotation"], 25)
                });
            }
        }

        this.showTerms = showTerms;
    }

    render() {
        return html`
<style include="jso-styles">

            /* Select picker optgroup header */
            .dropdown-header>span {
                font-size: 1.2em;
                font-weight: bold;
            }
        </style>

        <div id="${this.prefix}-ofvs" class="form-group row">

            <div class="col-md-7">
                <label>Select a Field</label>
                <select id="${this.prefix}-term-select" class="selectpicker" data-live-search="true"
                        .disabled=${this.disabled} @change="${this.onSelectedItemChange}">
                    ${this.showTerms && this.showTerms.length && this.showTerms.map( optterm => html`
                        <optgroup label="${optterm.name}" style="font-size: 1.1em; font-weight: bold">
                            ${optterm.values && optterm.values.length && optterm.values.map( term => html`
                                <option data-tokens="${term.tags}" data-variable="${term}"
                                        data-id="${term.id}"
                                        style="padding-left: ${term.margin}px; cursor: ${term.cursor};"
                                        .disabled="${term.disabled}">
                                    ${term.name}
                                </option>
                            `)}
                        </optgroup>
                    `) }
                </select>
            </div>

            <div class="col-md-5">
                <label>Include values or set range</label>
                <div class="input-group">
                    <input id="${this.prefix}-input" type="text" class="form-control" value=""
                           placeholder="Include values or range" @keyup="${this.onInputTextChange}">
                    <div class="input-group-btn">
                        <select id="${this.prefix}-value-select" class="selectpicker" .disabled=${this.disabled}
                                @change="${this.onSelectedItemChange}">
                            <optgroup label="Aggregation Function">
                                <option data-value="average">Average</option>
                                <option data-value="percentile">Percentile</option>
                            </optgroup>
                            <option data-divider="true"></option>
                            <option data-value="" data-id="reset">Reset</option>
                        </select>
                    </div>
                </div>
                <div>
                    <span style="font-style: italic;color: grey;font-size: 0.9em">For Terms you can set include values with [], e.g. for chromosome [1,2,3]</span>
                    <br>
                    <span style="font-style: italic;color: grey;font-size: 0.9em">For Range facets you can set [start..end]:step, e.g. for sift[0..1]:0.1</span>
                </div>
            </div>
        </div>
        `;
    }

}

customElements.define("opencga-facet-view-selector", OpencgaFacetViewSelector);

