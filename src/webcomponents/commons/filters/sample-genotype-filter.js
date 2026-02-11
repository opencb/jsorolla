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
import "../forms/select-dropdown.js";

export default class SampleGenotypeFilter extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            sample: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._sampleId = "";
        this._genotypes = "";
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("sample")) {
            const entries = this.sample?.split(":");
            this._sampleId = entries?.[0] || "";
            this._genotypes = entries?.[1] || "";
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    onFilterChange(event) {
        event.stopPropagation();
        // Prepare sample query filter
        let sampleFilter = this._sampleId;
        if (event.detail.value) {
            sampleFilter += ":" + event.detail.value;
        }

        LitUtils.dispatchCustomEvent(this, "filterChange", sampleFilter);
    }

    render() {
        return html`
            <select-dropdown
                .values="${this._config?.genotypes}"
                .value=${this._genotypes}
                ?multiple="${true}"
                ?search="${false}"
                @filterChange="${event => this.onFilterChange(event)}">
            </select-dropdown>
        `;
    }

    getDefaultConfig() {
        // HOM_REF, HOM_ALT, HET, HET_REF, HET_ALT and MISS e.g. HG0097:HOM_REF;HG0098:HET_REF,HOM_ALT . 3)
        return {
            genotypes: [
                {
                    id: "0/1", name: "Heterozygous (0/1)"
                },
                {
                    id: "1/1", name: "Homozygous Alternate (1/1)"
                },
                {
                    separator: true
                },
                {
                    id: "1", name: "Haploid (1)"
                },
                {
                    id: "1/2", name: "Biallelic (1/2)"
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

}

customElements.define("sample-genotype-filter", SampleGenotypeFilter);
