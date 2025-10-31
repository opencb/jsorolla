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
import UtilsNew from "../../../core/utils-new";

export default class VariantSummaryInfo extends LitElement {

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
        this.COMPONENT_ID = "variant-summary-info";
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

    updated() {
        UtilsNew.initTooltip(this);
    }

    variantObserver() {
        if (this.settings && this.variant) {
            // 1. DISPLAY MOST SEVER CONSEQUENCE TYPE:
            // Find the gene and transcript that exhibit the display consequence type
            // CAUTION 1: This code, copy&paste from previous component cellbase-variant-annotation-summary.js, it is selecting
            // the first gene and transcript that matches the displayConsequenceType.
            // In the interface, the label for this field is "Most Severe Consequence Type".
            // However, list of consequence types can have multiple sequence ontology terms matching with displayConsequenceType.
            // To confirm with backend if this code matches with the most severe consequence type.
            /*
            this._consequenceTypeGene = null;
            this._consequenceTypeTranscript = null;
            if (typeof this.variant.annotation.consequenceTypes !== "undefined") {
                for (let i = 0; i < this.variant.annotation.consequenceTypes.length; i++) {
                    for (let j = 0; j < this.variant.annotation.consequenceTypes[i].sequenceOntologyTerms.length; j++) {
                        if (displayConsequenceType=== this.variantAnnotation.consequenceTypes[i].sequenceOntologyTerms[j].name) {
                            this._consequenceTypeGene = this.variantAnnotation.consequenceTypes[i].geneName;
                            this._consequenceTypeTranscript = this.variantAnnotation.consequenceTypes[i].transcriptId;
                            break;
                        }
                    }
                }
            }
             */
            const mostSevereCT = this.variant.annotation.displayConsequenceType;
            const matchesMostSevere = ct =>
                ct.sequenceOntologyTerms?.some(so => so.name === mostSevereCT); // All most severe
            let mostSevere = this.variant.annotation.consequenceTypes.filter(matchesMostSevere)[0] || {};
            this._variant = {
                displayConsequenceType: mostSevereCT,
                mostSevere,
                ...this.variant
            };
        }
    }

    render() {
        if (!this._variant) {
            return nothing;
        }
        return html`
            <div class="rounded-4 p-4 bg-white me-2">
                <div class=" d-flex justify-content-between mb-2">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Variant Info</h5>
                    <a tooltip-title="Variant Info" tooltip-text="${VariantGridFormatter.interpretationSummaryTooltipContent(POPULATION_FREQUENCIES)}">
                        <i class="fa fa-info-circle text-dark"></i>
                    </a>
                </div>
                <div id="summary-variant-info">
                    <data-form
                        .data="${this._variant}"
                        .config="${this._config}">
                    </data-form>
                </div>
                <!--
                <div class="text-muted fw-light fs-7">
                    <i class="far fa-clock me-2 text-gray-700"></i> Last Updated:
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
                    id: "variant-info",
                    display: {
                        separationClassName: "mb-0",
                    },
                    elements: [
                        {
                            id: "variant-id",
                            title: "ID",
                            field: "id",
                            type: "custom",
                            display: {
                                titleClassName: "summary-category",
                                render: id => {
                                    return html`
                                        <div class="fw-bold text-truncate" style="max-width:350px">
                                            ${id}
                                        </div>
                                    `;
                                },
                            },
                        },
                        {
                            id: "variant-type",
                            title: "TYPE",
                            field: "type",
                            type: "custom",
                            display: {
                                titleClassName: "summary-category",
                                render: type => {
                                    const {displayLabel, color} = VariantGridFormatter.typeGetColour(type);
                                    return html`
                                        <div class="badge me-2"
                                              style="border: 1px solid ${color}; color: ${color};">${displayLabel}
                                        </div>
                                    `;
                                },
                            },
                        },
                        // Most severe consequence type
                        {
                            title: "MOST SEVERE",
                            type: "custom",
                            display: {
                                titleClassName: "summary-category",
                                render: data => {
                                    const consequenceTypeColor = this._consequenceTypeToColor?.[data.displayConsequenceType] || "black";
                                    return html`
                                        <div class="badge me-2"
                                              style="border: 1px solid ${consequenceTypeColor}; color: ${consequenceTypeColor};">${data.displayConsequenceType}
                                        </div>
                                        <!-- Transcript selected or no transcript selected -->
                                        <!-- ${data.mostSevere.geneName ? html`<div><b>Gene</b>: ${data.mostSevere.geneName}, </div>` : nothing} -->
                                        <!-- ${data.mostSevere.transcriptId ? html`<div><b>Transcript</b>: ${data.mostSevere.transcriptId}</div>` : nothing}-->
                                    `;
                                }
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("variant-summary-info", VariantSummaryInfo);
