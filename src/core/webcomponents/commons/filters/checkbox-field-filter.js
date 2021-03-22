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


export default class CheckboxFieldFilter extends LitElement {

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
            // value (default Values) can be either a single value as string or a comma separated list
            value: {
                type: String
            },
            data: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "tff-" + UtilsNew.randomString(6);
        this.state = {};
    }

    update(changedProperties) {
        super.update(changedProperties);
        /* if (changedProperties.has('firstName') || changedProperties.has('lastName') {
            this.fullName = `${this.firstName} ${this.lastName}`.trim();
        }*/
    }

    updated(changedProperties) {
        if (changedProperties.has("value")) {
            if (this.value) {
                if (Array.isArray(this.value)) {
                    this.value.forEach(v => this.state[v] = true);
                } else {
                    this.value.split(",").forEach(v => this.state[v] = true);
                }
                this.state = {...this.state};
            } else {
                this.state = {};
            }
            if (changedProperties.has("data")) {
            }
        }
    }

    filterChange(e) {
        const {value, checked} = e.currentTarget;
        this.state[value] = checked;
        const v = Object.entries(this.state).filter(([, value]) => value).map(([id]) => id);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: v.join(",")
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <ul class="magic-checkbox-wrapper">
                ${this.data.map((el, i) => {
                    const {id, name} = UtilsNew.isObject(el) ? el : {id: el, name: el};
                    return html`
                        <li>
                            <input class="magic-checkbox" type="checkbox" id="${this._prefix}checkbox${i}" .checked="${this.state[id]}" value="${id}" @click="${this.filterChange}">
                            <label for="${this._prefix}checkbox${i}">
                                ${name}
                            </label>
                        </li>
                    `;
        })}
            </ul>
        `;
    }

}

customElements.define("checkbox-field-filter", CheckboxFieldFilter);
