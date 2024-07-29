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

import {LitElement, html} from "lit";
import LitUtils from "../utils/lit-utils.js";
import "../forms/select-field-filter.js";

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
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("sample") && this.sample) {
            const [sample, genotype] = this.sample.split(":");
            this.sampleId = sample;
            if (genotype) {
                this.genotypes = genotype.split(",");
            }
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }

        super.update(changedProperties);
    }

    filterChange(e) {

        // Prepare sample query filter
        let sampleFilter = this.sampleId;
        if (e.detail.value) {
            sampleFilter += ":" + e.detail.value;
        }

        LitUtils.dispatchCustomEvent(this, "filterChange", sampleFilter);
    }

    getDefaultConfig() {
        // HOM_REF, HOM_ALT, HET, HET_REF, HET_ALT and MISS e.g. HG0097:HOM_REF;HG0098:HET_REF,HOM_ALT . 3)
        return {
            genotypes: [
                {
                    id: "0/1", name: "HET (0/1)"
                },
                {
                    id: "1/1", name: "HOM_ALT (1/1)"
                },
                {
                    separator: true
                },
                {
                    id: "1", name: "HAPLOID (1)"
                },
                {
                    id: "1/2", name: "BIALLELIC (1/2)"
                },
                {
                    id: "NA", name: "NA"
                }
                // {
                //     id: "./.", name: "Missing"
                // },
            ]
        };
    }

    render() {
        const genotypes = this.genotypes ?? [];
        return html`
            <select-field-filter
                .data="${this._config?.genotypes}"
                .value=${genotypes}
                .config="${{
                    multiple: true,
                    liveSearch: false
                }}"
                @filterChange="${this.filterChange}">
            </select-field-filter>
        `;
    }

}

customElements.define("sample-genotype-filter", SampleGenotypeFilter);
