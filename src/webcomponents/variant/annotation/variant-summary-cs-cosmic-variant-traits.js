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
import UtilsNew from "../../../core/utils-new.js";

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
        this._chartId = "summary-variant-cosmic-chart";

        this._config = this.getDefaultConfig();
    }


    update(changedProperties) {
        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        UtilsNew.initTooltip(this);
        this.querySelector("#summary-cosmic-traits data-form").updateComplete.then(() => {
            Object.keys(this._variantSummary).forEach((gene, idx) => {
                    this.#renderChart(gene, idx)
            });
        });
    }

    variantObserver() {
        if (this.variant) {
            this._variantSummary = this._summarize();
        }
        debugger
    }

    _mapFathmmColor(pred) {
        const map = {
            "PATHOGENIC": "#d73027",
            "NEUTRAL": "#4575b4",
            "UNKNOWN": "#999999"
        };
        return map[pred?.toUpperCase()] || "#cccccc";
    }

    _summarize() {
        // Aggregate data per gene and tumour site
        const geneSiteData = {};
        (this.variant.annotation?.traitAssociation || [])
            .filter(t => t.source?.name?.toLowerCase() === 'cosmic')
            .forEach(t => {
                const geneFeature = t.genomicFeatures.find(g => g.featureType === "gene" && isNaN(g.xrefs.symbol));
                const gene = geneFeature ? geneFeature.xrefs.symbol : "Unknown";
                const site = t.somaticInformation.primarySite || "Unknown";
                const histology = t.somaticInformation.primaryHistology || "Unknown";
                const transcriptFeature = t.genomicFeatures.find(g => g.featureType === "transcript");
                const transcriptId = transcriptFeature ? transcriptFeature.xrefs.symbol : "Unknown";

                const fathmmPrediction = (t.additionalProperties.find(p => p.id === "FATHMM_PREDICTION") || {}).value || "Unknown";
                const fathmmScore = (t.additionalProperties.find(p => p.id === "FATHMM_SCORE") || {}).value || "N/A";

                const key = `${gene}||${site}||${fathmmPrediction}||${histology}`;
                if (!geneSiteData[gene]) geneSiteData[gene] = {};
                if (!geneSiteData[gene][key]) {
                    geneSiteData[gene][key] = {
                        name: site,
                        weight: 0,
                        color: this._mapFathmmColor(fathmmPrediction),
                        histology,
                        fathmmPrediction,
                        fathmmScore,
                        transcripts: new Set()
                    };
                }
                geneSiteData[gene][key].weight++;
                geneSiteData[gene][key].transcripts.add(transcriptId);
            });
        debugger

        const cleanedGeneSiteData = Object.fromEntries(
            Object.entries(geneSiteData).filter(([key]) => key !== "Unknown")
        );
        return cleanedGeneSiteData;

    }

    #renderChart(gene, idx) {
        debugger
        const containerId = `container-${idx}`;
        const div = document.createElement("div");
        div.id = containerId;
        div.style.height = "300px";
        document.querySelector(`#${this._chartId}`).appendChild(div);

        const data = Object.values(this._variantSummary[gene]).map(d => ({
            name: d.name,
            weight: d.weight,
            color: d.color,
            histology: d.histology,
            fathmmPrediction: d.fathmmPrediction,
            fathmmScore: d.fathmmScore,
            transcriptIds: Array.from(d.transcripts)
        }));

        Highcharts.chart(containerId, {
            series: [{
                type: 'wordcloud',
                data,
                name: 'Transcript count'
            }],
            title: { text: `Tumour Sites for Gene: ${gene}` },
            tooltip: {
                useHTML: true,
                pointFormatter: function() {
                    return `<b>${this.name}</b><br/>
                        Histology: ${this.histology}<br/>
                        Transcripts: ${this.weight}<br/>
                        FATHMM Prediction: ${this.fathmmPrediction}<br/>
                        FATHMM Score: ${this.fathmmScore}<br/>
                        Transcript IDs: ${this.transcriptIds.join(", ")}
                    `;
                }
            },
            credits: {
                enabled: false
            },
        });
    }

    render() {
        if (!this._variantSummary) {
            return nothing;
        }


        return html`
            <div class="card p-3">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Cosmic trait Associations</h5>
                </div>
                <div class="card-body pt-0 pb-0"  id="summary-cosmic-traits">
                    ${Object.keys(this._variantSummary).length === 0 ? html`
                        <div>No cosmic traits association data available to display</div>
                    ` : html `
                        <data-form
                                .data="${this._variantSummary}"
                                .config="${this._config}">
                        </data-form>
                    `}
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
                    id: "variant-traits-cosmic",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: () => {
                                    return html`
                                        <div class="d-flex justify-content-center align-items-center" id="${this._chartId}" style="flex: 1 0 auto"></div>
                                    `;
                                }
                            }
                        },
                    ],
                },
            ],
        };
    }
}

customElements.define("variant-summary-cs-cosmic-variant-traits", VariantSummaryCSCosmicVariantTraits);
