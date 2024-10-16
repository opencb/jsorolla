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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import BioinfoUtils from "../../../core/bioinfo/bioinfo-utils.js";
import Types from "../../commons/types.js";

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
            },
            assembly: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.variantAnnotation = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("variantAnnotation")) {
            this.variantAnnotationChanged();
        }
        if (changedProperties.has("consequenceTypes") || changedProperties.has("proteinSubstitutionScores")) {
            this.setColors();
        }
        super.update(changedProperties);
    }

    isTranscriptAvailable(item) {
        return item !== "";
    }

    setColors() {
        if (this.consequenceTypes) {
            const consequenceTypeToColor = {};
            for (const category of this.consequenceTypes.categories) {
                if (category.terms) {
                    for (let j = 0; j < category.terms.length; j++) {
                        consequenceTypeToColor[category.terms[j].name] = this.consequenceTypes.style[category.terms[j].impact];
                    }
                } else {
                    if (category.id && category.name) {
                        consequenceTypeToColor[category.name] = this.consequenceTypes.style[category.impact];
                    }
                }
            }
            this.consequenceTypeToColor = consequenceTypeToColor;
        }

        if (typeof this.proteinSubstitutionScores !== "undefined") {
            const pssColor = new Map();
            for (const i in this.proteinSubstitutionScores) {
                const obj = this.proteinSubstitutionScores[i];
                Object.keys(obj).forEach(key => {
                    pssColor.set(key, obj[key]);
                });
            }
            this.pssColor = pssColor;
        }
    }

    variantAnnotationChanged() {
        const _this = this;
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
                            _this.ctTranscript = _this.variantAnnotation.consequenceTypes[i].transcriptId;
                            break;
                        }
                    }
                }
            }

            // PSS
            const proteinSubScore = {};
            // debugger
            if (typeof _this.variantAnnotation.consequenceTypes !== "undefined") {
                let min = 10;
                let max = 0;
                for (let i = 0; i < _this.variantAnnotation.consequenceTypes.length; i++) {
                    if (typeof _this.variantAnnotation.consequenceTypes[i].proteinVariantAnnotation !== "undefined") {
                        const gene = _this.variantAnnotation.consequenceTypes[i].geneName;
                        const transcript = _this.variantAnnotation.consequenceTypes[i].ensemblTranscriptId;
                        const scores = _this.variantAnnotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores;

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

            _this.proteinSubScore = proteinSubScore;
            // debugger
            // CADD
            if (typeof _this.variantAnnotation.functionalScore !== "undefined") {
                for (const i in _this.variantAnnotation.functionalScore) {
                    const value = Number(_this.variantAnnotation.functionalScore[i].score).toFixed(2);
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

            // this.requestUpdate();
        }
    }

    render() {
        if (this.variantAnnotation === undefined || this.variantAnnotation === "" || this.proteinSubScore === undefined) {
            return;
        }
        const variantRegion = this.variantAnnotation.chromosome + ":" + this.variantAnnotation.start + "-" + this.variantAnnotation.start;
        const variantId = this.variantAnnotation.id ? this.variantAnnotation.id : `${this.variantAnnotation.chromosome}:${this.variantAnnotation.start}:${this.variantAnnotation.reference}:${this.variantAnnotation.alternate}`;
        return html`
            <data-form
                .data="${this.variantAnnotation}"
                .config="${this._config}">
            </data-form>
        `;

    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            // title: "Summary",
            sections: [{
                title: "General",
                elements: [{
                    title: "Id",
                    type: "custom",
                    display: {
                        render: data => {
                            const variantRegion = data.chromosome + ":" + data.start + "-" + data.start;
                            const variantId = data.id ? data.id : `${data.chromosome}:${data.start}:${data.reference}:${data.alternate}`;
                            return html `
                                <a class="text-decoration-none" target="_blank" href="${BioinfoUtils.getVariantLink(variantId, variantRegion, "ensembl_genome_browser", this.assembly)}">
                                    ${variantId}
                                </a>
                            `;
                        }
                    }
                },
                {
                    title: "HGVS",
                    type: "custom",
                    display: {
                        visible: data => data?.hgvs.length > 0,
                        render: data => html `
                        ${data.hgvs.map(item => html` ${item}<br> `)}
                        `
                    }
                },
                {
                    title: "Alleles",
                    type: "custom",
                    display: {
                        render: data => html `
                        ${data.reference}/${data.alternate}
                        `
                    }
                },
                {
                    title: "Location",
                    type: "custom",
                    display: {
                        render: data => html `
                            ${data.chromosome}:${data.start}
                            ${data.end ? html`<div>-${data.end}</div>`: nothing}
                        `
                    }
                },
                {
                    title: "Type",
                    type: "custom",
                    field: "type",
                    display: {
                        visible: data => !UtilsNew.isEmpty(data.type),
                    }
                },
                {
                    title: "Ancestral Allele",
                    field: "ancestralAllele",
                    display: {
                        visible: data => !UtilsNew.isEmpty(data.ancestralAllele),
                    }
                },
                {
                    title: "MAF",
                    type: "custom",
                    display: {
                        visible: data => UtilsNew.isNotEmpty(data.minorAlleleFreq),
                        render: data => html `${data.minorAlleleFreq} (${data.minorAllele})`
                    }
                },
                {
                    title: "Most Severe Consequence Type",
                    type: "custom",
                    display: {
                        render: data => html `
                            <span id="${this._prefix}CT">${data.displayConsequenceType}</span>
                            ${this.ctGene ? html`
                                <span>
                                    (<b>Gene</b> : ${this.ctGene}, <b>Transcript</b> : ${this.ctTranscript})
                                </span>
                            ` : nothing }
                        `
                    }
                },
                {
                    title: "Most Severe Deleterious Score",
                    type: "custom",
                    display: {
                        render: data => html `
                            <span id="${this._prefix}Sift" title="${this.proteinSubScore.sift.score}">
                                ${this.proteinSubScore.sift.description}
                            </span>
                            ${this.isTranscriptAvailable(this.proteinSubScore.sift.transcript) ? html`
                                (<b>Gene:</b>${this.proteinSubScore.sift.gene}, <b>Transcript: </b>${this.proteinSubScore.sift.transcript})
                            ` : nothing }
                        `
                    }
                },
                {
                    title: "Polyphen",
                    type: "custom",
                    display: {
                        render: data => html `
                            <span id="${this._prefix}Polyphen" title="${this.proteinSubScore.polyphen.score}">${this.proteinSubScore.polyphen.description}</span>
                                ${this.isTranscriptAvailable(this.proteinSubScore.polyphen.transcript) ? html`
                                (<b>Gene:</b>${this.proteinSubScore.polyphen.gene}, <b>Transcript: </b>${this.proteinSubScore.polyphen.transcript})
                            ` : nothing}
                        `
                    }
                },
                {
                    title: "CADD Scaled",
                    type: "custom",
                    display: {
                        render: data => html `
                            ${this.caddScaled}
                        `
                    }
                }
                ]
            }]
        });
    }

}

customElements.define("cellbase-variant-annotation-summary", CellbaseVariantAnnotationSummary);
