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
import Utils from "./../../utils.js";
import UtilsNew from "./../../utilsNew.js";
import "./annotation/cellbase-variant-annotation-summary.js";
// import "./annotation/cellbase-variantannotation-view.js";
import "./annotation/cellbase-annotation-consequencetype-grid.js";
import "./annotation/cellbase-population-frequency-grid.js";
import "./opencga-variant-cohort-stats.js";

export default class OpenCGAVariantDetailView extends LitElement {

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
        this._prefix = "ovdv-" + Utils.randomString(6) + "_";
        // FIXME in case of region as a prop (with value = this.query.region from variant-filter) in case opencga-active-filter deletes a region filter this component is not updated.
        // A temp solution is to add query as prop and watch for its edits in updated() [this.region as prop is not used anymore].
        this.detailActiveTabs = [];
        this._config = this.getDefaultConfig();
    }

    firstUpdated(_changedProperties) {
        this._config = {...this.getDefaultConfig(), ...this.config};
        for (let view of this._config.views) {
            switch (view.id) {
                case "cohortStats":
                    this.cohortConfig = {cohorts: view.cohorts};
                    break;
            }
        }
    }

    updated(_changedProperties) {
        // if (_changedProperties.has("query")) {
        //     let _region = this.query && this.query.region ? this.query.region : "";
        //     //this shouldn't be necessary.. component view is refreshed but the textArea isn't.
        //     this.querySelector("#" + this._prefix + "LocationTextarea").value = _region;
        // }

        // let _region = _changedProperties.has("variant") && this.variant ? this.variant : null;
        // this.querySelector("#" + this._prefix + "LocationTextarea").value = _region;
        if (_changedProperties.has("variantId")) {
            this._variantChanged();
        }

        if (_changedProperties.has("variant")) {
            // this.variant
            // debugger
            // this.requestUpdate();
        }
    }

    // filterChange(e) {
    //     // Process the textarea: remove newline chars, empty chars, leading/trailing commas
    //     const _region = e.target.value.trim()
    //         .replace(/\r?\n/g, this.separator)
    //         .replace(/\s/g, "")
    //         .split(this.separator)
    //         .filter(_ => _)
    //         .join(this.separator);
    //     // this.region = _region;
    //     const event = new CustomEvent("filterChange", {
    //         detail: {
    //             value: _region
    //         },
    //         bubbles: true,
    //         composed: true
    //     });
    //     // this.requestUpdate();
    //     this.dispatchEvent(event);
    // }

    _variantChanged() {
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

                    // Gene Trait Association definition
                    // $("#" + _this._prefix + "GTATable").bootstrapTable("destroy");
                    // $("#" + _this._prefix + "GTATable").bootstrapTable({
                    //     data: _this.variantAnnotation.geneTraitAssociation,
                    //     columns: [
                    //         [
                    //             {
                    //                 title: "id",
                    //                 field: "id"
                    //             },
                    //             {
                    //                 title: "name",
                    //                 field: "name"
                    //             },
                    //             {
                    //                 title: "hpo",
                    //                 field: "hpo"
                    //             },
                    //             {
                    //                 title: "source",
                    //                 field: "source"
                    //             }
                    //         ]
                    //     ]
                    // });

                    // _this.requestUpdate();
                });
        }
    }

    _changeBottomTab(e) {
        let _activeTabs = {};
        for (let detail of this._config.detail) {
            _activeTabs[detail.id] = (detail.id === e.currentTarget.dataset.id);
        }
        this.detailActiveTabs = _activeTabs;
        this.requestUpdate();
    }

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
                                        <!-- Annotation Tab
                                        <div id="${this._prefix}annotation" role="tabpanel" class="tab-pane active">
                                            <div style="width: 90%;padding-top: 8px">
                                                <cellbase-variantannotation-view .data="${this.variantId}"
                                                                                 .assembly=${this.opencgaSession.project.organism.assembly}
                                                                                 _prefix="${this._prefix}"
                                                                                 .cellbaseClient="${this.cellbaseClient}"
                                                                                 mode="vertical"
                                                                                 .hashFragmentCredentials="${this.hashFragmentCredentials}"
                                                                                 .consequenceTypes="${this.consequenceTypes}"
                                                                                 .proteinSubstitutionScores="${this.proteinSubstitutionScores}">
                                                </cellbase-variantannotation-view>
                                            </div>
                                        </div>
             -->
                                        
                                        
                                         <!-- Annotation Tab -->
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
                                        <div id="${this._prefix}cohortStats" role="tabpanel" class="tab-pane">
                                            <div style="width: 75%;padding-top: 8px">
                                                <opencga-variant-cohort-stats   .opencgaSession="${this.opencgaSession}"
                                                                                variantId="${this.variant.id}"
                                                                                .active="${this.detailActiveTabs.cohortStats}"
                                                                                .config="${this.cohortConfig}">
                                                </opencga-variant-cohort-stats>
                                            </div>
                                        </div>

                                        <!-- Samples Tab -->
                                        <div id="${this._prefix}samples" role="tabpanel" class="tab-pane">
                                            <div style="width: 75%;padding-top: 8px">
                                                <opencga-variant-samples .opencgaSession="${this.opencgaSession}"
                                                                         variant="${this.variant.id}"
                                                                         .active="${this.detailActiveTabs.samples}">
                                                </opencga-variant-samples>
                                            </div>
                                        </div>
            
                                        <!-- Beacon Network Tab -->
                                        <div id="${this._prefix}beacon" role="tabpanel" class="tab-pane">
                                            <div style="width: 75%;padding-top: 8px">
                                                <variant-beacon-network variant="${this.variant.id}" 
                                                                        clear="${this.variant.id}"
                                                                        .config="${this.beaconConfig}">
                                                </variant-beacon-network>
                                            </div>
                                        </div>
                                        
            
                                        <!-- Reactome network tab -->
                                        <div id="${this._prefix}network" role="tabpanel" class="tab-pane">
                                            <div style="width: 75%;padding-top: 8px">
                                                <reactome-variant-network .opencgaSession="${this.opencgaSession}"
                                                                          .reactomeClient="${this.reactomeClient}" 
                                                                          .genes="${this.genes}"
                                                                          ?active="${this.detailActiveTabs.network}">
                                                </reactome-variant-network>
                                            </div>
                                        </div>
                                        
            
                                        <!-- Example Template Tab
                                        <div id="${this._prefix}template" role="tabpanel" class="tab-pane">
                                            <div style="width: 75%;padding-top: 8px">
                                                <opencga-variant-detail-template .opencgaSession="${this.opencgaSession}"
                                                                                 .variant="${this.variant}"
                                                                                 .active="${this.detailActiveTabs.template}">
                                                </opencga-variant-detail-template>
                                            </div>
                                        </div>
                                        -->
                                    </div>
                                </div>
                            </div>
                `;
    }

    getDefaultConfig() {
        return {
            title: "",
            filter:{
                menu: []
            },
            detail: [
                // {
                //     id: "annotation",
                //     component: "cellbase-variantannotation-view",
                //     title: "Advanced Annotation",
                //     active: true
                // },
                {
                    id: "annotationSummary",
                    // component: "opencga-variant-cohort-stats",
                    title: "Summary",
                    active: true
                },
                {
                    id: "annotationConsType",
                    // component: "opencga-variant-cohort-stats",
                    title: "Consequence Type",
                },
                {
                    id: "annotationPropFreq",
                    // component: "opencga-variant-cohort-stats",
                    title: "Population Frequencies"
                },
                {
                    id: "cohortStats",
                    component: "opencga-variant-cohort-stats",
                    title: "Cohort Stats"
                },
                {
                    id: "samples",
                    component: "opencga-variant-samples",
                    title: "Samples"
                },
                {
                    id: "beacon",
                    component: "variant-beacon-network",
                    title: "Beacon"
                    // Uncomment and edit Beacon hosts to change default hosts
                    // hosts: [
                    //     "brca-exchange", "cell_lines", "cosmic", "wtsi", "wgs", "ncbi", "ebi", "ega", "broad", "gigascience", "ucsc",
                    //     "lovd", "hgmd", "icgc", "sahgp"
                    // ]
                },
                {
                    id: "network",
                    component: "reactome-variant-network",
                    title: "Reactome Pathways"
                }
                // {
                //     id: "template",
                //     component: "opencga-variant-detail-template",
                //     title: "Template"
                // }
            ]
        };
    }
}

customElements.define("opencga-variant-detail-view", OpenCGAVariantDetailView);
