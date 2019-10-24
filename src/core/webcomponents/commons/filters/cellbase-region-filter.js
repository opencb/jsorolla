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


import {LitElement, html} from "/web_modules/lit-element.js";

export default class CellbaseRegionFilter extends LitElement {

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
        }
    }

    _init() {
        this._prefix = "crf-" + Utils.randomString(6);
        this._config = this.getDefaultConfig();
        console.log("this.region",this.region);

        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            placeholder: "3:444-55555,1:1-100000"
        }
    }

    onChange(e) {
        let _region = e.target.value.trim().replace(/\r?\n/g, ",").replace(/\s/g, "");
        let event = new CustomEvent('filterChange', {
            detail: {
                value: _region
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return html`
                    <textarea id="${this._prefix}LocationTextarea" name="location" 
                        class="form-control clearable ${this._prefix}FilterTextInput"
                        rows="3" placeholder="${this._config.placeholder}"
                        @change="${e => this.onChange(e)}">${this.region}</textarea>
                `;
    }
}

customElements.define("cellbase-region-filter", CellbaseRegionFilter);
