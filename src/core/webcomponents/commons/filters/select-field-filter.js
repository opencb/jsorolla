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
            //NOTE value is either a single string or a comma separated list
            value: {
                type: String
            },
            multiple: {
                type: Boolean
            },
            disabled: {
                type: Boolean
            },
            data: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sff-" + Utils.randomString(6) + "_";

        //NOTE: in case of single option select, in order to show the placeholder and NOT adding a dummy option as void selection,
        // the single selection is implemented still with the multiple flag, but forcing 1 selection with data-max-options=1
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
            // TODO check why lit-element execute this for all existing select-field-filter instances..wtf
            // console.log("data",this.data)
            $(".selectpicker", this).selectpicker("refresh");
        }
        if (_changedProperties.has("value")) {
            $(".selectpicker", this).selectpicker("val", this.value ? (this.multiple ? this.value.split(",") : this.value) : "");
        }
        if (_changedProperties.has("disabled")) {
            $(".selectpicker", this).selectpicker("refresh");
        }
    }

    filterChange(e) {
        const selection = $(".selectpicker", this).selectpicker("val");
        let val;
        //TODO refactor and simplify
        if(this.multiple) {
            if(selection && selection.length) {
                val = selection.join(",");
            } else val = [];
        } else {
            if(selection && selection.length) {
                val = selection;
            } else val = [];
        }
        console.log("select filterChange", val);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: val.length ? val : null
            }
        });
        this.dispatchEvent(event);
    }

    //safe check if the field is an object (NOTE null is an object, so the constructor check is not enough)
    // TODO add safe check if is a plain string
    isObject(obj) {
        return obj != null && obj.constructor.name === "Object";
    }

    render() {
        return html`
            <div id="${this._prefix}-wrapper" class="subsection-content form-group">
                <select
                        id="${this._prefix}-select"
                        class="selectpicker"
                        multiple
                        .disabled=${this.disabled}
                        title="${this.placeholder ? this.placeholder : "Select an option"}"
                        data-max-options="${!this.multiple ? 1 : false}"  
                        @change="${this.filterChange}" data-width="100%">
                    ${this.data.map( opt => html`
                        ${opt.fields ? html`
                            <optgroup label="${opt.name}">${opt.fields.map( subopt => html`
                                <option ?disabled="${subopt.disabled}">${this.isObject(subopt) ? subopt.name : subopt}</option>`) }
                            </optgroup>
                            ` : html`
                            <option ?disabled="${opt.disabled}">${this.isObject(opt) ? opt.name : opt}</option>
                        `}
                    `) }
                </select>
            </div>
        `;
    }

}

customElements.define("select-field-filter", SelectFieldFilter);
