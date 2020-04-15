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


export default class FileNameAutocomplete extends LitElement {

    constructor() {
        super();
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
            value: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sf-" + Utils.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    onFilterChange(key, value) {
        const event = new CustomEvent("filterChange", {
            detail: {
                value: value
            }
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        return {
            searchOn: "name",
            fields: item => ({
                name: item.name,
                secondary: {
                    "Format": item.format || ""
                }
            }),
            // template: item => item.id + "<p class=\"dropdown-item-extra\"><label>Individual ID</label>" + (item.attributes && item.attributes.OPENCGA_INDIVIDUAL ? item.attributes.OPENCGA_INDIVIDUAL.id : "") + "</p>",
            placeholder: "samples.tsv, phenotypes.vcf...",
            query: {
                type: "FILE"
            }
        };
    }

    render() {
        return html`
            <select-field-filter-autocomplete resource="files" placeholder="${this._config.placeholder}" .opencgaSession="${this.opencgaSession}" .config=${this._config} .value="${this.value}" @filterChange="${e => this.onFilterChange("id", e.detail.value)}"></select-field-filter-autocomplete>
        `;
    }

}

customElements.define("file-name-autocomplete", FileNameAutocomplete);
