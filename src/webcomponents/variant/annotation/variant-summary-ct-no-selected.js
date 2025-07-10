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
import VariantGridFormatter from "../variant-grid-formatter";

export default class VariantSummaryCtNoSelected extends LitElement {

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
            settings: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "variant-summary-ct-no-selected";
        this._study = null;
        this._variant = {};
        this._consequenceTypeToColor = {};
        this.#initConsequenceTypeToColor();

        this._config = this.getDefaultConfig();
    }

    #initConsequenceTypeToColor() {
        const consequenceTypeToColor = {};

        for (const {terms, name, impact} of CONSEQUENCE_TYPES.categories) {
            if (Array.isArray(terms)) {
                terms.forEach(({name: termName, impact: termImpact}) => {
                    if (termName && termImpact) {
                        consequenceTypeToColor[termName] = CONSEQUENCE_TYPES.style[termImpact];
                    }
                });
            } else if (name && impact) {
                consequenceTypeToColor[name] = CONSEQUENCE_TYPES.style[impact];
            }
        }

        this._consequenceTypeToColor = consequenceTypeToColor;
    }

    update(changedProperties) {
        if (changedProperties.has("variant") ||
            changedProperties.has("settings")) {
            this.variantObserver();
        }

        super.update(changedProperties);
    }

    variantObserver() {
        if (this.settings && this.variant) {
            // 1. Get the list of consequence types selected in settings
            const {selectedConsequenceTypes, notSelectedConsequenceTypes} =
                VariantGridFormatter._consequenceTypeDetailFormatterFilter(
                    this.variant.annotation.consequenceTypes,
                    this.settings);

            const mostSevereCT = this.variant.annotation.displayConsequenceType;

            const matchesMostSevere = ct =>
                ct.sequenceOntologyTerms?.some(so => so.name === mostSevereCT);

            this._variant = {
                notSelected: notSelectedConsequenceTypes,
                ...this.variant
            };
            debugger
        }
    }

    _groupConsequenceTypesByGene(cts) {
        // Group consequence types by gene
         return (cts || []).reduce((acc, ct) => {
            const gene = ct.geneName || "Unknown";
            acc[gene] = acc[gene] || [];
            acc[gene].push(ct);
            return acc;
        }, {});
    }

    _renderConsequenceTypes(cts) {
        if (Object.entries(cts).length === 0) {
            return html`
                <div class="fs-2">0 transcripts</div>
            `;
        }
        return html`
            <!-- Total transcript count -->
            <div class="fs-4 mb-4">
                ${Object.values(cts).reduce((total, transcripts) => total + transcripts.length, 0)} transcripts
            </div>

            <!-- Gene name list -->
            ${Object.keys(cts).map(geneName => html`
                <div class="badge fs-6 mb-4 bg-dark bg-opacity-75 text-white">
                    ${geneName}
                </div>
            `)}
        `;
    }

    render() {
        if (!this._variant) {
            return nothing;
        }
        // const data = this._variant.studies.find(s => s.studyId === this.opencgaSession.study.fqn).
        return html`
            <div class="card p-3">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Not relevant transcripts</h5>
                    <p class="text-secondary">According to your preferred transcript flags</p>

                </div>
                <div class="card-body pt-0 pb-0">
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
                className: "d-flex",
            },
            sections: [
                {
                    id: "ct-not-selected",
                    // title: ",
                    display: {},
                    elements: [
                        // Transcript selected and query ct
                        {
                            field: "notSelected",
                            type: "custom",
                            display: {
                                render: notSelected => {
                                    const ctsGroupByGene = this._groupConsequenceTypesByGene(notSelected);
                                    return this._renderConsequenceTypes(ctsGroupByGene)
                                }
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("variant-summary-ct-no-selected", VariantSummaryCtNoSelected);
