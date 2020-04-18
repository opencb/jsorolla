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
import Utils from "../../../utils.js";
import UtilsNew from "../../../utilsNew.js";
import "./opencga-interpretation-variant-review.js";
import "../annotation/cellbase-variantannotation-view.js";
import "../opencga-variant-file-metrics.js";
import "../variant-beacon-network.js";


export default class OpencgaVariantInterpretationDetail extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            variantId: {
                type: String
            },
            variant: {
                type: Object
            },
            clinicalAnalysis: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        // All id fields in the template must start with prefix, this allows components to be instantiated more than once
        this._prefix = "oivd" + Utils.randomString(6);
        this.detailActiveTabs = {};

        // Initially we set the default config, this will be overridden if 'config' is passed
        this._config = this.getDefaultConfig();
    }

    firstUpdated(_changedProperties) {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("variantId")) {
            this.variantIdObserver();
        }
        debugger
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    variantIdObserver() {
        let _this = this;
        if (typeof this.cellbaseClient !== "undefined" && UtilsNew.isNotEmpty(this.variantId)) {
            this.cellbaseClient.get("genomic", "variant", this.variantId, "annotation", {assembly: this.opencgaSession.project.organism.assembly}, {})
                .then(function(response) {
                    _this.variant = {id: _this.variantId, annotation: response.response[0].result[0]};
                    _this.variantAnnotation = response.response[0].result[0];
                    _this.numberConsequenceTypes = 0;
                    _this.numberPopulationFrequencies = 0;
                    _this.numberVTA = 0;
                    _this.numberGTA = 0;

                    if (_this.variantAnnotation.geneTraitAssociation != null) {
                        _this.numberConsequenceTypes = _this.variantAnnotation.consequenceTypes.length;
                        _this.numberPopulationFrequencies = UtilsNew.isNotEmptyArray(_this.variantAnnotation.populationFrequencies) ? _this.variantAnnotation.populationFrequencies.length : 0;
                        _this.numberVTA = UtilsNew.isNotUndefinedOrNull(_this.variantAnnotation.traitAssociation) ? _this.variantAnnotation.traitAssociation.length : 0;
                        _this.numberGTA = UtilsNew.isNotUndefinedOrNull(_this.variantAnnotation.geneTraitAssociation) ? _this.variantAnnotation.geneTraitAssociation.length : 0;
                    }
                });
        }
    }

    _changeBottomTab(e) {
        const _activeTabs = {};
        for (let detail of this._config.views) {
            _activeTabs[detail.id] = (detail.id === e.currentTarget.dataset.id);
        }
        this.detailActiveTabs = _activeTabs;
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            title: "Selected Variant",
            views: [
                {
                    id: "annotationSummary",
                    title: "Summary",
                    active: true
                },
                {
                    id: "annotationConsType",
                    title: "Consequence Type",
                },
                {
                    id: "annotationPropFreq",
                    title: "Population Frequencies"
                },
                {
                    id: "fileMetrics",
                    title: "File Metrics"
                },
                {
                    id: "cohortStats",
                    title: "Cohort Stats",
                    // cohorts: this.cohorts
                },
                {
                    id: "beacon",
                    title: "Beacon"
                    // Uncomment and edit Beacon hosts to change default hosts
                    // hosts: [
                    //     "brca-exchange", "cell_lines", "cosmic", "wtsi", "wgs", "ncbi", "ebi", "ega", "broad", "gigascience", "ucsc",
                    //     "lovd", "hgmd", "icgc", "sahgp"
                    // ]
                }
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
            <div style="padding-top: 20px">
                <h3>${this._config.title}: ${this.variant.id}</h3>
    
                <div style="padding-top: 20px">
                    <!-- Dynamically create the Detail Tabs from Browser config -->
                    <ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">
                        ${this._config.views.map( item => html`
                            ${this.active ? html`
                                    <li role="presentation" class="active">
                                        <a href="#${this._prefix}${item.id}" role="tab" data-toggle="tab" data-id="${item.id}"
                                            class="browser-variant-tab-title" @click="${this._changeBottomTab}">${item.title}
                                        </a>
                                    </li>` 
                                : html`
                                    <li role="presentation" class="">
                                        <a href="#${this._prefix}${item.id}" role="tab" data-toggle="tab" data-id="${item.id}"
                                           class="browser-variant-tab-title" @click="${this._changeBottomTab}">${item.title}</a>
                                    </li>
                                `}
                            `) }
                    </ul>

                    <div class="tab-content" style="height: 680px">
                    <!-- Annotation Tab -->
                        <!--
                            <div id="${this._prefix}annotation" role="tabpanel" class="tab-pane active">
                                <div style="width: 75%;padding-top: 8px">
                                    <cellbase-variantannotation-view .data="${this.variant.id}"
                                                                     .assembly="${this.opencgaSession.project.organism.assembly}"
                                                                     _prefix="${this._prefix}"
                                                                     .cellbaseClient="${this.cellbaseClient}"
                                                                     mode="vertical"
                                                                     .consequenceTypes="${this.consequenceTypes}"
                                                                     .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                                     style="font-size: 12px">
                                    </cellbase-variantannotation-view>
                                </div>
                            </div>
                        -->
                        
                        <div id="${this._prefix}annotationSummary" role="tabpanel" class="tab-pane active">
                            <div style="width: 90%;padding-top: 8px">
                                <cellbase-variant-annotation-summary    .variantAnnotation="${this.variant.annotation}"
                                                                        .consequenceTypes="${this.consequenceTypes}"
                                                                        .proteinSubstitutionScores="${this.proteinSubstitutionScores}">
                                </cellbase-variant-annotation-summary>  
                            </div>
                        </div>
                        
                         <div id="${this._prefix}annotationConsType" role="tabpanel" class="tab-pane">
                            <div style="width: 90%;padding-top: 8px">
                                <cellbase-annotation-consequencetype-grid   .data="${this.variant.annotation.consequenceTypes}"
                                                                            .consequenceTypes="${this.consequenceTypes}">
                                </cellbase-annotation-consequencetype-grid>
                            </div>
                         </div>
                                        
                         <div id="${this._prefix}annotationPropFreq" role="tabpanel" class="tab-pane">
                            <div style="width: 90%;padding-top: 8px">
                                <cellbase-population-frequency-grid .populationFrequencies="${this.variant.annotation.populationFrequencies}">
                                </cellbase-population-frequency-grid>
                            </div>
                         </div>
                                        
                        <!-- Cohort Stats Tab -->
                        <div id="${this._prefix}fileMetrics" role="tabpanel" class="tab-pane">
                            <div style="width: 75%;padding-top: 8px">
                                <opencga-variant-file-metrics .opencgaSession="${this.opencgaSession}"
                                                              .variant="${this.variant}"
                                                              .files="${this.clinicalAnalysis}"
                                </opencga-variant-file-metrics>
                            </div>
                        </div>
    
                        <!-- Cohort Stats Tab -->
                        <div id="${this._prefix}cohortStats" role="tabpanel" class="tab-pane">
                            <div style="width: 75%;padding-top: 8px">
                                <opencga-variant-cohort-stats .opencgaSession="${this.opencgaSession}"
                                                              .variant="${this.variant.id}"
                                                              .active="${this.detailActiveTabs.cohortStats}">
                                </opencga-variant-cohort-stats>
                            </div>
                        </div>
    
                        <!-- Samples Tab -->
                        <div id="${this._prefix}samples" role="tabpanel" class="tab-pane">
                            <div style="width: 75%;padding-top: 8px">
                                <opencga-variant-samples .opencgaSession="${this.opencgaSession}"
                                                         .variant="${this.variant.id}"
                                                         .active="${this.detailActiveTabs.samples}">
                                </opencga-variant-samples>
                            </div>
                        </div>
    
                        <!-- Beacon Network Tab-->
                        <div id="${this._prefix}beacon" role="tabpanel" class="tab-pane">
                            <div style="width: 75%;padding-top: 8px">
                                <variant-beacon-network .variant="${this.variant.id}" .clear="${this.variant.id}" .config="${this.beaconConfig}">
                                </variant-beacon-network>
                            </div>
                        </div>
    
                        <!-- Example Template Tab-->
                        <div id="${this._prefix}template" role="tabpanel" class="tab-pane">
                            <div style="width: 75%;padding-top: 8px">
                                <opencga-variant-detail-template .opencgaSession="${this.opencgaSession}"
                                                                 .variant="${this.variant.id}"
                                                                 .active="${this.detailActiveTabs.template}">
                                </opencga-variant-detail-template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define("opencga-variant-interpretation-detail", OpencgaVariantInterpretationDetail);
