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

export default class VariantSummaryGene extends LitElement {

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
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "variant-summary-gene";
        this._study = null;
        this._config = this.getDefaultConfig();
        this._variant = {};
    }

    update(changedProperties) {
        if (changedProperties.has("variant") || changedProperties.has("opencgaSession")) {
            this.variantObserver();
        }

        super.update(changedProperties);
    }

    variantObserver() {
        const study = this.variant.studies.find(study => study.studyId === this.opencgaSession.study.fqn)
        const { samples, sampleDataKeys, files} = study;
        this._variant = {...this.variant}
    }

    render() {
        if (!this._variant) {
            return nothing;
        }
        // const data = this._variant.studies.find(s => s.studyId === this.opencgaSession.study.fqn).
        return html`
            <div class="card p-3">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Gene Disease Association</h5>
                    <p class="text-secondary">Description of gene-disease association</p>

                </div>
                <div class="card-body mb-2">
                    <data-form
                        .data="${this._variant}"
                        .config="${this._config}">
                    </data-form>
                </div>
                <div class="card-footer text-muted">
                    <i class="far fa-clock me-2"></i>
                    Last updated
                </div>
            </div>

        `;
    }

    getDefaultConfig() {
        return {
            display: {
                buttonsVisible: false,
            },
            sections: [
                {
                    display: {
                        className: "d-flex justify-content-between align-items-center",
                    },
                    elements: [
                        //
                        {
                            id: "",
                            type: "",
                            field: "",
                            // title: "Sample Quality Summary",
                            display: {
                                classes: "",
                                defaultValue: "",
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("variant-summary-gene", VariantSummaryGene);
