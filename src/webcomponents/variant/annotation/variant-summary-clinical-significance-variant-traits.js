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

export default class VariantSummaryClinicalSignificanceVariantTraits extends LitElement {

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
        this.COMPONENT_ID = "variant-summary-clinical-significance-trait-association";
        this._variant = {};
        this._chartId = "chart-clinical-significance-trait-association";
        this._chart = {};

        this._clinicalSignificanceGroups = [
            "benign",
            "likely benign",
            "uncertain significance",
            "likely pathogenic",
            "pathogenic",
            "other"
        ];

        this._starsGermline = [
            { status: "practice guideline", stars: 4 },
            { status: "reviewed by expert panel", stars: 3 },
            { status: "criteria provided, multiple submitters, no conflicts", stars: 2 },
            { status: "criteria provided, conflicting classifications", stars: 1 },
            { status: "criteria provided, single submitter", stars: 1 },
            { status: "CRITERIA_PROVIDED_SINGLE_SUBMITTER", stars: 1 },
            { status: "no assertion criteria provided", stars: 0 },
            { status: "no classification provided", stars: 0 },
            { status: "no classification for the individual variant", stars: 0 }
        ];

        // According to this: https://www.ncbi.nlm.nih.gov/clinvar/docs/review_status/#revstat_web:
        // Review status on submitted records (SCV)
        this.starsSCV = [
            {
                stars: 4,
                status: "practice guideline",
                description: "There is a submitted record with a classification from a practice guideline"
            },
            {
                stars: 3,
                status: "reviewed by expert panel",
                description: "There is a submitted record with a classification from an expert panel"
            },
            {
                stars: 1,
                status: "criteria provided, single submitter",
                description: "There is a single submitted record with a classification, where assertion criteria and evidence for the classification (or a public contact) were provided."
            },
            {
                stars: 0,
                status: "no assertion criteria provided",
                description: "There are one or more submitted records with a classification but without assertion criteria and evidence for the classification (or a public contact)."
            },
            {
                stars: 0,
                status: "no classification provided",
                description: "There are one or more submitted records without a classification."
            }
        ];
        // Review status on aggregate records (VCV and RCV)
        // 1. Germline: the ones in stars mapping. 2. Somatic
        this.starsSomatic = [
            {
                stars: 4,
                status: "practice guideline",
                description: "There is a submitted record with a classification from a practice guideline",
                link: "https://www.ncbi.nlm.nih.gov/clinvar/docs/review_guidelines/"
            },
            {
                stars: 3,
                status: "reviewed by expert panel",
                description: "There is a submitted record with a classification from an expert panel",
                link: "https://www.ncbi.nlm.nih.gov/clinvar/docs/review_guidelines/"
            },
            {
                stars: 2,
                status: "criteria provided, multiple submitters",
                description: "There are multiple submitted records with a somatic classification of clinical impact. Assertion criteria and evidence for the classification (or a public contact) were provided."
            },
            {
                stars: 1,
                status: "criteria provided, single submitter",
                description: "There is a single submitted record with a classification, where assertion criteria and evidence for the classification (or a public contact) were provided."
            },
            {
                stars: 0,
                status: "no assertion criteria provided",
                description: "There are one or more submitted records with a classification but without assertion criteria and evidence for the classification (or a public contact)."
            },
            {
                stars: 0,
                status: "no classification provided",
                description: "There are one or more submitted records without a classification."
            },
            {
                stars: 0,
                status: "no classification for the individual variant",
                description: "The variant was not classified directly in any submitted record; it was submitted to ClinVar only as part of a haplotype or a genotype."
            }
        ];


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
            this._variant = {...this.variant};
        }
    }

    #normalizeSignificance(sig) {
        const map = {
            benign: "benign",
            likely_benign: "likely benign",
            uncertain_significance: "uncertain significance",
            likely_pathogenic: "likely pathogenic",
            pathogenic: "pathogenic"
        };
        return map[sig] || "other";
    }

    #getClinvarTraitAssociations(traitAssociations) {
        // 1. Define starLevels and categories
        const starLevels = [4, 3, 2, 1, 0];
        const categories = starLevels.map(star => "★".repeat(star) + "☆".repeat(5 - star));

        const countsByStars = {};
        for (const star of starLevels) {
            countsByStars[star] = {};
            for (const sig of this._clinicalSignificanceGroups) {
                countsByStars[star][sig] = 0;
            }
        }

        const statusToStars = Object.fromEntries(
            this._starsGermline.map(entry => [entry.status, entry.stars])
        );

        for (const trait of traitAssociations) {
            const sigRaw = trait.variantClassification?.clinicalSignificance || "other";
            const sig = this.#normalizeSignificance(sigRaw);

            const reviewProp = trait.additionalProperties?.find(p => p.name === "ReviewStatus_in_source_file");
            const status = reviewProp?.value || "no classification provided";
            const stars = statusToStars[status];

            if (stars === undefined) continue;
            countsByStars[stars][sig]++;
        }

        const series = this._clinicalSignificanceGroups.map(sig => ({
            name: sig.charAt(0).toUpperCase() + sig.slice(1),
            data: starLevels.map(star => countsByStars[star][sig])
        }));

        Highcharts.chart(`${this._chartId}`, {
            chart: {
                type: 'bar'
            },
            title: {
                text: null,
            },
            xAxis: {
                categories: categories,
                title: {
                    text: 'Germline Review Stars'
                }
            },
            yAxis: {
                min: 0,
                allowDecimals: false,
                title: {
                    text: 'Number of Traits',
                    align: 'high'
                },
                labels: {
                    formatter: function () {
                        return Math.floor(this.value);
                    }
                }
            },
            legend: {
                reversed: true
            },
            plotOptions: {
                series: {
                    stacking: 'normal'
                }
            },
            series: series
        });



    }

    render() {
        if (!this._variant) {
            return nothing;
        }

        return html`
            <div class="card p-3">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Clinvar Review by Clinical Significance</h5>
                    <p class="text-secondary">ClinVar variant traits by germline review stars and clinical significance</p>

                </div>
                <div class="card-body pt-0 pb-0">
                    <data-form
                        .data="${this._variant}"
                        .config="${this._config}">
                    </data-form>
                    <div class="d-flex flex-wrap justify-content-between gap-3 p-3" id="${this._chartId}"></div>
                </div>
                <div class="card-footer text-muted">
                    <i class="far fa-clock me-2"></i>
                    Last updated
                </div>
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
                            id: "variant-traits-association",
                            // title: "Clinical Significance",
                            type: "custom",
                            field: "annotation.traitAssociation",
                            display: {
                                render: traitAssociation => {
                                    // Init chart
                                    this._chart = document.getElementById(`${this._chartId}`);
                                    this._chart.innerHTML = "";
                                    // Check if trait association exists
                                    // Filter evidences from ClinVar source only
                                    const clinvarTraitAssociations = traitAssociation.filter(e => e.source?.name?.toLowerCase() === 'clinvar');

                                    if (clinvarTraitAssociations?.length === 0) {
                                        this._chart.innerHTML = "No clinvar traits association data available to display."
                                    } else {
                                        this.#getClinvarTraitAssociations(clinvarTraitAssociations);
                                    }
                                }
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("variant-summary-clinical-significance-variant-traits", VariantSummaryClinicalSignificanceVariantTraits);
