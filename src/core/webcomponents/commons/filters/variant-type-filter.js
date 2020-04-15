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
import Utils from "./../../../utils.js";
import {types} from "../../commons/opencga-variant-contants.js";

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
            type: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "crf-" + Utils.randomString(6) + "_";
        this._config = this.getDefaultConfig();
        this.selectedVariantTypes = [];
        this.requestUpdate();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(_changedProperties) {
        if (_changedProperties.has("type")) {
            if (this.type) {
                this.selectedVariantTypes = this.type.split(",");
            } else {
                this.selectedVariantTypes = [];
            }
            this.requestUpdate();
        }
    }

    filterChange(e) {
        console.log("filterChange", this.selectedVariantTypes.join(",") || null);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: this.selectedVariantTypes.join(",") || null
            }
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            types: types
        };
    }
    toggle(type) {
        const checkbox = this.querySelector(`input[value=${type}]`);
        if (!~this.selectedVariantTypes.indexOf(type)) {
            this.selectedVariantTypes.push(type);
            checkbox.checked = true;
        } else {
            this.selectedVariantTypes.splice(this.selectedVariantTypes.indexOf(type), 1);
            checkbox.checked = false;
        }
        this.filterChange();
    }

    render() {
        return html`
            <div id="${this._prefix}Type">
             <ul class="checkbox-container">
                ${this._config.types && this._config.types.length && this._config.types.map( type => html`
                    <li>
                            <input type="checkbox" value="${type}" .checked="${~this.selectedVariantTypes.indexOf(type)}" class="${this._prefix}FilterCheckBox"/>
                            <label class="checkmark-label" @click="${ _ => this.toggle(type) }">${type}</label>
                            
                    </li>
                `)}
             </ul>
            </div>
        `;
    }

}

customElements.define("variant-type-filter", VariantTypeFilter);
