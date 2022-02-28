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

/**
 * Created by swaathi on 28/03/17.
 */
import UtilsNew from "../../core/utilsNew.js";


// TODO urgent refactor!
export default class VariantUtils {

    static jsonToTabConvert(json, studiesPopFrequencies, samples, nucleotideGenotype, fieldList) {
        const rows = [];
        const dataString = [];
        const variantString = [];
        let populationMap = {};

        let headerString = [];

        const sampleIds = samples?.forEach(sample => sample.id);

        // took from the first result. Is there a better way?
        // allele count / allele freqs
        const cohortAlleleStatsColumns = [];
        const alleleStats = [];
        console.log("json", json);
        if (json[0].studies?.length) {
            json[0].studies.forEach(study => {
                if (study.studyId.includes("@")) {
                    const studyId = study.studyId.split(":")[1];
                    cohortAlleleStatsColumns.push(`cohort.${studyId}.alleleCount`, `cohort.${studyId}.altAlleleFreq`);
                    // alleleCount, altAlleleFreq

                    // cohort ALL is always the first element in study.stats
                    alleleStats.push({
                        id: studyId,
                        stats: study.stats
                    });
                } else {
                    console.error("Unexpected studyId format");
                }
            });
        }

        const popIds = studiesPopFrequencies?.flatMap(study => study.populations.map(pop => study.id + "_" + pop.id));

        headerString = [
            "id",
            "SNP ID",
            "gene",
            "type",
            // TODO ADD SAMPLES (includeSample=all in VB and Case samples in Sample VB)
            "consequenceType",
            "deleteriousness.SIFT",
            "deleteriousness.polyphen",
            "deleteriousness.revel",
            "deleteriousness.cadd",
            "conservation.phylop",
            "conservation.phastCons",
            "conservation.gerp",
            // AC / AF (cohorts IDs are comma joined)
            // "cohorts.RD38",
            // "cohorts.CG38",
            ...cohortAlleleStatsColumns,
            // "popfreq.1kG_phase3",
            // "popfreq.GNOMAD_GENOMES",
            ...popIds,
            "clinicalInfo.clinvar",
            "clinicalInfo.cosmic"
        ];

        if (fieldList) {
            // headerString = fieldList.flatMap(f => f.nested?.map(x => `${f.id}.${x.id}`) ?? f.id);

            // explicit list gives less maintainability but we need customisation (also in some cases for each column there is more than 1 field)


        } else {
            // default list
        }

        console.log("headerString", headerString);


        /* headerString = [
            "Variant",
            "SNP ID",
            "Genes",
            "Type",
            ...sampleIds,
            "Consequence Type",
            "SIFT",
            "Polyphen",
            "CADD",
            "PhyloP",
            "PhastCons",
            "GERP",
            ...popIds,
            "Clinvar",
            "Cosmic"
        ];

        variantString.push("Variant");
        variantString.push("SNP ID");
        variantString.push("Genes");
        variantString.push("Type");
        samples.forEach(sample => {
            variantString.push(sample.id);
        });
        variantString.push("Consequence Type");
        variantString.push("SIFT");
        variantString.push("Polyphen");
        variantString.push("CADD");
        variantString.push("PhyloP");
        variantString.push("PhastCons");
        variantString.push("GERP");
        // variantString.push("Population frequencies");
        studiesPopFrequencies.forEach(study => {
            study.populations.forEach(pop => variantString.push(study.id + "_" + pop.id));
        });
        variantString.push("Clinvar");
        variantString.push("Cosmic");
        dataString.push(variantString.join("\t"));
        variantString = [];*/

        rows.push(headerString.join("\t"));

        for (let i = 0; i < json.length; i++) {
            const row = [];
            const v = json[i]; // variant

            // ID
            row.push(v.chromosome + ":" + v.start + " " + v.reference + "/" + v.alternate);

            // SNP ID
            if (v?.id?.startsWith("rs")) {
                row.push(v.id);
            } else if (typeof v.annotation !== "undefined" && typeof v.annotation.xrefs !== "undefined" && v.annotation.xrefs.length > 0) {
                const annotation = v.annotation.xrefs.find(el => el.source === "dbSNP");
                if (typeof annotation !== "undefined") {
                    row.push(annotation.id);
                } else {
                    row.push("-");
                }
            } else {
                row.push("-");
            }


            const genes = [];
            const ct = [];
            const pfArray = [];
            let sift, polyphen; let cadd = "-"; let phylop = "-"; let phastCons = "-"; let gerp = "-";
            const clinvar = [];
            const cosmic = [];
            populationMap = {};

            const description = {sift: "-", polyphen: "-"};
            let min = 10;
            let max = 0;
            if (typeof v.annotation !== "undefined") {
                if (typeof v.annotation.consequenceTypes !== "undefined" && v.annotation.consequenceTypes.length > 0) {
                    const visitedGenes = {};
                    const visitedCT = new Set();
                    for (let j = 0; j < v.annotation.consequenceTypes.length; j++) {
                        const cT = v.annotation.consequenceTypes[j];
                        // gene
                        if (cT.geneName && cT.geneName !== "" && visitedGenes[cT.geneName]) {
                            genes.push(cT.geneName);
                            visitedGenes[cT.geneName] = true;
                        }

                        // Consequence Type
                        for (let z = 0; z < cT.sequenceOntologyTerms.length; z++) {
                            const consequenceTypeName = cT.sequenceOntologyTerms[z].name;
                            if (consequenceTypeName && consequenceTypeName !== "" && !visitedCT.has(consequenceTypeName)) {
                                ct.push(consequenceTypeName);
                                visitedCT.add(consequenceTypeName);
                            }
                        }

                        // Sift, Polyphen
                        if (typeof cT.proteinVariantAnnotation !== "undefined" &&
                            typeof cT.proteinVariantAnnotation.substitutionScores !== "undefined") {
                            for (let ss = 0; ss < cT.proteinVariantAnnotation.substitutionScores.length; ss++) {
                                const substitutionScore = cT.proteinVariantAnnotation.substitutionScores[ss];
                                const source = substitutionScore.source;
                                switch (source) {
                                    case "sift":
                                        if (substitutionScore.score < min) {
                                            min = substitutionScore.score;
                                            description.sift = substitutionScore.description + " ("+substitutionScore.score+")";
                                        }
                                        break;
                                    case "polyphen":
                                        if (substitutionScore.score >= max) {
                                            max = substitutionScore.score;
                                            description.polyphen = substitutionScore.description + " ("+substitutionScore.score+")";
                                        }
                                        break;
                                }
                            }
                        }

                    }
                }
                sift = typeof description.sift !== "undefined" ? description.sift : "-";
                polyphen = typeof description.polyphen !== "undefined" ? description.polyphen : "-";

                // CADD
                if (typeof v.annotation.functionalScore !== "undefined") {
                    for (let fs = 0; fs < v.annotation.functionalScore.length; fs++) {
                        if (v.annotation.functionalScore[fs] && v.annotation.functionalScore[fs].source === "cadd_scaled") {
                            cadd = Number(v.annotation.functionalScore[fs].score).toFixed(2);
                        }
                    }
                }

                // Conservation
                if (typeof v.annotation.conservation !== "undefined") {
                    for (let cons = 0; cons < v.annotation.conservation.length; cons++) {
                        const conservation = v.annotation.conservation[cons];
                        switch (conservation.source) {
                            case "phylop":
                                phylop = Number(conservation.score).toFixed(3);
                                break;
                            case "phastCons":
                                phastCons = Number(conservation.score).toFixed(3);
                                break;
                            case "gerp":
                                gerp = Number(conservation.score).toFixed(3);
                                break;
                        }
                    }
                }

                // Population frequency
                const populations = [];
                const populationStudyBidimensional = [];
                const populationMapExists = [];
                studiesPopFrequencies.forEach(study => {
                    populations[study.id] = study.populations.map(pop => pop.id);
                    study.populations.forEach(pop => {
                        populationMapExists[pop.id] = true;
                    });
                    populationStudyBidimensional[study.id] = populationMapExists;
                });
                if (typeof studiesPopFrequencies !== "undefined" && studiesPopFrequencies.length > 0) {
                    for (let j = 0; j < studiesPopFrequencies.length; j++) {
                        const study = studiesPopFrequencies[j];
                        for (const popFreqIdx in v.annotation.populationFrequencies) {
                            if (Object.prototype.hasOwnProperty.call(v.annotation.populationFrequencies, popFreqIdx)) {
                                const popFreq = v.annotation.populationFrequencies[popFreqIdx];
                                if (UtilsNew.isNotUndefinedOrNull(popFreq)) {
                                    const population = popFreq.population;
                                    if (study.id === popFreq.study && populationStudyBidimensional[study.id][population] === true) {
                                        populationMap[study.id + "_" + population] = "NA";
                                    }
                                }
                            }
                        }
                    }
                }

                if (typeof v.annotation.populationFrequencies !== "undefined") {
                    for (let pf = 0; pf < v.annotation.populationFrequencies.length; pf++) {
                        const pop = v.annotation.populationFrequencies[pf].study + "_" + v.annotation.populationFrequencies[pf].population;
                        if (typeof populationMap[pop] !== "undefined" && populationMap[pop] === "NA") {
                            populationMap[pop] = Number(v.annotation.populationFrequencies[pf].altAlleleFreq).toFixed(4);
                        }
                    }
                }
                // pfArray = Object.keys(populationMap).map(key => populationMap[key]);

                // Clinvar, cosmic
                if (typeof v.annotation.variantTraitAssociation !== "undefined" && v.annotation.variantTraitAssociation != null) {
                    for (const key in v.annotation.variantTraitAssociation) {
                        if (Object.prototype.hasOwnProperty.call(v.annotation.variantTraitAssociation, key)) {
                            const clinicalData = v.annotation.variantTraitAssociation[key];
                            if (typeof clinicalData !== "undefined") {
                                for (let cd = 0; cd < clinicalData.length; cd++) {
                                    switch (key) {
                                        case "clinvar":
                                            clinvar.push(clinicalData[cd].traits[0]);
                                            break;
                                        case "cosmic":
                                            cosmic.push(clinicalData[cd].primaryHistology);
                                            break;
                                    }
                                }
                            }
                        }

                    }
                }
            }


            if (genes.length > 0) {
                row.push(genes.join(","));
            } else {
                row.push("-");
            }
            row.push(v.type);
            row.push(...this.getGenotypeSamples(v, samples, nucleotideGenotype));
            if (ct.length > 0) {
                row.push(ct.join(","));
            } else {
                row.push("-");
            }
            row.push(sift);
            row.push(polyphen);
            row.push("-"); // TODO deleteriousness Revel is missing
            row.push(cadd);
            row.push(phylop);
            row.push(phastCons);
            row.push(gerp);

            // Allele stats
            row.push(...alleleStats.map(study => `${study.alleleCount}:${study.altAlleleFreq}`));

            studiesPopFrequencies.forEach(study => {
                study.populations.forEach(pop => {
                    const valuePopFreq = populationMap[study.id + "_" + pop.id];
                    row.push(UtilsNew.isNotEmpty(valuePopFreq) ? valuePopFreq : "-");
                });
            });
            // variantString.push(pfArray.join(','));
            if (clinvar.length > 0) {
                row.push(clinvar.join(","));
            } else {
                row.push("-");
            }
            if (cosmic.length > 0) {
                row.push(cosmic.join(","));
            } else {
                row.push("-");
            }

            rows.push(row.join("\t"));
        }


        // ---------------- old -------------------------

        /* for (let i = 0; i < json.length; i++) {
            variantString.push(json[i].chromosome + ":" + json[i].start + " " + json[i].reference + "/" + json[i].alternate);
            if (typeof json[i].id !== "undefined" && json[i].id.startsWith("rs")) {
                variantString.push(json[i].id);
            } else if (typeof json[i].annotation !== "undefined" && typeof json[i].annotation.xrefs !== "undefined" && json[i].annotation.xrefs.length > 0) {
                const annotation = json[i].annotation.xrefs.find(function (element) {
                    return element.source === "dbSNP";
                });
                if (typeof annotation !== "undefined") {
                    variantString.push(annotation.id);
                } else {
                    variantString.push("-");
                }
            } else {
                variantString.push("-");
            }

            const genes = [];
            const ct = [];
            const pfArray = [];
            let sift, polyphen; let cadd = "-"; let phylop = "-"; let phastCons = "-"; let gerp = "-";
            const clinvar = [];
            const cosmic = [];
            populationMap = {};

            const description = {sift: "-", polyphen: "-"};
            let min = 10;
            let max = 0;
            if (typeof json[i].annotation !== "undefined") {
                if (typeof json[i].annotation.consequenceTypes !== "undefined" && json[i].annotation.consequenceTypes.length > 0) {
                    const visitedGenes = {};
                    const visitedCT = new Set();
                    for (let j = 0; j < json[i].annotation.consequenceTypes.length; j++) {
                        // gene
                        if (typeof json[i].annotation.consequenceTypes[j].geneName !== "undefined" && json[i].annotation.consequenceTypes[j].geneName != "" &&
                            typeof visitedGenes[json[i].annotation.consequenceTypes[j].geneName] === "undefined") {
                            genes.push(json[i].annotation.consequenceTypes[j].geneName);
                            visitedGenes[json[i].annotation.consequenceTypes[j].geneName] = true;
                        }

                        // Consequence Type
                        for (let z = 0; z < json[i].annotation.consequenceTypes[j].sequenceOntologyTerms.length; z++) {
                            const consequenceTypeName = json[i].annotation.consequenceTypes[j].sequenceOntologyTerms[z].name;
                            if (typeof consequenceTypeName !== "undefined" && consequenceTypeName != "" && !visitedCT.has(consequenceTypeName)) {
                                ct.push(consequenceTypeName);
                                visitedCT.add(consequenceTypeName);
                            }
                        }

                        // Sift, Polyphen
                        if (typeof json[i].annotation.consequenceTypes[j].proteinVariantAnnotation !== "undefined" &&
                            typeof json[i].annotation.consequenceTypes[j].proteinVariantAnnotation.substitutionScores !== "undefined") {
                            for (let ss = 0; ss < json[i].annotation.consequenceTypes[j].proteinVariantAnnotation.substitutionScores.length; ss++) {
                                const source = json[i].annotation.consequenceTypes[j].proteinVariantAnnotation.substitutionScores[ss].source;
                                switch (source) {
                                    case "sift":
                                        if (json[i].annotation.consequenceTypes[j].proteinVariantAnnotation.substitutionScores[ss].score < min) {
                                            min = json[i].annotation.consequenceTypes[j].proteinVariantAnnotation.substitutionScores[ss].score;
                                            description.sift = json[i].annotation.consequenceTypes[j].proteinVariantAnnotation.substitutionScores[ss].description + " ("+json[i].annotation.consequenceTypes[j].proteinVariantAnnotation.substitutionScores[ss].score+")";
                                        }
                                        break;
                                    case "polyphen":
                                        if (json[i].annotation.consequenceTypes[j].proteinVariantAnnotation.substitutionScores[ss].score >= max) {
                                            max = json[i].annotation.consequenceTypes[j].proteinVariantAnnotation.substitutionScores[ss].score;
                                            description.polyphen = json[i].annotation.consequenceTypes[j].proteinVariantAnnotation.substitutionScores[ss].description + " ("+json[i].annotation.consequenceTypes[j].proteinVariantAnnotation.substitutionScores[ss].score+")";
                                        }
                                        break;
                                }
                            }
                        }

                    }
                }
                sift = typeof description.sift !== "undefined" ? description.sift : "-";
                polyphen = typeof description.polyphen !== "undefined" ? description.polyphen : "-";

                // CADD
                if (typeof json[i].annotation.functionalScore !== "undefined") {
                    for (let fs = 0; fs < json[i].annotation.functionalScore.length; fs++) {
                        if (typeof json[i].annotation.functionalScore[fs] !== "undefined" && json[i].annotation.functionalScore[fs].source == "cadd_scaled") {
                            cadd = Number(json[i].annotation.functionalScore[fs].score).toFixed(2);
                        }
                    }
                }

                // Conservation
                if (typeof json[i].annotation.conservation !== "undefined") {
                    for (let cons = 0; cons < json[i].annotation.conservation.length; cons++) {
                        switch (json[i].annotation.conservation[cons].source) {
                            case "phylop":
                                phylop = Number(json[i].annotation.conservation[cons].score).toFixed(3);
                                break;
                            case "phastCons":
                                phastCons = Number(json[i].annotation.conservation[cons].score).toFixed(3);
                                break;
                            case "gerp":
                                gerp = Number(json[i].annotation.conservation[cons].score).toFixed(3);
                                break;
                        }
                    }
                }

                // Population frequency
                const populations = [];
                const populationStudyBidimensional = [];
                const populationMapExists = [];
                studiesPopFrequencies.forEach(study => {
                    populations[study.id] = study.populations.map(pop => pop.id);
                    study.populations.forEach(pop => {
                        populationMapExists[pop.id] = true;
                    });
                    populationStudyBidimensional[study.id] = populationMapExists;
                });
                if (typeof studiesPopFrequencies !== "undefined" && studiesPopFrequencies.length > 0) {
                    for (let j = 0; j < studiesPopFrequencies.length; j++) {
                        const study = studiesPopFrequencies[j];
                        for (const popFreqIdx in json[i].annotation.populationFrequencies) {
                            const popFreq = json[i].annotation.populationFrequencies[popFreqIdx];
                            if (UtilsNew.isNotUndefinedOrNull(popFreq)) {
                                const population = popFreq.population;
                                if (study.id === popFreq.study && populationStudyBidimensional[study.id][population] === true) {
                                    populationMap[study.id + "_" + population] = "NA";
                                }
                            }
                        }
                    }
                }

                if (typeof json[i].annotation.populationFrequencies !== "undefined") {
                    for (let pf = 0; pf < json[i].annotation.populationFrequencies.length; pf++) {
                        const pop = json[i].annotation.populationFrequencies[pf].study + "_" + json[i].annotation.populationFrequencies[pf].population;
                        if (typeof populationMap[pop] !== "undefined" && populationMap[pop] == "NA") {
                            populationMap[pop] = Number(json[i].annotation.populationFrequencies[pf].altAlleleFreq).toFixed(4);
                        }
                    }
                }
                // pfArray = Object.keys(populationMap).map(key => populationMap[key]);

                // Clinvar, cosmic
                if (typeof json[i].annotation.variantTraitAssociation !== "undefined" && json[i].annotation.variantTraitAssociation != null) {
                    for (const key in json[i].annotation.variantTraitAssociation) {
                        const clinicalData = json[i].annotation.variantTraitAssociation[key];
                        if (typeof clinicalData !== "undefined") {
                            for (let cd = 0; cd < clinicalData.length; cd++) {
                                switch (key) {
                                    case "clinvar":
                                        clinvar.push(clinicalData[cd].traits[0]);
                                        break;
                                    case "cosmic":
                                        cosmic.push(clinicalData[cd].primaryHistology);
                                        break;
                                }
                            }
                        }
                    }
                }
            }


            if (genes.length > 0) {
                variantString.push(genes.join(","));
            } else {
                variantString.push("-");
            }
            variantString.push(json[i].type);
            this.getGenotypeSamples(json[i], samples, nucleotideGenotype, variantString);
            if (ct.length > 0) {
                variantString.push(ct.join(","));
            } else {
                variantString.push("-");
            }
            variantString.push(sift);
            variantString.push(polyphen);
            variantString.push(cadd);
            variantString.push(phylop);
            variantString.push(phastCons);
            variantString.push(gerp);
            studiesPopFrequencies.forEach(study => {
                study.populations.forEach(pop => {
                    const valuePopFreq = populationMap[study.id + "_" + pop.id];
                    variantString.push(UtilsNew.isNotEmpty(valuePopFreq) ? valuePopFreq : "-");
                });
            });
            // variantString.push(pfArray.join(','));
            if (clinvar.length > 0) {
                variantString.push(clinvar.join(","));
            } else {
                variantString.push("-");
            }
            if (cosmic.length > 0) {
                variantString.push(cosmic.join(","));
            } else {
                variantString.push("-");
            }

            dataString.push(variantString.join("\t"));
            variantString = [];
        }
*/

        return rows;
    }

    static getGenotypeSamples(json, samples, nucleotideGenotype) {
        // Samples genotypes

        const res = [];
        if (nucleotideGenotype) {
            samples.forEach((sample, indexSample) => {
                const alternateSequence = json.alternate;
                const referenceSequence = json.reference;
                const genotypeMatch = new Map();
                let colText = "";
                let referenceValueColText = "-";
                let alternateValueColText = "-";

                genotypeMatch.set(0, referenceSequence === "" ? "-" : referenceSequence);
                genotypeMatch.set(1, alternateSequence === "" ? "-" : alternateSequence);
                json.studies.forEach(study => {
                    if (UtilsNew.isNotUndefinedOrNull(study.secondaryAlternates) && UtilsNew.isNotEmptyArray(study.secondaryAlternates)) {
                        study.secondaryAlternates.forEach(secondary => {
                            genotypeMatch.set(genotypeMatch.size, secondary.alternate === "" ? "-" : secondary.alternate);
                        });
                    }
                    if (UtilsNew.isNotUndefinedOrNull(study.samples?.[indexSample]?.data) && UtilsNew.isNotEmptyArray(study.samples?.[indexSample]?.data)) {
                        if (UtilsNew.isNotUndefinedOrNull(study.samples?.[indexSample]?.data)) {
                            const currentGenotype = study.samples?.[indexSample]?.data[0];
                            let reference = currentGenotype.split("/")[0];
                            let alternate = currentGenotype.split("/")[1];
                            let tooltipText = reference + " / " + alternate;
                            if (UtilsNew.isNotEqual(reference, ".") && UtilsNew.isNotEqual(alternate, ".")) {
                                reference = parseInt(reference);
                                alternate = parseInt(alternate);
                                const referenceValue = genotypeMatch.get(reference);
                                const alternateValue = genotypeMatch.get(alternate);
                                // Cases which this will cover.
                                // referenceValue.length <= 5 && alternateVAlue.length <= 5
                                // referenceValue.length <= 10 && alternateValue == "-"
                                // alternateValue.length <= 10 && referenceValue == "-"
                                referenceValueColText = referenceValue;
                                alternateValueColText = alternateValue;

                                // Not equal X/- or -/X
                                if (UtilsNew.isNotEqual(referenceValue, "-") && UtilsNew.isNotEqual(alternateValue, "-")) {
                                    if ((referenceValue.length <= 5 && alternateValue.length > 5) || (referenceValue.length > 5 && alternateValue.length <= 5)) {
                                        if (referenceValue.length > 5) {
                                            // referenceValue > 5
                                            referenceValueColText = referenceValue.substring(0, 3) + "...";
                                            //                                                    tooltipText += "<br>" + referenceValue +" / " + alternateValue;
                                        } else {
                                            // alternateValue > 5
                                            alternateValueColText = alternateValue.substring(0, 3) + "...";
                                            //                                                    tooltipText += "<br>" + referenceValue +" / " + alternateValue;
                                        }
                                    } else if (referenceValue.length > 5 && alternateValue.length > 5) {
                                        // Both > 5 It will never happen
                                        referenceValueColText = referenceValue.substring(0, 3) + "...";
                                        alternateValueColText = alternateValue.substring(0, 3) + "...";
                                        //                                                tooltipText += "<br>" +   referenceValue +" / " + alternateValue;
                                    }
                                } else if (UtilsNew.isNotEqual(referenceValue, "-") && referenceValue.length > 10) {
                                    // X/-
                                    const substringReference = referenceValue.substring(0, 5) + "...";
                                    referenceValueColText = substringReference;
                                    alternateValueColText = "-";
                                    //                                                tooltipText += "<br>" +   referenceValue +" / " + alternateValue;
                                } else if (UtilsNew.isNotEqual(alternateValue, "-") && alternateValue.length > 10) {
                                    // -/X
                                    const substringAlternate = alternateValue.substring(0, 5) + "...";
                                    alternateValueColText = substringAlternate;
                                    referenceValueColText = "-";
                                    //                                                tooltipText += "<br>" +   referenceValue + " / " + alternateValue;
                                }
                                tooltipText += "<br>" + referenceValue + "/" + alternateValue;
                            } else {
                                referenceValueColText = reference;
                                alternateValueColText = alternate;
                                tooltipText += "<br>" + reference + "/" + alternate;
                            }

                            const referenceIndex = parseInt(reference);
                            const alternateIndex = parseInt(alternate);
                            referenceValueColText = referenceValueColText;
                            alternateValueColText = alternateValueColText;
                            colText = referenceValueColText + "/" + alternateValueColText;
                            res.push(colText);

                            // res = "<span class='sampleGenotype' data-text='" + tooltipText + "'> " + colText + " </span>";

                        }
                    }
                });
            });
        } else {
            if (UtilsNew.isNotUndefinedOrNull(samples)) {
                samples.forEach((sample, indexSample) => {
                    json.studies.forEach(study => {
                        if (study.samples?.[indexSample]?.data.length > 0) {
                            const currentGenotype = study.samples?.[indexSample]?.data;
                            if (UtilsNew.isNotUndefinedOrNull(currentGenotype)) {
                                res.push(currentGenotype[0]);
                            }
                        }
                        res.push("-");
                    });
                });
            }
        }
        return res;
    }

    static removeUnlockQuery(lockedFields, preparedQuery, executedQuery) {
        // Get all keys
        const queryKeys = new Set([...Object.keys(preparedQuery), ...Object.keys(executedQuery)]);

        // Remove keys belong to lockedFields
        lockedFields.forEach(key => queryKeys.delete(key.id));

        // Remove all key not belong to lockedFields
        queryKeys.forEach(key =>{
            delete preparedQuery[key];
            delete executedQuery[key];
        });
    }

    static validateQuery(query) {
        if (!query?.panel) {
            if ("panelFeatureType" in query) {
                delete query?.panelFeatureType;
            }
            if ("panelModeOfInheritance" in query) {
                delete query?.panelModeOfInheritance;
            }
            if ("panelConfidence" in query) {
                delete query?.panelConfidence;
            }
            if ("panelRoleInCancer" in query) {
                delete query?.panelRoleInCancer;
            }
        }
    }

}
