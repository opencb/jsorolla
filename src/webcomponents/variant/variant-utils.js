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

import UtilsNew from "../../core/utilsNew.js";


export default class VariantUtils {

    static jsonToTabConvert(json, studiesPopFrequencies, samples, nucleotideGenotype, fieldList) {
        const rows = [];
        const dataString = [];
        const variantString = [];
        let populationMap = {};

        const headerString = [];
        const header = {};

        const sampleIds = samples?.forEach(sample => sample.id);

        // took from the first result. Is there a better way?
        // allele count / allele freqs
        const cohortAlleleStatsColumns = [];
        const alleleStats = [];
        const studyIds = [];
        if (json[0].studies?.length) {
            json[0].studies.forEach(study => {
                if (study.studyId.includes("@")) {
                    const studyId = study.studyId.split(":")[1];
                    studyIds.push(studyId);
                    cohortAlleleStatsColumns.push(`cohorts.${studyId}.alleleCount`, `cohorts.${studyId}.altAlleleFreq`);
                    // alleleCount, altAlleleFreq

                    // cohort ALL is always the first element in study.stats
                    alleleStats.push({
                        id: studyId,
                        stats: study.stats,
                    });
                } else {
                    console.error("Unexpected studyId format");
                }
            });
        }

        const popIds = studiesPopFrequencies?.flatMap(study => study.populations.map(pop => "popfreq." + study.id + "_" + pop.id));
        const popStudyIds = studiesPopFrequencies?.map(study => "popfreq." + study.id);

        /* // explicit list gives less maintainability but we need customisation (also in some cases for each column there is more than 1 field) */
        let flatFieldList = [];

        // fieldList is expected to be always defined in VB and SVB.
        // It would be not defined only in case of use of the old Download button and instead of the Export component.
        if (!fieldList) {
            // default list
            flatFieldList = [
                "id",
                "gene",
                "type",
                // Adding SAMPLES (includeSample=all in VB and Case samples in Sample VB)
                ...samples.map(sample => sample.id),
                "consequenceType",
                "deleteriousness.SIFT",
                "deleteriousness.polyphen",
                "deleteriousness.revel",
                "deleteriousness.cadd",
                "conservation.phylop",
                "conservation.phastCons",
                "conservation.gerp",
                // AC / AF
                // fieldList (columns in the grid) is in the form: cohorts.RD38, cohorts.CG38
                // TSV in the form: cohort.RD38.alleleCount,cohort.RD38.altAlleleFreq
                ...studyIds.map(studyId => `cohorts.${studyId}`),
                // fieldList (columns in the grid) is in the form: popfreq.1kG_phase3, popfreq.GNOMAD_GENOMES
                // TSV in the form: popfreq.1kG_phase3_SAS,popfreq.GNOMAD_GENOMES_ALL,popfreq.GNOMAD_GENOMES_AFR
                ...popStudyIds,
                "clinicalInfo.clinvar",
                "clinicalInfo.cosmic",
            ];


        } else {
            flatFieldList = fieldList
                .filter(f => f.export && !f.excludeFromExport)
                .flatMap(f => f.children?.filter(f => f.export && !f.excludeFromExport).map(x => f.id + "." + x.id) ?? f.id);
            // ESlint parse error. Cannot read property 'range' of null https://github.com/babel/babel-eslint/issues/681
            // flatFieldList = fieldList.filter(f => f.export).flatMap(f => f.children?.filter(f => f.export).map(x => `${f.id}.${x.id}`) ?? f.id);
        }

        flatFieldList.forEach(f => {
            if ("id" === f) {
                headerString.push("id");
                headerString.push("SNP_ID");
            } else if (f.startsWith("cohorts.")) {
                // Cohorts Variant Browser
                studyIds.forEach(id => {
                    if (f === "cohorts." + id) {
                        headerString.push(`cohorts.${id}.alleleCount`, `cohorts.${id}.altAlleleFreq`);
                    }
                });
            } else if ("frequencies.cohort" === f) {
                // Cohorts in Sample Variant Browser
                studyIds.forEach(id => headerString.push(`cohorts.${id}.alleleCount`, `cohorts.${id}.altAlleleFreq`));
            } else if (f.startsWith("popfreq.")) {
                // Pop freq in Variant Browser
                studiesPopFrequencies.forEach(study => {
                    if (f === "popfreq." + study.id) {
                        headerString.push(...study.populations.map(pop => "popfreq." + study.id + "_" + pop.id));
                    }
                });
            } else if ("frequencies.populationFrequencies" === f) {
                // Pop freq in Sample Variant Browser
                studiesPopFrequencies.forEach(study => headerString.push(...study.populations.map(pop => "popfreq." + study.id + "_" + pop.id)));
            } else {
                headerString.push(f);
            }

        });

        rows.push(headerString.join("\t"));

        for (let i = 0; i < json.length; i++) {
            const row = [];
            const v = json[i]; // variant


            let genes = new Set();
            let ct = new Set();
            const pfArray = [];
            let sift, polyphen;
            let cadd = "-";
            let phylop = "-";
            let phastCons = "-";
            let gerp = "-";
            // cohorts
            // popfreqs
            let clinvar = new Set();
            let cosmic = new Map();
            let prediction = "-";

            populationMap = {};

            const description = {sift: "-", polyphen: "-"};
            let min = 10;
            let max = 0;
            if (typeof v.annotation !== "undefined") {
                if (typeof v.annotation.consequenceTypes !== "undefined" && v.annotation.consequenceTypes.length > 0) {
                    const visitedCT = new Set();
                    for (let j = 0; j < v.annotation.consequenceTypes.length; j++) {
                        const cT = v.annotation.consequenceTypes[j];
                        // gene
                        if (cT?.geneName !== "") {
                            genes.add(cT.geneName);
                        }

                        // Consequence Type
                        for (let z = 0; z < cT.sequenceOntologyTerms.length; z++) {
                            const consequenceTypeName = cT.sequenceOntologyTerms[z].name;
                            if (consequenceTypeName !== "") {
                                ct.add(consequenceTypeName);
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
                                            description.sift = substitutionScore.description + " (" + substitutionScore.score + ")";
                                        }
                                        break;
                                    case "polyphen":
                                        if (substitutionScore.score >= max) {
                                            max = substitutionScore.score;
                                            description.polyphen = substitutionScore.description + " (" + substitutionScore.score + ")";
                                        }
                                        break;
                                }
                            }
                        }

                    }
                }

                // CADD
                if (v.annotation?.functionalScore) {
                    for (let fs = 0; fs < v.annotation.functionalScore.length; fs++) {
                        if (v.annotation.functionalScore[fs] && v.annotation.functionalScore[fs].source === "cadd_scaled") {
                            cadd = Number(v.annotation.functionalScore[fs].score).toFixed(2);
                        }
                    }
                }

                // Conservation
                if (v.annotation?.conservation) {
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

                if (v.annotation?.populationFrequencies?.length) {
                    for (let pf = 0; pf < v.annotation.populationFrequencies.length; pf++) {
                        const pop = v.annotation.populationFrequencies[pf].study + "_" + v.annotation.populationFrequencies[pf].population;
                        if (typeof populationMap[pop] !== "undefined" && populationMap[pop] === "NA") {
                            populationMap[pop] = Number(v.annotation.populationFrequencies[pf].altAlleleFreq).toFixed(4);
                        }
                    }
                }

                // Clinvar, cosmic
                if (v.annotation?.traitAssociation?.length) {
                    v.annotation.traitAssociation.forEach(clinicalData => {
                        if (clinicalData.source.name === "clinvar") {
                            clinvar.add(`${clinicalData.id} (${clinicalData.variantClassification.clinicalSignificance})`);
                        }
                        if (clinicalData.source.name === "cosmic") {
                            if (clinicalData?.somaticInformation?.primaryHistology) {
                                if (!cosmic.has(clinicalData.id)) {
                                    cosmic.set(clinicalData.id, new Set());
                                }
                                cosmic.get(clinicalData.id).add(clinicalData.somaticInformation.primaryHistology);
                            }
                        }
                    });
                }
                genes = genes.size > 0 ? [...genes].join(",") : "-";
                ct = ct.size > 0 ? [...ct].join(",") : "-";
                sift = typeof description.sift !== "undefined" ? description.sift : "-";
                polyphen = typeof description.polyphen !== "undefined" ? description.polyphen : "-";
                clinvar = clinvar.size > 0 ? [...clinvar].join(",") : "-";
                cosmic = cosmic.size > 0 ? [...cosmic.entries()].map(([traitId, histologies]) => traitId + "(" + [...histologies].join(",") + ")").join(",") : "-";
            }

            // prediction
            if (v.evidences) {
                v.evidences.forEach(e => {
                    prediction = e.classification.clinicalSignificance + (e.classification.acmg.length ? ("(" + e.classification.acmg.map(acmg => acmg.classification).join(",") + ")") : "");
                });
            }


            // ID
            if (flatFieldList.includes("id")) {
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
            }

            // Genes
            if (flatFieldList.includes("gene")) {
                row.push(genes);
            }

            // type
            if (flatFieldList.includes("type")) {
                row.push(v.type);
            }

            // consequence type
            if (flatFieldList.includes("consequenceType")) {
                row.push(ct);
            }

            // gt samples
            row.push(...this.getGenotypeSamples(v, samples, nucleotideGenotype));

            // deleteriousness
            if (flatFieldList.includes("deleteriousness.SIFT")) {
                row.push(sift);
            }
            if (flatFieldList.includes("deleteriousness.polyphen")) {
                row.push(polyphen);
            }
            if (flatFieldList.includes("deleteriousness.revel")) {
                row.push("-"); // TODO deleteriousness Revel is missing
            }
            if (flatFieldList.includes("deleteriousness.cadd")) {
                row.push(cadd);
            }
            if (flatFieldList.includes("conservation.phylop")) {
                row.push(phylop);
            }
            if (flatFieldList.includes("conservation.phastCons")) {
                row.push(phastCons);
            }
            if (flatFieldList.includes("conservation.gerp")) {
                row.push(gerp);
            }

            // Allele stats (VB)
            // frequencies.cohort (SVB)
            alleleStats.forEach(study => {
                if (flatFieldList.includes(`cohorts.${study.id}`) || flatFieldList.includes("frequencies.cohort")) {
                    const ac = [];
                    const af = [];
                    study.stats.map(cohort => {
                        ac.push(`${cohort.cohortId}:${cohort.alleleCount}`);
                        af.push(`${cohort.cohortId}:${cohort.altAlleleFreq}`);
                    });
                    row.push(ac.join(";"));
                    row.push(af.join(";"));
                }
            });

            studiesPopFrequencies.forEach(study => {
                study.populations.forEach(pop => {
                    if (flatFieldList.includes("popfreq." + study.id) || flatFieldList.includes("frequencies.populationFrequencies")) {
                        const valuePopFreq = populationMap[study.id + "_" + pop.id];
                        row.push(UtilsNew.isNotEmpty(valuePopFreq) ? valuePopFreq : "-");
                    }
                });
            });

            if (flatFieldList.includes("clinicalInfo.clinvar")) {
                row.push(clinvar);
            }

            if (flatFieldList.includes("clinicalInfo.cosmic")) {
                row.push(cosmic);
            }

            if (flatFieldList.includes("interpretation.prediction")) {
                row.push(prediction);
            }


            rows.push(row.join("\t"));
        }

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
                            // let reference = currentGenotype.split(new RegExp("[/|]"))[0];
                            // let alternate = currentGenotype.split(new RegExp("[/|]"))[1];
                            let [reference, alternate] = currentGenotype.split(new RegExp("[/|]"));
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
        queryKeys.forEach(key => {
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
