/*
 * Copyright 2015-2016 OpenCB
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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "./../../utilsNew.js";
import "./annotation/cellbase-variant-annotation-summary.js";
import "./annotation/variant-consequence-type-view.js";
import "./annotation/cellbase-population-frequency-grid.js";
import "./annotation/variant-annotation-clinical-view.js";
import "./variant-cohort-stats.js";
import "./opencga-variant-samples.js";


export default class VariantBrowserDetail extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            variantId: {
                type: String
            },
            variant: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ovdv-" + UtilsNew.randomString(6);
        this.detailActiveTabs = {};
        this._config = this.getDefaultConfig();
    }

    firstUpdated(_changedProperties) {
        this._config = { ...this.getDefaultConfig(), ...this.config };
        for (let view of this._config.views) {
            switch (view.id) {
                case "cohortStats":
                    this.cohortConfig = { cohorts: view.cohorts };
                    break;
            }
        }
    }

    updated(changedProperties) {
        if (changedProperties.has("variantId")) {
            this.variantIdObserver();
        }

    }

    variantIdObserver() {
        if (this.cellbaseClient) {
            if (this.variantId) {
                this.cellbaseClient.get("genomic", "variant", this.variantId, "annotation", { assembly: this.opencgaSession.project.organism.assembly }, {})
                    .then(response => {
                        this.variant = { id: this.variantId, annotation: response.responses[0].results[0] };
                        this.variantAnnotation = response.response[0].result[0];
                        this.numberConsequenceTypes = 0;
                        this.numberPopulationFrequencies = 0;
                        this.numberVTA = 0;
                        this.numberGTA = 0;

                        if (this.variantAnnotation.geneTraitAssociation != null) {
                            this.numberConsequenceTypes = this.variantAnnotation.consequenceTypes.length;
                            this.numberPopulationFrequencies = UtilsNew.isNotEmptyArray(this.variantAnnotation.populationFrequencies) ? this.variantAnnotation.populationFrequencies.length : 0;
                            this.numberVTA = UtilsNew.isNotUndefinedOrNull(this.variantAnnotation.traitAssociation) ? this.variantAnnotation.traitAssociation.length : 0;
                            this.numberGTA = UtilsNew.isNotUndefinedOrNull(this.variantAnnotation.geneTraitAssociation) ? this.variantAnnotation.geneTraitAssociation.length : 0;
                        }
                    });
            } else {
                this.variant = null;
            }
        }
    }

    _changeBottomTab(e) {
        let _activeTabs = {};
        for (let detail of this._config.views) {
            _activeTabs[detail.id] = (detail.id === e.currentTarget.dataset.id);
        }
        this.detailActiveTabs = _activeTabs;
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            title: "Selected Variant",
            showTitle: true,
            items: [
                {
                    id: "annotationSummary",
                    name: "Summary",
                    active: true,
                    render: (variant, active) => {
                        return html`
                        <cellbase-variant-annotation-summary    
                            .variantAnnotation="${variant.annotation}"
                            .consequenceTypes="${consequenceTypes}"
                            .proteinSubstitutionScores="${proteinSubstitutionScore}">
                        </cellbase-variant-annotation-summary> 
                        `;
                    }
                },
                {
                    id: "annotationConsType",
                    name: "Consequence Type",
                    active: this.detailActiveTabs["annotationConsType"],
                    render: (variant, active) => {
                        return html`
                        <variant-consequence-type-view  
                            .consequenceTypes="${variant.annotation.consequenceTypes}"
                            .active="${active}">
                        </variant-consequence-type-view>
                        `
                    }
                },
                {
                    id: "annotationPropFreq",
                    name: "Population Frequencies",
                    active: this.detailActiveTabs["annotationPropFreq"],
                    render: (variant, active) => {
                        return html`
                        <cellbase-population-frequency-grid 
                            .populationFrequencies="${variant.annotation.populationFrequencies}"
                            .active="${active}"
                            >
                        </cellbase-population-frequency-grid>
                        `

                    }
                },
                {
                    id: "annotationClinical",
                    name: "Clinical",
                    render: (variant, active) => {
                        return html`
                        <variant-annotation-clinical-view   
                            .traitAssociation="${variant.annotation.traitAssociation}"
                            .geneTraitAssociation="${variant.annotation.geneTraitAssociation}">
                        </variant-annotation-clinical-view>
                        `
                    }
                },
                {
                    id: "cohortStats",
                    name: "Cohort Variant Stats",
                    onlyCohortAll: true,
                    tooltip: tooltips.cohort,
                    active: this.detailActiveTabs.cohortStats,
                    render: (variant, active, opencgaSession) => {
                        return html` 
                            <variant-cohort-stats   
                                .opencgaSession="${opencgaSession}"
                                .variantId="${variant.id}"
                                .config="${this.cohortConfig}"
                                .active="${active}">
                            </variant-cohort-stats>
                        `
                    }
                    //cohorts: this.cohorts
                },
                {
                    id: "samples",
                    name: "Samples",
                    active: this.detailActiveTabs.samples,
                    render: (variant, active, opencgaSession) => {
                        return html`
                        <opencga-variant-samples 
                            .opencgaSession="${opencgaSession}"
                            variantId="${variant.id}"
                            .active="${active}">
                        </opencga-variant-samples>
                        `
                    }
                },
                {
                    id: "beacon",
                    name: "Beacon",
                    active: this.detailActiveTabs.beacon,
                    render: (variant, active, opencgaSession) => {
                        return html`
                        <variant-beacon-network 
                            .variant="${variant.id}"
                            .assembly="${opencgaSession.project.organism.assembly}"
                            .config="${this.beaconConfig}"
                            .active="${active}">
                        </variant-beacon-network>
                        `
                    }
                },
                // {
                //     id: "network",
                //     title: "Reactome Pathways"
                // },
            ]
        };
    }

    render() {
        // if (!this.variant?.annotation) {
        //     return;
        // }

        return !this.variant?.annotation ? null : html` 
        <detail-tabs .data="${this.variant}" .config="${this._config}" .opencgaSession="${this.opencgaSession}"></detail-tabs>
        `
    }

}

customElements.define("variant-browser-detail", VariantBrowserDetail);
