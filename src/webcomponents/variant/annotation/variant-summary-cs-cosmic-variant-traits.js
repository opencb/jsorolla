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
            this.#renderChart()
        });
    }

    // Helper
    _getAdditionalProp(item, propName) {
        var found = null;
        for (var i = 0; i < item.additionalProperties.length; i++) {
            if (item.additionalProperties[i].name === propName) {
                found = item.additionalProperties[i].value;
                break;
            }
        }
        return found;
    }

    variantObserver() {
        if (this.variant) {
            this._variantSummary = this._summarize();
        }
    }

    _summarize() {
        // Step 1: Filter data by rules
        const filtered = this.variant.annotation.traitAssociation.filter(item => {
            const isCosmic = item.source?.name?.toLowerCase() === "cosmic";
            const isPrimary = item.somaticInformation?.tumourOrigin?.toLowerCase() === "primary";
            const somaticStatus = this._getAdditionalProp(item, "Mutation Somatic Status");
            const isConfirmedSomatic = somaticStatus && somaticStatus.toLowerCase().includes("confirmed somatic");
            const geneSymbols = item.genomicFeatures
                .filter(f => f.featureType === "gene")
                .map(f => f.xrefs?.symbol)
                .filter(sym => sym && isNaN(sym)); // exclude numeric-only
            return isCosmic && isPrimary && isConfirmedSomatic && geneSymbols.length > 0;
        });

        // Step 2: Group by histologySubtype + primarySite
        const groups = {};
        filtered.forEach(item => {
            const subtype = item.somaticInformation?.histologySubtype || "Unknown";
            const site = item.somaticInformation?.primarySite || "Unknown";
            const key = `${subtype}||${site}`;
            if (!groups[key]) {
                groups[key] = {
                    histologySubtype: subtype,
                    primarySite: site,
                    fathmmScores: [],
                    count: 0
                };
            }
            const fathmmScore = parseFloat(this._getAdditionalProp(item, "FATHMM Score"));
            if (!isNaN(fathmmScore)) groups[key].fathmmScores.push(fathmmScore);
            groups[key].count += 1;
        });

        // Median helper
        const median = arr => {
            const sorted = [...arr].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        };

        // Step 3: Prepare chart data
        const xCategories = [...new Set(Object.values(groups).map(g => g.histologySubtype))];
        const yCategories = [...new Set(Object.values(groups).map(g => g.primarySite))];

        const chartData = Object.values(groups).map(g => ({
            name: `${g.histologySubtype} - ${g.primarySite}`,
            x: xCategories.indexOf(g.histologySubtype),
            y: yCategories.indexOf(g.primarySite),
            z: g.count, // This is size (replace with proportion if available)
            colorValue: median(g.fathmmScores) || 0
        }));
        return {chartData, xCategories, yCategories};

    }

    #renderChart() {
        Highcharts.chart(`${this._chartId}`, {
            chart: {
                type: 'bubble',
                plotBorderWidth: 1,
                zoomType: 'xy'
            },
            title: {
                text: 'Primary Tumor Drivers by Histology and Site'
            },
            xAxis: {
                categories: this._variantSummary.yCategories,
                title: { text: 'Primary Site' },
            },
            yAxis: {
                categories: this._variantSummary.xCategories,
                title: { text: 'Histopathology Subtype' },
            },
            colorAxis: {
                min: 0,
                max: 1,
                stops: [
                    [0, '#3060cf'],
                    [0.5, '#fffbbc'],
                    [1, '#c4463a']
                ]
            },
            tooltip: {
                pointFormat: `
                    <b>{point.name}</b><br/>
                    Count: {point.z}<br/>
                    Median FATHMM: {point.colorValue:.3f}
                `,
            },
            series: [{
                data: this._variantSummary.chartData,
                minSize: 10,
                maxSize: 50,
                colorKey: 'colorValue'
            }]
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
