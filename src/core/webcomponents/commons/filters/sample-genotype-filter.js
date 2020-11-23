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
import UtilsNew from "../../../utilsNew.js";

export default class SampleGenotypeFilter extends LitElement {

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
            // opencgaSession: {
            //     type: Object
            // },
            sample: {
                type: String
            },
            genotypes: {
                type: Array
            },
            sampleId: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("sample")) {
            if (this.sample) {
                let keyValue = this.sample.split(":");
                if (keyValue.length === 2) {
                    this.sampleId = keyValue[0];
                    this.genotypes = keyValue[1].split(",");
                } else {
                    // No genotypes provided
                    this.sampleId = keyValue[0];
                    this.genotypes = ["0/1", "1/1", "NA"];
                }
                this.requestUpdate();
            }
        }
    }

    filterChange(e) {
        debugger
        //select-field-filter already emits a bubbled filterChange event.

        // Prepare sample query filter
        let sampleFilter = this.sampleId;
        if (e.detail.value) {
            sampleFilter += ":" + e.detail.value;
        }

        const event = new CustomEvent("filterChange", {
            detail: {
                value: sampleFilter
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }

    getDefaultConfig() {
        // HOM_REF, HOM_ALT, HET, HET_REF, HET_ALT and MISS e.g. HG0097:HOM_REF;HG0098:HET_REF,HOM_ALT . 3)
        return {
            genotypes: [
                {
                    id: "0/1", name: "HET"
                },
                {
                    id: "1/1", name: "HOM ALT"
                },
                {
                    separator: true
                },
                {
                    id: "./.", name: "Missing"
                },
                {
                    id: "NA", name: "NA"
                }
            ]
        };
    }

    render() {
        return html`
            <select-field-filter    multiple 
                                    .data="${this._config.genotypes}" 
                                    .value=${this.genotypes} 
                                    .multiple="true" 
                                    @filterChange="${this.filterChange}">
            </select-field-filter>
        `;
    }

}

customElements.define("sample-genotype-filter", SampleGenotypeFilter);
