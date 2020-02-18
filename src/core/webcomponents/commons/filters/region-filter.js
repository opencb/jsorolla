/*
 * Copyright 2015-2016 OpenCB
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


import {html, LitElement} from "/web_modules/lit-element.js";

export default class RegionFilter extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            region: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "crf-" + Utils.randomString(6) + "_";
        // FIXME in case of region as a prop (with value = this.query.region from variant-filter) in case opencga-active-filter deletes a region filter this component is not updated.
        // A temp solution is to add query as prop and watch for its edits in updated() [this.region as prop is not used anymore].
        // this.region = "";
        this.separator = ",";
        this._config = this.getDefaultConfig();
    }

    firstUpdated(_changedProperties) {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(_changedProperties) {
        // "this.region" are automatically reflected on the template, we don't needto watch it
        /*if (_changedProperties.has("region")) {
            if (this.region) {
                this.querySelector("#" + this._prefix + "LocationTextarea").value = this.region;
            } else {
                this.querySelector("#" + this._prefix + "LocationTextarea").value = "";
            }
        }*/
    }

    filterChange(e) {
        // Process the textarea: remove newline chars, empty chars, leading/trailing commas
        const _region = e.target.value.trim()
            .replace(/\r?\n/g, this.separator)
            .replace(/\s/g, "")
            .split(this.separator)
            .filter(_ => _)
            .join(this.separator);

        const event = new CustomEvent("filterChange", {
            detail: {
                value: _region
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            rows: 3,
            placeholder: "3:444-55555,1:1-100000"
        };
    }

    render() {
        return html`
                    <textarea id="${this._prefix}LocationTextarea" name="location" 
                        class="form-control clearable ${this._prefix}FilterTextInput"
                        rows="${this._config.rows}" placeholder="${this._config.placeholder}"
                        .value="${this.region || ""}"
                        @input="${e => this.filterChange(e)}"></textarea>
                `;
    }
}

customElements.define("region-filter", RegionFilter);
