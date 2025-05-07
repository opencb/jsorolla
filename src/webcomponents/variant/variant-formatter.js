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

import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import VariantInterpreterGridFormatter from "./interpretation/variant-interpreter-grid-formatter";


export default class VariantFormatter {

    static variantIdFormatter(id, variant, alleleStringLengthMax = 20) {
        let ref = variant.reference ? variant.reference : "-";
        let alt = variant.alternate ? variant.alternate : "-";

        // Check size
        const maxAlleleLength = alleleStringLengthMax;
        ref = (ref.length > maxAlleleLength) ? ref.substring(0, 4) + "..." + ref.substring(ref.length - 4) : ref;
        alt = (alt.length > maxAlleleLength) ? alt.substring(0, 4) + "..." + alt.substring(alt.length - 4) : alt;

        // Ww need to escape < and > symbols from <INS>, <DEL>, ...
        alt = alt.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        return `${variant.chromosome}:${variant.start} ${ref}/${alt}`;
    }

    static snpFormatter(value, row) {
        // We try first to read SNP ID from the 'names' of the variant (this identifier comes from the file).
        // If this ID is not a "rs..." then we search the rs in the CellBase XRef annotations.
        // This field is in annotation.xref when source: "dbSNP".
        let snpId = "";
        if (row.names && row.names.length > 0) {
            for (const name of row.names) {
                if (name.startsWith("rs")) {
                    snpId = name;
                    break;
                }
            }
        } else {
            if (row.annotation) {
                if (row.annotation.id && row.annotation.id.startsWith("rs")) {
                    snpId = row.annotation.id;
                } else {
                    if (row.annotation.xrefs) {
                        for (const xref of row.annotation.xrefs) {
                            if (xref.source === "dbSNP") {
                                snpId = xref.id;
                                break;
                            }
                        }
                    }
                }
            }
        }

        return snpId;
    }

    static siftPproteinScoreFormatter(value, variant) {
        let min = 10;
        let description = "";
        if (variant?.annotation?.consequenceTypes?.length > 0) {
            for (let i = 0; i < variant.annotation.consequenceTypes.length; i++) {
                if (variant.annotation.consequenceTypes[i]?.proteinVariantAnnotation?.substitutionScores) {
                    for (let j = 0; j < variant.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores.length; j++) {
                        const substitutionScore = variant.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j];
                        if (substitutionScore.source === "sift" && substitutionScore.score < min) {
                            min = substitutionScore.score;
                            description = substitutionScore.description;
                        }
                    }
                }
            }
        }

        // if (min < 10) {
        //     return `<span style="color: ${this.consequenceTypeColors.pssColor.get("sift")[description]}" title=${min}>${description}</span>`;
        // }
        // return "-";
        return min < 10 ? description : "-";
    }

    static polyphenProteinScoreFormatter(value, variant) {
        let max = 0;
        let description = "";
        if (variant?.annotation?.consequenceTypes?.length > 0) {
            for (let i = 0; i < variant.annotation.consequenceTypes.length; i++) {
                if (variant.annotation.consequenceTypes[i]?.proteinVariantAnnotation?.substitutionScores) {
                    for (let j = 0; j < variant.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores.length; j++) {
                        const substitutionScore = variant.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j];
                        if (substitutionScore.source === "polyphen" && substitutionScore.score >= max) {
                            max = substitutionScore.score;
                            description = substitutionScore.description;
                        }
                    }
                }
            }
        }

        // if (max > 0) {
        //     return `<span style="color: ${this.consequenceTypeColors.pssColor.get("polyphen")[description]}" title=${max}>${description}</span>`;
        // }
        // return "-";
        return max > 0 ? description : "-";
    }

    static revelProteinScoreFormatter(value, variant) {
        let max = 0;
        if (variant?.annotation?.consequenceTypes?.length > 0) {
            for (let i = 0; i < variant.annotation.consequenceTypes.length; i++) {
                if (variant.annotation.consequenceTypes[i]?.proteinVariantAnnotation?.substitutionScores) {
                    for (let j = 0; j < variant.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores.length; j++) {
                        const substitutionScore = variant.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j];
                        if (substitutionScore.source === "revel" && substitutionScore.score >= max) {
                            max = substitutionScore.score;
                        }
                    }
                }
            }
        }

        // if (max > 0) {
        //     return `<span style="color: ${max > 0.5 ? "darkorange" : "black"}" title=${max}>${max}</span>`;
        // }
        // return "-";
        return max > 0 ? max : "-";
    }

    static caddScaledFormatter(annotation, variant) {
        let value;
        if (variant?.type !== "INDEL" && variant.annotation?.functionalScore?.length > 0) {
            for (const functionalScore of variant.annotation.functionalScore) {
                if (functionalScore.source === "cadd_scaled") {
                    value = Number(functionalScore.score).toFixed(2);
                    // if (value < 15) {
                    //     return value;
                    // } else {
                    //     return "<span style=\"color: red\">" + value + "</span>";
                    // }
                }
            }
        }
        return value ?? "-";
    }

    static spliceAIFormatter(value, variant) {
        let dscore;
        if (variant.annotation.consequenceTypes?.length > 0) {
            // We need to find the max Delta Score:
            //      Delta score of a variant, defined as the maximum of (DS_AG, DS_AL, DS_DG, DS_DL),
            //      ranges from 0 to 1 and can be interpreted as the probability of the variant being splice-altering.
            dscore = 0;
            let transcriptId;
            for (const ct of variant.annotation.consequenceTypes) {
                if (ct.spliceScores?.length > 0) {
                    const spliceAi = ct.spliceScores.find(ss => ss.source.toUpperCase() === "SPLICEAI");
                    if (spliceAi) {
                        const max = Math.max(spliceAi.scores["DS_AG"], spliceAi.scores["DS_AL"], spliceAi.scores["DS_DG"], spliceAi.scores["DS_DL"]);
                        if (max > dscore) {
                            dscore = max;
                            transcriptId = ct.transcriptId;
                        }
                    }
                }
            }

            // const color = (dscore >= 0.8) ? "red" : (dscore >= 0.5) ? "darkorange" : "black";
            // return `
            //     <div>
            //         <span title="${transcriptId || "not found"}" style="color: ${color}">${dscore}</span>
            //     </div>
            // `;
        }
        return dscore;
    }

    static clinicalTraitAssociationFormatter(variant, source) {
        // const phenotypeHtml = "<span><i class='fa fa-times' style='color: red'></i></span>";
        // Check for ClinVar and Cosmic annotations
        if (variant?.annotation?.traitAssociation) {
            // Filter the traits for this column and check the number of existing traits
            const traits = variant.annotation.traitAssociation.filter(trait => trait.source.name.toUpperCase() === source.toUpperCase());
            if (traits.length === 0) {
                // return "<span title='No clinical records found for this variant'><i class='fa fa-times' style='color: gray'></i></span>";
                return [];
            }

            const results = [];
            let tooltipText = "";
            switch (source.toLowerCase()) {
                case "clinvar":
                    // const clinicalSignificanceVisited = new Set();
                    for (const trait of traits) {
                        let clinicalSignificance, drugResponseClassification;
                        if (trait?.variantClassification?.clinicalSignificance) {
                            clinicalSignificance = trait.variantClassification.clinicalSignificance;
                        } else {
                            if (trait?.variantClassification?.drugResponseClassification) {
                                clinicalSignificance = "drug_response";
                                drugResponseClassification = trait?.variantClassification?.drugResponseClassification;
                            } else {
                                clinicalSignificance = "unknown";
                            }
                        }
                        let code = "";
                        let color = "";
                        let tooltip = "";
                        switch (clinicalSignificance.toUpperCase()) {
                            case "BENIGN":
                                code = CLINICAL_SIGNIFICANCE_SETTINGS.BENIGN.id;
                                color = "green";
                                tooltip = "Classified as benign following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                                break;
                            case "LIKELY_BENIGN":
                                code = CLINICAL_SIGNIFICANCE_SETTINGS.LIKELY_BENIGN.id;
                                color = "darkgreen";
                                tooltip = "Classified as likely benign following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                                break;
                            case "VUS":
                            case "UNCERTAIN_SIGNIFICANCE":
                                code = CLINICAL_SIGNIFICANCE_SETTINGS.UNCERTAIN_SIGNIFICANCE.id;
                                color = "darkorange";
                                tooltip = "Classified as of uncertain significance following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                                break;
                            case "LIKELY_PATHOGENIC":
                                code = CLINICAL_SIGNIFICANCE_SETTINGS.LIKELY_PATHOGENIC.id;
                                color = "darkred";
                                tooltip = "Classified as likely pathogenic following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                                break;
                            case "PATHOGENIC":
                                code = CLINICAL_SIGNIFICANCE_SETTINGS.PATHOGENIC.id;
                                color = "red";
                                tooltip = "Classified as pathogenic following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                                break;
                            case "DRUG_RESPONSE":
                                code = "DR";
                                color = "darkred";
                                tooltip = "Classified as drug response following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                                break;
                            case "UNKNOWN":
                                code = "NP";
                                color = "grey";
                                tooltip = "ClinVar submissions without an interpretation of clinical significance";
                                break;
                        }

                        // if (code !== "NP" && !clinicalSignificanceVisited.has(code)) {
                        //     results.push(`<span style="color: ${color}">${code}</span>`);
                        //     clinicalSignificanceVisited.add(code);
                        // }

                        // Prepare the tooltip links
                        if (!trait.id?.startsWith("SCV")) {
                            // We display the link plus the clinical significance and all the heritable trait descriptions
                            // tooltipText += `
                            // <div style="margin: 10px 5px">
                            //     <div>
                            //         <a href="${trait.url}" target="_blank">${trait.id}</a>
                            //         <span style="font-style: italic; color: ${color}; margin-left: 10px">
                            //             ${clinicalSignificance} ${drugResponseClassification ? "(" + drugResponseClassification + ")" : ""}
                            //         </span>
                            //     </div>
                            //     <div>
                            //         ${trait?.heritableTraits?.length > 0 && trait.heritableTraits
                            //     .filter(t => t.trait && t.trait !== "not specified" && t.trait !== "not provided")
                            //     .map(t => `<span class="help-block" style="margin: 5px 1px">${t.trait}</span>`)
                            //     .join("")
                            // }
                            //     </div>
                            // </div>`;

                            results.push({
                                trait: trait,
                                clinicalSignificance: clinicalSignificance,
                                code: code,
                                color: color,
                                tooltip: tooltip
                            });
                        }
                    }

                    // This can only be shown if nothing else exists
                    // if (results.length === 0) {
                    //     return "<span style=\"color: grey\" title=\"ClinVar submissions without an interpretation of clinical significance\">NP</span>";
                    // }

                    // return `<a class="clinvar-tooltip" tooltip-title='Links' tooltip-text='${tooltipText}' tooltip-position-at="left bottom" tooltip-position-my="right top">${results.join("<br>")}</a>`;
                    return results;
                case "cosmic":
                    // Prepare the tooltip links
                    const cosmicMap = new Map();
                    traits.forEach(trait => {
                        if (!cosmicMap.has(trait.id)) {
                            cosmicMap.set(trait.id, new Set());
                        }
                        if (trait?.somaticInformation?.primaryHistology) {
                            cosmicMap.get(trait.id).add(trait.somaticInformation.primaryHistology);
                        }
                    });

                    Array.from(cosmicMap.entries())
                        .forEach(([traitId, histologies]) => {
                            const histologies2 = Array.from(histologies.values())
                                .filter(histology => histology && histology !== "null")
                                // .map(histology => `<span class="help-block" style="margin: 5px 1px">${histology}</span>`)
                                // .join("");

                            // tooltipText += `
                            //     <div style="margin: 10px 5px">
                            //         <div>
                            //             <a href="${BioinfoUtils.getCosmicVariantLink(traitId)}" target="_blank">${traitId}</a>
                            //         </div>
                            //         <div>
                            //             ${histologiesItems}
                            //         </div>
                            //     </div>
                            // `;
                            results.push({
                                id: traitId,
                                histologies: histologies2
                            });
                        });

                    // return `
                    //     <a class="cosmic-tooltip" tooltip-title='Links' tooltip-text='${tooltipText}' tooltip-position-at="left bottom" tooltip-position-my="right top">
                    //         <span style="color: green">${cosmicMap.size} ${cosmicMap.size > 1 ? "studies" : "study" }</span>
                    //     </a>`;
                    return results;
                default:
                    console.error("Wrong clinical source : " + this.field);
                    break;
            }
        }
        return phenotypeHtml;
    }

}
