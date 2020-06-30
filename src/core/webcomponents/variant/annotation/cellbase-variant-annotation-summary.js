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
            variantAnnotation: {
                type: Object
            },
            consequenceTypes: {
                type: Object
            },
            proteinSubstitutionScores: {
                type: Object
            },
            minimumFreq: {
                type: Array
            }
        };
    }

    _init() {
        this._prefix = "sf-" + UtilsNew.randomString(6) + "_";
        this.variantAnnotation = {};
    }

    updated(changedProperties) {
        if (changedProperties.has("variantAnnotation")) {
            this.variantAnnotationChanged();
        }
        if (changedProperties.has("consequenceTypes") || changedProperties.has("proteinSubstitutionScores")) {
            this.setColors();
        }
    }

    isTranscriptAvailable(item) {
        return item !== "";
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

    variantAnnotationChanged() {
        let _this = this;
        //debugger
        if (typeof this.variantAnnotation !== "undefined") {
            if (UtilsNew.isEmpty(_this.variantAnnotation.reference)) {
                _this.variantAnnotation.reference = "-";
            }

            if (UtilsNew.isEmpty(_this.variantAnnotation.alternate)) {
                _this.variantAnnotation.alternate = "-";
            }

            // Consequence type
            // Color the consequence type
            if (typeof _this.consequenceTypeToColor !== "undefined" && typeof _this.consequenceTypeToColor[_this.variantAnnotation.displayConsequenceType] !== "undefined") {
                $("#" + _this._prefix + "CT").css("color", _this.consequenceTypeToColor[_this.variantAnnotation.displayConsequenceType]);
            }

            // Find the gene and transcript that exhibit the display consequence type
            if (typeof _this.variantAnnotation.consequenceTypes !== "undefined") {
                for (let i = 0; i < _this.variantAnnotation.consequenceTypes.length; i++) {
                    for (let j = 0; j < _this.variantAnnotation.consequenceTypes[i].sequenceOntologyTerms.length; j++) {
                        if (_this.variantAnnotation.displayConsequenceType === _this.variantAnnotation.consequenceTypes[i].sequenceOntologyTerms[j].name) {
                            _this.ctGene = _this.variantAnnotation.consequenceTypes[i].geneName;
                            _this.ctTranscript = _this.variantAnnotation.consequenceTypes[i].ensemblTranscriptId;
                            break;
                        }
                    }
                }
            }

            // PSS
            let proteinSubScore = {};
            //debugger
            if (typeof _this.variantAnnotation.consequenceTypes !== "undefined") {
                let min = 10;
                let max = 0;
                for (let i = 0; i < _this.variantAnnotation.consequenceTypes.length; i++) {
                    if (typeof _this.variantAnnotation.consequenceTypes[i].proteinVariantAnnotation !== "undefined") {
                        let gene = _this.variantAnnotation.consequenceTypes[i].geneName;
                        let transcript = _this.variantAnnotation.consequenceTypes[i].ensemblTranscriptId;
                        let scores = _this.variantAnnotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores;

                        if (typeof scores !== "undefined") {
                            for (let j = 0; j < scores.length; j++) {
                                if (scores[j].source === "sift" && scores[j].score <= min) {
                                    min = scores[j].score;
                                    proteinSubScore.sift = {score: scores[j].score, description: scores[j].description, gene: gene, transcript: transcript};
                                    // if (typeof _this.pssColor !== "undefined" && typeof _this.pssColor.get(scores[j].description) !== "undefined") {
                                    //     $("#" + _this._prefix + "Sift").css("color", _this.pssColor.get(scores[j].description));
                                    // }
                                } else if (scores[j].source === "polyphen" && scores[j].score >= max) {
                                    max = scores[j].score;
                                    proteinSubScore.polyphen = {score: scores[j].score, description: scores[j].description, gene: gene, transcript: transcript};
                                    // if (typeof _this.pssColor !== "undefined" && typeof _this.pssColor.get(scores[j].description) !== "undefined") {
                                    //     $("#" + _this._prefix + "Polyphen").css("color", _this.pssColor.get(scores[j].description));
                                    // }
                                }
                            }
                        }
                    }
                }
            }
            if (Object.keys(proteinSubScore).length === 0 && proteinSubScore.constructor === Object) {
                proteinSubScore.sift = {score: "NA", description: "NA", transcript: ""};
                proteinSubScore.polyphen = {score: "NA", description: "NA", transcript: ""};
                $("#" + _this._prefix + "Sift").css("color", "black");
                $("#" + _this._prefix + "Polyphen").css("color", "black");
            }
            _this.proteinSubScore = proteinSubScore;
            //debugger
            // CADD
            if (typeof _this.variantAnnotation.functionalScore !== "undefined") {
                for (let i in _this.variantAnnotation.functionalScore) {
                    let value = Number(_this.variantAnnotation.functionalScore[i].score).toFixed(2);
                    if (_this.variantAnnotation.functionalScore[i].source === "cadd_scaled") {
                        if (value > 15) {
                            $("#" + _this._prefix + "Cadd").css("color", "red");
                            _this.caddScaled = value;
                        } else {
                            $("#" + _this._prefix + "Cadd").css("color", "black");
                            _this.caddScaled = value;
                        }
                    }
                }
            } else {
                $("#" + _this._prefix + "Cadd").css("color", "black");
                _this.caddScaled = "NA";
            }

            this.requestUpdate();
        }
    }

    render() {
        if (this.variantAnnotation === undefined || this.variantAnnotation === "" || this.proteinSubScore === undefined) {
            return;
        }
        return html`
            <div class="cellbase-variant-annotation-summary">
                <div class="row">
                    <h3 class="section-title">Summary</h3>
                    <div class="col-md-12">
                        <div class="form-horizontal">
                            <div class="form-group">
                                <label class="col-md-3 label-title">Id</label>
                                <span class="col-md-9"><a target="_blank" href="http://grch37.ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=${this.variantAnnotation.id}">${this.variantAnnotation.id}</a></span>
                            </div>
                            
                                ${this.variantAnnotation?.hgvs.length ? html`
                                <div class="form-group">
                                    <label class="col-md-3 label-title">HGVS</label>
                                    <span class="col-md-9">${this.variantAnnotation.hgvs.map(item => html` ${item}<br> `)}</span>
                                </div>
                                ` : null}
                                
                                <div class="form-group">
                                    <label class="col-md-3 label-title">Alleles</label>
                                    <span class="col-md-9">${this.variantAnnotation.reference}/${this.variantAnnotation.alternate}</span>
                                </div>
                                
                                <div class="form-group">
                                    <label class="col-md-3 label-title">Location</label>
                                    <span class="col-md-9">
                                        <a target="_blank" href="http://genomemaps.org/?region=${this.variantAnnotation.chromosome}:${this.variantAnnotation.start}">
                                            ${this.variantAnnotation.chromosome}:${this.variantAnnotation.start}
                                            ${this.variantAnnotation.end ? html`
                                                <div>-${this.variantAnnotation.end}</div>
                                            `: null}
                                        </a>
                                    </span>
                                </div>
                                
                                ${this.variantAnnotation.type ? html`
                                    <div class="form-group">
                                        <label class="col-md-3 label-title">Type</label>
                                        <span class="col-md-9">${this.variantAnnotation.type}</span>
                                    </div>
                                ` : null }
                                
                                ${this.variantAnnotation.ancestralAllele ? html`
                                    <div class="form-group">
                                        <label class="col-md-3 label-title">Ancestral Allele</label>
                                        <span class="col-md-9">${this.variantAnnotation.ancestralAllele}</span>
                                    </div>
                                ` : null}
                                
                                ${this.variantAnnotation.minorAlleleFreq ? html`
                                    <div class="form-group">
                                        <label class="col-md-3 label-title">MAF</label>
                                        <span class="col-md-9">${this.variantAnnotation.minorAlleleFreq} (${this.variantAnnotation.minorAllele})</span>
                                    </div>
                                ` : null}
                                
                                <div class="form-group">
                                    <label class="col-md-3 label-title">Most Severe Consequence Type</label>
                                    <span class="col-md-9">
                                        <span id="${this._prefix}CT">${this.variantAnnotation.displayConsequenceType}</span>
                                        ${this.ctGene ? html`
                                        <span>(<b>Gene</b> : ${this.ctGene}, <b>Transcript</b> : ${this.ctTranscript})</span>
                                        ` : null }
                                    </span>
                                </div>
                                
                                <div class="form-group">
                                    <label class="col-md-3 label-title">Most Severe Deleterious Score</label>
                                    <span class="col-md-9">
                                        <span id="${this._prefix}Sift" title="${this.proteinSubScore.sift.score}">
                                            ${this.proteinSubScore.sift.description}
                                        </span>
                                        ${this.isTranscriptAvailable(this.proteinSubScore.sift.transcript) ? html`
                                            (<b>Gene:</b>{{proteinSubScore.sift.gene}, <b>Transcript: </b>{{proteinSubScore.sift.transcript})
                                        ` : null }
                                    </span>
                                </div>
                                
                                <div class="form-group">
                                    <label class="col-md-3 label-title">Polyphen</label>
                                    <span class="col-md-9">
                                        <span id="${this._prefix}Polyphen" title="${this.proteinSubScore.polyphen.score}">${this.proteinSubScore.polyphen.description}</span>
                                        ${this.isTranscriptAvailable(this.proteinSubScore.polyphen.transcript) ? html`
                                            (<b>Gene:</b>${this.proteinSubScore.polyphen.gene}, <b>Transcript: </b>${this.proteinSubScore.polyphen.transcript})
                                        ` : null}
                                    </span>
                                </div>
                                                                    
                                <div class="form-group">
                                    <label class="col-md-3 label-title">CADD Scaled</label>
                                    <span class="col-md-9"><span id="${this._prefix}Cadd">${this.caddScaled}</span></span>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="${this._prefix}Traits"></div>
        `;
    }
}

customElements.define("cellbase-variant-annotation-summary", CellbaseVariantAnnotationSummary);
