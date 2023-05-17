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

import UtilsNew from "../../core/utils-new.js";


export default class VariantUtils {

    static jsonToTabConvert(variants, studiesPopFrequencies, samples, nucleotideGenotype, fieldList) {
        const rows = [];
        let populationMap = {};
        const headerString = [];
        // const sampleIds = samples?.map(sample => sample.id);

        // took from the first result. Is there a better way?
        // allele count / allele freqs
        const cohortAlleleStatsColumns = [];
        const alleleStats = [];
        const studyIds = [];

        // Code to Remove
        // ###
        if (variants[0].studies?.length) {
            variants[0].studies.forEach(study => {
                if (study.studyId.includes("@")) {
                    const studyId = study.studyId.split(":")[1];
                    studyIds.push(studyId);
                    cohortAlleleStatsColumns.push(`cohorts.${studyId}.alleleCount`, `cohorts.${studyId}.altAlleleFreq`);
                    // alleleCount, altAlleleFreq

                    // cohort ALL is always the first element in study.stats
                    // Remove
                    alleleStats.push({
                        id: studyId,
                        stats: study.stats,
                    });
                } else {
                    console.error("Unexpected studyId format");
                }
            });
        }
        // #####

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

        //  TSV header
        rows.push(headerString.join("\t"));

        for (const v of variants) {
            const row = [];
            let genes = new Set();
            let ct = new Set();
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
            const dataToTsv = {};

            const description = {sift: "-", polyphen: "-"};
            let min = 10;
            let max = 0;
            if (typeof v.annotation !== "undefined") {
                if (typeof v.annotation.consequenceTypes !== "undefined" && v.annotation.consequenceTypes.length > 0) {
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
                            // Verify isn't undefined
                            const clinicalSignificance = clinicalData?.variantClassification?.clinicalSignificance ? ` (${clinicalData?.variantClassification?.clinicalSignificance})`: "";
                            clinvar.add(`${clinicalData.id}${clinicalSignificance}`);
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
                prediction = this.getClassificationByClinicalSignificance(v);
            }

            // ID
            if (flatFieldList.includes("id")) {
                dataToTsv["id"] = v.chromosome + ":" + v.start + " " + v.reference + "/" + v.alternate;

                // SNP ID
                if (v?.id?.startsWith("rs")) {
                    dataToTsv["SNP_ID"] = v.id;
                } else if (typeof v.annotation !== "undefined" && typeof v.annotation.xrefs !== "undefined" && v.annotation.xrefs.length > 0) {
                    const annotation = v.annotation.xrefs.find(el => el.source === "dbSNP");
                    if (typeof annotation !== "undefined") {
                        dataToTsv["SNP_ID"] = annotation.id;
                    } else {
                        dataToTsv["SNP_ID"] = "-";
                    }
                } else {
                    dataToTsv["SNP_ID"] = "-";
                }
            }

            // Genes
            if (flatFieldList.includes("gene")) {
                dataToTsv["gene"] = genes;
            }

            // type
            if (flatFieldList.includes("type")) {
                dataToTsv["type"] = v.type;
            }

            // consequence type
            if (flatFieldList.includes("consequenceType")) {
                dataToTsv["consequenceType"] = ct;
            }

            if (samples?.length > 0) {
                const gtSamples = this.getGenotypeSamples(v, samples, nucleotideGenotype);
                gtSamples.forEach(sample => {
                    Object.keys(sample).forEach(sampleId => {
                        if (flatFieldList.includes("sampleGenotypes." + sampleId)) {
                            dataToTsv["sampleGenotypes."+ sampleId] = sample[sampleId];
                        }

                        if (flatFieldList.includes("samples." + sampleId)) {
                            dataToTsv["samples."+ sampleId] = sample[sampleId];
                        }
                    });
                });
            }

            // deleteriousness
            if (flatFieldList.includes("deleteriousness.SIFT")) {
                dataToTsv["deleteriousness.SIFT"] = sift;
            }
            if (flatFieldList.includes("deleteriousness.polyphen")) {
                dataToTsv["deleteriousness.polyphen"] = polyphen;
            }
            if (flatFieldList.includes("deleteriousness.revel")) {
                row.push("-"); // TODO deleteriousness Revel is missing
                dataToTsv["deleteriousness.revel"] = "-";
            }
            if (flatFieldList.includes("deleteriousness.cadd")) {
                dataToTsv["deleteriousness.cadd"] = cadd;
            }
            if (flatFieldList.includes("conservation.phylop")) {
                dataToTsv["conservation.phylop"] = phylop;
            }
            if (flatFieldList.includes("conservation.phastCons")) {
                dataToTsv["conservation.phastCons"] = phastCons;
            }
            if (flatFieldList.includes("conservation.gerp")) {
                dataToTsv["conservation.gerp"] = gerp;
            }

            // Allele stats (VB)
            // frequencies.cohort (SVB)
            // alleleStats.forEach(study => {

            //     if (flatFieldList.includes(`cohorts.${study.id}`) || flatFieldList.includes("frequencies.cohort")) {
            //         const ac = [];
            //         const af = [];
            //         study.stats.map(cohort => {
            //             ac.push(`${cohort.cohortId}:${cohort.alleleCount}`);
            //             af.push(`${cohort.cohortId}:${cohort.altAlleleFreq}`);
            //         });
            //         dataToTsv[`cohorts.${study.id}.alleleCount`] = ac.join(";");
            //         dataToTsv[`cohorts.${study.id}.altAlleleFreq`] = af.join(";");
            //     }
            // });

            v?.studies.forEach(study => {
                const studyId = study.studyId.split(":")[1];
                if (flatFieldList.includes(`cohorts.${studyId}`) || flatFieldList.includes("frequencies.cohort")) {
                    const ac = [];
                    const af = [];
                    study?.stats.map(cohort => {
                        ac.push(`${cohort.cohortId}:${cohort.alleleCount}`);
                        af.push(`${cohort.cohortId}:${cohort.altAlleleFreq}`);
                    });
                    dataToTsv[`cohorts.${studyId}.alleleCount`] = ac.join(";");
                    dataToTsv[`cohorts.${studyId}.altAlleleFreq`] = af.join(";");
                }
            });

            studiesPopFrequencies.forEach(study => {
                study.populations.forEach(pop => {
                    if (flatFieldList.includes("popfreq." + study.id) || flatFieldList.includes("frequencies.populationFrequencies")) {
                        const valuePopFreq = populationMap[study.id + "_" + pop.id];
                        dataToTsv[`popfreq.${study.id}_${pop.id}`] = UtilsNew.isNotEmpty(valuePopFreq) ? valuePopFreq : "-";
                    }
                });
            });

            if (flatFieldList.includes("clinicalInfo.clinvar")) {
                dataToTsv["clinicalInfo.clinvar"] = clinvar;
            }

            if (flatFieldList.includes("clinicalInfo.cosmic")) {
                dataToTsv["clinicalInfo.cosmic"] = cosmic;
            }

            if (flatFieldList.includes("interpretation.prediction")) {
                dataToTsv["interpretation.prediction"] = prediction;
            }
            const rowValues = headerString.map(head => dataToTsv[head]);
            rows.push(rowValues.join("\t"));
        }

        return rows;
    }

    static getClassificationByClinicalSignificance(variant) {
        const clinicalSignificanceMap = {};
        variant.evidences.forEach(({classification}) => {
            const {clinicalSignificance} = classification;
            const acmg = clinicalSignificanceMap[clinicalSignificance] || [];
            const nextAcmg = classification.acmg?.map(acmg => acmg.classification);
            clinicalSignificanceMap[clinicalSignificance] = Array.from(new Set([...acmg, ...nextAcmg]));
        });
        return Object.keys(clinicalSignificanceMap).map(key => {
            const getAcmglistByKey = key => clinicalSignificanceMap[key].length > 0 ? `(${clinicalSignificanceMap[key].join(",")})` : "";
            return `${key} ${getAcmglistByKey(key)}`;
        }).join(" ");
    }

    static getGenotypeSamples(variant, samples, nucleotideGenotype) {
        // Samples genotypes

        const res = [];
        if (nucleotideGenotype) {
            samples.forEach((sample, indexSample) => {
                const alternateSequence = variant.alternate;
                const referenceSequence = variant.reference;
                const genotypeMatch = new Map();
                let colText = "";
                let referenceValueColText = "-";
                let alternateValueColText = "-";

                genotypeMatch.set(0, referenceSequence === "" ? "-" : referenceSequence);
                genotypeMatch.set(1, alternateSequence === "" ? "-" : alternateSequence);
                variant.studies.forEach(study => {
                    if (UtilsNew.isNotUndefinedOrNull(study.secondaryAlternates) && UtilsNew.isNotEmptyArray(study.secondaryAlternates)) {
                        study.secondaryAlternates.forEach(secondary => {
                            genotypeMatch.set(genotypeMatch.size, secondary.alternate === "" ? "-" : secondary.alternate);
                        });
                    }
                    if (UtilsNew.isNotUndefinedOrNull(study.samples?.[indexSample]?.data) && UtilsNew.isNotEmptyArray(study.samples?.[indexSample]?.data)) {
                        if (study.sampleDataKeys[0] === "GT" && (study.samples?.[indexSample]?.data[0] !== "NA" && study.samples?.[indexSample]?.data[0] !== "?/?")) {
                            const currentGenotype = study.samples?.[indexSample]?.data[0];
                            // Is it data is "?/?" it'll be undefined.
                            let [reference, alternate] = currentGenotype.split(new RegExp("[/|]"));
                            let tooltipText = reference + " / " + alternate;
                            if (UtilsNew.isNotEqual(reference, ".") && UtilsNew.isNotEqual(alternate, ".")) {
                                reference = parseInt(reference);
                                alternate = parseInt(alternate);
                                const referenceValue = genotypeMatch.get(reference);
                                const alternateValue = genotypeMatch.get(alternate);
                                referenceValueColText = referenceValue;
                                alternateValueColText = alternateValue;

                                // Not equal X/- or -/X
                                if (UtilsNew.isNotEqual(referenceValue, "-") && UtilsNew.isNotEqual(alternateValue, "-")) {
                                    if ((referenceValue?.length <= 5 && alternateValue?.length > 5) || (referenceValue?.length > 5 && alternateValue?.length <= 5)) {
                                        if (referenceValue?.length > 5) {
                                            referenceValueColText = referenceValue.substring(0, 3) + "...";
                                        } else {
                                            alternateValueColText = alternateValue.substring(0, 3) + "...";
                                        }
                                    } else if (referenceValue?.length > 5 && alternateValue?.length > 5) {
                                        referenceValueColText = referenceValue.substring(0, 3) + "...";
                                        alternateValueColText = alternateValue.substring(0, 3) + "...";
                                    }
                                } else if (UtilsNew.isNotEqual(referenceValue, "-") && referenceValue?.length > 10) {
                                    // X/-
                                    const substringReference = referenceValue.substring(0, 5) + "...";
                                    referenceValueColText = substringReference;
                                    alternateValueColText = "-";
                                } else if (UtilsNew.isNotEqual(alternateValue, "-") && alternateValue?.length > 10) {
                                    // -/X
                                    const substringAlternate = alternateValue.substring(0, 5) + "...";
                                    alternateValueColText = substringAlternate;
                                    referenceValueColText = "-";
                                }
                                tooltipText += "<br>" + referenceValue + "/" + alternateValue;

                            } else {
                                referenceValueColText = reference;
                                alternateValueColText = alternate;
                                tooltipText += "<br>" + reference + "/" + alternate;
                            }
                            colText = {[study.samples?.[indexSample]?.sampleId]: referenceValueColText + "/" + alternateValueColText};
                            res.push(colText);
                        } else {
                            if (study.samples?.[indexSample]?.data[0] === "?/?") {
                                res.push({[study?.samples?.[indexSample]?.sampleId]: "0/0"});
                            } else {
                                res.push({[study?.samples?.[indexSample]?.sampleId]: "NA"});
                            }
                        }
                    }
                });
            });
        } else {
            if (UtilsNew.isNotUndefinedOrNull(samples)) {
                samples.forEach((sample, indexSample) => {
                    variant.studies.forEach(study => {
                        if (study.samples?.[indexSample]?.data.length > 0) {
                            const currentGenotype = study.samples?.[indexSample]?.data;
                            if (UtilsNew.isNotUndefinedOrNull(currentGenotype)) {
                                res.push({[study?.samples?.[indexSample]?.sampleId]: currentGenotype[0]});
                            }
                        }
                        res.push({[study?.samples?.[indexSample]?.sampleId]: "-"});
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
