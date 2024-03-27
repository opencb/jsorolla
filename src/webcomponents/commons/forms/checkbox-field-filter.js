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
import LitUtils from "../utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";

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
            },
            disabled: {
                type: Boolean
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.state = {};
    }

    update(changedProperties) {
        if (changedProperties.has("value")) {
            this.state = {};
            if (this.value) {
                if (Array.isArray(this.value)) {
                    this.value.forEach(v => this.state[v] = true);
                } else {
                    this.value.split(",").forEach(v => this.state[v] = true);
                }
                this.state = {...this.state};
            }
        }
        super.update(changedProperties);
    }

    filterChange(e) {
        const {value, checked} = e.currentTarget;
        this.state[value] = checked;
        const v = Object.entries(this.state)
            .filter(([, value]) => value)
            .map(([id]) => id);
        LitUtils.dispatchCustomEvent(this, "filterChange", v.join(","));
    }

    render() {
        return html`
            <div class="magic-checkbox-wrapper ms-2">
                ${this.data.map((el, i) => {
                    const {id, name} = UtilsNew.isObject(el) ? el : {id: el, name: el};
                    return html`
                        <div class="form-check">
                            <input class="form-check-input"
                                type="checkbox"
                                id="${this._prefix}checkbox${i}"
                                value="${id}"
                                .checked="${this.state[id]}"
                                ?disabled="${this.disabled}"
                                @click="${this.filterChange}">
                            <label class="form-check-label" for="${this._prefix}checkbox${i}">
                                ${UtilsNew.renderHTML(name)}
                            </label>
                        </div>
                    `;
                })}
            </div>
        `;
    }

}

customElements.define("checkbox-field-filter", CheckboxFieldFilter);
