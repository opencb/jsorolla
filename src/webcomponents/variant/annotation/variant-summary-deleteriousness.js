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

export default class VariantSummaryDeleteriousness extends LitElement {

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

    updated(changedProperties) {
        this.querySelector("#summary-deleteriousness data-form").updateComplete.then(() => {
            this._variant.dataDel.forEach(data => {
                if (this.querySelector(`#chart-deleteriousness-${data.index}`)) {
                    this.#renderTranscriptRadar(`chart-deleteriousness-${data.index}`, data.scores, data.id)
                }
            });
        });
    }

    variantObserver() {
        if (this.variant) {
            // 1. Get the list of consequence types selected in settings
            /*
            const { selectedConsequenceTypes } =
            VariantGridFormatter._consequenceTypeDetailFormatterFilter(
                this.variant.annotation.consequenceTypes,
                this.settings
            ) || [];
             */
            this._variant = {};
            // 1. Get consequenceTypes transcriptId where transcript flags contain "MANE" and source="ensembl"
            const { maneConsequenceTypes } = VariantGridFormatter._consequenceTypeManeFilter(
                this.variant.annotation.consequenceTypes) || [];
            // 2. Deleteriousness
            let dataDel = [];
            maneConsequenceTypes.forEach((ct, index) => {
                const scores = this._extractRadarData(ct, index);
                const hasValidScore = Object.values(scores).some(metric => metric?.normScore !== null);
                dataDel.push({
                    id: ct.transcriptId,
                    scores: scores,
                    index: index,
                    hasValidScore: hasValidScore,
                })
            });
            // 3. Conservation
            const dataCons =  (this.variant.annotation?.conservation || []).map(item => ({
                source: item.source,
                score: item.score?.toFixed(3),
                // color: colorMap(item.source, item.score)
            }));
            debugger
            this._variant = {
                selected: maneConsequenceTypes,
                dataDel: dataDel,
                dataCons: dataCons,
                ...this.variant
            };

            this._config = this.getDefaultConfig();
        }
    }

    _normalizeScore(source, value) {
        switch (source.toLowerCase()) {
            case 'sift':
                // SIFT INVERTED to match radar plot logic
                return 1 - value; // SIFT: 0 = deleterious, 1 = tolerated, SIFT INVERTED: 1: deleterious, 0: tolerated
                // return value;
            case 'revel':
            case 'polyphen':
            case 'spliceai':
                // already in 0-1 range
                return value;
            case 'cadd_scaled':
                return Math.min(value / 40, 1); // typical CADD_PHRED scores max around 40
            default:
                return null;
        }
    };

    _extractRadarData(ct) {
        const scores = {
            sift: { score: null, qualitative: null, normScore: null, color: ""},
            polyphen: { score: null, qualitative: null, normScore: null, color: ""},
            cadd_scaled: { score: null, qualitative: null, normScore: null, color: ""},
            spliceai: { score: null, qualitative: null, normScore: null, color: ""},
            revel: { score: null, qualitative: null, normScore: null, color: ""},
        };

        const { proteinVariantAnnotation, spliceScores } = ct;
        const substitutionScores = proteinVariantAnnotation?.substitutionScores || [];

        substitutionScores.forEach(({ score, source, description }) => {
            const key = source.toLowerCase();
            if (key in scores) {
                scores[key].score = score;
                scores[key].normScore = this._normalizeScore(key, score);
                // Use description if present, otherwise fallback to front-end interpretation
                scores[key].qualitative = description?.trim()
                    ? description
                    : this._getQualitativeValue(key, score);
                // Assign color based on qualitative interpretation
                scores[key].color = this._getQualitativeColor(scores[key].qualitative);
            }
        });

        const splice = spliceScores?.[0]?.scores || {};
        const spliceMax = Math.max(
            splice.DS_AG || 0,
            splice.DS_AL || 0,
            splice.DS_DG || 0,
            splice.DS_DL || 0
        );
        if (spliceMax > 0) {
            scores.spliceai.score = spliceMax;
            scores.spliceai.normScore = this._normalizeScore('spliceai', spliceMax);
            scores.spliceai.qualitative = this._getQualitativeValue('spliceai', spliceMax);
            scores.spliceai.color = this._getQualitativeColor(scores.spliceai.qualitative);
        }

        const caddObj = (this.variant.annotation?.functionalScore || []).find(f => f.source === 'cadd_scaled');
        if (caddObj) {
            scores.cadd_scaled.score = caddObj.score;
            scores.cadd_scaled.normScore = this._normalizeScore('cadd_scaled', caddObj.score);
            scores.cadd_scaled.qualitative = this._getQualitativeValue('cadd_scaled', caddObj.score);
            scores.cadd_scaled.color = this._getQualitativeColor(scores.cadd_scaled.qualitative);
        }
        return scores;
    }

    _getQualitativeColor(qualitative = "") {
        const q = qualitative.toLowerCase().trim();

        const colorMap = [
            { keywords: ["potentially pathogenic", "possibly damaging"], color: "#f7b233" },
            { keywords: ["likely pathogenic", "probably damaging"], color: "#d9534f" },
            { keywords: ["moderate"], color: "#dd7a16" },
            { keywords: ["deleterious", "damaging", "pathogenic", "high"], color: "#d9534f" },
            { keywords: ["benign", "tolerated", "low"], color: "#13a574" },
        ];
        for (const { keywords, color } of colorMap) {
            if (keywords.some(k => q.includes(k))) {
                return color;
            }
        }
        return "#aaa"; // fallback gray
    }

    _getQualitativeValue(source, score) {
        switch (source.toLowerCase()) {
            case "sift":
                // https://ionreporter.thermofisher.com/ionreporter/help/GUID-2097F236-C8A2-4E67-862D-0FB5875979AC.html
                return score <= 0.05 ? "deleterious" : "tolerated";
            case "polyphen":
                // https://ionreporter.thermofisher.com/ionreporter/help/GUID-57A60D00-0654-4F80-A8F9-F6B6A48D0278.html
                if (score > 0.85) return "Probably Damaging";
                if (score > 0.15) return "Possibly Damaging";
                return "benign";
            case "revel":
                if (score >= 0.75) return "likely Pathogenic";
                if (score >= 0.5) return "Potentially Pathogenic";
                return "benign";
            case "cadd_scaled":
                // "Predicted to be within the..."
                if (score >= 30) return "Top 0.1% most deleterious SNVs";
                if (score >= 20) return "Top 1% most deleterious SNVs";
                return "Top 10% most deleterious SNVs";
            case "spliceai":
                if (score >= 0.8) return "High";
                if (score >= 0.5) return "Moderate";
                //if (score >= 0.2) return 'Low';
                // return 'Minimal/None';
                return "Low";
            default:
                return '';
        }
    }

    #renderTranscriptRadar(chart, data, transcriptId) {
        Highcharts.chart(`${chart}`, {
            chart: {
                polar: true,
                //type: 'line',
                type: 'area',
                backgroundColor: 'transparent',
                height: 200
            },
            title: { text: '' },
            subtitle: {
                text: transcriptId || '',
                style: {
                    fontSize: '12px',
                    color: '#666'
                }
            },
            pane: { size: '80%' },
            legend: {
                enabled: false
            },
            xAxis: {
                categories: ['SIFT', 'PolyPhen', 'REVEL', 'CADD', 'SpliceAI'],
                tickmarkPlacement: 'on',
                lineWidth: 0
            },
            yAxis: {
                gridLineInterpolation: 'polygon',
                lineWidth: 0,
                min: 0,
                max: 1
            },
            tooltip: {
                shared: false,
                formatter: function () {
                    const point = this.point;
                    return `
                        <b>${point.category}</b><br/>
                        <b style="color: ${point.color}">${point.qualitative ?? 'N/A'}</b><br/>
                        <b>Raw Score: ${point.rawScore.toFixed(4) ?? 'N/A'}</b><br/>
                        <i>Normalized Score: <i>${point.y.toFixed(4)}</i>
                    `;
                }
            },
            plotOptions: {
                series: {
                    enableMouseTracking: true
                },
                area: {
                    fillOpacity: 0.4
                }
            },
            series: [{
                name: 'Deleteriousness',
                pointPlacement: 'on',
                color: 'rgba(100, 100, 100, 0.5)', // semi-transparent gray fill
                fillOpacity: 0.4,
                data: [
                    {
                        y: data.sift.normScore,
                        rawScore: data.sift.score,
                        qualitative: data.sift.qualitative,
                        category: 'SIFT',
                        color: data.sift.color,
                    },
                    {
                        y: data.polyphen.normScore,
                        rawScore: data.polyphen.score,
                        qualitative: data.polyphen.qualitative,
                        category: 'PolyPhen',
                        color: data.polyphen.color,
                    },
                    {
                        y: data.revel.normScore,
                        rawScore: data.revel.score,
                        qualitative: data.revel.qualitative,
                        category: 'REVEL',
                        color: data.revel.color,
                    },
                    {
                        y: data.cadd_scaled.normScore,
                        rawScore: data.cadd_scaled.score,
                        qualitative: data.cadd_scaled.qualitative,
                        category: 'CADD',
                        color: data.cadd_scaled.color,
                    },
                    {
                        y: data.spliceai.normScore,
                        rawScore: data.spliceai.score,
                        qualitative: data.spliceai.qualitative,
                        category: 'SpliceAI',
                        color: data.spliceai.color,
                    }
                ],
            }],
            credits: {
                enabled: false
            },
        });
    };

    render() {
        if (!this._variant) {
            return nothing;
        }

        return html`
            <div class="card p-3 me-2">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Deleteriousness</h5>
                    <p class="text-secondary">Consequence types linked to transcripts flagged as MANE-selected and source Ensembl</p>
                </div>
                <div class="card-body pt-0 pb-0" id="summary-deleteriousness">
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
                    id: "ct-deleriousness",
                    display: {},
                    elements: [
                        {
                            id: "deleteriousness-chart",
                            type: "custom",
                            field: "dataDel",
                            // showLabel: false,
                            display: {
                                render: dataDel => {
                                    let hasValidScore = dataDel.some(data => data.hasValidScore);
                                    if (!hasValidScore) {
                                        return html`<div>No deleteriousness scores</div>`;
                                    }
                                    return html`
                                        ${dataDel.map(data => {
                                            const chartId = `chart-deleteriousness-${data.index}`;
                                            if (data.hasValidScore) {
                                                return html`
                                                    <div id="${chartId}" style="height: 200px; margin: auto;"></div>
                                                `;
                                            }
                                            return nothing;
                                        })}
                                    `;
                                },
                            }
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("variant-summary-deleteriousness", VariantSummaryDeleteriousness);
