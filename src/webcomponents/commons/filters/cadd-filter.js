/* eslint-disable lit/attribute-value-entities */
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
import UtilsNew from "../../../core/utils-new.js";
import PolymerUtils from "../../PolymerUtils.js";
import LitUtils from "../utils/lit-utils.js";

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
            "opencgaSession": {
                type: Object
            },
            "annot-functional-score": {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "caddf-" + UtilsNew.randomString(6) + "_";
        this.invalidData = {
            raw: false,
            scaled: false
        };
    }

    updated(_changedProperties) {
        if (_changedProperties.has("annot-functional-score")) {
            if (this["annot-functional-score"]) {
                const fields = this["annot-functional-score"].split(new RegExp("[,;]"));
                const cadd_raw = fields.find(el => el.startsWith("cadd_raw"));
                if (cadd_raw) {
                    this.querySelector("#" + this._prefix + "CaddRawInput").value = cadd_raw.split(/[<=>]+/)[1];
                    this.querySelector("#" + this._prefix + "CaddRawOperator").value = cadd_raw.split(/[-A-Za-z0-9_]+/)[1];
                } else {
                    this.querySelector("#" + this._prefix + "CaddRawInput").value = "";

                }
                const cadd_scaled = fields.find(el => el.startsWith("cadd_scaled"));
                if (cadd_scaled) {
                    this.querySelector("#" + this._prefix + "CaddScaledInput").value = cadd_scaled.split(/[<=>]+/)[1];
                    this.querySelector("#" + this._prefix + "CaddScaledOperator").value = cadd_scaled.split(/[-A-Za-z0-9_]+/)[1];
                } else {
                    this.querySelector("#" + this._prefix + "CaddScaledInput").value = "";
                }
                /*
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
                }*/
            } else {
                $("." + this._prefix + "FilterTextInput").val("");
                $("." + this._prefix + "FilterTextInput").prop("disabled", false);
            }
        }
    }

    filterChange(e, field) {
        if (e.target?.validity?.valid) {
            this.invalidData[field] = false;
            this.caddFilterChange();
        } else {
            this.invalidData[field] = true;
        }
        this.requestUpdate();
    }

    errorMessage(msg) {
        return html `
            <div class="row" style="color:#a94442">
                ${msg}
            </div>
        `;
    }

    caddFilterChange() {
        const cadd = [];
        const caddRawInput = PolymerUtils.getElementById(this._prefix + "CaddRawInput");
        const caddScaledInput = PolymerUtils.getElementById(this._prefix + "CaddScaledInput");
        if (UtilsNew.isNotUndefinedOrNull(caddRawInput) && UtilsNew.isNotUndefinedOrNull(caddScaledInput)) {
            if (UtilsNew.isNotEmpty(caddRawInput.value)) {
                cadd.push("cadd_raw" + PolymerUtils.getElementById(this._prefix + "CaddRawOperator").value + caddRawInput.value);
            }
            if (UtilsNew.isNotEmpty(caddScaledInput.value)) {
                cadd.push("cadd_scaled" + PolymerUtils.getElementById(this._prefix + "CaddScaledOperator").value + caddScaledInput.value);
            }
        }
        console.log("filterChange", cadd && cadd.length ? cadd.join(",") : null);
        LitUtils.dispatchCustomEvent(this, "filterChange", cadd && cadd.length ? cadd.join(",") : null);
    }

    render() {
        return html`
            <div class="row g-1">
                <div class="col-md-5">
                    <label class="form-label">Raw</label>
                </div>
                <div class="col-md-3">
                    <select class="${this._prefix}FilterSelect form-select"  id="${this._prefix}CaddRawOperator"
                            name="caddRawOperator" @change="${this.caddFilterChange}">
                        <option value="<">&lt;</option>
                        <option value="<=">&le;</option>
                        <option value=">" selected>&gt;</option>
                        <option value=">=">&ge;</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <input type="number" class="${this._prefix}FilterTextInput form-control"
                        id="${this._prefix}CaddRawInput" name="caddRaw" @input="${e => this.filterChange(e, "raw")}">
                </div>
                ${this.invalidData["raw"]? this.errorMessage("0 or 1"):""}


                <div class="col-md-5">
                    <label class="form-label">Scaled</label>
                </div>
                <div class="col-md-3">
                    <select class="${this._prefix}FilterSelect form-select" id="${this._prefix}CaddScaledOperator"
                        name="caddRScaledOperator" @change="${this.caddFilterChange}">
                        <option value="<" selected>&lt;</option>
                        <option value="<=">&le;</option>
                        <option value=">">&gt;</option>
                        <option value=">=">&ge;</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <input type="number" min="0" max="99" class="${this._prefix}FilterTextInput form-control"
                        id="${this._prefix}CaddScaledInput" name="caddScaled" @input="${e => this.filterChange(e, "scaled")}">
                </div>
                ${this.invalidData["scaled"]? this.errorMessage("Invalid number, must be between 0-99"):""}
            </div>
        `;
    }

}

customElements.define("cadd-filter", CaddFilter);
