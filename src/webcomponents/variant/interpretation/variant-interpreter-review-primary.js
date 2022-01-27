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
import UtilsNew from "../../../core/utilsNew.js";
import PolymerUtils from "../../PolymerUtils.js";
import "./variant-interpreter-grid.js";
import "./variant-interpreter-detail.js";
import "../../clinical/interpretation/clinical-interpretation-view.js";


export default class VariantInterpreterReviewPrimary extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            consequenceTypes: {
                type: Object
            },
            populationFrequencies: {
                type: Object
            },
            proteinSubstitutionScores: {
                type: Object
            },
            mode: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ovi-" + UtilsNew.randomString(6);

        // TODO recheck this variant-interpretation-editor doesn't have a "mode" prop in opencga-variant-interpretation
        this.mode = "create";
        this.isCreate = this.mode.toLowerCase() === "create";

        this.interpretationCollapsed = false;
        this.variantsCollapsed = false;
        // this.isInterpretedVariants = false;

        // this.checkProjects = false;
        // this.interactive = true;
        this.filterClass = "col-md-2";
        this.gridClass = "col-md-10";

        this._collapsed = true;

        this.messageError = false;
        this.messageSuccess = false;

        this.variant = null;
        this.reportedVariants = [];

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        // console.log("this.interpretation in variant-interpretation-editor", this.interpretation)
        // this._interpretation = this.interpretation;
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("mode") || changedProperties.has("config")) {
            this.propertyObserver();
        }
        if (changedProperties.has("clinicalAnalysis") || changedProperties.has("interpretation")) {
            // this.clinicalAnalysisObserver();
        }
    }

    propertyObserver(opencgaSession, mode, config) {
        this._config = {...this.getDefaultConfig(), ...this.config};

        if (UtilsNew.isNotUndefinedOrNull(mode)) {
            this.isCreate = mode.toLowerCase() === "create";
        }
    }

    // clinicalAnalysisObserver() {
    //     if (this.clinicalAnalysis) {
    //         this._interpretation = this.clinicalAnalysis.interpretation;
    //         if (UtilsNew.isNotUndefinedOrNull(this._interpretation)) {
    //             if (UtilsNew.isNotEmptyArray(this._interpretation.primaryFindings)) {
    //                 this.isInterpretedVariants = true;
    //             } else {
    //                 this.isInterpretedVariants = false;
    //             }
    //         }
    //         // this.fillForm(this._interpretation);
    //         this.requestUpdate();
    //     }
    // }

    toggleInterpretationCollapsed(e) {
        this.interpretationCollapsed = !this.interpretationCollapsed;
    }

    toggleVariantsCollapsed(e) {
        this.variantsCollapsed = !this.variantsCollapsed;
    }

    onClinicalAnalysisEditor(e) {
        this.clinicalAnalysis = Object.assign({}, e.detail.clinicalAnalysis);
    }

    _changeBottomTab(e) {
        const _activeTabs = {};
        for (const detail of this.config.detail) {
            _activeTabs[detail.id] = (detail.id === e.currentTarget.dataset.id);
        }
        this.set("detailActiveTabs", _activeTabs);
    }

    checkVariant(variant) {
        return variant.split(":").length > 2;
    }

    onSelectVariant(e) {
        this.variant = e.detail.row;
        this.requestUpdate();
    }

    onCheckVariant(e) {
        // Alexis: we need to do something like this:
        this.checkedVariants = e.detail.rows;

        // We set/remove disable status to Save button
        // if (this.checkedVariants.length > 0 && UtilsNew.isNotEmptyArray(this.samples)) {
        //     PolymerUtils.removeAttribute(this._prefix + 'SaveInterpretationButton', 'disabled');
        // } else {
        //     PolymerUtils.setAttribute(this._prefix + 'SaveInterpretationButton', 'disabled', true);
        // }
    }

    onGenomeBrowserPositionChange(e) {
        $(".variant-interpretation-content").hide(); // hides all content divs
        $("#" + this._prefix + "GenomeBrowser").show(); // get the href and use it find which div to show

        // Show the active button
        $(".variant-interpretation-view-buttons").removeClass("active");
        // $(e.target).addClass("active");
        PolymerUtils.addClass(this._prefix + "GenomeBrowserButton", "active");

        this._genomeBrowserActive = true;

        this.region = e.detail.genomeBrowserPosition;
    }

    _backToSelectAnalysis(e) {
        this.dispatchEvent(new CustomEvent("backtoselectanalysis", {detail: {idTab: "PrioritizationButton"}}));
    }

    _goToReport(e) {
        this.dispatchEvent(new CustomEvent("gotoreport", {detail: {interpretation: this.clinicalAnalysis.interpretation}}));
    }

    triggerBeacon(e) {
        this.variantToBeacon = this.variant.id;
    }

    onViewInterpretation(e) {
        $("#" + this._prefix + "PreviewModal").modal("show");
    }

    onSaveInterpretation() {
        this.opencgaSession.opencgaClient.clinical().updateInterpretation(this.clinicalAnalysis.id, this.clinicalAnalysis.interpretation, {study: this.opencgaSession.study.fqn})
            .then(response => {
                // debugger
            })
            .catch(error => console.error(error));
    }

    cleanSaveInterpretation() {
        PolymerUtils.setValue(this._prefix + "IDInterpretation", "");
        // PolymerUtils.setValue(this._prefix + "NameInterpretation", "");
        PolymerUtils.setValue(this._prefix + "DescriptionInterpretation", "");
        PolymerUtils.setValue(this._prefix + "CommentInterpretation", "");
    }

    getAnalysisInterpretations() {
        const params = {
            study: this.opencgaSession.study.fqn
        };
        this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysis.id, params)
            .then(response => {
                this.showSummary = false;
                if (response.response[0].numResults === 1) {
                    this.clinicalAnalysis = response.response[0].result[0];
                }
            });
    }

    render() {
        // No primary findings in interpretation --> display message
        if (!this.clinicalAnalysis?.interpretation?.primaryFindings?.length) {
            return html`
                <div class="alert alert-warning">
                    <b>Warning</b>: there are not variants or annotations for this clinical interpretation.
                </div>
            `;
        }

        return html`
            <div class="pull-right save-button">
                <button type="button" class="btn btn-primary" @click="${this.onViewInterpretation}">
                    Preview
                </button>
                <button class="btn btn-primary" @click="${this.onSaveInterpretation}">
                    <i class="fas fa-save icon-padding"></i> Save
                </button>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <div style="padding-top: 5px">
                        <div id="${this._prefix}collapsibleVariants" class="collapse in">
                            ${this.clinicalAnalysis?.interpretation ? html`
                                <variant-interpreter-grid
                                    .opencgaSession="${this.opencgaSession}"
                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                    .review="${true}"
                                    .config="${this._config.result.grid}"
                                    @selected="${this.selectedGene}"
                                    @selectrow="${this.onSelectVariant}"
                                    @checkvariant="${this.onCheckVariant}"
                                    @reviewvariant="${this.onReviewVariant}"
                                    @setgenomebrowserposition="${this.onGenomeBrowserPositionChange}">
                                </variant-interpreter-grid>
                                <variant-interpreter-detail
                                    .opencgaSession="${this.opencgaSession}"
                                    .variant="${this.variant}"
                                    .cellbaseClient="${this.cellbaseClient}"
                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                    .consequenceTypes="${this.consequenceTypes}"
                                    .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                    .config="${this._config.detail}">
                                </variant-interpreter-detail>
                            ` : html`
                                <div class="alert alert-info">
                                    <i class="fas fa-3x fa-info-circle align-middle"></i> No Selected variants yet.
                                </div>
                            `}
                        </div>
                    </div>
                </div>
                <div class="col-md-12">
                    ${this.interpretationView ? html`
                        <clinical-interpretation-view
                            id="id"
                            interpretation="${this.interpretationView}"
                            .opencgaSession="${this.opencgaSession}"
                            .opencgaClient="${this.opencgaSession.opencgaClient}"
                            .cellbaseClient="${this.cellbaseClient}"
                            .consequenceTypes="${this.consequenceTypes}"
                            .proteinSubstitutionScores="${this.proteinSubstitutionScores}">
                        </clinical-interpretation-view>
                        ` : null}
                    </div>
                </div>
            </div>

            <div class="modal fade" id="${this._prefix}PreviewModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" style="width: 1024px">
                    <div class="modal-content">
                        <div class="modal-header" style="display:flex;align-items:center;">
                            <h4 style="margin-right:auto;">
                                Interpretation preview
                            </h4>
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="container-fluid" style="max-height:75vh;overflow-y:auto;">
                                <json-viewer .data="${this.clinicalAnalysis?.interpretation}"></json-viewer>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            title: "RD Case Interpreter",
            showTitle: false,
            result: {
                grid: {
                    pagination: true,
                    pageSize: 10,
                    pageList: [10, 25, 50],
                    showExport: false,
                    detailView: true,
                    showReview: true,
                    showActions: false,

                    showSelectCheckbox: false,
                    multiSelection: false,
                    nucleotideGenotype: true,
                    alleleStringLengthMax: 10,

                    renderLocal: true,

                    header: {
                        horizontalAlign: "center",
                        verticalAlign: "bottom"
                    },

                    quality: {
                        qual: 30,
                        dp: 20
                    },
                    evidences: {
                        showSelectCheckbox: true
                    }
                }
            },
            detail: {
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
                        id: "annotationClinical",
                        title: "Clinical"
                    },
                    {
                        id: "fileMetrics",
                        title: "File Metrics"
                    },
                    {
                        id: "cohortStats",
                        title: "Cohort Stats",
                        cohorts: this.cohorts
                    },
                    {
                        id: "samples",
                        title: "Samples"
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
            }
        };
    }

}

customElements.define("variant-interpreter-review-primary", VariantInterpreterReviewPrimary);
