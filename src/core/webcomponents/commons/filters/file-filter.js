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

// TODO check functionality

import {LitElement, html} from "/web_modules/lit-element.js";

export default class FileFilter extends LitElement {

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
            }
        };
    }

    _init() {
        this._prefix = "ff-" + Utils.randomString(6) + "_";
    }

    updated(_changedProperties) {

    }

    filterChange() {
        const value = `${this.qual ? `qual=${this.qual},` : ""}${this.filter ? `filter=${this.filter}` : ""}`;
        console.log("filterChange", value);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: value || null
            }
        });
        this.dispatchEvent(event);
    }

    onChangePass(e) {
        this.filter = e.target.checked ? "PASS" : null;
    }

    onChangeQual(e) {
        this.qual = ">=" + e.target.value;
    }

    onChangeQualCheckBox(e) {
        this.qualEnabled = e.target.checked;
    }

    render() {
        return html`
            <div class="row">
                <div class="col-md-12">
                    <input id="${this._prefix}FilePassCheckbox" type="checkbox" class="${this._prefix}FilterCheckBox" @change="${this.onChangePass}" ?checked="${this.query.filter === "PASS"}"><span
                        style="padding-left: 5px">Only include <span style="font-weight: bold;">PASS</span> variants</span>
                </div>
                <form class="form-horizontal">
                    <div class="form-group col-md-12">
                        <div class="col-md-8">
                            <input id="${this._prefix}FileQualCheckbox" type="checkbox"
                                   class="${this._prefix}FilterCheckBox" @change="${this.onChangeQualCheckBox}" ?checked="${this.qualEnabled && this.query.qual > 0}"><span style="padding-left: 5px">Introduce min. <span
                                style="font-weight: bold;">QUAL</span></span>
                        </div>
                        <div class="col-md-4">
                            <input id="${this._prefix}FileQualInput" type="text" class="form-control input-sm ${this._prefix}FilterTextInput" ?disabled="${this.query.qual > 0}" value="${this.query.qual}" @change="${this.onChangeQual}">
                        </div>
                    </div>
                </form>
            </div>
        `;
    }

}

customElements.define("file-filter", FileFilter);
