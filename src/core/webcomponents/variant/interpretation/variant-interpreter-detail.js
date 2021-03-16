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

import { LitElement, html } from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";
import "../../clinical/clinical-interpretation-variant-review.js";
import "../annotation/cellbase-variantannotation-view.js";
import "../annotation/variant-consequence-type-view.js";
import "../annotation/variant-annotation-clinical-view.js";
import "../opencga-variant-file-metrics.js";
import "../variant-beacon-network.js";


export default class VariantInterpreterDetail extends LitElement {

    constructor() {
        super();
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
            clinicalAnalysis: {
                type: Object
            },
            variant: {
                type: Object
            },
            variantId: {
                type: String
            },
            cellbaseClient: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        // All id fields in the template must start with prefix, this allows components to be instantiated more than once
        this._prefix = "oivd" + UtilsNew.randomString(6);
        // this.detailActiveTabs = {};

        // Initially we set the default config, this will be overridden if 'config' is passed
        this._config = this.getDefaultConfig();
    }

    firstUpdated(_changedProperties) {
        this._config = { ...this.getDefaultConfig(), ...this.config };
    }

    updated(changedProperties) {
        if (changedProperties.has("variantId")) {
            this.variantIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = { ...this.getDefaultConfig(), ...this.config };
        }
    }

    variantIdObserver() {
        let _this = this;
        if (typeof this.cellbaseClient !== "undefined" && UtilsNew.isNotEmpty(this.variantId)) {
            this.cellbaseClient.get("genomic", "variant", this.variantId, "annotation", { assembly: this.opencgaSession.project.organism.assembly }, {})
                .then(restReponse => {
                    this.variant = { id: this.variantId, annotation: restReponse.getResult(0) };
                    this.variantAnnotation = restReponse.getResult(0);
                    this.numberConsequenceTypes = 0;
                    this.numberPopulationFrequencies = 0;
                    this.numberVTA = 0;
                    this.numberGTA = 0;

                    if (this.variantAnnotation.geneTraitAssociation != null) {
                        this.numberConsequenceTypes = this.variantAnnotation.consequenceTypes.length;
                        this.numberPopulationFrequencies = UtilsNew.isNotEmptyArray(_this.variantAnnotation.populationFrequencies) ? this.variantAnnotation.populationFrequencies.length : 0;
                        this.numberVTA = UtilsNew.isNotUndefinedOrNull(this.variantAnnotation.traitAssociation) ? this.variantAnnotation.traitAssociation.length : 0;
                        this.numberGTA = UtilsNew.isNotUndefinedOrNull(this.variantAnnotation.geneTraitAssociation) ? this.variantAnnotation.geneTraitAssociation.length : 0;
                    }
                });
        }
    }

    // _changeBottomTab(e) {
    //     const _activeTabs = {};
    //     for (let detail of this._config.views) {
    //         _activeTabs[detail.id] = (detail.id === e.currentTarget.dataset.id);
    //     }
    //     this.detailActiveTabs = _activeTabs;
    //     this.requestUpdate();
    // }

    getDefaultConfig() {
        return {
            title: "Selected Variant: ",
            showTitle: true,
            items: [
                {
                    id: "annotationSummary",
                    name: "Summary",
                    active: true,
                    render: (variant) => {
                        return html`
                            <cellbase-variant-annotation-summary    
                                .variantAnnotation="${variant.annotation}"
                                .consequenceTypes="${consequenceTypes}"
                                .proteinSubstitutionScores="${proteinSubstitutionScore}">
                            </cellbase-variant-annotation-summary>`;
                    }
                },
                {
                    id: "annotationConsType",
                    name: "Consequence Type",
                    render: (variant, active) => {
                        return html`
                            <variant-consequence-type-view  
                                .consequenceTypes="${variant.annotation.consequenceTypes}" 
                                .active="${active}">
                            </variant-consequence-type-view>`;
                    }
                },
                {
                    id: "annotationPropFreq",
                    name: "Population Frequencies",
                    render: (variant, active) => {
                        return html`
                            <cellbase-population-frequency-grid 
                                .populationFrequencies="${variant.annotation.populationFrequencies}" 
                                .active="${active}">
                            </cellbase-population-frequency-grid>`;
                    }
                },
                {
                    id: "annotationClinical",
                    name: "Clinical",
                    render: (variant) => {
                        return html`
                        <variant-annotation-clinical-view   
                            .traitAssociation="${variant.annotation.traitAssociation}"
                            .geneTraitAssociation="${variant.annotation.geneTraitAssociation}">
                        </variant-annotation-clinical-view>`;
                    }
                },
                {
                    id: "fileMetrics",
                    name: "File Metrics",
                    render: (variant, active, opencgaSession) => {
                        return html`
                            <opencga-variant-file-metrics 
                                .opencgaSession="${opencgaSession}"
                                .variant="${variant}"
                                .files="${this.clinicalAnalysis}">
                            </opencga-variant-file-metrics>`;
                    }
                },
                {
                    id: "cohortStats",
                    name: "Cohort Stats",
                    render: (variant, active, opencgaSession) => {
                        return html`
                        <variant-cohort-stats 
                            .opencgaSession="${opencgaSession}"
                            .variantId="${variant.id}"
                            .active="${active}">
                        </variant-cohort-stats>
                        `
                    }
                },
                {
                    id: "samples",
                    name: "Samples",
                    render: (variant, active, opencgaSession) => {
                        return html`
                        <opencga-variant-samples 
                            .opencgaSession="${opencgaSession}"
                            .variantId="${variant.id}"
                            .active="${active}">
                        </opencga-variant-samples>`
                    }
                },
                {
                    id: "beacon",
                    name: "Beacon",
                    render: (variant, active, opencgaSession) => {
                        return html`
                            <variant-beacon-network 
                                .variant="${variant.id}" 
                                .assembly="${opencgaSession.project.organism.assembly}"
                                .config="${this.beaconConfig}"
                                .active="${active}">
                            </variant-beacon-network>`;
                    }
                    // Uncomment and edit Beacon hosts to change default hosts
                    // hosts: [
                    //     "brca-exchange", "cell_lines", "cosmic", "wtsi", "wgs", "ncbi", "ebi", "ega", "broad", "gigascience", "ucsc",
                    //     "lovd", "hgmd", "icgc", "sahgp"
                    // ]
                }
                // {
                //     id: "variantDetail",
                //     name: "Variant Detail",
                //     render: (variant, active,opencgaSession) => {
                //         return html`
                //             <opencga-variant-detail-template 
                //                 .opencgaSession="${opencgaSession}"
                //                 .variant="${variant.id}"
                //                 .active="${active}">
                //             </opencga-variant-detail-template>`;
                //     }
                // }
            ]
        };
    }

    render() {
        if (!this.variant || !this.variant.annotation) {
            return html`<h3>Error: No valid variant or annotation</h3>`;
        }

        if (!this._config || !this._config.views) {
            return html`<h3>Error: No valid tab configuration</h3>`;
        }

        return html`
            <detail-tabs
                .data="${this.variant}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>`
    }
}

customElements.define("variant-interpreter-detail", VariantInterpreterDetail);
