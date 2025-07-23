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

import {html, LitElement, nothing} from "lit";

export default class VariantSummaryConservation extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variant: {
                type: Object,
            },
        };
    }

    #init() {
        this._variant = {};
        this._chartDelId = "chart-deleteriousness";
    }

    update(changedProperties) {
        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        super.update(changedProperties);
    }


    variantObserver() {
        if (this.variant) {
            this._variant = {};
            const dataCons =  (this.variant.annotation?.conservation || []).map(s => ({
                source: s.source,
                score: s.score?.toFixed(3),
                color: this._colorMap(s.source, s.score)
            }));
            this._variant = {
                dataCons: dataCons,
                ...this.variant
            };

            this._config = this.getDefaultConfig();
        }
    }

    _colorMap(source, score) {
            if (source === "gerp") {
                if (score > 2) return "#d9534f"; // Highly conserved
                if (score > 1) return "#f0ad4e"; // Moderately conserved
                return "#13A574FF"; // Neutral
            }
            if (source === "phastCons") {
                if (score > 0.8) return "#d9534f";
                if (score > 0.5) return "#f0ad4e";
                return "#13A574FF";
            }
            if (source === "phylop") {
                if (score > 1.6) return "#d9534f";
                if (score > 1.0) return "#f0ad4e";
                return "#13A574FF";
            }
            return "#aaa";
    }

    render() {
        if (!this._variant) {
            return nothing;
        }
        debugger
        return html`
            <div class="card p-3 me-2">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Conservation</h5>
                    <p class="text-secondary">Consequence types linked to transcripts flagged as MANE-selected and source Ensembl</p>
                </div>
                <div class="card-body pt-0 pb-0" id="summary-conservation">
                    <data-form
                        .data="${this._variant}"
                        .config="${this._config}">
                    </data-form>
                </div>
                <!--
                <div class="card-footer text-muted">
                    <i class="far fa-clock me-2"></i>
                    Last updated
                </div>
                -->
            </div>

        `;
    }

    getDefaultConfig() {
        return {
            display: {
                buttonsVisible: false,
                className: "d-flex",
            },
            sections: [
                {
                    id: "ct-conservation",
                    display: {},
                    elements: [
                        {
                            id: "conservation",
                            type: "custom",
                            field: "dataCons",
                            display: {
                                render: dataCons => {
                                    return html`
                                        <div>
                                            <ul>
                                                ${dataCons.map(c => html`
                                                    <li style="margin: 4px 0;">
                                                        <span class="fw-bold">
                                                            ${c.source}:
                                                        </span>
                                                        <span style="color: ${c.color}">
                                                            ${c.score}
                                                        </span>
                                                    </li>`
                                                )}
                                            </ul>
                                        </div>
                                    `;
                                },
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("variant-summary-conservation", VariantSummaryConservation);
