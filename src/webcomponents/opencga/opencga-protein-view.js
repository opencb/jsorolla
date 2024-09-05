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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import PolymerUtils from "../PolymerUtils.js";
import "../variant/variant-browser-grid.js";

export default class OpencgaProteinView extends LitElement {

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
            opencgaClient: {
                type: Object
            },
            project: {
                type: Object
            },
            study: {
                type: Object
            },
            protein: {
                type: String
            },
            populationFrequencies: {
                type: Array
            },
            proteinSubstitutionScores: {
                type: Object
            },
            consequenceTypes: {
                type: Object
            },
            variant: {
                type: String
            },
            settings: {
                type: Object
            },
            summary: {
                type: Boolean
            }
        };
    }

    _init() {
        this._prefix = "opencgaProteinView" + UtilsNew.randomString(6) + "_";
        this.variant = "";
        this.summary = true;
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            // this.geneChanged();
        }

        if (changedProperties.has("protein")) {
            this.projectStudyObtained();
        }

        if (changedProperties.has("project") || changedProperties.has("study")) {
            this._proteinChanged();
        }

        if (changedProperties.has("settings")) {
            // TODO support settings
        }
    }

    projectStudyObtained() {
        if (UtilsNew.isNotUndefined(this.project) && UtilsNew.isNotEmpty(this.project.alias) &&
            UtilsNew.isNotUndefined(this.study) && UtilsNew.isNotEmpty(this.study.alias)) {
            this.hashFragmentCredentials = {
                project: this.project.alias,
                study: this.study.alias
            };
        }
    }

    checkPrimary(item) {
        if (item.type === "primary") {
            return true;
        }
    }

    checkLastItem(array, item) {
        if (array[array.length - 1] === item) {
            return true;
        }
    }

    _proteinChanged() {
        // Remove the previously added SVG
        const svg = PolymerUtils.querySelector("svg");
        if (svg !== null) {
            const proteinSvgDiv = PolymerUtils.getElementById(this._prefix + "ProteinSvgDiv");
            if (proteinSvgDiv !== undefined && proteinSvgDiv !== null) {
                //                        proteinSvgDiv.removeChild(svg);
            }
        }

        const query = {};
        query.xref = this.protein;
        const _this = this;
        if (this.cellbaseClient instanceof CellBaseClient && UtilsNew.isNotEmpty(this.protein)) {
            // FIXME Below line should work as soon as the proteins are annotated
            //                    query["annot-xref"] = this.protein; // Query object that is passed to Variant browser grid

            // FIXME Below is a patch that needs to be removed
            //                    _this.cellbaseClient.get("feature", "id", this.protein, "xref", {
            //                        dbname: "ensembl_transcript"
            // //                        "Output format": "json"
            //                    }).then(function (response) {
            //                        let transcripts = [];
            //                        let results = response.response[0].result;
            //                        for (let result of results) {
            //                            transcripts.push(result.id);
            //                        }
            //                        query["annot-xref"] = transcripts.join(",");
            //                        _this.query = query;
            //                    });

            _this.cellbaseClient.getProteinClient(this.protein, "info", {}, {})
                .then(function (response) {
                    _this.proteinObj = response.response[0].result[0];

                    if (typeof _this.proteinObj !== "undefined" && typeof _this.project !== "undefined" && typeof _this.study !== "undefined" && typeof _this.study.alias !== "undefined") {
                        const params = {
                            //                                    "annot-xref": _this.protein,
                            // TODO remove below gene and give proper query param
                            "xref": _this.proteinObj.gene[0].name[0].value,
                            "annot-ct": "missense_variant,transcript_ablation,splice_acceptor_variant,splice_donor_variant,stop_gained,frameshift_variant,stop_lost,start_lost," +
                                "transcript_amplification,inframe_insertion,inframe_deletion",
                            "study": _this.project.alias + ":" + _this.study.alias,
                            "includeStudy": _this.project.alias + ":" + _this.study.alias,
                            "summary": _this.summary
                            // exclude: "studies.samplesData,studies.files"
                        };

                        _this.opencgaClient.variants().query(params)
                            .then(function (variants) {
                                const lollipop = new Lollipop();
                                const svgSettings = {
                                    // width: _this.proteinObj.sequence.length,
                                    width: 1280,
                                    height: 140,
                                    proteinPositioningInterval: 3,
                                    color: _this.config.color
                                };
                                const svg = lollipop.createSvg(_this.proteinObj, variants.response[0].result, svgSettings);
                                const querySelector = PolymerUtils.getElementById(_this._prefix + "ProteinSvgDiv");
                                querySelector.appendChild(svg);
                                _this.requestUpdate();

                            }).catch(function (e) {
                                console.log(e);
                            });
                    }
                });
            _this.query = query;
        }
    }

    updateQuery(e) {
        PolymerUtils.removeClass(".protein-ct-buttons", "active");
        PolymerUtils.addClass(e.target.id, "active");
        const query = this.query;
        switch (e.target.innerText) {
            case "Missense":
                query.ct = "missense_variant";
                break;
            case "LoF":
                query.ct = this.consequenceTypes.lof.join(",");
                break;
            default:
                if (typeof query.ct !== "undefined") {
                    delete query.ct;
                }
                break;
        }
        this.query = Object.assign({}, query);
    }

    checkVariant(variant) {
        return variant.split(":").length > 2;
    }

    showBrowser() {
        const hash = window.location.hash.split("/");
        const newHash = "#browser/" + hash[1] + "/" + hash[2];
        window.location.hash = newHash;
    }

    onSelectVariant(e) {
        this.variant = e.detail.id;
    }

    render() {
        return html`
        <style>
            .protein-variant-tab-title {
                font-size: 150%;
                font-weight: bold;
            }

            .protein-align-left {
                width: 25%;
                display: block;
                float: left;
                text-align: left;
            }

            .protein-align-right {
                width: 75%;
                display: block;
                float: left;
                text-align: left;
            }
        </style>

        <div>
            <div style="float: right;padding: 10px 5px 10px 5px">
                <button type="button" class="btn btn-primary" @click="${this.showBrowser}">
                    <i class="fa fa-hand-o-left" aria-hidden="true"></i> Variant Browser
                </button>
            </div>

            <h2>${this.protein} (<i>Beta</i>)</h2>

            ${this.proteinObj ? html`
                <div class="row" style="padding: 5px 0px 25px 0px">
                    <div class="col-md-5">
                        <h3>Summary</h3>
                        <div class="block">
                            <label class="protein-align-left">Name</label>
                            <div class="protein-align-right">
                                ${this.proteinObj.name && this.proteinObj.name.length ? this.proteinObj.name.map(item => html`
                                    ${item}<br>
                                `) : null}
                            </div>
                            <br>
                        </div>
                        <div class="block">
                            <label class="protein-align-left">Recommended Name</label>
                            <div class="protein-align-right">${this.proteinObj.protein ? this.proteinObj.protein.recommendedName.fullName.value : ""}
                            </div>
                            <br>
                        </div>
                        <div class="block">
                            <label class="protein-align-left">Accession</label>
                            <div class="protein-align-right">
                                <!-- TODO refactor with join-->
                                ${this.proteinObj.accession && this.proteinObj.accession.length ? this.proteinObj.accession.map(item => html`
                                    ${this.item}
                                    ${!this.checkLastItem(this.proteinObj.accession, item) ? "," : ""}
                                `) : null }
                            </div>
                            <br>
                        </div>
                        <div class="block">
                            <label class="protein-align-left">Gene</label>
                            <div class="protein-align-right">
                                <!-- TODO add checkPrimary filter above! (see original file) -->
                                ${this.proteinObj.gene && this.proteinObj.gene.length ? this.proteinObj.gene.map(gene => gene.name.map(item => html`
                                    ${item}
                                `)) : null}
                            </div>
                            <br>
                        </div>
                        <div class="block">
                            <label class="protein-align-left">Keywords</label>
                            <div class="protein-align-right">
                                ${this.proteinObj.keyword && this.proteinObj.keyword.length ? this.proteinObj.keyword.map(item => html`
                                    ${this.item.value}
                                    ${!this.checkLastItem(this.proteinObj.accession, item) ? "," : ""}
                                `) : null}
                            </div>
                            <br>
                        </div>
                        <div class="block">
                            <label class="protein-align-left">Sequence</label>
                            <div class="protein-align-right">
                                <textarea class="form-control" rows="3" readonly>${this.proteinObj.sequence.value}</textarea>
                            </div>
                            <br>
                        </div>
                        <div class="block">
                            <label class="protein-align-left">Sequence Length</label>
                            <div class="protein-align-right">${this.proteinObj.sequence.length}
                            </div>
                            <br>
                        </div>
                    </div>

                </div>
            ` : null}
            <!--SVG-->
            <div id="${this._prefix}ProteinSvgDiv">
            </div>
        </div>
        <br>

        <ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">
            <li role="presentation" class="nav-item active">
                <a href="#${this._prefix}Variants" role="tab" data-bs-toggle="tab" class="nav-link protein-variant-tab-title">Variants</a>
            </li>
        </ul>

        <div class="tab-content" style="height: 1024px">
            <div role="tabpanel" class="tab-pane active" id="${this._prefix}Variants">
                <div class="btn-group btn-group" role="group" aria-label="..." style="padding: 15px;float: right">
                    <button id="${this._prefix}AllConsTypeButton" type="button" class="btn btn-light btn-warning protein-ct-buttons active" @click="${this.updateQuery}">
                        All
                    </button>
                    <button id="${this._prefix}MissenseConsTypeButton" type="button" class="btn btn-light btn-warning protein-ct-buttons" @click="${this.updateQuery}">
                        Missense
                    </button>
                    <button id="${this._prefix}LoFConsTypeButton" type="button" class="btn btn-light btn-warning protein-ct-buttons" @click="${this.updateQuery}">
                        LoF
                    </button>
                </div>

                <br>
                <br>
                <variant-browser-grid
                    .opencgaSession="${this.opencgaSession}"
                    .project="${this.project}"
                    .study="${this.study}"
                    .opencgaClient="${this.opencgaClient}"
                    .populationFrequencies="${this.populationFrequencies}"
                    .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                    .consequenceTypes="${this.consequenceTypes}"
                    .search="${this.query}"
                    .query="${this.query}"
                    .variant="${this.variant}"
                    .summary="${this.summary}"
                    style="font-size: 12px">
                </variant-browser-grid>

                <!-- Bottom tabs with specific variant information -->
                ${this.checkVariant(this.variant) ? html`
                    <div style="padding-top: 20px; height: 400px">
                        <h3>Advanced Annotation for Variant: ${this.variant}</h3>
                        <!--<cellbase-variantannotation-view data="\${this.variant}" prefix="\${this._prefix}"-->
                                <!--cellbase-client="\${this.cellbaseClient}" assembly=\${this.project.organism.assembly} -->
                                <!--hash-fragment-credentials="\${this.hashFragmentCredentials}"-->
                                <!--style="font-size: 12px"-->
                                <!--population-frequencies="\${this.populationFrequencies}"-->
                                <!--protein-substitution-scores="\${this.proteinSubstitutionScores}"-->
                                <!--consequence-types="\${this.consequenceTypes}">-->
                        <!--</cellbase-variantannotation-view>-->
                    </div>
                    ` : html`
                    <br>
                    <h3>Please select a variant to view variant's detailed annotation</h3>
                ` }
            </div>

        </div>
        `;
    }

}

customElements.define("opencga-protein-view", OpencgaProteinView);
