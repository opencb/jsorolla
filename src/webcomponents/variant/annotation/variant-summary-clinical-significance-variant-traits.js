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

        this.groups = ["benign", "likely_benign", "uncertain_significance", "likely_pathogenic", "pathogenic", "conflicting"];
        this.starsMapping = {
            benign: 1,
            likely_benign: 2,
            uncertain_significance: 3,
            likely_pathogenic: 4,
            pathogenic: 5,
            conflicting: 0
        };


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

    // Function to get subgroup from clinical significance string (lowercase)
    #getGroups(cs) {
        if (!cs) return "conflicting";
        cs = cs.toLowerCase();
        if (this.groups.includes(cs)) return cs;
        return "conflicting";
    }

    #getClinvarTraitAssociations(traitAssociation) {

        // Define clinical significance groups for stacking

        // Process evidence to fill counts by group and stars
        const counts = {};
        // Initialize counts for each group and star rating (0-5 stars)
        this.groups.forEach(g => counts[g] = [0, 0, 0, 0, 0, 0]); // 6 star levels: 0 to 5 stars
        traitAssociation.forEach(ta => {
            const clinicalSignificance = ta.variantClassification?.clinicalSignificance;
            const group = this.#getGroups(clinicalSignificance);
            const stars = this.starsMapping[this.#getGroups(clinicalSignificance)] || 0;
            counts[group][stars]++;
        });

        // Prepare Highcharts data series (stacked bar chart)
        const starLabels = ['☆☆☆☆☆','★☆☆☆☆','★★☆☆☆','★★★☆☆','★★★★☆','★★★★★'];
        const series = this.groups.map(group => ({
            name: group.charAt(0).toUpperCase() + group.slice(1).replace(/_/g, ' '), // e.g. "Likely pathogenic"
            data: counts[group]
        }));

        Highcharts.chart(`${this._chartId}`, {
            chart: {
                type: 'bar',
                height: 400,
            },
            title: {
                text: ""
            },
            xAxis: {
                categories: starLabels,
                title: { text: 'Review Stars' },
                labels: { style: { fontSize: '14px' } }
            },
            yAxis: {
                min: 0,
                title: { text: 'Number of variant traits' },
                allowDecimals: false
            },
            legend: { reversed: true },
            plotOptions: { series: { stacking: 'normal' } },
            series,
            credits: { enabled: false }
        });

    }

    render() {
        if (!this._variant) {
            return nothing;
        }

        return html`
            <div class="card p-3">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">ClinVar Stars Ratings by Clinical Significance</h5>
                    <p class="text-secondary"></p>

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
