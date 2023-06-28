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

import {LitElement, html} from "lit";
import {classMap} from "lit/directives/class-map.js";
import UtilsNew from "../../../core/utils-new.js";


export default class VariantExtSvtypeFilter extends LitElement {

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
            type: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.selectedVariantTypes = [];
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("types")) {
            if (this.type) {
                this.selectedVariantTypes = this.types.split(",");
            } else {
                this.selectedVariantTypes = [];
            }
            this.requestUpdate();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    filterChange(e) {
        console.log("filterChange", this.selectedVariantTypes.join(",") || null);
        const event = new CustomEvent("filterChange", {
            detail: {
                // value: this.selectedVariantTypes.join(",") || null,
                value: `EXT_SVTYPE=${this.selectedVariantTypes.join(",")}`
            }
        });
        this.dispatchEvent(event);
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

    getDefaultConfig() {
        return {
            types: ["TRANSLOCATION", "DUPLICATION", "INVERSION", "DELETION"],
            layout: "vertical"
        };
    }

    render() {
        return html`
            <style>
                variant-type-filter .inline li {
                    display: inline-block;
                    margin-right: 10px;
                }
            </style>
            <div id="${this._prefix}Type">
             <ul class="cy-magic-checkbox-wrapper ${classMap({inline: this._config.layout === "horizontal"})}">
                ${this._config.types && this._config.types.length && this._config.types.map( type => html`
                    <li>
                        <input class="magic-checkbox" type="checkbox" value="${type}" .checked="${~this.selectedVariantTypes.indexOf(type)}"/>
                        <label class="" @click="${() => this.toggle(type) }">${type}</label>
                    </li>
                `)}
             </ul>
            </div>
        `;
    }

}

customElements.define("variant-ext-svtype-filter", VariantExtSvtypeFilter);
