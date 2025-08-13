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
            opencgaSession: {
                type: Object,
            },
            setting: {
                type: Object,
            }
        };
    }

    #init() {
        this._variant = {};
        this._dateSummary = {};
        this._chartDelId = "chart-deleterious";
    }

    update(changedProperties) {
        if (changedProperties.has("variant")) {
            this.variantObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        UtilsNew.initTooltip(this);
        this.querySelector("#summary-deleteriousness data-form").updateComplete.then(() => {
                UtilsNew.initTooltip(this, (event, api, tooltipEl) => {
                    this.#renderDelHeatmap();
                }, "qtip-custom-no-maxwidth qtip-custom-scroll");
        });
    }

    opencgaSessionObserver() {
        // 1. Extract deleterious sources
        const deleteriousSources = ['SpliceAI', 'Revel'];
        const deleteriousEntries = (this.opencgaSession.project.cellbase.sources || [])
            .filter(s => deleteriousSources.includes(s.name))
            .map(s => ({
                name: s.name,
                version: s.version || null,
                date: s.date
            }));

        // 2. Group by date
        this._sourceDateGroups = deleteriousEntries.reduce((acc, { name, version, date }) => {
            acc[date] = acc[date] || [];
            acc[date].push(version ? `${name} ${version}` : name);
            return acc;
        }, {});

        // 3. Date summary
        this._dateSummary = Object.entries(this._sourceDateGroups).map(([date, entries]) => {
            return `${this._formatDate(date)} (${entries.join(', ')} )`;
        });

        this._config = this.getDefaultConfig();
    }

    _formatDate(rawDate) {
        const y = rawDate.slice(0, 4);
        const m = rawDate.slice(4, 6);
        const d = rawDate.slice(6, 8);
        return `${y}-${m}-${d}`;
    }

    variantObserver() {
        if (this.variant) {
            // 1. Get the list of consequence types selected in settings
            // TODO: DeleteMe and use the only MANE one. Just for testing
            const { selectedConsequenceTypes } =
            VariantGridFormatter._consequenceTypeDetailFormatterFilter(
                this.variant.annotation.consequenceTypes,
                this.settings
            ) || [];

            this._variant = {};
            // 1. Get consequenceTypes transcriptId where transcript flags contain "MANE" and source="ensembl"
            /*
            const { maneConsequenceTypes } = VariantGridFormatter._consequenceTypeManeFilter(
                this.variant.annotation.consequenceTypes) || [];
            */
            // 2. Deleteriousness full heatmap
            let dataDel = [];
            selectedConsequenceTypes.forEach((ct, index) => {
                const scores = this._extractData(ct, index);
                const hasValidScore = Object.values(scores).some(metric => metric?.rawScore !== null);
                if (hasValidScore) {
                    dataDel.push({
                        id: ct.transcriptId,
                        scores: scores,
                        index: index,
                    })
                }
            });

            // 3. Summary predictors
            const summaryDel = this._summarizePredictors(dataDel);

            this._variant = {
                selected: selectedConsequenceTypes,
                dataDel: dataDel,
                summaryDel: summaryDel,
                ...this.variant
            };

            this._config = this.getDefaultConfig();
        }
    }

    _extractData(ct) {
        const scores = {
            sift: { score: null, qualitative: null, color: ""},
            polyphen: { score: null, qualitative: null, color: ""},
            cadd_scaled: { score: null, qualitative: null, color: ""},
            spliceai: { score: null, qualitative: null, color: ""},
            revel: { score: null, qualitative: null, color: ""},
        };

        // Substitution Scores
        const substitutionScores = ct.proteinVariantAnnotation?.substitutionScores ?? [];

        substitutionScores.forEach(({ score, source, description }) => {
            const key = source.toLowerCase();
            if (key in scores) {
                scores[key].score = score;
                // CAUTION!! to discuss: Use description if present, otherwise fallback to front-end interpretation
                scores[key].qualitative = description?.trim() ? description : this._getQualitativeValueFallback(key, score);
                // Assign color based on qualitative interpretation
                scores[key].color = this._getQualitativeColor(scores[key].qualitative);
            }
        });

        // 2. Splice Scores
        const spliceScores = ct.spliceScores;
        // 2.1 SpliceAI
        const splice = spliceScores?.[0]?.scores || {};
        const spliceMax = Math.max(splice.DS_AG || 0, splice.DS_AL || 0, splice.DS_DG || 0, splice.DS_DL || 0);
        if (spliceMax > 0) {
            scores.spliceai.score = spliceMax;
            scores.spliceai.qualitative = this._getQualitativeValueFallback('spliceai', spliceMax);
            scores.spliceai.color = this._getQualitativeColor(scores.spliceai.qualitative);
        }
        // 2.2 CADD
        const caddObj = (this.variant.annotation?.functionalScore || []).find(f => f.source === 'cadd_scaled');
        if (caddObj) {
            scores.cadd_scaled.score = caddObj.score;
            scores.cadd_scaled.qualitative = this._getQualitativeValueFallback('cadd_scaled', caddObj.score);
            scores.cadd_scaled.color = this._getQualitativeColor(scores.cadd_scaled.qualitative);
        }
        return scores;
    }

    _getQualitativeColor(qualitative = "") {
        const q = qualitative.toLowerCase().trim();

        const colorMap = [
            { keywords: ["benign", "tolerated", "low", "bottom 90%"], color: "#13a574" },
            { keywords: ["potentially pathogenic", "possibly damaging", "top 10%"], color: "#f7b233" },
            { keywords: ["moderate", "top 5%"], color: "#dd7a16" },
            { keywords: ["likely pathogenic", "probably damaging", "top 1%"], color: "#d9534f" },
            { keywords: ["deleterious", "damaging", "pathogenic", "high", "top 0.1%"], color: "#d9534f" },
        ];
        for (const { keywords, color } of colorMap) {
            if (keywords.some(k => q.includes(k))) {
                return color;
            }
        }
        return "#aaa"; // fallback gray
    }

    _getQualitativeValueFallback(source, score) {
        switch (source.toLowerCase()) {
            case "sift":
                // https://ionreporter.thermofisher.com/ionreporter/help/GUID-2097F236-C8A2-4E67-862D-0FB5875979AC.html
                return score <= 0.05 ? "Deleterious" : "Tolerated";
            case "polyphen":
                // https://ionreporter.thermofisher.com/ionreporter/help/GUID-57A60D00-0654-4F80-A8F9-F6B6A48D0278.html
                if (score > 0.85) return "Probably Damaging";
                if (score > 0.15) return "Possibly Damaging";
                return "Benign";
            case "revel":
                if (score >= 0.75) return "Likely Pathogenic";
                if (score >= 0.5) return "Potentially Pathogenic";
                return "Benign";
            case "cadd_scaled":
                // "Predicted to be within the..."
                if (score >= 30) return "Top 0.1%"; // Extremely deleterious
                if (score >= 20) return "Top 1%"; // Highly deleterious
                if (score >= 15) return "Top 5%"; // Likely deleterious
                if (score >= 10) return "Top 10%"; // Possibly deleterious
                if (score < 10) return "Bottom 90%"; // Likely Benign
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

    #renderDelHeatmap() {
        const predictors = ['sift', 'polyphen', 'revel', 'cadd_scaled', 'spliceai'];

        const heatmapData = [];
        const rowHeightPx = 14;
        const labelSize = 10;
        const numRows = this._variant.dataDel.length;

        this._variant.dataDel.forEach((transcript, rowIndex) => {
            predictors.forEach((predictor, colIndex) => {
                const score = transcript.scores[predictor];
                heatmapData.push({
                    x: colIndex,
                    y: rowIndex,
                    value: 1,
                    color: score?.color || '#eeeeee',
                    custom: {
                        label: score?.qualitative || "No data",
                        rawScore: score?.score != null ? score.score : "N/A"
                    }
                });
            });
        });

        Highcharts.chart(`${this._chartDelId}`, {
            chart: {
                type: 'heatmap',
                plotBorderWidth: 0,
                height: numRows * rowHeightPx + 80,  // enough height for rows + padding
                width: predictors.length * 40 + 400, // room for squares + labels
                marginLeft: 150, // <-- ensure transcript IDs are visible
                marginRight: 10,
                marginTop: 50,
                marginBottom: 30,
                spacing: [0, 0, 0, 0]
            },
            title: {text: null},
            xAxis: {
                categories: predictors,
                title: { text: null },
                opposite: true,
                labels: {
                    rotation: 0,
                    align: 'center',
                    style: { fontSize: labelSize },
                },
            },
            yAxis: {
                categories: this._variant.dataDel.map(v => v.id),
                title: null,
                reversed: true,
                labels: {
                    style: { fontSize: labelSize,  whiteSpace: 'nowrap'  }
                },
                lineWidth: 0,
                tickLength: 0,
                gridLineWidth: 0,
            },
            colorAxis: {
                min: 0,
                max: 1,
                visible: false,
            },
            tooltip: {
                formatter: function () {
                    const transcript = this.series.yAxis.categories[this.point.y];
                    const predictor = this.series.xAxis.categories[this.point.x];
                    const label = this.point.custom.label;
                    const rawScore = this.point.custom.rawScore;
                    return `<b>${transcript}</b><br>${predictor}<br>Score: ${rawScore}<br>${label}`;
                }
            },
            plotOptions: {
                series: {
                    borderWidth: 1,
                    borderColor: '#ffffff',
                    pointPadding: 0,
                    colsize: 1,
                    rowsize: 1,
                }
            },
            series: [{
                name: 'Scores',
                data: heatmapData,
                dataLabels: {
                    enabled: false
                }
            }],
            legend: {enabled: false},
            credits: {enabled: false},
        });
    }

    _summarizePredictors(data) {
            const predictors = ["sift", "polyphen", "revel", "cadd_scaled", "spliceai"];
            const transcriptAgnostic = ["cadd_scaled", "spliceai"];

            const summary = {};

            predictors.forEach(predictor => {
                if (transcriptAgnostic.includes(predictor)) {
                    // Take first non-null qualitative
                    const firstNonNull = data.find(d => d.scores[predictor].qualitative !== null);
                    if (firstNonNull) {
                        summary[predictor] = {
                            qualitative: UtilsNew.capitalizeWords(firstNonNull.scores[predictor].qualitative),
                            color: firstNonNull.scores[predictor].color,
                            score: firstNonNull.scores[predictor].score,
                        };
                    }
                    else {
                        summary[predictor] = {
                            qualitative: "N/A",
                            color: "#888888"
                        };
                    }
                } else {
                    // Transcript-specific
                    const entries = data
                        .map(d => d.scores[predictor])
                        .filter(s => s.qualitative !== null && s.color !== "");

                    if (entries.length === 0) {
                        summary[predictor] = { qualitative: "N/A", color: "#888888" };
                        return;
                    }

                    const total = entries.length;
                    const redCount = entries.filter(e => e.color === "#d9534f").length;
                    const greenCount = entries.filter(e => e.color === "#13a574").length;
                    const yellowCount = entries.filter(e => e.color === "#f7b233").length;
                    const darkYellowCount = entries.filter(e => e.color === "#dd7a16").length;

                    let finalColor = "";
                    if (greenCount === total) {
                        finalColor = "#13a574";
                    } else if (redCount > total / 2) {
                        finalColor = "#d9534f";
                    } else if (redCount > 0 || darkYellowCount > 0) {
                        finalColor = "#dd7a16";
                    } else if (yellowCount > 0) {
                        finalColor = "#f7b233";
                    } else {
                        finalColor = "#13a574";
                    }

                    // Pick a qualitative value from the original matching finalColor
                    let match = entries.find(e => e.color === finalColor);
                    if (!match && finalColor === "#dd7a16" && redCount > 0) {
                        match = entries.find(e => e.color === "#d9534f");
                    }
                    debugger
                    summary[predictor] = {
                        qualitative: match ? UtilsNew.capitalizeWords(match.qualitative) : null,
                        color: finalColor
                    };
                }
            });

            return summary;
    }

    render() {
        if (!this._variant) {
            return nothing;
        }

        return html`
            <div class="card p-3 me-2">
                <div class="card-header border-0 d-flex justify-content-between mb-2">
                    <h5 class="fs-5 fw-bold me-2">
                        Deleteriousness
                    </h5>
                    <a tooltip-title="Deleterious Scores" tooltip-text="${VariantGridFormatter.deleteriousTooltipSummaryContent()}">
                        <i class="fa fa-info-circle text-info"></i>
                    </a>
                </div>
                <div class="card-body pt-0 pb-0" id="summary-deleteriousness">
                    <data-form
                        .data="${this._variant}"
                        .config="${this._config}">
                    </data-form>
                </div>
                <div class="card-divider"></div>
                <div class="text-muted fw-light fs-7">
                    <i class="far fa-clock me-2 text-gray-700"></i> ${this._dateSummary.join(' · ')}
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
                    id: "ct-deleriousness",
                    display: {
                        separationClassName: "",
                    },
                    elements: [
                        {
                            id: "deleteriousness-data",
                            type: "custom",
                            field: "summaryDel",
                            display: {
                                separationClassName: "",
                                render: summaryDel => {
                                    return html`
                                        <a tooltip-title="Heatmap"
                                           tooltip-text="<div id='${this._chartDelId}' style='width:100%;height:100%;min-width:300px;min-height:200px;'></div>">
                                            <div class="d-flex justify-content-between">
                                                ${Object.entries(summaryDel).map(([predictor, value]) => {
                                                    return html`
                                                        <div class="d-flex flex-column me-2">
                                                            <div class="card-category">${VariantGridFormatter.getDeleteriousPredictorDisplayName(predictor)}</div>
                                                            <h4 class="d-flex flex-column">
                                                                <div style="color: ${value?.color}">
                                                                    ${value?.qualitative}
                                                                </div>
                                                            </h4>
                                                        </div>
                                                    `;
                                                })}
                                            </div>
                                        </a>
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

customElements.define("variant-summary-deleteriousness", VariantSummaryDeleteriousness);
