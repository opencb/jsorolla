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
import {classMap} from "/web_modules/lit-html/directives/class-map.js";
import UtilsNew from "../../../core/utilsNew.js";
import PolymerUtils from "../../PolymerUtils.js";
// import "./variant-interpreter-review-summary.js";
import "./variant-interpreter-review-primary.js";
import "../../clinical/clinical-interpretation-editor.js";


export default class VariantInterpreterReview extends LitElement {

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

        this.activeTab = {"GeneralInfo": true}; //default active tab
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        // console.log("this.interpretation in variant-interpretation-editor", this.interpretation)
        // this._interpretation = this.interpretation;
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("mode") ||
            changedProperties.has("config")) {
            this.propertyObserver();
        }
        if (changedProperties.has("clinicalAnalysis") || changedProperties.has("interpretation")) {
            this.clinicalAnalysisObserver();
        }
    }

    propertyObserver(opencgaSession, mode, config) {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        // let _config = JSON.parse(JSON.stringify(config));
        let _config = config;
        _config = Object.assign(this.getDefaultConfig(), _config);
        // _config.grid.showSelectCheckbox = false;
        // _config.grid.showStatus = true;
        this._config = _config;

        // Check if Beacon hosts are configured
        // for (const detail of this._config.detail) {
        //     if (detail.id === "beacon" && UtilsNew.isNotEmptyArray(detail.hosts)) {
        //         this.beaconConfig = {
        //             hosts: detail.hosts
        //         };
        //     }
        // }

        if (UtilsNew.isNotUndefinedOrNull(mode)) {
            this.isCreate = mode.toLowerCase() === "create";
        }
    }

    clinicalAnalysisObserver() {
        if (this.clinicalAnalysis) {
            this._interpretation = this.clinicalAnalysis.interpretation;
            if (UtilsNew.isNotUndefinedOrNull(this._interpretation)) {
                if (UtilsNew.isNotEmptyArray(this._interpretation.primaryFindings)) {
                    this.isInterpretedVariants = true;
                } else {
                    this.isInterpretedVariants = false;
                }
            }
            // this.fillForm(this._interpretation);
            this.requestUpdate();
        }
    }

    toggleInterpretationCollapsed(e) {
        this.interpretationCollapsed = !this.interpretationCollapsed;
    }

    toggleVariantsCollapsed(e) {
        this.variantsCollapsed = !this.variantsCollapsed;
    }

    onClinicalAnalysisEditor(e) {
        debugger
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
                    // TODO We should update here clinicalAnalysis and add to interpretation list this file with its name from save interpertation forms.
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
                        study: _this.opencgaSession.study.fqn,
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

    _changeTab(e) {
        e.preventDefault();
        const tabId = e.currentTarget.dataset.id;
        const navTabs = $(`#${this._prefix}ReviewTabs > .nav-tabs > .content-pills`, this);
        const contentTabs = $(`#${this._prefix}ReviewTabs > .content-tab-wrapper > .tab-pane`, this);
        if (!e.currentTarget?.className?.split(" ")?.includes("disabled")) {
            navTabs.removeClass("active");
            contentTabs.removeClass("active");
            $("#" + this._prefix + tabId).addClass("active");
            for (const tab in this.activeTab) this.activeTab[tab] = false;
            this.activeTab[tabId] = true;
            this.requestUpdate();
        }
    }

    getDefaultConfig() {
        return {};
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession.project) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue</h3>
                </div>
            `;
        }

        return html`
            <div id="${this._prefix}ReviewTabs">
                <div>
                    <ul class="nav nav-tabs nav-center tablist" role="tablist" aria-label="toolbar">
                        <li role="presentation" class="content-pills active ${classMap({active: this.activeTab["GeneralInfo"]})}">
                            <a href="javascript: void 0" role="tab" data-id="GeneralInfo" @click="${this._changeTab}" class="tab-title">General Info</a>
                        </li>
                        <li role="presentation" class="content-pills ${classMap({active: this.activeTab["PrimaryFindings"]})}">
                            <a href="javascript: void 0" role="tab" data-id="PrimaryFindings" @click="${this._changeTab}" class="tab-title">Primary Findings</a>
                        </li>
                        <!--<li role="presentation" class="content-pills help-pill ${classMap({active: this.activeTab["help"]})}">
                            <a href="javascript: void 0" role="tab" data-id="Help" @click="${this._changeTab}" class="tab-title"><i class="fas fa-question-circle"></i> Help</a>
                        </li>-->
                    </ul>
                </div>

                <div class="content-tab-wrapper">
                    <div id="${this._prefix}GeneralInfo" role="tabpanel" class="tab-pane active col-md-10 col-md-offset-1 content-tab">
                        <tool-header title="Interpretation - ${this.clinicalAnalysis?.interpretation?.id}" class="bg-white"></tool-header>
                        <div style="padding: 0px 10px">
                            <clinical-interpretation-editor .opencgaSession="${this.opencgaSession}"
                                                            .clinicalAnalysis="${this.clinicalAnalysis}">
                            </clinical-interpretation-editor>
                        </div>
                    </div>
                    <div id="${this._prefix}PrimaryFindings" role="tabpanel" class="tab-pane col-md-10 col-md-offset-1 content-tab">
                        <tool-header title="Primary Findings - ${this.clinicalAnalysis?.interpretation?.id}" class="bg-white"></tool-header>
                        <variant-interpreter-review-primary .opencgaSession="${this.opencgaSession}"
                                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                                            .active="${this.activeTab["PrimaryFindings"]}">
                        </variant-interpreter-review-primary>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-review", VariantInterpreterReview);
