/*
 * Copyright 2015-2016 OpenCB
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
import {checkBoxWidget} from "/src/styles/styles.js";

export default class VariantTypeFilter extends LitElement {

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
            },
            config: {
                type: Object
            }
        }
    }

    _init() {
        this._prefix = "crf-" + Utils.randomString(6) + "_";
        this._config = this.getDefaultConfig();
        this.selectedVariantTypes = [];
        this.requestUpdate();
    }

    updated(_changedProperties) {
        if (_changedProperties.has("query")) {
            if(this.query.type) {
                this.selectedVariantTypes = this.query.type.split(",");
            } else {
                this.selectedVariantTypes = [];
            }
            this.requestUpdate();

        }
    }

    filterChange(e) {
        console.log("filterChange", this.selectedVariantTypes.join(",") || null);
        let event = new CustomEvent('filterChange', {
            detail: {
                value: this.selectedVariantTypes.join(",") || null
            }
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            types: ["SNV", "INDEL", "CNV", "INSERTION", "DELETION", "MNV"],
        }
    }
    toggle(type) {
        let checkbox = this.querySelector(`input[value=${type}]`)
        if(!~this.selectedVariantTypes.indexOf(type)) {
            this.selectedVariantTypes.push(type);
            checkbox.checked = true;
        } else {
            this.selectedVariantTypes.splice(this.selectedVariantTypes.indexOf(type),1)
            checkbox.checked = false;
        }
        this.filterChange()
    }

    handleCollapseAction(e) {
        let id = e.target.dataset.id;
        let elem = $("#" + id)[0];
        elem.hidden = !elem.hidden;
        if (elem.hidden) {
            e.target.className = "fa fa-plus";
        } else {
            e.target.className = "fa fa-minus";
        }
    }

    render() {
        return html`
            <style>
                ${checkBoxWidget}
            </style>
            <div id="${this._prefix}Type">
             <ul class="checkbox-container">
                ${this._config.types && this._config.types.length && this._config.types.map( type => html`
                    <li>
                        <a @click="${ _ => this.toggle(type) }" style="cursor: pointer;">
                            <!--<input type="checkbox" value="${type}"  ?checked="${~this.selectedVariantTypes.indexOf(type)}" @change="${this.onChange}" @click="${this.checkboxToggle}"
                            ?checked="${1}" class="${this._prefix}FilterCheckBox"/> -->
                            <input type="checkbox" value="${type}" .checked="${~this.selectedVariantTypes.indexOf(type)}" class="${this._prefix}FilterCheckBox"/>
                            <span class="checkmark-label">${type}</span>
                            <span class="checkmark"></span>
                        </a>
                    </li>
                `)}
             </ul>
            </div>
        `;
    }
}

customElements.define("variant-type-filter", VariantTypeFilter);
