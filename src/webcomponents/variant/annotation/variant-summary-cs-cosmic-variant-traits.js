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

export default class VariantSummaryCSCosmicVariantTraits extends LitElement {

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
        this._data = [];

        this._config = this.getDefaultConfig();
    }


    update(changedProperties) {
        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        super.update(changedProperties);
    }

    variantObserver() {
        if (this.variant) {
            this._variantSummary = (this.variant.annotation?.traitAssociation || [])
                .filter(t => t.source?.name?.toLowerCase() === 'cosmic')
                .map(t => this._summarize(t));
        }
    }

    _summarize(trait) {
        const somaticInfo = trait.somaticInformation || {};

        return {
            cosmicId: trait.id,
            legacyId: trait.additionalProperties?.find(p => p.id === "COSM_ID")?.value || "—",
            url: trait.url,
            // Caution Vero 20250722: gene id and name can not be distinguished.
            // It would be good to link to external and to obtain the uniprot id.
            geneSymbol: trait.genomicFeatures?.find(f => f.featureType === 'gene')?.xrefs?.symbol || "—",
            transcript: trait.genomicFeatures?.find(f => f.featureType === 'transcript')?.xrefs?.symbol || "—",
            primarySite: somaticInfo.primarySite || "—",
            histology: somaticInfo.primaryHistology || "—",
            sampleSource: somaticInfo.sampleSource || "—",
            tumourOrigin: somaticInfo.tumourOrigin || "—",
            somaticStatus: trait.additionalProperties?.find(p => p.id === "MUTATION_SOMATIC_STATUS")?.value || "—",
            fathmmScore: trait.additionalProperties?.find(p => p.id === "FATHMM_SCORE")?.value || "—",
            fathmmPrediction: trait.additionalProperties?.find(p => p.id === "FATHMM_PREDICTION")?.value || "—",
            pmids: (trait.bibliography || []).map(p => p.replace('PMID:', '')) || "—",
        };
    }

    render() {
        if (!this._variantSummary) {
            return nothing;
        }

        if (this._variantSummary.length === 0) {
            return html`<div>No cosmic traits association data available to display</div>`;
        }


        return html`
            <div class="card p-3">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Cosmic trait Associations</h5>
                    <p class="text-secondary"></p>

                </div>
                <div class="card-body pt-0 pb-0">
                    <data-form
                        .data="${this._variantSummary[0]}"
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
                className: "",
            },
            sections: [
                {
                    id: "variant-traits",
                    elements: [
                        {
                            title: "COSMIC ID",
                            type: "custom",
                            display: {
                                render: trait => {
                                    return html`
                                        <div class="header">
                                            <a href=${trait.url} target="_blank">${trait.cosmicId}</a>
                                            ${trait.legacyId ? html`<span> (${trait.legacyId})</span>` : ''}
                                        </div>
                                    `;
                                }
                            }
                        },
                        {
                            title: "Gene",
                            field: "geneSymbol",
                            display: {
                                render: trait => {
                                    7939
                                    return html`
                                        <div class="header">
                                            <a href=https://www.alliancegenome.org/gene/HGNC:${trait.geneSymbol} target="_blank">${trait.geneSymbol}</a>
                                            ${trait.geneSymbol ? html`<span> (${trait.geneSymbol})</span>` : ''}
                                        </div>
                                    `;
                                }
                            }
                        },
                        {
                            title: "Sample Source",
                            field: "sampleSource",
                        },
                        {
                            title: "Tumour type",
                            type: "custom",
                            display: {
                                render: trait => {
                                    return html`
                                        <div class="">
                                            <b>Primary site:</b> ${trait.primarySite} | <b>Histology:</b> ${trait.histology}
                                        </div>

                                    `;
                                }
                            }
                        },
                        {
                            title: "Somatic Status",
                            field: "somaticStatus",
                        },
                        {
                            title: "FATHMM prediction/score",
                            type: "custom",
                            display: {
                                render: trait => {
                                    return html`
                                    <div class=""><b>Prediction:</b> ${trait.fathmmPrediction} | <b>Score:</b> ${trait.fathmmScore}</div>
                                `;
                                },
                            },
                        },
                        {
                            title: "Literature Evidence",
                            field: "literatureEvidence",
                            type: "custom",
                            display: {
                                render: trait => {
                                    return html`
                                    ${trait?.pmids.length ? (trait?.pmids || []).map(pmid => html`
                                        <a href="https://pubmed.ncbi.nlm.nih.gov/${pmid}" target="_blank">PMID:${pmid}</a>
                                    `) : html`—`}
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

customElements.define("variant-summary-cs-cosmic-variant-traits", VariantSummaryCSCosmicVariantTraits);
