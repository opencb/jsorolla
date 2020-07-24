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
import UtilsNew from "../../../utilsNew.js";
import PolymerUtils from "../../PolymerUtils.js";
import "./variant-interpreter-grid.js";
import "./variant-interpreter-detail.js";
import "../../opencga/opencga-genome-browser.js";
import "../../clinical/clinical-interpretation-view.js";


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

        //TODO recheck this variant-interpretation-editor doesn't have a "mode" prop in opencga-variant-interpretation
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

    firstUpdated(_changedProperties) {
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

    // onReviewVariant(e) {
    //     $("#" + this._prefix + "ReviewSampleModal").modal("show");
    // }

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
        // this.interpretationView = this._createInterpretation();
        this.interpretationView = this._interpretation;
    }

    onSaveInterpretation(e, obj) {
        this.clinicalAnalysis
        debugger
        this.opencgaSession.opencgaClient.clinical().updateInterpretation(this.clinicalAnalysis.id, this.clinicalAnalysis.interpretation, {study: this.opencgaSession.study.fqn})
            .then(response => {
                debugger
            })
            .catch(error => console.error(error));
        // const id = PolymerUtils.getValue(this._prefix + "IDInterpretation");
        // const description = PolymerUtils.getValue(this._prefix + "DescriptionInterpretation");
        // const comment = PolymerUtils.getValue(this._prefix + "CommentInterpretation");

        // if (UtilsNew.isNotEmpty(id)) {
        //     if (/s/.test(id)) {
        //         this.dispatchEvent(new CustomEvent(this.eventNotifyName, {
        //             detail: {
        //                 message: "ID must not contains blanks.",
        //                 type: UtilsNew.MESSAGE_ERROR
        //             },
        //             bubbles: true,
        //             composed: true
        //         }));
        //     } else {
        //         this.interpretation = this._createInterpretation();
        //     }
        // } else {
        //     this.dispatchEvent(new CustomEvent(this.eventNotifyName, {
        //         detail: {
        //             message: "ID must not be empty.",
        //             type: UtilsNew.MESSAGE_ERROR
        //         },
        //         bubbles: true,
        //         composed: true
        //     }));
        // }
    }

    _createInterpretation() {
        try {
            // let userID = this.opencgaSession.opencgaClient._config.userId;
            // let interpretation = {};
            // interpretation.id = this.clinicalAnalysis.id + "_" + PolymerUtils.getValue(this._prefix + "IDInterpretation");
            // // interpretation.name = PolymerUtils.getValue(this._prefix + "NameInterpretation");
            // interpretation.description = PolymerUtils.getValue(this._prefix + "DescriptionInterpretation");
            // interpretation.clinicalAnalysisId = this.clinicalAnalysisId;
            // interpretation.software = {
            //     name: "TEAM",
            //     version: "2.0",
            //     website: "https://www.ncbi.nlm.nih.gov/pubmed/24861626",
            //     repository: "https://github.com/opencb/opencga",
            //     commit: "f43372aa",
            //     params: {}
            // };
            // interpretation.analyst = {
            //     name: userID,
            //     email: "",
            //     company: ""
            // };
            // interpretation.dependencies = [
            //     {
            //         name: "CellBase", repository: "https://github.com/opencb/cellbase", version: this.cellbaseVersion
            //     }
            // ];
            // interpretation.filters = this.query;
            // //                interpretation.creationDate = Date();
            // interpretation.comments = [{
            //     author: userID,
            //     type: "comment",
            //     text: PolymerUtils.getValue(this._prefix + "CommentInterpretation"),
            //     date: moment(new Date(), "YYYYMMDDHHmmss").format('D MMM YY')
            // }];
            //
            // // Remove 'stateCheckbox' from the variant list. When we receive the list from the grid, we are getting
            // // an additional field that should not be present in a reported variant.
            // let reportedVariants = [];
            // for (let i in this.reportedVariants) {
            //     let variant = Object.assign({}, this.reportedVariants[i]);
            //     delete variant['stateCheckBox'];
            //     reportedVariants.push(variant);
            // }
            // interpretation.primaryFindings = reportedVariants;
            // interpretation.attributes = {};
            // // interpretation.creationDate = moment(new Date(), "YYYYMMDDHHmmss").format('D MMM YY');


            let params = {
                study: this.opencgaSession.study.fqn
            };

            const _this = this;
            console.error("new client recheck");
            this.opencgaSession.opencgaClient.interpretations().create(this.clinicalAnalysis.id, params, interpretation)
                .then(response => {
                    console.log(response);
                    // TODO We should update here clinicalAnalysis and add to interpretation list this file with its name from save interpertation form.
                    console.error("interpretation ref is not defined");
                    if (UtilsNew.isNotUndefinedOrNull(this.interpretation) && UtilsNew.isNotUndefinedOrNull(this.interpretation.clinicalAnalysis)) {
                        if (UtilsNew.isEmptyArray(this.interpretation.clinicalAnalysis.interpretations)) {
                            this.interpretation.clinicalAnalysis.interpretations = [];
                        } else {
                            this.interpretation.clinicalAnalysis.interpretations = this.interpretation.clinicalAnalysis.interpretations.map(interpretation => {
                                return {id: interpretation.id, name: interpretation.name, file: interpretation.file.id};
                            });
                        }
                        this.interpretation.clinicalAnalysis.interpretations.push({
                            id: this.interpretation.id,
                            name: this.interpretation.name,
                            file: response.response[0].result[0].id
                        });
                    }

                    params = {
                        study: _this.opencgaSession.study.fqn,
                    };
                    const interpretations = {interpretations: this.interpretation.clinicalAnalysis.interpretations};
                    console.log("new clients change")
                    _this.opencgaSession.opencgaClient.clinical().update(this.interpretation.clinicalAnalysis.id, interpretations, params)
                        .then(response => {
                            this.dispatchEvent(new CustomEvent(this.eventNotifyName, {
                                detail: {
                                    message: this.interpretation.id + " interpretation has been created correctly.",
                                    type: UtilsNew.MESSAGE_SUCCESS
                                },
                                bubbles: true,
                                composed: true
                            }));

                            _this.cleanSaveInterpretation();
                            console.log(response);
                            // Update analysis with new interpretations
                            _this.getAnalysisInterpretations();
                        })
                        .catch(err => {
                            this.dispatchEvent(new CustomEvent(this.eventNotifyName, {
                                detail: {
                                    message: err.error,
                                    type: UtilsNew.MESSAGE_ERROR
                                },
                                bubbles: true,
                                composed: true
                            }));
                        });
                })
                .catch(err => {
                    this.dispatchEvent(new CustomEvent(this.eventNotifyName, {
                        detail: {
                            message: err.error,
                            type: UtilsNew.MESSAGE_ERROR
                        },
                        bubbles: true,
                        composed: true
                    }));
                });

        } catch (err) {
            this.dispatchEvent(new CustomEvent(this.eventNotifyName, {
                detail: {
                    message: err,
                    type: UtilsNew.MESSAGE_ERROR
                },
                bubbles: true,
                composed: true
            }));
        }
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
        const _this = this;
        this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysis.id, params)
            .then(function(response) {
                _this.showSummary = false;
                if (response.response[0].numResults === 1) {
                    _this.clinicalAnalysis = response.response[0].result[0];
                }
            });
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
                    // populationFrequencies: ["1kG_phase3:ALL", "GNOMAD_GENOMES:ALL", "GNOMAD_EXOMES:ALL", "UK10K:ALL", "GONL:ALL", "ESP6500:ALL", "EXAC:ALL"]
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

    render() {
        return html`
        <style>
            .prioritization-center {
                margin: auto;
                text-align: justify;
                width: 95%;
            }

            .browser-variant-tab-title {
                font-size: 115%;
                font-weight: bold;
            }

            .prioritization-variant-tab-title {
                font-size: 115%;
                font-weight: bold;
            }

            .icon-padding {
                padding-left: 4px;
                padding-right: 8px;
            }

            .form-section-title {
                padding: 5px 0px;
                width: 90%;
                border-bottom-width: 1px;
                border-bottom-style: solid;
                border-bottom-color: #ddd
            }

            .jso-label-title {
                width: 15em !important;
            }
        </style>

        <div class="">
            <div class="pull-right save-button">
                <button type="button" class="btn btn-primary ripple" @click="${this.onViewInterpretation}">Preview</button>
                <button class="btn btn-primary ripple" @click="${this.onSaveInterpretation}">
                    <i class="fas fa-save icon-padding"></i>Save
                </button>
            </div>
            <tool-header title="Primary Findings" class="bg-white" icon="${this._config.icon}"></tool-header>

            <div class="row">
                <div id="${this._prefix}SaveInterpretation">
                    <div class="col-md-12">
                        ${this.messageError ? html ` 
                            <div class="alert alert-danger" role="alert" id="${this._prefix}messageError" style="margin:5px auto;">${this.messageErrorText}</div>
                        ` : null}
                        ${this.messageSuccess ? html `
                            <div class="alert alert-success" role="alert" id="${this._prefix}messageSuccess" style="margin:5px auto;">${this.messageSuccessText}</div>
                        ` : null}
                    </div>
    
                    <div class="col-md-12">
                        <div style="padding-top: 5px">
    
                            <div id="${this._prefix}collapsibleVariants" class="collapse in">
                                ${this.clinicalAnalysis && this.clinicalAnalysis.interpretation 
                                    ? html`
                                        <variant-interpreter-grid .opencgaSession="${this.opencgaSession}"
                                                                  .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                  .consequenceTypes="${consequenceTypes}"
                                                                  .populationFrequencies="${populationFrequencies}"
                                                                  .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                                  .config="${this._config.result.grid}"
                                                                  @selected="${this.selectedGene}"
                                                                  @selectrow="${this.onSelectVariant}"
                                                                  @checkvariant="${this.onCheckVariant}"
                                                                  @reviewvariant="${this.onReviewVariant}"
                                                                  @setgenomebrowserposition="${this.onGenomeBrowserPositionChange}">
                                        </variant-interpreter-grid>
        
                                        <variant-interpreter-detail .opencgaSession="${this.opencgaSession}"
                                                                    .variant="${this.variant}"
                                                                    .cellbaseClient="${this.cellbaseClient}"
                                                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                    .consequenceTypes="${this.consequenceTypes}"
                                                                    .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                                    .config="${this._config.detail}">
                                        </variant-interpreter-detail>` 
                                    : html`
                                        <div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> No Selected variants yet.</div>`
                                }
                            </div>
                        </div>
                    </div>
    
                    <div class="col-md-12">
                        ${this.interpretationView ? html`
                            <clinical-interpretation-view id="id"
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
        </div>
    `;
    }

}

customElements.define("variant-interpreter-review-primary", VariantInterpreterReviewPrimary);
