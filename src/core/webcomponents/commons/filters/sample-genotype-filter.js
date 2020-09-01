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
            opencgaSession: {
                type: Object
            },
            genotypes: {
                type: Array
            },
            sampleId: {
                type: String
            },
            sample: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.genotypes = ["any"];
        this._config = this.getDefaultConfig();
    }

    getDefaultConfig() {
        return {
            genotypes: [
                {
                    id: "any", name: "Any"
                },
                {
                    separator: true
                },
                {
                    id: "0/1", name: "0/1"
                },
                {
                    id: "1/1", name: "1/1"
                },
                {
                    separator: true
                },
                {
                    id: "NA", name: "NA"
                }
            ]
        };
    }

    filterChange(e) {
        //select-field-filter already emits a bubbled filterChange event.
        let genotypes = e.detail?.value?.split(",");
        if (genotypes) {
            let sampleId = this.sample ? this.sample.id : this.sampleId;
            let sampleGenotypes = genotypes.filter(e => e !== "any").join(",");
            const event = new CustomEvent("filterChange", {
                detail: {
                    value: `${sampleId}=${sampleGenotypes}`
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        }
        debugger
    }

    render() {
        return html`
            <select-field-filter multiple .data="${this._config.genotypes}" .value=${this.genotypes} .multiple="true" @filterChange="${this.filterChange}"></select-field-filter>
        `;
    }

}

customElements.define("sample-genotype-filter", SampleGenotypeFilter);
