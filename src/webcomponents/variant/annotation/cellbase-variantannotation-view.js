/*
 * Copyright 2015-2024 OpenCB
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
import "./cellbase-variant-annotation-summary.js";
import "./variant-consequence-type-view.js";
import "./cellbase-population-frequency-grid.js";

export default class CellbaseVariantAnnotationView extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            cellbaseClient: {
                type: Object
            },
            data: {
                type: String
            },
            assembly: {
                type: String
            },
            variantAnnotation: {
                type: Object
            },
            consequenceTypes: {
                type: Object
            },
            proteinSubstitutionScores: {
                type: Object
            },
            mode: {
                type: String
            },
            hashFragmentCredentials: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "cbvav-" + UtilsNew.randomString(6) + "_";
        this.data = "";
        this.mode = "horizontal";
        //this.assembly = "GRCh37";
    }

    updated(_changedProperties) {
        if (_changedProperties.has("data")) {
            console.log("_variantChanged");
            this._variantChanged();

        }
    }

    attached() {
        if (this.mode === "vertical") {
            $("#" + this._prefix + "Div").addClass("col-xs-10");
        }
    }

    checkData(data) {
        return data !== "";
    }

    check(data) {
        return data.variantTraitAssociation !== null;
    }

    checkVertical(mode) {
        return this.mode === "vertical";
    }

    checkHorizontal(mode) {
        return this.mode === "horizontal";
    }

    checkClinvar(clinvar) {
        return typeof clinvar !== "undefined" && clinvar.length > 0;
    }

    checkCosmic(cosmic) {
        return typeof cosmic !== "undefined" && cosmic.length > 0;
    }

    _variantChanged() {
        if (typeof this.cellbaseClient !== "undefined" && UtilsNew.isNotEmpty(this.data) && !this.data.includes(" ")) {
            this.cellbaseClient.get("genomic", "variant", this.data, "annotation", {assembly: this.assembly}, {})
                .then( async response => {
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

                    this.requestUpdate();
                    await this.updateComplete;
                    // Gene Trait Association definition
                    $("#" + this._prefix + "GTATable").bootstrapTable("destroy");
                    $("#" + this._prefix + "GTATable").bootstrapTable({
                        theadClasses: "table-light",
                        buttonsClass: "light",
                        data: this.variantAnnotation.geneTraitAssociation,
                        columns: [
                            [
                                {
                                    title: "id",
                                    field: "id"
                                },
                                {
                                    title: "name",
                                    field: "name"
                                },
                                {
                                    title: "hpo",
                                    field: "hpo"
                                },
                                {
                                    title: "source",
                                    field: "source"
                                }
                            ]
                        ]
                    });
                });
        }
    }

    render() {
        if (this.data === undefined || this.data === "") {
            return html`
                        <div><h3>Please click on a variant to view annotations</h3></div>
            `;
        } else {

            return html`
            <div style="padding-top: 20px;padding-left: 20px">
            <!-- This renders a vertical menu, this is controlled by the mode property -->
            ${this.checkVertical(this.mode) ? html`
                <div class="col-xs-2">
                    <ul id="${this._prefix}stackedPills" class="nav nav-pills nav-stacked" role="tablist">
                        <li role="presentation" class="active"><a href="#${this._prefix}VariantAnnotationSummary" role="tab"
                                                                  data-toggle="tab">Summary</a></li>
                        <li role="presentation"><a href="#${this._prefix}VariantAnnotationConsequenceTypes" role="tab"
                                                   data-toggle="tab">Consequence Types (${this.numberConsequenceTypes})</a></li>
                        <li role="presentation"><a href="#${this._prefix}VariantAnnotationPopulationFrequencies" role="tab"
                                                   data-toggle="tab">Population Frequencies
                            (${this.numberPopulationFrequencies})</a></li>
                        <li role="presentation"><a href="#${this._prefix}VariantAnnotationVTA" role="tab" data-toggle="tab">Variant
                            Trait Association (${this.numberVTA})</a></li>
                        <li role="presentation"><a href="#${this._prefix}VariantAnnotationGTA" role="tab" data-toggle="tab">Gene
                            Trait Association (${this.numberGTA})</a></li>
                    </ul>
                </div>` : null}

            <!-- This renders a horizontal menu, this is controlled by the mode property -->
            ${this.checkHorizontal(this.mode) ? html`
                <ul id="${this._prefix}myTabs" class="nav nav-tabs" role="tablist">
                    <li role="presentation" class="active"><a href="#${this._prefix}VariantAnnotationSummary" role="tab"
                                                              data-toggle="tab">Summary</a></li>
                    <li role="presentation">
                        <a href="#${this._prefix}VariantAnnotationConsequenceTypes" role="tab" data-toggle="tab">Consequence Types ${this.numberConsequenceTypes ? html`(${this.numberConsequenceTypes})` : null}</a></li>
                    <li role="presentation">
                        <a href="#${this._prefix}VariantAnnotationPopulationFrequencies" role="tab" data-toggle="tab">Population Frequencies ${this.numberPopulationFrequencies ? html`(${this.numberPopulationFrequencies})` : null}</a>
                    </li>
                    <li role="presentation"><a href="#${this._prefix}VariantAnnotationVTA" role="tab" data-toggle="tab">Variant Trait Association ${this.numberVTA ? html`(${this.numberVTA})` : null}</a></li>
                    <li role="presentation"><a href="#${this._prefix}VariantAnnotationGTA" role="tab" data-toggle="tab">Gene Trait Association ${this.numberGTA ? html`(${this.numberGTA})` : null}</a></li>
                </ul>
                ` : null}

    ${this.variantAnnotation ? html`
        <div id="${this._prefix}Div" class="">
            <div class="tab-content">
                <!--Summary Tab-->
                <div role="tabpanel" class="tab-pane active" id="${this._prefix}VariantAnnotationSummary">
                    <br>
                    <cellbase-variant-annotation-summary
                        .variantAnnotation="${this.variantAnnotation}"
                        .consequenceTypes="${this.consequenceTypes}"
                        .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                        .assembly="${this.assembly}">
                    </cellbase-variant-annotation-summary>
                </div>
                <!--TODO there is no such component
                Consequence types Tab-->
                <div role="tabpanel" class="tab-pane" id="${this._prefix}VariantAnnotationConsequenceTypes">
                    <variant-consequence-type-view  .consequenceTypes="${this.variantAnnotation.consequenceTypes}" .active="${true}"></variant-consequence-type-view>
                </div>
                <!--Population frequency Tab-->
                <div role="tabpanel" class="tab-pane" id="${this._prefix}VariantAnnotationPopulationFrequencies">
                    <cellbase-population-frequency-grid .populationFrequencies="${this.variantAnnotation.populationFrequencies}">
                    </cellbase-population-frequency-grid>
                </div>
                <!--Gene Trait Association Tab-->
                <div role="tabpanel" class="tab-pane" id="${this._prefix}VariantAnnotationGTA">
                    <table id="${this._prefix}GTATable" data-search="true" data-show-columns="true" data-pagination="true"
                           data-page-list="[10, 25, 50]"
                           data-show-pagination-switch="true" data-show-export="true">
                    </table>
                </div>
                <!--Variant Trait Association-->
                <div role="tabpanel" class="tab-pane" id="${this._prefix}VariantAnnotationVTA">
                    ${this.check(this.variantAnnotation) ? html`
                        <h4>Clinvar</h4>
                        ${this.variantAnnotation.variantTraitAssociation && this.variantAnnotation.variantTraitAssociation.clinvar ? html`
                        <div>
                            <table class="table table-hover table-bordered">
                                <thead style="background-color: #eee">
                                <tr>
                                    <th>Accession</th>
                                    <th>Clinical Significance</th>
                                    <th>Traits</th>
                                    <th>Gene Names</th>
                                    <th>Review Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                ${this.variantAnnotation.variantTraitAssociation.clinvar.map(item => html`
                                    <tr>
                                        <td>${item.accession}</td>
                                        <td>${item.clinicalSignificance}</td>
                                        <td>
                                            ${item.traits.map(trait => html`${trait}<br>`)}
                                        </td>
                                        <td>
                                            ${item.geneNames.map(geneName => html`${geneName}<br>`)}
                                        </td>
                                        <td>${item.reviewStatus}</td>
                                    </tr>
                                `)}
                                </tbody>
                            </table>
                        </div>` : html`
                            <div>No ClinVar data available</div>
                        `}


                        <h4>Cosmic</h4>
                        ${this.variantAnnotation.variantTraitAssociation && this.variantAnnotation.variantTraitAssociation.cosmic ? html`
                            <table class="table table-hover table-bordered">
                                <thead style="background-color: #eee">
                                <tr>
                                    <th>Mutation Id</th>
                                    <th>Primary Site</th>
                                    <th>Site Subtype</th>
                                    <th>Primary Histology</th>
                                    <th>Histology Subtype</th>
                                    <th>Sample Source</th>
                                    <th>Tumour Origin</th>
                                    <th>Gene Name</th>
                                    <th>Mutation Somatic Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                ${this.variantAnnotation.variantTraitAssociation.cosmic.map( item => html`
                                    <tr>
                                        <td>${item.mutationId}</td>
                                        <td>${item.primarySite}</td>
                                        <td>${item.siteSubtype}</td>
                                        <td>${item.primaryHistology}</td>
                                        <td>${item.histologySubtype}</td>
                                        <td>${item.sampleSource}</td>
                                        <td>${item.tumourOrigin}</td>
                                        <td>${item.geneName}</td>
                                        <td>${item.mutationSomaticStatus}</td>
                                    </tr>
                                `)}
                                </tbody>
                            </table>
                        ` : html`
                            No Cosmic data available
                        `}
                    ` : html`No ClinVar and Cosmic data available`}

                </div>
            </div>

        </div>` : null }
</div>
        `;
        }
    }

}

customElements.define("cellbase-variantannotation-view", CellbaseVariantAnnotationView);
