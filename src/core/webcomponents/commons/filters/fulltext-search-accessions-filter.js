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
            traits: {
                type: String
            },
            // query: {
            //     type: Object
            // },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "fsaf-" + Utils.randomString(6) + "_";
        this._config = this.getDefaultConfig();
    }

    firstUpdated(_changedProperties) {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(_changedProperties) {
        // if (_changedProperties.has("query")) {
        //     let _traits = this.query && this.query.traits ? this.query.traits : "";
        //     this.querySelector("#" + this._prefix + "TraitsTextarea").value = _traits;
        //     // FIXME The preferred way of updating should be requestUpdate, but for any reason is not working now
        //     // this.requestUpdate();
        //     debugger
        // }

        let _traits = _changedProperties.has("traits") && this.traits ? this.traits : "";
        this.querySelector("#" + this._prefix + "TraitsTextarea").value = _traits;
        // FIXME The preferred way of updating should be requestUpdate, but for any reason is not working now
        // this.requestUpdate();
    }

    filterChange(e) {
        let traits;
        let inputTextArea = document.getElementById(this._prefix + "TraitsTextarea");
        if (UtilsNew.isNotUndefinedOrNull(inputTextArea) && UtilsNew.isNotEmpty(inputTextArea.value)) {
            traits = inputTextArea.value;
        }
        let event = new CustomEvent('filterChange', {
            detail: {
                value: traits || null
            }
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            rows: 5,
            placeholder: "Full-text search, e.g. melanoma"
        };
    }

    render() {
        return html`
            <textarea id="${this._prefix}TraitsTextarea" class="form-control clearable ${this._prefix}FilterTextInput" 
                rows="${this._config.rows}" name="traits" placeholder="${this._config.placeholder}" @keyup="${this.filterChange}"></textarea>
        `;
    }

}

customElements.define("fulltext-search-accessions-filter", FulltextSearchAccessionsFilter);
