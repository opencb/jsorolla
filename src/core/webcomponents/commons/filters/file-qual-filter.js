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
import Utils from "./../../../utils.js";


export default class FileQualFilter extends LitElement {

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
            qual: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "fqf-" + Utils.randomString(6) + "_";
        this.qual = "";
    }

    updated(_changedProperties) {
        if (_changedProperties.has("qual")) {
            if(this.qual && this.qual > 0) {
                this.querySelector("#" + this._prefix + "FileQualCheckbox").checked = true;
                this.querySelector("#" + this._prefix + "FileQualInput").value = this.qual;
            } else {
                this.querySelector("#" + this._prefix + "FileQualCheckbox").checked = false;
                this.querySelector("#" + this._prefix + "FileQualInput").value = "";
                this.qualEnabled = false;
                this.requestUpdate();
            }
        }
    }

    //NOTE filterChange is called both on checkbox and text field
    filterChange(e) {
        let checked = this.querySelector("#" + this._prefix + "FileQualCheckbox").checked
        let value = this.querySelector("#" + this._prefix + "FileQualInput").value
        const event = new CustomEvent("filterChange", {
            detail: {
                value: checked && value > 0 ? value : null
            }
        });
        this.dispatchEvent(event);
    }

    onChangeQualCheckBox(e) {
        this.qualEnabled = e.target.checked;
        this.filterChange(e);
        this.requestUpdate();
    }

    render() {
        return html`
                <form class="form-horizontal subsection-content ">
                    <div class="form-group row">
                        <div class="col-md-8">
                            <input id="${this._prefix}FileQualCheckbox" type="checkbox"
                                   class="${this._prefix}FilterCheckBox" @change="${this.onChangeQualCheckBox}" .checked="${this.qualEnabled}"><span style="padding-left: 5px">Introduce min. <span
                                style="font-weight: bold;">QUAL</span></span>
                        </div>
                        <div class="col-md-4">
                            <input id="${this._prefix}FileQualInput" type="number" class="form-control input-sm ${this._prefix}FilterTextInput" .disabled="${!this.qualEnabled}" @input="${this.filterChange}">
                        </div>
                    </div>
                </form>
        `;
    }

}

customElements.define("file-qual-filter", FileQualFilter);
