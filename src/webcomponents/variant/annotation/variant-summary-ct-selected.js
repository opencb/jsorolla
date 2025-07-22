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

export default class VariantSummaryCtSelected extends LitElement {

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

            // CAUTION 2: What I believe can be more accurate is:
            // 1. Get the list of consequence types selected in settings
            /*
            const {selectedConsequenceTypes, notSelectedConsequenceTypes} =
                VariantGridFormatter._consequenceTypeDetailFormatterFilter(
                    this.variant.annotation.consequenceTypes,
                    this.settings);
            */
            /*
            const mostSevereCT = this.variant.annotation.displayConsequenceType;
            const matchesMostSevere = ct =>
                ct.sequenceOntologyTerms?.some(so => so.name === mostSevereCT);
            let mostSevere = this.variant.annotation.consequenceTypes.filter(matchesMostSevere) || [];
            let selected = selectedConsequenceTypes.filter(matchesMostSevere) || [];
            let notSelected = notSelectedConsequenceTypes.filter(matchesMostSevere) || [];
             */

            const {maneConsequenceTypes, notManeConsequenceTypes, indexes} = VariantGridFormatter._consequenceTypeManeFilter(this.variant.annotation.consequenceTypes);

            this._variant = {
                // selected: selectedConsequenceTypes,
                selectedGene: "",
                selected: maneConsequenceTypes,
                ...this.variant
            };
        }
    }

    _onSelectGene(e) {
        this._variant.selectedGene = event.currentTarget.dataset.gene;
        this._variant = {...this._variant};
        this.requestUpdate();
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

    _renderGeneTabs(cts) {
        return html`
            <div class="d-flex flex-wrap mb-3">
                ${Object.keys(cts).map(geneName => html`
                    <span
                        class="
                            badge fs-6 me-2 mb-2
                            ${this._selectedGene === geneName
                                ? 'bg-dark bg-opacity-75 text-white'
                                : 'bg-light text-muted border border-secondary-subtle'}
                        "
                        style="cursor: pointer;"
                        data-gene=${geneName}
                        @click=${e => this._onSelectGene(e)}>
                        ${geneName}
                    </span>
                `)}
            </div>
        `;
    }

    _renderConsequenceTypes(cts) {
        const transcripts = cts[this._selectedGene] || [];
        return html`
          <div class="d-flex">
              ${transcripts.map(ct => html`
                  <div class="d-flex align-items-start flex-column"> <!--border-bottom  mb-2 pb-2-->
                      <div class="d-flex mb-2">
                          <!-- SO Terms -->
                          <div class="d-flex">
                              ${(ct.sequenceOntologyTerms || []).map(term => {
                                  const color = this._consequenceTypeToColor[term.name] || 'black';
                                  return html`
                                      <span class="badge me-2" style="border: 1px solid ${color}; color: ${color};">
                                    ${term.name}
                                  </span>
                                  `;
                              })}
                          </div>
                          <!-- Transcript Flags -->
                          <div class="d-flex">
                              ${(ct.transcriptFlags || []).map(tf => html`
                                  <span class="badge bg-white text-muted border border-secondary-subtle rounded-2 me-2">${tf}</span>
                              `)}
                          </div>
                      </div>
                      <!-- HGVS or transcript ID -->
                      <div class="d-flex flex-column">
                          ${ct.hgvs?.length ? ct.hgvs.map(hgvs => html`
                              <div class="d-flex mb-1 small text-muted">${hgvs}</div>
                          `) : html`
                              <div class="d-flex mb-1 small text-muted">${ct.transcriptId}</div>
                          `}
                      </div>
                  </div>
              `)}
          </div>
        `;
    };

    _renderConsequenceTypesNew(cts) {
        this._selectedGene = this._variant.selectedGene || Object.keys(cts)[0]; // set default gene
        return html`
            <div>
                ${this._renderGeneTabs(cts)}
                ${this._renderConsequenceTypes(cts)}
            </div>
        `;
    }

    render() {
        if (!this._variant) {
            return nothing;
        }

        // const data = this._variant.studies.find(s => s.studyId === this.opencgaSession.study.fqn).
        return html`
            <div class="card p-3 me-2">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Relevant transcripts</h5>
                    <p class="text-secondary">Consequence types linked to transcripts flagged as MANE-selected and source Ensembl</p>

                </div>
                <div class="card-body pt-0 pb-0">
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
            },
            sections: [
                {
                    id: "ct-selected",
                    display: {},
                    elements: [
                        // Transcript selected and query ct
                        {
                            // field: "selected",
                            type: "custom",
                            display: {
                                render: variant => {
                                    const ctsGroupByGene = this._groupConsequenceTypesByGene(variant.selected);
                                    return this._renderConsequenceTypesNew(ctsGroupByGene)
                                }
                            },
                        },
                    ],
                },
                /*
                {
                    title: "MOST SEVERE CONSEQUENCE TYPE",
                    display: {},
                    elements: [
                        // Most severe consequence type
                        {
                            // title: "Most Severe Consequence Type",
                            field: "consequenceTypesByGroup.displayConsequenceType",
                            type: "custom",
                            display: {
                                render: displayConsequenceType => {
                                    const consequenceTypeColor = this._consequenceTypeToColor?.[displayConsequenceType] || "black";
                                    return html`
                                        <div style="color: ${consequenceTypeColor};">
                                            ${displayConsequenceType}
                                        </div>
                                    `;
                                }
                            },
                        },
                        {
                            // title: "Most Severe Consequence Type",
                            field: "consequenceTypesByGroup.mostSevere",
                            type: "custom",
                            display: {
                                render: mostSevere => {
                                    debugger
                                    return html`
                                        <!-- Transcript selected or no transcript selected -->
                                        ${mostSevere?.map(ct => html`
                                            ${ct.geneName ? html`<div><b>Gene</b>: ${ct.geneName}</div>` : nothing}
                                            ${ct.hgvs?.map(hgvs => html`<div>${hgvs}</div>`) ?? nothing}
                                        `)}
                                    `;
                                }
                            },
                        },

                    ],
                },
                 */
            ],
        };
    }

}

customElements.define("variant-summary-ct-selected", VariantSummaryCtSelected);
