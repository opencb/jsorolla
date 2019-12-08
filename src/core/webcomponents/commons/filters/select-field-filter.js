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

export default class SelectFieldFilter extends LitElement {

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
            opencgaSession: {
                type: Object
            },
            placeholder: {
                type: String
            },
            value: {
                type: String
            },
            multiple: {
                type: Boolean
            },
            data: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sff-" + Utils.randomString(6) + "_";
        this.multiple = false;
        this.data = [];
    }

    /* set value(val) {
        let oldVal = this._value;
        this._value = val;
        this.requestUpdate('value', oldVal);
    }*/

    firstUpdated() {
        $(".selectpicker", this).selectpicker("val", "");
    }

    updated(_changedProperties) {
        if (_changedProperties.has("data")) {
            // TODO check why lit-element execute this for all existing select-field-filter instance..wtf
            // console.log("data",this.data)
        }
        if (_changedProperties.has("value")) {
            $(".selectpicker", this).selectpicker("val", this.value ? this.value.split(",") : []);
        }
    }

    filterChange(e) {
        // console.log("filterChange", $(".selectpicker", this).selectpicker('val'))
        const val = $(".selectpicker", this).selectpicker("val").join(","); // remember [] is truthy
        const event = new CustomEvent("filterChange", {
            detail: {
                value: val.length ? val : null
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <div id="${this._prefix}-wrapper" class="subsection-content form-group">
                <select id="${this._prefix}-select" class="selectpicker" ?multiple = ${this.multiple}
                                        @change="${this.filterChange}" data-width="100%">
                    ${this.data.map( opt => html`<option>${opt}</option>`) }
                </select>
            </div>
        `;
    }

}

customElements.define("select-field-filter", SelectFieldFilter);
