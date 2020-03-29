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

import {LitElement, html} from "/web_modules/lit-element.js";
import Utils from "./../../utils.js";
import UtilsNew from "../../utilsNew.js";
import PolymerUtils from "../PolymerUtils.js";
import "./opencga-variant-filter.js";
import "../opencga/opencga-active-filters.js";
import "./opencga-variant-grid.js";
import "./opencga-variant-interpretation-grid.js";
import "./opencga-variant-interpretation-detail.js";
import "../clinical/opencga-clinical-analysis-view.js";
import "../opencga/opencga-genome-browser.js";
import "../clinical/clinical-interpretation-view.js";


export default class OpencgaVariantInterpretationEditor extends LitElement {

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
            interpretation: {
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
        this._prefix = "ovi-" + Utils.randomString(6);

        //TODO recheck this variant-interpretation-editor doesn't have a "mode" prop in opencga-variant-interpretation
        this.mode = "create";
        this.isCreate = this.mode.toLowerCase() === "create";

        this.interpretationCollapsed = false;
        this.variantsCollapsed = false;
        this.isInterpretedVariants = false;

        this.checkProjects = false;
        this.interactive = true;
        this.filterClass = "col-md-2";
        this.gridClass = "col-md-10";

        this._collapsed = true;

        this.messageError = false;
        this.messageSuccess = false;

        this.variant = null;
        this.reportedVariants = [];

        this._config = this.getDefaultConfig();

    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("mode") ||
            changedProperties.has("config")) {
            this.propertyObserver();
        }
        if (changedProperties.has("interpretation")) {
            this.interpretationObserver();
        }
    }

    connectedCallback() {
        super.connectedCallback();
        console.log("this.interpretation in variant-interpretation-editor", this.interpretation)
        this._interpretation = this.interpretation;
    }

    firstUpdated(_changedProperties) {

        // if (!this.interactive) {
        //     this.collapseFilter();
        // }

        // CellBase version
        this.cellbaseClient.getMeta("about").then(response => {
            if (UtilsNew.isNotUndefinedOrNull(response) && UtilsNew.isNotEmptyArray(response.response)) {
                if (UtilsNew.isNotUndefinedOrNull(response.response[0].result) && UtilsNew.isNotEmptyArray(response.response[0].result)) {
                    this.cellbaseVersion = response.response[0].result[0]["Version: "];
                }
            }
        });
    }

    propertyObserver(opencgaSession, mode, config) {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        let _config = JSON.parse(JSON.stringify(config));
        _config = Object.assign(this.getDefaultConfig(), _config);
        _config.grid.showSelectCheckbox = false;
        _config.grid.showStatus = true;
        this._config = _config;

        // Check if Beacon hosts are configured
        for (const detail of this._config.detail) {
            if (detail.id === "beacon" && UtilsNew.isNotEmptyArray(detail.hosts)) {
                this.beaconConfig = {
                    hosts: detail.hosts
                };
            }
        }

        if (UtilsNew.isNotUndefinedOrNull(mode)) {
            this.isCreate = mode.toLowerCase() === "create";
        }

        // if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.project)) {
        //     this.checkProjects = true;
        // } else {
        //     this.checkProjects = false;
        // }
    }

    interpretationObserver() {
        // TODO We need to respect all the changes made in the reported variants
        this._interpretation = this.interpretation;

        if (UtilsNew.isNotUndefinedOrNull(this._interpretation)) {
            if (UtilsNew.isNotEmptyArray(this._interpretation.primaryFindings)) {
                this.isInterpretedVariants = true;
            } else {
                this.isInterpretedVariants = false;
            }
        }
        // this.fillForm(this._interpretation);
    }

    toggleInterpretationCollapsed(e) {
        this.interpretationCollapsed = !this.interpretationCollapsed;
    }

    toggleVariantsCollapsed(e) {
        this.variantsCollapsed = !this.variantsCollapsed;
    }

    onClinicalAnalysisEditor(e) {
        // debugger
        this.clinicalAnalysis = Object.assign({}, e.detail.clinicalAnalysis);
    }

    // interactiveObserver() {
    //     if (!this.interactive) {
    //         this.collapseFilter();
    //     } else {
    //         this.unCollapseFilter();
    //     }
    // }

    // onCollapse() {
    //     if (this._collapsed) {
    //         this.unCollapseFilter();
    //     } else {
    //         this.collapseFilter();
    //     }
    // }

    // collapseFilter() {
    //     this.filterClass = "hidden";
    //     this.gridClass = "prioritization-center";
    //     this._collapsed = true;
    // }
    //
    // unCollapseFilter() {
    //     if (this.interactive) {
    //         this.filterClass = "col-md-2";
    //         this.gridClass = "col-md-10";
    //         this._collapsed = false;
    //     }
    // }


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
        this.variant = e.detail.variant;
        // this.variant = e.detail.id;
        // this.variantObj = e.detail.variant;
    }

    onSelectVariant2(e) {

        this.selectedVariant = e.detail.variant;
        // this.variant = e.detail.id;
        // this.variantObj = e.detail.variant;
    }

    onCheckVariant(e) {
        // Alexis: we need to do something like this:
        this.checkedVariants = e.detail.variants;

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
        this.dispatchEvent(new CustomEvent("gotoreport", {detail: {interpretation: this.interpretation}}));
    }

    triggerBeacon(e) {
        this.variantToBeacon = this.variant.id;
    }

    onViewInterpretation(e) {
        // this.interpretationView = this._createInterpretation();
        this.interpretationView = this._interpretation;
    }

    onSaveInterpretation(e, obj) {
        const id = PolymerUtils.getValue(this._prefix + "IDInterpretation");
        const description = PolymerUtils.getValue(this._prefix + "DescriptionInterpretation");
        const comment = PolymerUtils.getValue(this._prefix + "CommentInterpretation");

        if (UtilsNew.isNotEmpty(id)) {
            if (/s/.test(id)) {
                this.dispatchEvent(new CustomEvent(this.eventNotifyName, {
                    detail: {
                        message: "ID must not contains blanks.",
                        type: UtilsNew.MESSAGE_ERROR
                    },
                    bubbles: true,
                    composed: true
                }));
            } else {
                this.interpretation = this._createInterpretation();
            }
        } else {
            this.dispatchEvent(new CustomEvent(this.eventNotifyName, {
                detail: {
                    message: "ID must not be empty.",
                    type: UtilsNew.MESSAGE_ERROR
                },
                bubbles: true,
                composed: true
            }));
        }
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
                    if (UtilsNew.isNotUndefinedOrNull(interpretation) && UtilsNew.isNotUndefinedOrNull(interpretation.clinicalAnalysis)) {
                        if (UtilsNew.isEmptyArray(interpretation.clinicalAnalysis.interpretations)) {
                            interpretation.clinicalAnalysis.interpretations = [];
                        } else {
                            interpretation.clinicalAnalysis.interpretations = interpretation.clinicalAnalysis.interpretations.map(interpretation => {
                                return {id: interpretation.id, name: interpretation.name, file: interpretation.file.id};
                            });
                        }
                        interpretation.clinicalAnalysis.interpretations.push({
                            id: interpretation.id,
                            name: interpretation.name,
                            file: response.response[0].result[0].id
                        });
                    }

                    params = {
                        study: _this.opencgaSession.project.alias + ":" + _this.opencgaSession.study.alias
                    };
                    const interpretations = {interpretations: interpretation.clinicalAnalysis.interpretations};
                    console.log("new clients change")
                    _this.opencgaSession.opencgaClient.clinical().update(interpretation.clinicalAnalysis.id, interpretations, params)
                        .then(response => {
                            this.dispatchEvent(new CustomEvent(this.eventNotifyName, {
                                detail: {
                                    message: interpretation.id + " interpretation has been created correctly.",
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
            study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias
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
            activeFilters: {
                alias: {
                    // Example:
                    // "region": "Region",
                    // "gene": "Gene",
                    // "genotype": "Sample Genotypes",
                },
                complexFields: ["genotype"],
                hiddenFields: ["study"]
            },
            genomeBrowser: {
                showTitle: false
            }
        };
    }

    render() {
        return html`
        <style include="jso-styles">
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

        <div class="row" style="padding: 0px 10px">
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
                    <div>
                        <!-- <h3 class="form-section-title" style="margin-top: 10px">Interpretation</h3> -->
                        <div style="display: inline; cursor:pointer" @click="toggleInterpretationCollapsed"
                             data-toggle="collapse" href="#${this._prefix}collapsibleInterpretation">
                            <h3 class="form-section-title">
                                ${this.interpretationCollapsed ? html`
                                    <i class="fa fa-caret-right" aria-hidden="true" style="width: 20px;padding-left: 5px;padding-right: 5px"></i>
                                ` : html`
                                <i class="fa fa-caret-down" aria-hidden="true" style="width: 20px;padding-left: 5px;padding-right: 5px"></i>
                                `}
                                Interpretation
                            </h3>
                        </div>

                        <div id="${this._prefix}collapsibleInterpretation" class="form-horizontal collapse in" data-toggle="validator" data-feedback='{"success": "fa-check", "error": "fa-times"}' role="form">
                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title">Interpretation ID</label>
                                <div class="col-md-3">
                                    ${this.isCreate ? html`
                                        <input type="text" id="${this._prefix}IDInterpretation" class="${this._prefix}TextInput form-control"
                                               placeholder="ID of the interpretation" data-field="id" @input="${this.onInputChange}"
                                               value="${this._interpretation.id}">
                                    ` : html`
                                        <div class="input-group">
                                            <input type="text" id="${this._prefix}IDInterpretation" class="${this._prefix}TextInput form-control"
                                                   placeholder="ID of the interpretation" data-field="id" @input="${this.onInputChange}">
                                            <span class="input-group-btn">
                                            <button class="btn btn-default" type="button">
                                                <i class="fa fa-search" aria-hidden="true"></i>
                                            </button>
                                        </span>
                                        </div>
                                    `}
                                    
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title">Comment</label>
                                <div class="col-md-3">
                                    <input type="text" id="${this._prefix}CommentInterpretation" class="${this._prefix}TextInput form-control"
                                           placeholder="Add a comment" data-field="comment">
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-md-1 jso-label-title">Description</label>
                                <div class="col-md-3">
                                <textarea id="${this._prefix}DescriptionInterpretation" class="${this._prefix}TextInput form-control"
                                          placeholder="Description of the interpretation" data-field="description"
                                          @input="${this.onInputChange}"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="padding-top: 5px">
                        <!--                        <h3 class="form-section-title">Edit Reported Variants</h3>-->
                        <div style="display: inline; cursor:pointer" @click="${this.toggleVariantsCollapsed}"
                             data-toggle="collapse" href="#${this._prefix}collapsibleVariants">
                            <h3 class="form-section-title">
                                ${this.variantsCollapsed ? html`
                                    <i class="fa fa-caret-right" aria-hidden="true" style="width: 20px;padding-left: 5px;padding-right: 5px"></i>
                                ` : html`
                                    <i class="fa fa-caret-down" aria-hidden="true" style="width: 20px;padding-left: 5px;padding-right: 5px"></i>
                                `}
                                Primary Findings
                            </h3>
                        </div>

                        <div id="${this._prefix}collapsibleVariants" class="collapse in">
                            ${this.isInterpretedVariants ? html`
                                <opencga-variant-interpretation-grid .opencgaSession="${this.opencgaSession}"
                                                                     .reportedVariants="${this._interpretation.primaryFindings}"
                                                                     .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                     .consequenceTypes="${this.consequenceTypes}"
                                                                     .populationFrequencies="${this.populationFrequencies}"
                                                                     .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                                     .config="${this._config.grid}"
                                                                     @selected="${this.selectedGene}"
                                                                     @selectvariant2="${this.onSelectVariant2}"
                                                                     @checkvariant="${this.onCheckVariant}"
                                                                     @reviewvariant="${this.onReviewVariant}"
                                                                     @setgenomebrowserposition="${this.onGenomeBrowserPositionChange}">
                                </opencga-variant-interpretation-grid>

                                <opencga-variant-interpretation-detail .opencgaSession="${this.opencgaSession}"
                                                                       .cellbaseClient="${this.cellbaseClient}"
                                                                       .variant="${this.selectedVariant}"
                                                                       .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                       .consequenceTypes="${this.consequenceTypes}"
                                                                       .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                                       .config="${this._config.detail}">
                                </opencga-variant-interpretation-detail>
                            ` : html`
                                <h4 style="padding: 20px">No interpreted variants</h4>
                            ` }

                        </div>
                    </div>
                </div>

                <div class="col-md-12">
                    <div class="col-md-4 col-md-offset-8" style="padding: 0px 20px;">
                        <button type="button" class="btn btn-primary" @click="${this.onViewInterpretation}">View</button>
                        <button type="button" class="btn btn-primary" @click="${this.onSaveInterpretation}">Save</button>
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
                                                      .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                      style="font-size: 12px">
                        </clinical-interpretation-view>
                    ` : null}
                </div>
            </div>
        </div>
        <!--</template>-->

        <!--<template is="dom-if" if="${!this.checkProjects}}">-->
        <!--<span style="text-align: center"><h3>No public projects available to browse. Please login to continue</h3></span>-->
        <!--</template>-->

    `;
    }

}

customElements.define("opencga-variant-interpretation-editor", OpencgaVariantInterpretationEditor);
