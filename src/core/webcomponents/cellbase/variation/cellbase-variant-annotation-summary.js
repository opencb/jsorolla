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

export default class CellbaseVariantAnnotationSummary extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            data: {
                type: Object,
                observer: "variantAnnotationChanged"
            },
            consequenceTypes: {
                type: Object,
                observer: "setColors"
            },
            proteinSubstitutionScores: {
                type: Object,
                observer: "setColors"
            },
            minimumFreq: {
                type: Array
            },
            prefix: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "sf-" + Utils.randomString(6) + "_";
        this.data = {};
    }

    updated(changedProperties) {
        if (changedProperties.has("data")) {
            this.variantAnnotationChanged();
        }
        if (changedProperties.has("consequenceTypes") || changedProperties.has("proteinSubstitutionScores")) {
            this.setColors();
        }
    }

    ready() {
        super.ready();

        if (typeof this.prefix === "undefined" || this.prefix === "") {
            this.prefix = "annotation" + Utils.randomString(6);
        }
    }

    isTranscriptAvailable(item) {
        return item !== "";
    }

    isDataEmpty(data) {
        return typeof data === "undefined";
    }

    setColors() {
        if (typeof this.consequenceTypes !== "undefined") {
            let consequenceTypeToColor = {};
            for (let i = 0; i < this.consequenceTypes.categories.length; i++) {
                if (typeof this.consequenceTypes.categories[i].terms !== "undefined") {
                    for (let j = 0; j < this.consequenceTypes.categories[i].terms.length; j++) {
                        consequenceTypeToColor[this.consequenceTypes.categories[i].terms[j].name] = this.consequenceTypes.color[this.consequenceTypes.categories[i].terms[j].impact];
                    }
                } else if (typeof this.consequenceTypes.categories[i].id !== "undefined" && typeof this.consequenceTypes.categories[i].name !== "undefined") {
                    consequenceTypeToColor[this.consequenceTypes.categories[i].name] = this.consequenceTypes.color[this.consequenceTypes.categories[i].impact];
                }
            }
            this.consequenceTypeToColor = consequenceTypeToColor;
        }

        if (typeof this.proteinSubstitutionScores !== "undefined") {
            let pssColor = new Map();
            for (let i in this.proteinSubstitutionScores) {
                let obj = this.proteinSubstitutionScores[i];
                Object.keys(obj).forEach(key => {
                    pssColor.set(key, obj[key]);
                });
            }
            this.pssColor = pssColor;
        }
    }

    variantAnnotationChanged(neo, old) {
        let _this = this;

        if (typeof _this.data !== "undefined") {
            if (UtilsNew.isEmpty(_this.data.reference)) {
                _this.data.reference = "-";
            }

            if (UtilsNew.isEmpty(_this.data.alternate)) {
                _this.data.alternate = "-";
            }

            // Consequence type
            // Color the consequence type
            if (typeof _this.consequenceTypeToColor !== "undefined" && typeof _this.consequenceTypeToColor[_this.data.displayConsequenceType] !== "undefined") {
                $("#" + _this.prefix + "CT").css("color", _this.consequenceTypeToColor[_this.data.displayConsequenceType]);
            }

            // Find the gene and transcript that exhibit the display consequence type
            if (typeof _this.data.consequenceTypes !== "undefined") {
                for (let i = 0; i < _this.data.consequenceTypes.length; i++) {
                    for (let j = 0; j < _this.data.consequenceTypes[i].sequenceOntologyTerms.length; j++) {
                        if (_this.data.displayConsequenceType === _this.data.consequenceTypes[i].sequenceOntologyTerms[j].name) {
                            _this.ctGene = _this.data.consequenceTypes[i].geneName;
                            _this.ctTranscript = _this.data.consequenceTypes[i].ensemblTranscriptId;
                            break;
                        }
                    }
                }
            }

            // PSS
            let proteinSubScore = {};
            if (typeof _this.data.consequenceTypes !== "undefined") {
                let min = 10;
                let max = 0;
                for (let i = 0; i < _this.data.consequenceTypes.length; i++) {
                    if (typeof _this.data.consequenceTypes[i].proteinVariantAnnotation !== "undefined") {
                        let gene = _this.data.consequenceTypes[i].geneName;
                        let transcript = _this.data.consequenceTypes[i].ensemblTranscriptId;
                        let scores = _this.data.consequenceTypes[i].proteinVariantAnnotation.substitutionScores;
                        if (typeof scores !== "undefined") {
                            for (let j = 0; j < scores.length; j++) {
                                if (scores[j].source === "sift" && scores[j].score <= min) {
                                    min = scores[j].score;
                                    proteinSubScore.sift = {score: scores[j].score, description: scores[j].description, gene: gene, transcript: transcript};
                                    if (typeof _this.pssColor !== "undefined" && typeof _this.pssColor.get(scores[j].description) !== "undefined") {
                                        $("#" + _this.prefix + "Sift").css("color", _this.pssColor.get(scores[j].description));
                                    }
                                } else if (scores[j].source === "polyphen" && scores[j].score >= max) {
                                    max = scores[j].score;
                                    proteinSubScore.polyphen = {score: scores[j].score, description: scores[j].description, gene: gene, transcript: transcript};
                                    if (typeof _this.pssColor !== "undefined" && typeof _this.pssColor.get(scores[j].description) !== "undefined") {
                                        $("#" + _this.prefix + "Polyphen").css("color", _this.pssColor.get(scores[j].description));
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (Object.keys(proteinSubScore).length === 0 && proteinSubScore.constructor === Object) {
                proteinSubScore.sift = {score: "NA", description: "NA", transcript: ""};
                proteinSubScore.polyphen = {score: "NA", description: "NA", transcript: ""};
                $("#" + _this.prefix + "Sift").css("color", "black");
                $("#" + _this.prefix + "Polyphen").css("color", "black");
            }
            _this.proteinSubScore = proteinSubScore;

            // CADD
            if (typeof _this.data.functionalScore !== "undefined") {
                for (let i in _this.data.functionalScore) {
                    let value = Number(_this.data.functionalScore[i].score).toFixed(2);
                    if (_this.data.functionalScore[i].source == "cadd_scaled") {
                        if (value > 15) {
                            $("#" + _this.prefix + "Cadd").css("color", "red");
                            _this.caddScaled = value;
                        } else {
                            $("#" + _this.prefix + "Cadd").css("color", "black");
                            _this.caddScaled = value;
                        }
                    }
                }
            } else {
                $("#" + _this.prefix + "Cadd").css("color", "black");
                _this.caddScaled = "NA";
            }

        }
    }

    render() {
        return html`
            <div>
                <style include="jso-styles">
                    div.block {
                        overflow: hidden;
                    }
            
                    .align-left {
                        width: 20%;
                        display: block;
                        float: left;
                        text-align: left;
                    }
            
                    .align-right {
                        width: 70%;
                        display: block;
                        float: left;
                        text-align: left;
                    }
                </style>
            
                <div>
                    <div class="block">
                        <label class="align-left">ID</label>
                        <div class="align-right"><a target="_blank"
                                                    href="http://grch37.ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=${this.data.id}">${this.data.id}</a>
                        </div>
                        <br>
                    </div>
                    ${this.data.hgvs && this.data.hgvs.length ? html`
                            <div class="block">
                                <label class="align-left">HGVS</label>
                                <div class="align-right">
                                    ${this.data.hgvs.map(item => html`
                                        {item}<br>
                                    `)}
                                </div> <br>
                            </div>
                        ` : null}
                    <div class="block">
                        <label class="align-left">Alleles</label>
                        <div class="align-right">${this.data.reference}/${this.data.alternate}</div>
                        <br>
                    </div>
                    <div class="block">
                        <label class="align-left">Location</label>
                        <div class="align-right">
                            <a target="_blank" href="http://genomemaps.org/?region=${this.data.chromosome}:${this.data.start}">
                                ${this.data.chromosome}:${this.data.start}
                                ${this.data.end ? html`
                                <div>-${this.data.end}</div>
                            ` : null}
                            </a>
                        </div>
                        <br>
                    </div>
                    ${this.isDataEmpty(this.data.type) ? html`
                            <div class="block">
                                <label class="align-left">Type</label>
                                <div class="align-right">${this.data.type}</div>
                                <br>
                            </div>
                    ` : null }
                    ${this.isDataEmpty(this.data.ancestralAllele) ? html`
                        <div class="block">
                            <label class="align-left">Ancestral Allele</label>
                            <div class="align-right">${this.data.ancestralAllele}</div>
                            <br>
                        </div>
                    ` : null }
                    ${this.isDataEmpty(this.data.minorAlleleFreq) ? html`
                        <div class="block">
                            <label class="align-left">MAF</label>
                            <div class="align-right">${this.data.minorAlleleFreq} (${this.data.minorAllele})</div>
                            <br>
                         </div>
                    ` : null }
                    <div class="block">
                        <label class="align-left">Most Severe Consequence Type</label>
                        <div class="align-right"><span id="${this.prefix}CT">${this.data.displayConsequenceType}</span>
                            ${this.isDataEmpty(this.ctGene) ? html`
                                    <span>(<b>Gene</b> : ${this.ctGene}, <b>Transcript</b> : ${this.ctTranscript})</span>
                                ` : null }
                        </div>
                        <br>
                    </div>
                    <div class="block">
                        <label class="align-left">Most Severe Deleterious Score</label>
                        <div class="align-right">
                            <!-- Sift -->
                            <div class="row" style="padding-left: 12px">
                                <label style="width:10%">Sift</label>
                                <span id="${this.prefix}Sift"
                                      title="${this.proteinSubScore.sift.score}">${this.proteinSubScore.sift.description}</span>
                                ${this.isTranscriptAvailable(this.proteinSubScore.sift.transcript) ? html`
                                    (<b>Gene:</b>{{proteinSubScore.sift.gene}, <b>Transcript: </b>{{proteinSubScore.sift.transcript})
                                ` : null }
                                <br>
                            </div>
                            <!-- Polyphen -->
                            <div class="row" style="padding-left: 12px">
                                <label style="width:10%">Polyphen</label>
                                <span id="${this.prefix}Polyphen" title="${this.proteinSubScore.polyphen.score}">${this.proteinSubScore.polyphen.description}</span>
                                ${this.isTranscriptAvailable(proteinSubScore.polyphen.transcript) ? html`
                                    (<b>Gene:</b>${this.proteinSubScore.polyphen.gene}, <b>Transcript: </b>${this.proteinSubScore.polyphen.transcript})
                                ` : null}
                                <br>
                            </div>
                            <!--CADD-->
                            <div class="row" style="padding-left: 12px">
                                <label style="width:10%">CADD Scaled</label>
                                <span id="${this.prefix}Cadd">${this.caddScaled}</span>
                                <br>
                            </div>
                        </div>
                        <br>
                    </div>
            
                </div>
                <div id="${this.prefix}Traits"></div>
            </div>
        `;
    }
}

customElements.define("cellbase-variant-annotation-summary", CellbaseVariantAnnotationSummary);
