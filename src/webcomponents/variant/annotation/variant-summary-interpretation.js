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
import VariantUtils from "../variant-utils.js";
import UtilsNew from "../../../core/utils-new";

export default class VariantSummaryInterpretation extends LitElement {

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
            primaryFinding: {
                type: Object
            },
            clinicalAnalysis: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "variant-summary-interpretation";
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
        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        super.update(changedProperties);
    }

    variantObserver() {
        this._variant = UtilsNew.objectClone(this.variant);
    }

    render() {
        if (!this._variant) {
            return nothing;
        }
debugger
        // const data = this._variant.studies.find(s => s.studyId === this.opencgaSession.study.fqn).
        return html`
            <div class="card p-3">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Variant Interpretation</h5>
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex flex-column me-2">
                            <div class="card-category">
                                STATUS
                            </div>
                            ${this._variant.status ? html`
                                <h4 class="d-flex flex-column badge ${VariantUtils.getStatusColor(this._variant.status || "")} user-select-none my-2">
                                    <b>${this._variant.status}</b>
                                </h4>
                            ` : html`
                                <h4 class="d-flex flex-column badge bg-light-subtle border-1 border-light-subtle user-select-none my-2">
                                    <b>N/A</b>
                                </h4>
                            `}
                        </div>
                        <div class="d-flex flex-column me-2">
                            <div class="card-category">
                                CONFIDENCE
                            </div>
                            ${this._variant?.confidence?.value ? html`
                                <div class="">
                                    <b>${this._variant?.confidence?.value }</b>
                                </div>
                            ` : html`
                                <div class="">
                                    <b>N/A</b>
                                </div>
                            `}
                        </div>
                        <div class="d-flex flex-column me-2">
                            <div class="card-category">
                                RELEVANCE
                            </div>
                            ${this.primaryFinding ? html`
                                <div class="">
                                    <b>PRIMARY_FINDING</b>
                                </div>
                            ` : html`
                                <div class="">
                                   <b>SECONDARY_FINDING</b>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
                <div class="card-body pt-0 pb-0" id="summary-interpretation">
                    <data-form
                        .data="${this._variant}"
                        .config="${this._config}">
                    </data-form>
                </div>
                <div class="card-divider"></div>
                <div class="text-muted fw-light fs-7">
                    <i class="far fa-clock me-2 text-gray-700"></i>
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
                    id: "variant-interpretation-discussion",
                    // title: "VARIANT INFO",
                    display: {
                        // visible:
                        // className: "d-flex flex-column",
                    },
                    elements: [
                        {
                            id: "variant-interpretation-latest-activity",
                            type: "custom",
                            display: {
                                render: variant => {
                                    const sortedComments = variant.comments.sort((a, b) => b.date.localeCompare(a.date));
                                    const lastComment = sortedComments[0] ?? null;
                                    return html `
                                        <div class="d-flex justify-content-between">
                                            <!-- Discussion -->
                                            ${variant.discussion ? html`
                                                <div class="flex-fill border rounded p-3 bg-light me-2">
                                                <h5 class="mb-2">Discussion</h5>
                                                <p class="mb-2">
                                                    ${variant.discussion.text}
                                                </p>
                                                <small class="text-muted d-block">${UtilsNew.dateFormatter(variant.discussion.date)}</small>
                                            </div>
                                            ` : html`
                                                No discussion so far
                                            `}
                                            <!-- Last Comment -->
                                            ${lastComment ? html`
                                                <div class="flex-fill border rounded p-3 bg-light me-2">
                                                    <h5 class="mb-2">Last Comment</h5>
                                                    <p class="mb-2">
                                                        ${lastComment.message}
                                                    </p>
                                                    <small class="text-muted d-block">${UtilsNew.dateFormatter(variant.discussion.date)}</small>
                                                </div>
                                            ` : html`
                                                No comments so far
                                            `}
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

customElements.define("variant-summary-interpretation", VariantSummaryInterpretation);
