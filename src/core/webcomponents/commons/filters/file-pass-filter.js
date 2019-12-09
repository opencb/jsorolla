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

export default class FilePassFilter extends LitElement {

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
            filter: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "fpf-" + Utils.randomString(6) + "_";
    }

    updated(_changedProperties) {
        if (_changedProperties.has("filter")) {
            this.querySelector("#" + this._prefix + "FilePassCheckbox").checked = this.filter === "PASS";
        }
    }

    filterChange(e) {
        console.log("filterChange", e.target.checked);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: e.target.checked ? "PASS" : null
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <div id="${this._prefix}-wrapper" class="subsection-content form-group">
                <input id="${this._prefix}FilePassCheckbox" type="checkbox" class="${this._prefix}FilterCheckBox" @change="${this.filterChange}" .checked="${this.filter === "PASS"}"><span
                        style="padding-left: 5px">Only include <span style="font-weight: bold;">PASS</span> variants</span>
            </div>
        `;
    }

}

customElements.define("file-pass-filter", FilePassFilter);
