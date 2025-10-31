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
import VariantGridFormatter from "../variant-grid-formatter.js";
import VariantUtils from "../variant-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import WebUtils from "../../commons/utils/web-utils.js";

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

    updated(changedProperties) {
        UtilsNew.initTooltip(this);
        this.updateComplete.then(() => {
            const allDiscussions = this.renderRoot.querySelectorAll('.clamp-text');
            allDiscussions.forEach(el => {
                WebUtils.clampText(el, 2, 'text-primary small');
            });
        });
    }

    variantObserver() {
        this._variant = UtilsNew.objectClone(this.variant);
    }

    render() {
        if (!this._variant) {
            return nothing;
        }

        return html`
            <div class="rounded-4 p-4 bg-white">
                <div class=" d-flex justify-content-between mb-2">
                    <h5 class="mb-2 fs-5 fw-bold">Variant Interpretation</h5>
                    <a tooltip-title="Population Frequencies" tooltip-text="${VariantGridFormatter.interpretationSummaryTooltipContent(POPULATION_FREQUENCIES)}">
                        <i class="fa fa-info-circle text-dark"></i>
                    </a>
                </div>
                <div class="" id="summary-interpretation">
                    <!-- TODO: Move this bit to data-form -->
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <div class="d-flex flex-column me-2">
                            <div class="summary-category">STATUS</div>
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
                            <div class="summary-category">CONFIDENCE</div>
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
                            <div class="summary-category">RELEVANCE</div>
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
                        <div class="d-flex flex-column me-2">
                            <div class="summary-category">#COMMENTS</div>
                            ${(() => {
                                const count = this._variant?.comments?.length ?? [];
                                return html`<div><b>${count}</b></div>`;
                            })()}
                        </div>
                        <div class="d-flex flex-column me-2">
                            <div class="summary-category">#REFERENCES</div>
                            ${(() => {
                                const count = this._variant?.references?.length ?? [];
                                return html`<div><b>${count}</b></div>`;
                            })()}
                        </div>
                        <div class="d-flex flex-column me-2">
                            <div class="summary-category">#IMAGES</div>
                            ${(() => {
                                const count = this._variant?.images?.length ?? [];
                                return html`<div><b>${count}</b></div>`;
                            })()}
                        </div>
                    </div>
                    <data-form
                        .data="${this._variant}"
                        .config="${this._config}">
                    </data-form>
                </div>
                <!--
                <div class="text-muted fw-light fs-7">
                    <i class="far fa-clock me-2 text-gray-700"></i>
                </div>
                -->
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
                    // title: "VARIANT INFO",
                    display: {
                        // visible:
                        // className: "d-flex",
                        separationClassName: "mb-0",
                        layout: [
                            {
                                className: "d-flex align-items-stretch mt-2",
                                elements: [
                                    {
                                        id:"variant-interpretation-evidences",
                                        style: "flex: 1",
                                    },
                                ],
                            },
                            {
                                className: "d-flex align-items-stretch",
                                elements: [
                                    {
                                        id:"variant-interpretation-discussion",
                                        style: "flex: 1",
                                    },
                                    {
                                        id:"variant-interpretation-recommendation",
                                        style: "flex: 1",
                                    },
                                ],
                            },
                        ],
                    },
                    elements: [
                        {
                            title: "SELECTED EVIDENCES",
                            id: "variant-interpretation-evidences",
                            type: "table",
                            display: {
                                //visible: false,
                                titleClassName: "summary-category",
                                titleStyle: "font-weight: normal !important",
                                defaultLayout: "vertical",
                                className: " table-borderless table-grid table-hover mt-2",
                                style: "font-size: 12px; background-color: #f9fafa; padding: 4px 12px",
                                bodyCellClassName: "align-middle bg-transparent",
                                headerCellClassName: "bg-transparent",
                                separationClassName: "mb-0",
                                // bodyRowClassName: "bg-gray-100",
                                getData: variant => (variant?.evidences || []).filter(({review}) => review?.select),
                                columns: [
                                    {
                                        title: "Gene",
                                        field: "genomicFeature.geneName",
                                        display: {
                                            defaultValue: "N/A",
                                            className: "text-secondary"
                                        }
                                    },
                                    {
                                        title: "Transcript",
                                        field: "genomicFeature.transcriptId",
                                        display: {
                                            defaultValue: "N/A",
                                            className: "text-secondary"
                                        },
                                    },
                                    {
                                        title: "Manual User Review",
                                        display: {
                                            columns: [
                                                {
                                                    title: "Clinical Significance",
                                                    field: "review.clinicalSignificance",
                                                    type: "custom",
                                                    display: {
                                                        render: clinicalSignificance => {
                                                            if (!clinicalSignificance) {
                                                                return html`<span class="text-secondary">-</span>`;
                                                            }
                                                            const cs = CLINICAL_SIGNIFICANCE.find(cs => cs.id === clinicalSignificance.toLowerCase());
                                                            return html`
                                                                <span style="color: ${cs.color}">${cs.acronym}</span>
                                                            `;
                                                        },
                                                    },
                                                },
                                                {
                                                    title: "ACMG",
                                                    field: "review.acmg",
                                                    type: "custom",
                                                    display: {
                                                        render: acmgList => {
                                                            if (!acmgList || acmgList.length === 0) {
                                                                return html`<span class="text-secondary">-</span>`;
                                                            }
                                                            return html`
                                                                ${acmgList.map(({ classification, strength }) => {
                                                                const { color, id } = ACMG_CRITERIA_COLOR.find(c => c.id === classification) ?? { color: '#000', id: '-' };
                                                                return html`
                                                                    <div class="d-inline-flex flex-column align-items-center text-center me-1">
                                                                        <span
                                                                            class="rounded-4 px-2 py-1"
                                                                            style="border: 1px solid ${color}; color: ${color}; min-width: 2.5rem;">
                                                                                ${id}
                                                                        </span>
                                                                        ${strength ? html`<small class="text-muted mt-1 fs-9">${strength}</small>` : ''}
                                                                    </div>
                                                              `;
                                                            })}
                                                            `;
                                                        },
                                                    },
                                                },
                                                {
                                                    title: "Tier",
                                                    field: "review.tier",
                                                    type: "custom",
                                                    display: {
                                                        render: tier => tier ? html`<span class="text-secondary">${tier}</span>` : "N/A"
                                                    },
                                                },
                                                {
                                                    title: "Score",
                                                    field: "review.score",
                                                    display: {
                                                        defaultValue: "N/A",
                                                        className: "text-secondary"
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        title: "Automatic Prediction",
                                        display: {
                                            separationClassName: "mb-0",
                                            className: "table mb-0",
                                            style: "font-size: 12px;",
                                            bodyCellClassName: "align-middle",
                                            headerCellClassName: "bg-transparent",
                                            columns: [
                                                {
                                                    title: "Clinical Significance",
                                                    field: "classification.clinicalSignificance",
                                                    type: "custom",
                                                    display: {
                                                        render: clinicalSignificance => {
                                                            if (!clinicalSignificance) {
                                                                return html`<span class="text-secondary">-</span>`;
                                                            }
                                                            const cs = CLINICAL_SIGNIFICANCE.find(cs => cs.id === clinicalSignificance.toLowerCase());
                                                            return html`
                                                                <span style="color: ${cs.color}">${cs.acronym}</span>
                                                            `;
                                                        },
                                                    },
                                                },
                                                {
                                                    title: "ACMG",
                                                    field: "classification.acmg",
                                                    type: "custom",
                                                    display: {
                                                        render: acmgList => {
                                                            if (!acmgList || acmgList.length === 0) {
                                                                return html`<span class="text-secondary">-</span>`;
                                                            }
                                                            return html`
                                                                ${acmgList.map(acmg => {
                                                                    const c = ACMG_CRITERIA_COLOR.find(({ id }) => id === acmg.classification) ?? { color: '#000', id: '-' };
                                                                    return html`
                                                                        <span
                                                                            class="rounded-4 px-1 me-1"
                                                                            style="border: 1px solid ${c.color}; color: ${c.color};">
                                                                            ${c.id}
                                                                        </span>
                                                                    `;
                                                                })}
                                                            `;
                                                        },
                                                    },
                                                },
                                                {
                                                    title: "Tier",
                                                    field: "review.tier",
                                                    type: "custom",
                                                    display: {
                                                        render: tier => tier ? html`<span class="text-secondary">${tier}</span>` : "-"
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                ],
                                defaultValue: () => {
                                    return html`
                                        <div class="alert alert-light border-0 mb-0 d-flex align-items-center gap-1">
                                            <i class="fas fa-info-circle fs-4 me-2"></i>
                                            <div class="text-break">No evidences have been selected.</div>
                                        </div>
                                    `;
                                },
                            },
                        },
                        {
                            title: "DISCUSSION",
                            id: "variant-interpretation-discussion",
                            type: "custom",
                            display: {
                                titleClassName: "summary-category",
                                titleStyle: "font-weight: normal !important",
                                defaultLayout: "vertical",
                                separationClassName: "mb-0 me-1",
                                style: "font-size: 12px;",
                                render: variant => {
                                    return html `
                                        <div class="d-flex flex-column mt-2">
                                            ${variant.discussion?.text ? html`
                                                <div class="clamp-text text-muted fs-6">
                                                    ${variant.discussion.text}
                                                </div>
                                                <small class="text-muted fw-bold d-block">
                                                    By <b>${variant.discussion.author}</b> •
                                                    ${UtilsNew.dateFormatter(variant.discussion.date)}
                                                </small>
                                            ` : html`
                                                <div class="alert alert-light border-0 mb-0 d-flex align-items-center gap-1">
                                                    <i class="fas fa-info-circle fs-4 me-2"></i>
                                                    <div class="text-break">No discussion available.</div>
                                                </div>
                                            `}
                                        </div>
                                    `;
                                },
                            },
                        },
                        {
                            title: "RECOMMENDATION",
                            id: "variant-interpretation-recommendation",
                            type: "custom",
                            display: {
                                titleClassName: "summary-category",
                                titleStyle: "font-weight: normal !important",
                                defaultLayout: "vertical",
                                separationClassName: "mb-0 ms-1",
                                style: "font-size: 12px;",
                                render: variant => {
                                    return html `
                                            <!-- Recommendation -->
                                            <div class="d-flex flex-column mt-2">
                                                ${variant?.recommendation ? html`
                                                    <div class="clamp-text text-muted fs-6">
                                                        ${variant.recommendation}
                                                    </div>
                                                ` : html`
                                                    <div class="alert alert-light border-0 mb-0 d-flex align-items-center gap-1">
                                                        <i class="fas fa-info-circle fs-4 me-2"></i>
                                                        <div class="text-break">No recommendation available.</div>
                                                    </div>
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
