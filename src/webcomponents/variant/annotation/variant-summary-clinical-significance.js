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
import VariantGridFormatter from "../variant-grid-formatter.js";

export default class VariantSummaryClinicalSignificance extends LitElement {

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
        this.COMPONENT_ID = "variant-summary-clinical-significance";
        this._variant = {};
        this._chartCSId = "chart-clinical-significance";
        this._chartAcmgId = "chart-acmg";
        this._isMane = true;
        this._dataCS = [];
        this._dataAcmg = [];

        this._maneTranscriptIds = [];

        this._config = this.getDefaultConfig();
    }


    update(changedProperties) {
        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        this.querySelector("data-form").updateComplete.then(() => {
            if (this.querySelector(`#${this._chartCSId}`)) {
                this.#renderClinicalSignificanceSummary();
            }

            if (this.querySelector(`#${this._chartAcmgId}`)) {
                this.#renderAcmgSummary();
            }
        });
    }

    #initManeConsequenceTypes() {
        // 1. Get consequenceTypes transcriptId where transcript flags contain "MANE" and source="ensembl"
        const { maneConsequenceTypes } = VariantGridFormatter._consequenceTypeManeFilter(
            this.variant.annotation.consequenceTypes,
            this.settings
        ) || [];

        this._maneTranscriptIds = maneConsequenceTypes.map(ct => ct.transcriptId);
    }
    variantObserver() {
        if (this.variant) {
            this.#initManeConsequenceTypes();
            this._variant = {
                isMane: this._isMane,
                ...this.variant
            };
        }
    }

    onManeChange(event) {
        this._variant.isMane = event.detail.value;
        this._variant = {...this._variant};
        this.requestUpdate();
    }

    #renderClinicalSignificanceSummary() {
        Highcharts.chart(`${this._chartCSId}`, {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent',
                height: 150,       // reduce vertical space
                width: 300,
                spacing: [0, 0, 0, 0], // top, right, bottom, left padding
                margin: [0, 0, 0, 0],
            },
            title: {
                text: "Clin.Sig.",
                align: 'center',
                verticalAlign: 'middle',
                style: { fontSize: '14px' },
                y: 29,
            },
            plotOptions: {
                pie: {
                    // size: '60%', // Donut size
                    innerSize: '70%',
                    startAngle: -90,
                    endAngle: 90,
                    center: ['50%', '70%'],
                    dataLabels: {
                        enabled: true,
                        distance: 15,
                        format: '{point.name}: {point.y}',
                        style: {
                            color: '#666', // light grey
                            fontWeight: "normal",
                            textOutline: "none",
                            fontSize: "10px",
                        },
                    }
                }
            },
            series: [{
                name: 'Clinical significance classification',
                data: this._dataCS,
            }],
            tooltip: {
                useHTML: true,
                pointFormat: '<b>{point.y}</b> clinical significance classification(s)'
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
        });
    }

    #renderAcmgSummary() {
        Highcharts.chart(`${this._chartAcmgId}`, {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent',
                height: 150,       // reduce vertical space
                width: 300,
                spacing: [0, 0, 0, 0], // top, right, bottom, left padding
                margin: [0, 0, 0, 0],
            },
            title: {
                text: "ACMG",
                align: 'center',
                verticalAlign: 'middle',
                style: { fontSize: '14px' },
                y: 29,
            },
            plotOptions: {
                pie: {
                    // size: '60%', // Donut size
                    innerSize: '70%',
                    startAngle: -90,
                    endAngle: 90,
                    center: ['50%', '70%'],
                    dataLabels: {
                        enabled: true,
                        distance: 15,
                        format: '{point.name}: {point.y}',
                        style: {
                            color: '#666', // light grey
                            fontSize: '10px',
                            textOutline: 'none',
                        },
                    },
                }
            },
            series: [{
                name: 'ACMG classification',
                data: this._dataAcmg,
            }],
            tooltip: {
                useHTML: true,
                pointFormat: '<b>{point.y}</b> acmg classification(s) are {point.name} {point.strength}'
            },
            credits: {
                enabled: false
            },
        });
    }


    render() {
        if (!this._variant) {
            return nothing;
        }

        return html`
            <div class="card p-3">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Clinical Significance</h5>
                    <p class="text-secondary">Clinical significance in the consequence types evidences</p>

                </div>
                <div class="card-body pt-0 pb-0">
                    <data-form
                        .data="${this._variant}"
                        .config="${this._config}"
                        @fieldChange="${event => this.onManeChange(event)}">
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
                    id: "cs-info",
                    display: {
                        layout: [
                            {
                                elements: [
                                    {
                                        id:"is-mane",
                                        className: "",
                                    },
                                    {
                                        id:"total-evidences",
                                        className: "",
                                    },
                                ]
                            },
                        ],
                    },
                    elements: [
                        {
                            id: "is-mane",
                            // title: "Mane",
                            type: "toggle-buttons",
                            allowedValues: ["MANE", "ALL"],
                            defaultValue: "MANE",
                            field: "isMane",
                            display: {
                                width: "9",
                                classesLabel: "btn btn-outline-dark px-2 py-0 fs-7"
                            }
                        },
                        {
                            id: "total-evidences",
                            title: "Evidences",
                            type: "custom",
                            field: "evidences",
                            display: {
                                render: evidences => {
                                    let selectedEvidences = evidences;
                                    if (this._variant.isMane === "MANE") {
                                        selectedEvidences = evidences.filter(evidence =>
                                            this._maneTranscriptIds.includes(evidence.genomicFeature?.transcriptId)
                                        );
                                    }
                                    return html`
                                        <div class="">${selectedEvidences.length}</div>
                                    `;
                                }
                            },
                        },
                    ],
                },
                {
                    // id: "variant-summary-clinical-significance-charts",
                    display: {
                        layout: [
                            {
                                className: "d-flex",
                                elements: [
                                    {
                                        id:"evidences-clinical-significance-chart",
                                        className: "",
                                    },
                                    {
                                        id:"evidences-acmg-chart",
                                        className: "",
                                    },
                                ]
                            },
                        ],
                    },
                    elements: [
                        {
                            id: "evidences-clinical-significance-chart",
                            type: "custom",
                            field: "evidences",
                            display: {
                                render: evidences => {
                                    // Reset CS data
                                    this._dataCS = [];
                                    // Filter evidences based on MANE status
                                    const relevantEvidences = this._variant.isMane === "MANE"
                                        ? evidences.filter(evidence =>
                                            this._maneTranscriptIds.includes(evidence.genomicFeature?.transcriptId))
                                        : evidences;
                                    // Count clinical significance
                                    const countsCS = VariantUtils.countEvidencesPerClinicalSignificance(relevantEvidences);
                                    // Validate data
                                    const hasData = countsCS && Object.values(countsCS).some(val => val && val !== 0);
                                    if (!hasData) {
                                        return html`<div>No clinical significance data available to display</div>`;
                                    }
                                    // Map and render chart
                                    this._dataCS = VariantUtils.mapClinicalSignificanceToColor(countsCS);
                                    return html`
                                        <div
                                            class="d-flex"
                                            id="${this._chartCSId}">
                                        </div>
                                    `;
                                }
                            },
                        },
                        {
                            id: "evidences-acmg-chart",
                            type: "custom",
                            field: "evidences",
                            display: {
                                render: evidences => {
                                    // Reset data
                                    this._dataAcmg = [];
                                    // Select relevant evidences based on MANE status
                                    const relevantEvidences = evidences.filter(evidence => {
                                        const transcriptId = evidence.genomicFeature?.transcriptId;
                                        return this._variant.isMane === "MANE"
                                            ? this._maneTranscriptIds.includes(transcriptId)
                                            : transcriptId?.startsWith("ENST");
                                    });
                                    // Get ACMG evidence counts
                                    const countsAcmg = VariantUtils.countEvidencesAcmg(relevantEvidences);
                                    // Check if there's valid ACMG data to display
                                    const hasData = countsAcmg && Object.values(countsAcmg).some(val => val && val !== 0);
                                    if (!hasData) {
                                        return html`<div>No acmg data available to display.</div>`;
                                    }
                                    // Map and render chart
                                    this._dataAcmg = VariantUtils.mapAcmgToColor(countsAcmg);
                                    return html`
                                        <div
                                            class="d-flex"
                                            id="${this._chartAcmgId}"
                                        ></div>
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

customElements.define("variant-summary-clinical-significance", VariantSummaryClinicalSignificance);
