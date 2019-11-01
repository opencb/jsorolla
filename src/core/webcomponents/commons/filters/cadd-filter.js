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

export default class CaddFilter extends LitElement {

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
            query: {
                type: Object
            }
        }
    }

    //TODO refactor & check functionality
    _init() {
        this._prefix = "caddf-" + Utils.randomString(6) + "_";
    }

    firstUpdated(_changedProperties) {
        if (this.query && typeof this.query["annot-functional-score"] !== "undefined") {
            let fields = this.query["annot-functional-score"].split(new RegExp("[,;]"));
            for (let i = 0; i < fields.length; i++) {
                let source = fields[i].split(/[<=>]+/)[0];
                switch (source) {
                case "cadd_raw":
                    PolymerUtils.setValue(this._prefix + "CaddRawInput", fields[i].split(/[<=>]+/)[1]);
                    PolymerUtils.setValue(this._prefix + "CaddRawOperator", fields[i].split(/[-A-Za-z0-9_]+/)[1]);
                    break;
                case "cadd_scaled":
                    PolymerUtils.setValue(this._prefix + "CaddScaledInput", fields[i].split(/[<=>]+/)[1]);
                    PolymerUtils.setValue(this._prefix + "CaddScaledOperator", fields[i].split(/[-A-Za-z0-9_]+/)[1]);
                    break;
                }
            }
        }
    }

    //TODO refactor
    filterChange(e) {
        let cadd = [];
        let caddRawInput = PolymerUtils.getElementById(this._prefix + "CaddRawInput");
        let caddScaledInput = PolymerUtils.getElementById(this._prefix + "CaddScaledInput");
        if (UtilsNew.isNotUndefinedOrNull(caddRawInput) && UtilsNew.isNotUndefinedOrNull(caddScaledInput)) {
            if (UtilsNew.isNotEmpty(caddRawInput.value)) {
                cadd.push("cadd_raw" + PolymerUtils.getElementById(this._prefix + "CaddRawOperator").value + caddRawInput.value);
            }
            if (UtilsNew.isNotEmpty(caddScaledInput.value)) {
                cadd.push("cadd_scaled" + PolymerUtils.getElementById(this._prefix + "CaddScaledOperator").value + caddScaledInput.value);
            }
        }
        console.log("filterChange", cadd && cadd.length ? cadd.join(",") : null);
        let event = new CustomEvent("filterChange", {
            detail: {
                value: cadd && cadd.length ? cadd.join(",") : null
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <div style="padding-top: 10px">
                <div class="row">
                    <div class="col-md-5 form-group" style="padding-right: 5px">
                        <span class="control-label">Raw</span>
                    </div>
                    <div class="col-md-3" style="padding: 0px 5px">
                        <select name="caddRawOperator" id="${this._prefix}CaddRawOperator"
                                class="${this._prefix}FilterSelect form-control input-sm" style="padding: 0px 5px"
                                @change="${this.filterChange}">
                            <option value="<">&lt;</option>
                            <option value="<=">&le;</option>
                            <option value=">" selected>&gt;</option>
                            <option value=">=">&ge;</option>
                        </select>
                    </div>
                    <div class="col-md-4" style="padding-left: 5px">
                        <input type="number" value="" class="${this._prefix}FilterTextInput form-control input-sm"
                               id="${this._prefix}CaddRawInput" name="caddRaw" @input="${this.filterChange}">
                    </div>
            
                </div>
            </div>
            
            <div style="padding-top: 10px">
                <div class="row">
                    <span class="col-md-5 control-label" style="padding-right: 5px">Scaled</span>
                    <div class="col-md-3" style="padding: 0px 5px">
                        <select name="caddRScaledOperator" id="${this._prefix}CaddScaledOperator"
                                class="${this._prefix}FilterSelect form-control input-sm" style="padding: 0px 5px"
                                @change="${this.filterChange}">
                            <option value="<" selected>&lt;</option>
                            <option value="<=">&le;</option>
                            <option value=">">&gt;</option>
                            <option value=">=">&ge;</option>
                        </select>
                    </div>
                    <div class="col-md-4" style="padding-left: 5px">
                        <input type="number" value="" class="${this._prefix}FilterTextInput form-control input-sm"
                               id="${this._prefix}CaddScaledInput" name="caddScaled" @input="${this.filterChange}">
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define("cadd-filter", CaddFilter);
