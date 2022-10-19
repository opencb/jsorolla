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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../annotation/cellbase-variant-annotation-summary.js";
import "../annotation/variant-consequence-type-view.js";
import "../annotation/cellbase-population-frequency-grid.js";
import "../annotation/variant-annotation-clinical-view.js";
import "../variant-cohort-stats.js";
import "../opencga-variant-samples.js";

/**
 * @deprecated
 */


export default class OpencgaVariantDetail extends LitElement {

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
        this._config = this.getDefaultConfig();
    }

    firstUpdated(_changedProperties) {
        this._config = {...this.getDefaultConfig(), ...this.config};
        for (const view of this._config.views) {
            switch (view.id) {
                case "cohortStats":
                    this.cohortConfig = {cohorts: view.cohorts};
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
        if (this.cellbaseClient && this.variantId) {
            this.cellbaseClient.get("genomic", "variant", this.variantId, "annotation", {assembly: this.opencgaSession.project.organism.assembly}, {})
                .then(response => {
                    this.variant = {id: this.variantId, annotation: response.responses[0].results[0]};
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
        }
    }

    getDefaultConfig() {
        return {
            title: "Sample",
            showTitle: true,
            items: [
                {
                    id: "sample-view",
                    name: "Overview",
                    active: true,
                    render: (sample, active, opencgaSession) => {
                        return html`<opencga-sample-view .sample="${sample}" .opencgaSession="${opencgaSession}"></opencga-sample-view>`;
                    }
                },
                {
                    id: "sample-variant-stats-view",
                    name: "Variant Stats",
                    render: (sample, active, opencgaSession) => {
                        return html`<sample-variant-stats-view .sampleId="${sample.id}" .opencgaSession="${opencgaSession}"></sample-variant-stats-view>`;
                    }
                },
                {
                    id: "individual-view",
                    name: "Individual",
                    render: (sample, active, opencgaSession) => {
                        return html`<individual-view .individualId="${sample?.individualId}" .opencgaSession="${opencgaSession}"></individual-view>`;
                    }
                },
                {
                    id: "file-view",
                    name: "Files",
                    render: (sample, active, opencgaSession) => {
                        return html`<opencga-file-grid .opencgaSession="${opencgaSession}" .query="${{sampleIds: sample.id}}"></opencga-file-grid>`;
                    }
                }
            ],
            filter: {
                menu: []
            },
            detail: [
                {
                    id: "annotationSummary",
                    title: "Summary",
                    active: true
                },
                {
                    id: "annotationConsType",
                    title: "Consequence Types",
                },
                {
                    id: "annotationPropFreq",
                    title: "Population Frequencies"
                },
                {
                    id: "annotationClinical",
                    title: "Clinical Info"
                },
                {
                    id: "cohortStats",
                    title: "Cohort Stats"
                },
                {
                    id: "samples",
                    title: "Samples"
                },
                {
                    id: "beacon",
                    component: "variant-beacon-network",
                    title: "Beacon"
                },
            ]
        };
    }

    // getDefaultConfig() {
    //     return {
    //         title: "",
    //         filter: {
    //             menu: []
    //         },
    //         detail: [
    //             // {
    //             //     id: "annotation",
    //             //     component: "cellbase-variantannotation-view",
    //             //     title: "Advanced Annotation",
    //             //     active: true
    //             // },
    //             {
    //                 id: "annotationSummary",
    //                 title: "Summary",
    //                 active: true
    //             },
    //             {
    //                 id: "annotationConsType",
    //                 title: "Consequence Types",
    //             },
    //             {
    //                 id: "annotationPropFreq",
    //                 title: "Population Frequencies"
    //             },
    //             {
    //                 id: "annotationClinical",
    //                 title: "Clinical Info"
    //             },
    //             {
    //                 id: "cohortStats",
    //                 title: "Cohort Stats"
    //             },
    //             {
    //                 id: "samples",
    //                 title: "Samples"
    //             },
    //             {
    //                 id: "beacon",
    //                 component: "variant-beacon-network",
    //                 title: "Beacon"
    //                 // Uncomment and edit Beacon hosts to change default hosts
    //                 // hosts: [
    //                 //     "brca-exchange", "cell_lines", "cosmic", "wtsi", "wgs", "ncbi", "ebi", "ega", "broad", "gigascience", "ucsc",
    //                 //     "lovd", "hgmd", "icgc", "sahgp"
    //                 // ]
    //             },
    //             // {
    //             //     id: "network",
    //             //     component: "reactome-variant-network",
    //             //     title: "Reactome Pathways"
    //             // }
    //         ]
    //     };
    // }

    render() {
        if (this.variant === undefined || this.variant.annotation === undefined) {
            return;
        }

        return html`
                    <div style="padding-top: 20px">
                                <h3>Variant: ${this.variant.id}</h3>
                                <div style="padding-top: 20px">
                                    <!-- Dynamically create the Detail Tabs from Browser config -->
                                    <ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">
                                        ${this._config.detail.length && this._config.detail.map(item => html`
                                            ${item.active ? html`
                                                <li role="presentation" class="active">
                                                    <a href="#${this._prefix}${item.id}" role="tab" data-toggle="tab" data-id="${item.id}"
                                                        class="browser-variant-tab-title" @click="${this._changeBottomTab}">${item.title}</a>
                                                </li>
                                            ` : html`
                                                <li role="presentation" class="">
                                                    <a href="#${this._prefix}${item.id}" role="tab" data-toggle="tab" data-id="${item.id}"
                                                        class="browser-variant-tab-title" @click="${this._changeBottomTab}">${item.title}</a>
                                                </li>
                                            `}
                                        `)}
                                    </ul>

                                    <div class="tab-content" style="height: 680px">

                                        <!-- Annotation Tab -->
                                        <div id="${this._prefix}annotationSummary" role="tabpanel" class="tab-pane active">
                                            <div style="width: 90%;padding-top: 8px">
                                                <cellbase-variant-annotation-summary
                                                    .variantAnnotation="${this.variant.annotation}"
                                                    .consequenceTypes="${this.consequenceTypes}"
                                                    .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                    .assembly="${this.opencgaSession.project.organism.assembly}">
                                                </cellbase-variant-annotation-summary>
                                            </div>
                                        </div>


                                        <div id="${this._prefix}annotationConsType" role="tabpanel" class="tab-pane">
                                            <div style="width: 90%;padding-top: 8px">
                                                <variant-consequence-type-view  .consequenceTypes="${this.variant.annotation.consequenceTypes}"
                                                                                .active="${this.detailActiveTabs["annotationConsType"]}">
                                                </variant-consequence-type-view>
                                            </div>
                                        </div>

                                        <div id="${this._prefix}annotationPropFreq" role="tabpanel" class="tab-pane">
                                            <div style="width: 90%;padding-top: 8px">
                                                <cellbase-population-frequency-grid .populationFrequencies="${this.variant.annotation.populationFrequencies}"
                                                                                    .active="${this.detailActiveTabs["annotationPropFreq"]}">
                                                </cellbase-population-frequency-grid>
                                            </div>
                                        </div>


                                        <div id="${this._prefix}annotationClinical" role="tabpanel" class="tab-pane">
                                            <div style="width: 90%;padding-top: 8px">
                                                <variant-annotation-clinical-view   .traitAssociation="${this.variant.annotation.traitAssociation}"
                                                                                    .geneTraitAssociation="${this.variant.annotation.geneTraitAssociation}">
                                                </variant-annotation-clinical-view>
                                            </div>
                                        </div>

                                        <!-- Cohort Stats Tab -->
                                        <div id="${this._prefix}cohortStats" role="tabpanel" class="tab-pane">
                                            <div style="width: 75%;padding: 15px">
                                                <opencga-variant-cohort-stats   .opencgaSession="${this.opencgaSession}"
                                                                                .variantId="${this.variant.id}"
                                                                                .active="${this.detailActiveTabs.cohortStats}"
                                                                                .config="${this.cohortConfig}">
                                                </opencga-variant-cohort-stats>
                                            </div>
                                        </div>

                                        <!-- Samples Tab -->
                                        <div id="${this._prefix}samples" role="tabpanel" class="tab-pane">
                                            <div style="width: 75%;padding-top: 8px">
                                                <opencga-variant-samples .opencgaSession="${this.opencgaSession}"
                                                                        .variantId="${this.variant.id}"
                                                                        .active="${this.detailActiveTabs.samples}">
                                                </opencga-variant-samples>
                                            </div>
                                        </div>

                                        <!-- Beacon Network Tab -->
                                        <div id="${this._prefix}beacon" role="tabpanel" class="tab-pane">
                                            <div style="width: 75%;padding-top: 8px">
                                                <variant-beacon-network variant="${this.variant.id}"
                                                                        .assembly="${this.opencgaSession.project.organism.assembly}"
                                                                        .config="${this.beaconConfig}">
                                                </variant-beacon-network>
                                            </div>
                                        </div>


                                        <!-- Reactome network tab
                                        <div id="\${this._prefix}network" role="tabpanel" class="tab-pane">
                                            <div style="width: 75%;padding-top: 8px">
                                                <reactome-variant-network .opencgaSession="\${this.opencgaSession}"
                                                                        .reactomeClient="\${this.reactomeClient}"
                                                                        .genes="\${this.genes}"
                                                                        ?active="\${this.detailActiveTabs.network}">
                                                </reactome-variant-network>
                                            </div>
                                        </div>
                                        -->

                                        <!-- Example Template Tab
                                        <div id="\${this._prefix}template" role="tabpanel" class="tab-pane">
                                            <div style="width: 75%;padding-top: 8px">
                                                <opencga-variant-detail-template .opencgaSession="\${this.opencgaSession}"
                                                                                .variant="\${this.variant}"
                                                                                .active="\${this.detailActiveTabs.template}">
                                                </opencga-variant-detail-template>
                                            </div>
                                        </div>
                                        -->
                                    </div>
                                </div>
                            </div>
                `;
    }

}

customElements.define("opencga-variant-detail", OpencgaVariantDetail);
