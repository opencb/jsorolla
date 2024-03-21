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

import VariantFormatter from "./variant-formatter";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import VariantInterpreterGridFormatter from "./interpretation/variant-interpreter-grid-formatter.js";


export default class VariantTableFormatter {

    // DEPRECATED: use new consequenceTypes.impact instead
    static assignColors(consequenceTypes, proteinSubstitutionScores) {
        let result = {};
        if (consequenceTypes) {
            const consequenceTypeToColor = {};
            const consequenceTypeToImpact = {};
            for (const category of consequenceTypes.categories) {
                if (category.terms) {
                    for (const term of category.terms) {
                        consequenceTypeToColor[term.name] = consequenceTypes.style[term.impact];
                        consequenceTypeToImpact[term.name] = term.impact;
                    }
                } else {
                    if (category.id && category.name) {
                        consequenceTypeToColor[category.name] = consequenceTypes[category.impact];
                        consequenceTypeToImpact[category.name] = category.impact;
                    }
                }
            }
            result = {
                consequenceTypeToColor: consequenceTypeToColor,
                consequenceTypeToImpact: consequenceTypeToImpact
            };
        }

        if (proteinSubstitutionScores) {
            const pssColor = new Map();
            for (const i in proteinSubstitutionScores) {
                if (Object.prototype.hasOwnProperty.call(proteinSubstitutionScores, i)) {

                    const obj = proteinSubstitutionScores[i];
                    Object.keys(obj).forEach(key => {
                        pssColor.set(key, obj[key]);
                    });
                }
            }
            result.pssColor = pssColor;
        }
        return result;
    }

    static variantIdFormatter() {
        return {
            title: "Variant ID",
            field: "id",
            type: "basic",
            display: {
                format: (id, variant) => {
                    const variantId = VariantFormatter.variantIdFormatter(id, variant);
                    const snpId = VariantFormatter.snpFormatter(id, variant);
                    if (snpId) {
                        return `${variantId} (${snpId}`;
                    } else {
                        return `${variantId}`;
                    }
                },
                style: {
                    "font-weight": "bold",
                }
            },
        };
    }

    static geneFormatter() {
        return {
            title: "Gene ID",
            type: "list",
            display: {
                getData: variant => {
                    if (variant?.annotation?.consequenceTypes?.length > 0) {
                        const visited = {};
                        const genes = [];
                        // const geneWithCtLinks = [];
                        for (let i = 0; i < variant.annotation.consequenceTypes.length; i++) {
                            const geneName = variant.annotation.consequenceTypes[i].geneName;

                            // We process Genes just one time
                            if (geneName && !visited[geneName]) {
                                genes.push(geneName);
                                visited[geneName] = true;
                            }
                        }
                        return genes;
                    } else {
                        return [];
                    }
                },
                // style: {
                //     "font-weight": "bold",
                // }
            },
        };
    }

    static hgvsFormatter(gridConfig) {
        return {
            title: "HGVS",
            type: "list",
            display: {
                defaultValue: "-",
                getData: variant => {
                    BioinfoUtils.sort(variant.annotation?.consequenceTypes, v => v.geneName);
                    const showArrayIndexes = VariantTableFormatter._consequenceTypeDetailFormatterFilter(variant.annotation?.consequenceTypes, gridConfig).indexes;

                    if (showArrayIndexes?.length > 0 && variant.annotation.hgvs?.length > 0) {
                        const results = [];
                        for (const index of showArrayIndexes) {
                            const consequenceType = variant.annotation.consequenceTypes[index];
                            const transcriptHgvs = variant.annotation?.hgvs?.find(hgvs => hgvs.startsWith(consequenceType.transcriptId));
                            const proteinHgvs = variant.annotation?.hgvs?.find(hgvs => hgvs.startsWith(consequenceType.proteinVariantAnnotation?.proteinId));

                            if (transcriptHgvs || proteinHgvs) {
                                results.push(transcriptHgvs);
                                proteinHgvs ? results.push(proteinHgvs) : results.push("-");
                            }
                        }
                        return results;
                    }
                },
                separator: hgvs => hgvs.includes("p.") || hgvs === "-" ? "---" : ""
                // separator: "<hr>"
                // style: {
                //     "font-weight": "bold",
                // }
            },
        };
    }

    static vcfFormatter(value, row, field, type = "INFO") {
        if (type.toUpperCase() === "INFO") {
            return row.studies[0].files[0].data[field];
        } else {
            const index = row.studies[0].sampleDataKeys.findIndex(f => f === field);
            return row.studies[0].samples[0].data[index];
        }
    }

    static typeFormatter() {
        return {
            title: "Type",
            field: "type",
            type: "basic",
            display: {
                defaultValue: "-",
                style: {
                    color: type => {
                        let color = "";
                        switch (type) {
                            case "SNP": // Deprecated
                                // eslint-disable-next-line no-param-reassign
                                type = "SNV";
                                color = "black";
                                break;
                            case "INDEL":
                            case "CNV": // Deprecated
                            case "COPY_NUMBER":
                            case "COPY_NUMBER_GAIN":
                            case "COPY_NUMBER_LOSS":
                            case "MNV":
                                color = "darkorange";
                                break;
                            case "SV":
                            case "INSERTION":
                            case "DELETION":
                            case "DUPLICATION":
                            case "TANDEM_DUPLICATION":
                            case "BREAKEND":
                                color = "red";
                                break;
                            default:
                                color = "black";
                                break;
                        }
                        return color;
                    },
                }
            }
        };
    }

    static consequenceTypeFormatter(ctQuery, gridSettings) {
        return {
            title: "Consequence Type",
            type: "list",
            display: {
                defaultValue: "-",
                contentLayout: "vertical",
                getData: variant => {
                    if (variant.annotation?.consequenceTypes?.length > 0) {
                        let {selectedConsequenceTypes, notSelectedConsequenceTypes, indexes} =
                            VariantTableFormatter._consequenceTypeDetailFormatterFilter(variant.annotation.consequenceTypes, gridSettings);

                        // If CT is passed in the query then we must make and AND with the selected transcript by the user.
                        // This means that only the selectedConsequenceTypes that ARE ALSO IN THE CT QUERY are displayed.
                        if (ctQuery) {
                            const consequenceTypes = new Set();
                            for (const ct of ctQuery.split(",")) {
                                consequenceTypes.add(ct);
                            }

                            const newSelectedConsequenceTypes = [];
                            for (const ct of selectedConsequenceTypes) {
                                if (ct.sequenceOntologyTerms.some(so => consequenceTypes.has(so.name))) {
                                    newSelectedConsequenceTypes.push(ct);
                                } else {
                                    notSelectedConsequenceTypes.push(ct);
                                }
                            }
                            selectedConsequenceTypes = newSelectedConsequenceTypes;
                        }

                        const positiveConsequenceTypes = [];
                        const soVisited = new Set();
                        for (const ct of selectedConsequenceTypes) {
                            for (const so of ct.sequenceOntologyTerms) {
                                if (!soVisited.has(so?.name)) {
                                    // positiveConsequenceTypes.push(`<span style="color: ${CONSEQUENCE_TYPES.style[CONSEQUENCE_TYPES.impact[so.name]] || "black"}">${so.name}</span>`);
                                    positiveConsequenceTypes.push(so.name);
                                    soVisited.add(so.name);
                                }
                            }
                        }

                        return positiveConsequenceTypes;
                    }
                },
                style: {
                    // "font-weight": "bold",
                    "color": so => {
                        return CONSEQUENCE_TYPES.style[CONSEQUENCE_TYPES.impact[so]] || "black";
                    },
                }
            }
        };
    }


    static _consequenceTypeDetailFormatterFilter(cts, filter) {
        const selectedConsequenceTypes = [];
        const notSelectedConsequenceTypes = [];
        const showArrayIndexes = [];

        const geneSet = filter?.geneSet ? filter.geneSet : {};
        for (let i = 0; i < cts.length; i++) {
            const ct = cts[i];

            // Check if gene source is valid
            let isSourceValid = false;
            if (geneSet["ensembl"] && (!ct.source || ct.source.toUpperCase() === "ENSEMBL")) { // FIXME: Ensembl regulatory CT do not have 'source'
                isSourceValid = true;
            } else {
                if (geneSet["refseq"] && ct.source?.toUpperCase() === "REFSEQ") {
                    isSourceValid = true;
                }
            }
            if (!isSourceValid) {
                // Not a valid source, let's continue to next ct
                continue;
            }

            // TODO Remove in IVA 2.3
            // To keep compatability with CellBase 4
            const transcriptFlags = ct.transcriptFlags ?? ct.transcriptAnnotationFlags;
            let isCtSelected = filter.consequenceType?.all || false;
            if (filter && isCtSelected === false) {
                if (filter.consequenceType.maneTranscript) {
                    isCtSelected = isCtSelected || transcriptFlags?.includes("MANE Select")|| transcriptFlags?.includes("MANE Plus Clinical");
                }
                if (filter.consequenceType.ensemblCanonicalTranscript) {
                    isCtSelected = isCtSelected || transcriptFlags?.includes("canonical");
                }
                if (filter.consequenceType.gencodeBasicTranscript) {
                    isCtSelected = isCtSelected || transcriptFlags?.includes("basic");
                }
                if (filter.consequenceType.ccdsTranscript) {
                    isCtSelected = isCtSelected || transcriptFlags?.includes("CCDS");
                }
                if (filter.consequenceType.lrgTranscript) {
                    isCtSelected = isCtSelected || transcriptFlags?.includes("LRG");
                }
                if (filter.consequenceType.ensemblTslTranscript) {
                    isCtSelected = isCtSelected || transcriptFlags?.includes("TSL:1");
                }
                if (filter.consequenceType.illuminaTSO500Transcript) {
                    isCtSelected = isCtSelected || transcriptFlags?.includes("TSO500");
                }
                if (filter.consequenceType.eglhHaemoncTranscript) {
                    isCtSelected = isCtSelected || transcriptFlags?.includes("EGLH_HaemOnc");
                }
                if (filter.consequenceType.proteinCodingTranscript && ct.biotype === "protein_coding") {
                    isCtSelected = isCtSelected || ct.biotype === "protein_coding";
                }
                if (filter.consequenceType.highImpactConsequenceTypeTranscript) {
                    for (const so of ct.sequenceOntologyTerms) {
                        const impact = CONSEQUENCE_TYPES?.impact[so.name]?.toUpperCase();
                        isCtSelected = isCtSelected || impact === "HIGH" || impact === "MODERATE";
                    }
                }
            }
            // Check if the CT satisfy any condition
            if (isCtSelected) {
                showArrayIndexes.push(i);
                selectedConsequenceTypes.push(ct);
            } else {
                notSelectedConsequenceTypes.push(ct);
            }
        }
        return {
            selectedConsequenceTypes: selectedConsequenceTypes,
            notSelectedConsequenceTypes: notSelectedConsequenceTypes,
            indexes: showArrayIndexes
        };
    }

    static siftFormatter() {
        return {
            title: "SIFT",
            field: "annotation",
            type: "basic",
            display: {
                defaultValue: "-",
                format: (annotation, variant) => VariantFormatter.siftPproteinScoreFormatter(annotation, variant),
                style: {
                    color: value => value !== "-" ? PROTEIN_SUBSTITUTION_SCORE.style.sift[value]: "black"
                }
            },
        };
    }

    static polyphenFormatter() {
        return {
            title: "Polyphen",
            field: "annotation",
            type: "basic",
            display: {
                defaultValue: "-",
                format: (annotation, variant) => VariantFormatter.polyphenProteinScoreFormatter(annotation, variant),
                style: {
                    color: value => value !== "-" ? PROTEIN_SUBSTITUTION_SCORE.style.polyphen[value] : "black"
                }
            },
        };
    }

    static revelFormatter() {
        return {
            title: "Revel",
            field: "annotation",
            type: "basic",
            display: {
                defaultValue: "-",
                format: (annotation, variant) => VariantFormatter.revelProteinScoreFormatter(annotation, variant),
                style: {
                    color: value => value > 0.5 ? "darkorange" : "black"
                }
            }
        };
    }

    static caddScaledFormatter() {
        return {
            title: "CADD",
            field: "annotation",
            type: "basic",
            display: {
                defaultValue: "-",
                format: (annotation, variant) => VariantFormatter.caddScaledFormatter(annotation, variant),
                style: {
                    color: value => value < 15 ? "red" : "black",
                }
            }
        };
    }

    static spliceAIFormatter() {
        return {
            title: "SpliceAI",
            field: "annotation",
            type: "basic",
            display: {
                defaultValue: "--",
                format: annotation => {
                    if (annotation.consequenceTypes?.length > 0) {
                        let dscore = 0;
                        let transcriptId;
                        for (const ct of annotation.consequenceTypes) {
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
                        return dscore;
                    }
                },
                style: {
                    color: dscore => (dscore >= 0.8) ? "red" : (dscore >= 0.5) ? "darkorange" : "black",
                }
            }
        };
    }

    static conservationFormatter(source) {
        return {
            title: source,
            field: "annotation",
            type: "basic",
            display: {
                defaultValue: "-",
                format: annotation => {
                    if (annotation?.conservation?.length > 0) {
                        for (const conservation of annotation.conservation) {
                            if (conservation.source?.toLowerCase() === source.toLowerCase()) {
                                return Number(conservation.score).toFixed(3);
                            }
                        }
                    }
                }
            }
        };
    }

    static populationFrequencyFormatter() {
        return {
            title: "Population Frequency",
            field: "annotation",
            type: "table",
            display: {
                columns: [
                    {
                        title: "",
                        field: "chromosome",
                        display: {
                            style: {
                                height: "10px",
                                width: "6px",
                                background: "blue",
                            }
                        }
                    },
                    {
                        title: "",
                        field: "reference",
                        display: {
                            style: {
                                height: "10px",
                                width: "6px",
                                background: "red",
                            }
                        }
                    },
                    {
                        title: "",
                        field: "alternate",
                        display: {
                            style: {
                                height: "10px",
                                width: "6px",
                                background: "green",
                            }
                        }
                    }
                ],
                style: {
                    height: "10px"
                }
            }
        };
    }

    static clinvarFormatter() {
        return {
            title: "ClinVar",
            type: "list",
            display: {
                defaultValue: "-",
                contentLayout: "vertical",
                getData: variant => {
                    return VariantFormatter.clinicalTraitAssociationFormatter(variant, "clinvar");
                },
                template: "${trait.id} - ${clinicalSignificance}",
                style: {
                    clinicalSignificance: {
                        color: (id, trait) => trait.color
                    }
                },
                link: {
                    "trait.id": (id, trait) => trait.trait.url
                }
            }
        };
    }

    static cosmicFormatter() {
        return {
            title: "Cosmic",
            type: "list",
            display: {
                defaultValue: "-",
                contentLayout: "vertical",
                getData: variant => {
                    return VariantFormatter.clinicalTraitAssociationFormatter(variant, "cosmic");
                },
                template: "${id} - ${histologies}",
                style: {
                    // clinicalSignificance: {
                    //     color: (id, trait) => trait.color
                    // }
                },
                link: {
                    id: id => BioinfoUtils.getCosmicVariantLink(id)
                }
            }
        };
    }

    static populationFrequenciesInfoTooltipContent(populationFrequencies) {
        return `One coloured square is shown for each population. Frequencies are coded with colours which classify values
                into 'very rare', 'rare', 'average', 'common' or 'missing', see
                <a href='https://www.nature.com/scitable/topicpage/multifactorial-inheritance-and-genetic-disease-919' target='_blank'>
                    https://www.nature.com/scitable/topicpage/multifactorial-inheritance-and-genetic-disease-919
                </a>. Please, leave the cursor over each square to display the actual frequency values. <br>
                <span style='font-weight: bold'>Note that that all frequencies are percentages.</span>
                <div style='padding: 10px 0px 0px 0px'><label>Legend: </label></div>
                <div><span><i class='fa fa-square' style='color: ${populationFrequencies.style.veryRare}' aria-hidden='true'></i> Very rare:  freq < 0.1 %</span></div>
                <div><span><i class='fa fa-square' style='color: ${populationFrequencies.style.rare}' aria-hidden='true'></i> Rare:  freq < 0.5 %</span></div>
                <div><span><i class='fa fa-square' style='color: ${populationFrequencies.style.average}' aria-hidden='true'></i> Average:  freq < 5 %</span></div>
                <div><span><i class='fa fa-square' style='color: ${populationFrequencies.style.common}' aria-hidden='true'></i> Common:  freq >= 5 %</span></div>
                <div><span><i class='fa fa-square' style='color: black' aria-hidden='true'></i> Not observed</span></div>`;
    }

// Creates the colored table with one row and as many columns as populations.
    static renderPopulationFrequencies(populations, populationFrequenciesMap, populationFrequenciesColor, populationFrequenciesConfig = {displayMode: "FREQUENCY_BOX"}) {
        const tooltipRows = (populations || []).map(population => {
            const popFreq = populationFrequenciesMap.get(population) || null;
            const altFreq = popFreq?.altAlleleFreq?.toPrecision(4) || 0;
            const altCount = popFreq?.altAlleleCount || 0;
            const homAltFreq = popFreq?.altHomGenotypeFreq?.toPrecision(4) || 0;
            const homAltCount = popFreq?.altHomGenotypeCount || 0;
            const color = VariantGridFormatter._getPopulationFrequencyColor(altFreq, populationFrequenciesColor);
            let altFreqText = "";
            let homAltFreqText = "";

            // ALT freq tell us if the VARIANT has been OBSERVED.
            if (altFreq > 0) {
                altFreqText = `${altFreq || "-"} / ${altCount} (${altFreq > 0 ? (altFreq * 100).toPrecision(4) + "%" : "-"})`;
                homAltFreqText = `${homAltFreq > 0 ? homAltFreq : "-"} / ${homAltCount} ${homAltFreq > 0 ? `(${(homAltFreq * 100).toPrecision(4)} %)` : ""}`;
            } else {
                altFreqText = "<span style='font-style: italic'>Not Observed</span>";
                homAltFreqText = "<span style='font-style: italic'>Not Observed</span>";
            }

            return `
                <tr style='border-top:1px solid #ededed;'>
                    <td style='width:140px;padding:8px 8px 8px 0;'>
                        <i class='fa fa-xs fa-square' style='color: ${color}' aria-hidden='true'></i>
                        <label style='padding-left: 5px;'>${population}</label>
                    </td>
                    <td style='font-weight:bold;padding:8px 8px 8px 0;'>${altFreqText}</td>
                    <td style='font-weight:bold;padding:8px 0 8px 0;'>${homAltFreqText}</td>
                </td>
            `;
        });
        const tooltip = `
            <table class='population-freq-tooltip'>
                <thead>
                    <tr>
                        <th style='padding:0 8px 8px 0;'>Population</th>
                        <th style='min-width:100px;padding:0 8px 8px 0;'>Allele ALT<br>(freq/count)</th>
                        <th style='min-width:100px;padding:0 0 8px 0;'>Genotype HOM_ALT<br>(freq/count)</th>
                    </tr>
                </thead>
                <tbody>${tooltipRows.join("")}</tbody>
            </table>
        `;

        // Create the table (with the tooltip info)
        let htmlPopFreqTable;
        if (populationFrequenciesConfig?.displayMode === "FREQUENCY_BOX") {
            const tableSize = populations.length * 15;
            htmlPopFreqTable = `
                <a tooltip-title="Population Frequencies" tooltip-text="${tooltip}" tooltip-position-my="top right">
                <table style="width:${tableSize}px" class="populationFrequenciesTable">
                    <tr>
            `;
            for (const population of populations) {
                // This array contains "study:population"
                let color = "black";
                if (typeof populationFrequenciesMap.get(population) !== "undefined") {
                    const freq = populationFrequenciesMap.get(population).altAlleleFreq || 0;
                    color = VariantGridFormatter._getPopulationFrequencyColor(freq, populationFrequenciesColor);
                }
                htmlPopFreqTable += `<td style="width: 15px; background: ${color}; border-right: 1px solid white;">&nbsp;</td>`;
            }
            htmlPopFreqTable += "</tr></table></a>";
        } else {
            htmlPopFreqTable = "<div>";
            const populationFrequenciesHtml = [];
            for (const population of populations) {
                let color = "black";
                if (typeof populationFrequenciesMap.get(population) !== "undefined") { // Freq exists
                    const freq = populationFrequenciesMap.get(population).altAlleleFreq || 0;
                    const percentage = (Number(freq) * 100).toPrecision(4);
                    // Only color the significant ones
                    if (freq <= 0.005) {
                        color = VariantGridFormatter._getPopulationFrequencyColor(freq, populationFrequenciesColor);
                    }

                    if (populations.length > 1) {
                        populationFrequenciesHtml.push("<div>");
                        populationFrequenciesHtml.push(`<span style="padding: 0 5px; color: ${color}">${population}</span>`);
                        populationFrequenciesHtml.push(`<span style="padding: 0 5px; color: ${color}">${freq}</span>`);
                        populationFrequenciesHtml.push(`<span style="padding: 0 5px; color: ${color}">(${percentage} %)</span>`);
                        populationFrequenciesHtml.push("</div>");
                    } else {
                        populationFrequenciesHtml.push("<div>");
                        populationFrequenciesHtml.push(`<span style="padding: 0 5px; color: ${color}">${freq}</span>`);
                        populationFrequenciesHtml.push(`<span style="padding: 0 5px; color: ${color}">(${percentage} %)</span>`);
                        populationFrequenciesHtml.push("</div>");
                    }
                } else { // Freq does not exist
                    if (populations.length > 1) {
                        populationFrequenciesHtml.push("<div>");
                        populationFrequenciesHtml.push(`<span style="padding: 0 5px; color: ${color}">${population}</span>`);
                        populationFrequenciesHtml.push(`<span style="padding: 0 5px; color: ${color}">NA</span>`);
                        populationFrequenciesHtml.push("</div>");
                    } else {
                        populationFrequenciesHtml.push("<div>");
                        populationFrequenciesHtml.push(`<span style="padding: 0 5px; color: ${color}">NA</span>`);
                        populationFrequenciesHtml.push("</div>");
                    }
                }
            }
            htmlPopFreqTable += `${populationFrequenciesHtml.join("")}`;
            htmlPopFreqTable += "</div>";
        }

        return htmlPopFreqTable;
    }

    static _getPopulationFrequencyColor(freq, populationFrequenciesColor) {
        let color;
        if (freq === 0 || freq === "0") {
            color = populationFrequenciesColor.unobserved;
        } else if (freq < 0.001) {
            color = populationFrequenciesColor.veryRare;
        } else if (freq < 0.005) {
            color = populationFrequenciesColor.rare;
        } else if (freq < 0.05) {
            color = populationFrequenciesColor.average;
        } else {
            color = populationFrequenciesColor.common;
        }
        return color;
    }

    static clinicalTraitAssociationFormatter(value, row, index) {
        const phenotypeHtml = "<span><i class='fa fa-times' style='color: red'></i></span>";
        // Check for ClinVar and Cosmic annotations
        if (row?.annotation?.traitAssociation) {
            // Filter the traits for this column and check the number of existing traits
            const traits = row.annotation.traitAssociation.filter(trait => trait.source.name.toUpperCase() === this.field.toUpperCase());
            if (traits.length === 0) {
                return "<span title='No clinical records found for this variant'><i class='fa fa-times' style='color: gray'></i></span>";
            }

            let tooltipText = "";
            switch (this.field) {
                case "clinvar":
                    const results = [];
                    const clinicalSignificanceVisited = new Set();
                    for (const trait of traits) {
                        let clinicalSignificance,
                            drugResponseClassification;
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

                        if (code !== "NP" && !clinicalSignificanceVisited.has(code)) {
                            results.push(`<span style="color: ${color}">${code}</span>`);
                            clinicalSignificanceVisited.add(code);
                        }

                        // Prepare the tooltip links
                        if (!trait.id?.startsWith("SCV")) {
                            // We display the link plus the clinical significance and all the heritable trait descriptions
                            tooltipText += `
                            <div style="margin: 10px 5px">
                                <div>
                                    <a href="${trait.url}" target="_blank">${trait.id}</a>
                                    <span style="font-style: italic; color: ${color}; margin-left: 10px">
                                        ${clinicalSignificance} ${drugResponseClassification ? "(" + drugResponseClassification + ")" : ""}
                                    </span>
                                </div>
                                <div>
                                    ${trait?.heritableTraits?.length > 0 && trait.heritableTraits
                                .filter(t => t.trait && t.trait !== "not specified" && t.trait !== "not provided")
                                .map(t => `<span class="help-block" style="margin: 5px 1px">${t.trait}</span>`)
                                .join("")
                            }
                                </div>
                            </div>`;
                        }
                    }

                    // This can only be shown if nothing else exists
                    if (results.length === 0) {
                        return "<span style=\"color: grey\" title=\"ClinVar submissions without an interpretation of clinical significance\">NP</span>";
                    }

                    return `<a class="clinvar-tooltip" tooltip-title='Links' tooltip-text='${tooltipText}' tooltip-position-at="left bottom" tooltip-position-my="right top">${results.join("<br>")}</a>`;
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

                    Array.from(cosmicMap.entries()).forEach(([traitId, histologies]) => {
                        const histologiesItems = Array.from(histologies.values())
                            .filter(histology => histology && histology !== "null")
                            .map(histology => `<span class="help-block" style="margin: 5px 1px">${histology}</span>`)
                            .join("");

                        tooltipText += `
                            <div style="margin: 10px 5px">
                                <div>
                                    <a href="${BioinfoUtils.getCosmicVariantLink(traitId)}" target="_blank">${traitId}</a>
                                </div>
                                <div>
                                    ${histologiesItems}
                                </div>
                            </div>
                        `;
                    });

                    return `
                        <a class="cosmic-tooltip" tooltip-title='Links' tooltip-text='${tooltipText}' tooltip-position-at="left bottom" tooltip-position-my="right top">
                            <span style="color: green">${cosmicMap.size} ${cosmicMap.size > 1 ? "studies" : "study" }</span>
                        </a>`;
                default:
                    console.error("Wrong clinical source : " + this.field);
                    break;
            }
        }
        return phenotypeHtml;
    }

    static clinicalCancerHotspotsFormatter(value, row) {
        if (row?.annotation?.cancerHotspots?.length > 0) {
            const cancerHotspotsHtml = new Map();
            for (const ct of row.annotation.consequenceTypes) {
                for (const hotspot of row.annotation.cancerHotspots) {
                    if (ct.geneName === hotspot.geneName && ct.proteinVariantAnnotation?.position === hotspot.aminoacidPosition) {
                        cancerHotspotsHtml.set(`${hotspot.geneName}_${hotspot.aminoacidPosition}`, hotspot);
                    }
                }
            }
            let tooltipText = "";
            for (const [key, hotspot] of cancerHotspotsHtml.entries()) {
                tooltipText += `
                    <div style="margin: 10px 5px">
                        <div>
                            <label style="">Gene: ${hotspot.geneName} - Aminoacid: ${hotspot.aminoacidPosition} (${AMINOACID_CODE[hotspot.aminoacidReference]})</label>
                            <div style="">Cancer Type: ${hotspot.cancerType} - ${hotspot.variants.length} ${hotspot.variants.length === 1 ? "mutation" : "mutations"}</div>
                        </div>
                        <div>
                            ${
                    hotspot.variants
                        .map(variant => `
                                    <span
                                        class="help-block"
                                        style="margin: 5px 1px">${AMINOACID_CODE[hotspot.aminoacidReference]}${hotspot.aminoacidPosition}${AMINOACID_CODE[variant.aminoacidAlternate]}: ${variant.count} sample(s)
                                    </span>`)
                        .join("")
                }
                        </div>
                    </div>`;
            }

            if (cancerHotspotsHtml.size > 0) {
                return `
                     <a class="hotspots-tooltip" tooltip-title='Info' tooltip-text='${tooltipText}' tooltip-position-at="left bottom" tooltip-position-my="right top">
                        <span style="color: green">${cancerHotspotsHtml.size} ${cancerHotspotsHtml.size === 1 ? "variant" : "variants"}</span>
                    </a>`;
            }
        }
        return "<span title='No clinical records found for this variant'><i class='fa fa-times' style='color: gray'></i></span>";
    }

    static clinicalTableDetail(value, row, index) {
        const clinvar = [];
        const cosmic = [];
        const hotspots = [];
        if (row.annotation?.traitAssociation?.length > 0) {
            const cosmicIntermediate = new Map();
            for (const trait of row.annotation.traitAssociation) {
                const values = [];
                const vcvId = trait.additionalProperties.find(p => p.name === "VCV ID");
                const genomicFeature = trait.genomicFeatures.find(f => f.featureType.toUpperCase() === "GENE");
                const reviewStatus = trait.additionalProperties.find(p => p.name === "ReviewStatus_in_source_file");
                if (trait.source.name.toUpperCase() === "CLINVAR") {
                    values.push(`<a href="${trait.url ?? BioinfoUtils.getClinvarVariationLink(trait.id)}" target="_blank">${trait.id}</a>`);
                    values.push(vcvId ? vcvId.value : trait.id);
                    values.push(genomicFeature?.xrefs ? genomicFeature.xrefs?.symbol : "-");
                    values.push(trait.variantClassification?.clinicalSignificance);
                    values.push(trait.consistencyStatus);
                    values.push(reviewStatus ? reviewStatus.value : "-");
                    values.push(trait.heritableTraits ? trait.heritableTraits.map(t => t.trait).join("<br>") : "-");
                    clinvar.push({
                        values: values
                    });
                } else { // COSMIC section
                    // Prepare data to group by histologySubtype field
                    const key = trait.id + ":" + trait.somaticInformation.primaryHistology + ":" + trait.somaticInformation.primaryHistology;
                    const reviewStatus = trait.additionalProperties.find(p => p.id === "MUTATION_SOMATIC_STATUS");
                    const zygosity = trait.additionalProperties.find(p => p.id === "MUTATION_ZYGOSITY");
                    if (!cosmicIntermediate.has(key)) {
                        cosmicIntermediate.set(key, {
                            id: trait.id,
                            url: trait.url,
                            primarySite: trait.somaticInformation.primarySite,
                            primaryHistology: trait.somaticInformation.primaryHistology,
                            histologySubtypes: [],
                            histologySubtypesCounter: new Map(),
                            reviewStatus: reviewStatus,
                            pubmed: new Set(),
                            zygosity: new Set()
                        });
                    }
                    // Only add the new terms for this key
                    if (trait.somaticInformation.histologySubtype) {
                        if (!cosmicIntermediate.get(key).histologySubtypesCounter.get(trait.somaticInformation.histologySubtype)) {
                            cosmicIntermediate.get(key).histologySubtypes.push(trait.somaticInformation.histologySubtype);
                        }
                        // Increment the counter always
                        cosmicIntermediate.get(key).histologySubtypesCounter
                            .set(trait.somaticInformation.histologySubtype, cosmicIntermediate.get(key).histologySubtypesCounter.size + 1);
                    }
                    if (trait?.bibliography?.length > 0) {
                        cosmicIntermediate.get(key).pubmed.add(...trait.bibliography);
                    }
                    if (zygosity) {
                        cosmicIntermediate.get(key).zygosity.add(zygosity.value);
                    }
                }
            }

            // Sort by key and prepare column data
            for (const [key, c] of new Map([...cosmicIntermediate.entries()].sort())) {
                const values = [];
                values.push(`<a href="${c.url ?? BioinfoUtils.getCosmicVariantLink(c.id)}" target="_blank">${c.id}</a>`);
                values.push(c.primarySite);
                values.push(c.primaryHistology);
                values.push(c.histologySubtypes
                    .map(value => {
                        if (cosmicIntermediate.get(key).histologySubtypesCounter.get(value) > 1) {
                            return value + " (x" + cosmicIntermediate.get(key).histologySubtypesCounter.get(value) + ")";
                        } else {
                            return "-";
                        }
                    })
                    .join("<br>") || "-");
                values.push(Array.from(c.zygosity?.values()).join(", ") || "-");
                values.push(c?.reviewStatus?.value || "-");
                values.push(Array.from(c.pubmed.values()).map(p => `<a href="${BioinfoUtils.getPubmedLink(p)}" target="_blank">${p}</a>`).join("<br>"));
                cosmic.push({
                    values: values
                });
            }
        }

        if (row?.annotation?.cancerHotspots?.length > 0) {
            const visited = {};
            for (const ct of row.annotation.consequenceTypes) {
                for (const hotspot of row.annotation.cancerHotspots) {
                    if (ct.geneName === hotspot.geneName && ct.proteinVariantAnnotation?.position === hotspot.aminoacidPosition && !visited[hotspot.geneName + "_" + hotspot.aminoacidPosition]) {
                        const reference = AMINOACID_CODE[hotspot.aminoacidReference];
                        const position = hotspot.aminoacidPosition;
                        const values = [];
                        values.push(hotspot.geneName);
                        values.push(reference);
                        values.push(hotspot.aminoacidPosition);
                        values.push(hotspot.cancerType);
                        values.push(hotspot.variants.length);
                        values.push(hotspot.variants.map(m => `${reference}${position}${AMINOACID_CODE[m.aminoacidAlternate]}: ${m.count} sample(s)`).join("; "));
                        hotspots.push({
                            values: values
                        });
                        visited[hotspot.geneName + "_" + hotspot.aminoacidPosition] = true;
                    }
                }
            }
        }

        // Clinvar
        const clinvarColumns = [
            {title: "ID"},
            {title: "Variation ID"},
            {title: "Gene"},
            {title: "Clinical Significance"},
            {title: "Consistency Status"},
            {title: "Review Status"},
            {title: "Traits"}
        ];
        const clinvarTable = VariantGridFormatter.renderTable("", clinvarColumns, clinvar, {defaultMessage: "No ClinVar data found"});
        const clinvarTraits = `
            <div>
                <label>ClinVar</label>
                <div style="padding: 0 10px">${clinvarTable}</div>
            </div>`;

        // Cosmic
        const cosmicColumns = [
            {title: "ID"},
            {title: "Primary Site"},
            {title: "Primary Histology"},
            {title: "Histology Subtype"},
            {title: "Zygosity"},
            {title: "Status"},
            {title: "Pubmed"}
        ];
        const cosmicTable = VariantGridFormatter.renderTable("", cosmicColumns, cosmic, {defaultMessage: "No Cosmic data found"});
        const cosmicTraits = `
            <div style="margin-top: 15px">
                <label>Cosmic</label>
                <div style="padding: 0 10px">${cosmicTable}</div>
            </div>`;

        // Cancer Hotspots
        const cancerHotspotsColumns = [
            {title: "Gene Name"},
            {title: "Aminoacid Reference"},
            {title: "Aminoacid Position"},
            {title: "Cancer Type"},
            {title: "Number of Mutations"},
            {title: "Mutations"},
        ];
        const cancerHotspotsTable = VariantGridFormatter.renderTable("", cancerHotspotsColumns, hotspots, {defaultMessage: "No Cancer Hotspots data found"});
        const cancerHotspotsHtml = `
            <div style="margin-top: 15px">
                <label>Cancer Hotspots</label>
                <div style="padding: 0 10px">${cancerHotspotsTable}</div>
            </div>`;

        return clinvarTraits + cosmicTraits + cancerHotspotsHtml;
    }

    /*
     * Reported Variant formatters
     */
    static toggleDetailClinicalEvidence(e) {
        const id = e.target.dataset.id;
        const elements = document.getElementsByClassName(this._prefix + id + "EvidenceFiltered");
        for (const element of elements) {
            if (element.style.display === "none") {
                element.style.display = "";
            } else {
                element.style.display = "none";
            }
        }
    }

    static reportedVariantFormatter(value, variant, index) {
        return `
            ${variant?.interpretations?.length > 0 ? `
                <div>${variant.interpretations.length === 1 ? "1 case found" : `${variant.interpretations.length} cases found`}</div>
                <div class="text-muted">
                    <div>REPORTED: ${variant.interpretationStats?.status?.REPORTED || 0} times</div>
                    <div>TIER 1: ${variant.interpretationStats?.tier?.TIER1 || 0} times</div>
                    <div>DISCARDED: ${variant.interpretationStats?.status?.DISCARDED || 0} times</div>
                </div>` : `
                <div>No cases found</div>`
        }
        `;
    }

    static reportedVariantDetailFormatter(value, row, opencgaSession) {
        if (row?.interpretations?.length > 0) {
            let reportedHtml = `
                <table id="ConsqTypeTable" class="table table-hover table-no-bordered">
                    <thead>
                        <tr>
                            <th rowspan="2">Case</th>
                            <th rowspan="2">Disease Panel</th>
                            <th rowspan="2">Sample</th>
                            <th rowspan="2">Genotype</th>
                            <th rowspan="2">Status</th>
                            <th rowspan="2">Discussion</th>
                            <th rowspan="1" colspan="5" style="text-align: center; padding-top: 5px; padding-right: 2px">Evidences</th>
                        </tr>
                        <tr style="margin: 5px">
                            <th rowspan="1" style="padding-top: 5px">Gene</th>
                            <th rowspan="1">Transcript</th>
                            <th rowspan="1">ACMG</th>
                            <th rowspan="1">Tier</th>
                            <th rowspan="1">Clinical Significance</th>
                        </tr>
                    </thead>
                    <tbody>`;

            for (const interpretation of row.interpretations) {
                // Prepare data info for columns
                const caseId = interpretation.id.split(".")[0];
                const interpretationIdHtml = `
                    <div>
                        <label>
                            ${caseId}
                       </label>
                    </div>
                `;

                const panelsHtml = `
                    <div>
                        ${interpretation.panels?.map(panel => {
                    if (panel?.source?.project === "PanelApp") {
                        return `<a href="${BioinfoUtils.getPanelAppLink(panel.source.id)}" target="_blank">${panel.name}</a>`;
                    } else {
                        return `<span>${panel.name || "-"}</span>`;
                    }
                })?.join("<br>")}
                    </div>`;

                const interpretedVariant = interpretation.primaryFindings.find(variant => variant.id === row.id);

                const sampleHtml = `
                    <div>
                        <label>${interpretedVariant.studies[0]?.samples[0]?.sampleId || "-"}</label>
                    </div>`;

                const genotype = VariantInterpreterGridFormatter.alleleGenotypeRenderer(row, interpretedVariant.studies[0]?.samples[0], "call");
                const genotypeHtml = `
                    <div>
                        <span>${genotype || "-"}</span>
                    </div>`;

                const statusHtml = `
                    <div>
                        ${interpretedVariant.status || "-"}
                    </div>`;
                const discussionHtml = `
                    <div>
                        ${interpretedVariant?.discussion?.text || "-"}
                    </div>`;

                const genes = [];
                const transcripts = [];
                const acmgClassifications = [];
                const tierClassifications = [];
                const clinicalSignificances = [];
                for (const evidence of interpretedVariant.evidences.filter(ev => ev.review.select)) {
                    genes.push(`
                        <a href="${BioinfoUtils.getGeneLink(evidence.genomicFeature.geneName, "HGNC")}" target="_blank">
                            ${evidence.genomicFeature.geneName}
                        </a>
                    `);
                    transcripts.push(`
                        <a href="${BioinfoUtils.getTranscriptLink(evidence.genomicFeature.transcriptId)}" target="_blank">
                            ${evidence.genomicFeature.transcriptId}
                        </a>
                    `);
                    acmgClassifications.push(evidence.review.acmg?.map(acmg => acmg.classification)?.join(", ")|| "-");
                    tierClassifications.push(evidence.review.tier || "-");
                    clinicalSignificances.push(`
                        <span style="color:${CLINICAL_SIGNIFICANCE_SETTINGS[evidence.review.clinicalSignificance?.toUpperCase()]?.color || "black"}">
                            ${evidence.review.clinicalSignificance || "-"}
                        </span>
                    `);
                }

                // Create the table row
                reportedHtml += `
                    <tr class="detail-view-row">
                        <td>${interpretationIdHtml}</td>
                        <td>${interpretation?.panels?.length > 0 ? panelsHtml : "-"}</td>
                        <td>${sampleHtml}</td>
                        <td>${genotypeHtml}</td>
                        <td>${statusHtml}</td>
                        <td style="max-width:280px;">${discussionHtml}</td>

                        <td>${genes.length > 0 ? genes.join("<br>") : "-"}</td>
                        <td>${transcripts.length > 0 ? transcripts.join("<br>") : "-"}</td>
                        <td>${acmgClassifications.length > 0 ? acmgClassifications.join("<br>") : "-"}</td>
                        <td>${tierClassifications.length > 0 ? tierClassifications.join("<br>") : "-"}</td>
                        <td>${clinicalSignificances.length > 0 ? clinicalSignificances.join("<br>") : "-"}</td>
                    </tr>
                `;
            }
            reportedHtml += "</tbody></table>";
            return reportedHtml;
        }
        return "-";
    }

}
