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

export default class CellbaseVariantAnnotationSummary extends LitElement {

    constructor() {
        super();
        this.#init();
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

    #init() {
        this.variantAnnotation = null;
        this.proteinSubScore = null;
        this.consequenceTypeToColor = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("consequenceTypes") || changedProperties.has("proteinSubstitutionScores")) {
            this.setColors();
        }
        if (changedProperties.has("variantAnnotation")) {
            this.variantAnnotationChanged();
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

        // Note Josemi 20241016: colors for protein substitution scores are now managed in the method getProteinSubstitutionScoresColor
        // so we do not need to set them in this.pssColor
    }

    variantAnnotationChanged() {
        if (typeof this.variantAnnotation !== "undefined") {
            if (UtilsNew.isEmpty(this.variantAnnotation.reference)) {
                this.variantAnnotation.reference = "-";
            }

            if (UtilsNew.isEmpty(this.variantAnnotation.alternate)) {
                this.variantAnnotation.alternate = "-";
            }

            // Find the gene and transcript that exhibit the display consequence type
            if (typeof this.variantAnnotation.consequenceTypes !== "undefined") {
                for (let i = 0; i < this.variantAnnotation.consequenceTypes.length; i++) {
                    for (let j = 0; j < this.variantAnnotation.consequenceTypes[i].sequenceOntologyTerms.length; j++) {
                        if (this.variantAnnotation.displayConsequenceType === this.variantAnnotation.consequenceTypes[i].sequenceOntologyTerms[j].name) {
                            this.ctGene = this.variantAnnotation.consequenceTypes[i].geneName;
                            this.ctTranscript = this.variantAnnotation.consequenceTypes[i].transcriptId;
                            break;
                        }
                    }
                }
            }

            // Protein substitution scores
            const proteinSubScore = {};

            if (typeof this.variantAnnotation.consequenceTypes !== "undefined") {
                let min = 10;
                let max = 0;
                for (let i = 0; i < this.variantAnnotation.consequenceTypes.length; i++) {
                    if (typeof this.variantAnnotation.consequenceTypes[i].proteinVariantAnnotation !== "undefined") {
                        const gene = this.variantAnnotation.consequenceTypes[i].geneName;
                        const transcript = this.variantAnnotation.consequenceTypes[i].ensemblTranscriptId;
                        const scores = this.variantAnnotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores;

                        if (typeof scores !== "undefined") {
                            for (let j = 0; j < scores.length; j++) {
                                if (scores[j].source === "sift" && scores[j].score <= min) {
                                    min = scores[j].score;
                                    proteinSubScore.sift = {
                                        score: scores[j].score,
                                        description: scores[j].description,
                                        gene: gene,
                                        transcript: transcript,
                                    };
                                } else if (scores[j].source === "polyphen" && scores[j].score >= max) {
                                    max = scores[j].score;
                                    proteinSubScore.polyphen = {
                                        score: scores[j].score,
                                        description: scores[j].description,
                                        gene: gene,
                                        transcript: transcript,
                                    };
                                }
                            }
                        }
                    }
                }
            }

            // Check if SIFT score is not defined
            if (typeof proteinSubScore.sift === "undefined") {
                proteinSubScore.sift = {score: "NA", description: "NA", transcript: ""};
            }
            // Check if Polyphen score is not defined
            if (typeof proteinSubScore.polyphen === "undefined") {
                proteinSubScore.polyphen = {score: "NA", description: "NA", transcript: ""};
            }

            // Save the protein substitution scores
            this.proteinSubScore = proteinSubScore;

            // CADD
            this.caddScaled = "NA"; // default value
            (this.variantAnnotation.functionalScore || []).forEach(functionalScore => {
                if (functionalScore?.source === "cadd_scaled") {
                    this.caddScaled = Number(functionalScore.score).toFixed(2);
                }
            });
        }
    }

    getProteinSubstitutionScoresColor(source, description) {
        return this.proteinSubstitutionScores?.style?.[source]?.[description] || "black";
    }

    render() {
        if (!this.variantAnnotation || !this.proteinSubScore) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this.variantAnnotation}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            sections: [
                {
                    title: "General",
                    elements: [
                        {
                            title: "Id",
                            type: "custom",
                            display: {
                                render: data => {
                                    const variantRegion = data.chromosome + ":" + data.start + "-" + data.start;
                                    const variantId = data.id ? data.id : `${data.chromosome}:${data.start}:${data.reference}:${data.alternate}`;
                                    const url = BioinfoUtils.getVariantLink(variantId, variantRegion, "ensembl_genome_browser", this.assembly);
                                    return html `
                                        <a class="text-decoration-none" target="_blank" href="${url}">
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
                                render: data => {
                                    return data.hgvs.map(item => html`${item}<br>`);
                                },
                            },
                        },
                        {
                            title: "Alleles",
                            type: "custom",
                            display: {
                                render: data => html`${data.reference}/${data.alternate}`,
                            },
                        },
                        {
                            title: "Location",
                            type: "custom",
                            display: {
                                render: data => html`${data.chromosome}:${data.start}${data.end ? html`<div>-${data.end}</div>`: nothing}`,
                            }
                        },
                        {
                            title: "Type",
                            type: "custom",
                            field: "type",
                            display: {
                                visible: data => !UtilsNew.isEmpty(data.type),
                            },
                        },
                        {
                            title: "Ancestral Allele",
                            field: "ancestralAllele",
                            display: {
                                visible: data => !UtilsNew.isEmpty(data.ancestralAllele),
                            },
                        },
                        {
                            title: "MAF",
                            type: "custom",
                            display: {
                                visible: data => UtilsNew.isNotEmpty(data.minorAlleleFreq),
                                render: data => html`${data.minorAlleleFreq} (${data.minorAllele})`,
                            },
                        },
                        {
                            title: "Most Severe Consequence Type",
                            type: "custom",
                            display: {
                                render: data => {
                                    const consequenceTypeColor = this.consequenceTypeToColor?.[data.displayConsequenceType] || "black";
                                    return html`
                                        <span style="color:${consequenceTypeColor};">
                                            ${data.displayConsequenceType}
                                        </span>
                                        ${this.ctGene ? html`
                                            <span>
                                                (<b>Gene</b> : ${this.ctGene}, <b>Transcript</b> : ${this.ctTranscript})
                                            </span>
                                        ` : nothing}
                                    `;
                                },
                            },
                        },
                        {
                            title: "Most Severe Deleterious Score",
                            type: "custom",
                            display: {
                                render: () => {
                                    const color = this.getProteinSubstitutionScoresColor("sift", this.proteinSubScore?.sift?.description);
                                    return html`
                                        <span title="${this.proteinSubScore.sift.score}" style="color:${color};">
                                            ${this.proteinSubScore.sift.description || "-"}
                                        </span>
                                        ${this.isTranscriptAvailable(this.proteinSubScore.sift.transcript) ? html`
                                            (<b>Gene:</b>${this.proteinSubScore.sift.gene}, <b>Transcript: </b>${this.proteinSubScore.sift.transcript})
                                        ` : nothing }
                                    `;
                                },
                            },
                        },
                        {
                            title: "Polyphen",
                            type: "custom",
                            display: {
                                render: () => {
                                    const color = this.getProteinSubstitutionScoresColor("polyphen", this.proteinSubScore?.polyphen?.description);
                                    return html`
                                        <span title="${this.proteinSubScore.polyphen.score}" style="color:${color};">
                                            ${this.proteinSubScore.polyphen.description || "-"}
                                        </span>
                                        ${this.isTranscriptAvailable(this.proteinSubScore.polyphen.transcript) ? html`
                                            (<b>Gene:</b>${this.proteinSubScore.polyphen.gene}, <b>Transcript: </b>${this.proteinSubScore.polyphen.transcript})
                                        ` : nothing}
                                    `;
                                },
                            },
                        },
                        {
                            title: "CADD Scaled",
                            type: "custom",
                            display: {
                                render: () => {
                                    const colorClassName = (this.caddScaled !== "NA" && this.caddScaled > 15) ? "text-danger" : "text-body";
                                    return html `
                                        <span class="${colorClassName}">${this.caddScaled || "NA"}</span>
                                    `;
                                },
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("cellbase-variant-annotation-summary", CellbaseVariantAnnotationSummary);
