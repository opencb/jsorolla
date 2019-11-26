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

export default class FulltextSearchAccessionsFilter extends LitElement {

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
            placeholder: {
                type: String
            },
            query: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "fsaf-" + Utils.randomString(6) + "_";
        this.placeholder = "Full-text search, e.g. *melanoma*";
    }

    updated(_changedProperties) {
        if (_changedProperties.has("query")) {
            if(this.query.traits) {
                this.querySelector("#" + this._prefix + "TraitsTextarea").value = this.query.traits;
            } else {
                this.querySelector("#" + this._prefix + "TraitsTextarea").value = "";
            }

        }
    }

    filterChange(e) {
        let traits;
        const inputTextArea = PolymerUtils.getElementById(this._prefix + "TraitsTextarea");
        if (UtilsNew.isNotUndefinedOrNull(inputTextArea) && UtilsNew.isNotEmpty(inputTextArea.value)) {
            traits = inputTextArea.value;
        }
        console.log("filterChange", traits);
        const event = new CustomEvent("filterChange", {
            detail: {
                value: traits || null
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
            <textarea id="${this._prefix}TraitsTextarea" class="form-control clearable ${this._prefix}FilterTextInput" rows="5" name="traits" placeholder="${this.placeholder}" @input="${this.filterChange}"></textarea>
        `;
    }

}

customElements.define("fulltext-search-accessions-filter", FulltextSearchAccessionsFilter);
