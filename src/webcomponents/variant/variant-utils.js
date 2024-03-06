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
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import VariantGridFormatter from "./variant-grid-formatter.js";


export default class VariantUtils {

    static jsonToTabConvert(variants, populationFrequenciesStudies, samples, nucleotideGenotype, fieldList) {
        const rows = [];
        let populationMap = {};
        const headerString = [];
        // const sampleIds = samples?.map(sample => sample.id);

        // took from the first result. Is there a better way?
        // allele count / allele freqs
        // const cohortAlleleStatsColumns = [];
        // const alleleStats = [];
        // const studyIds = [];

        // variants?.[0]?.studies
        //     ?.filter(s => s.studyId.includes("@"))
        //     .map(s => s.studyId.split(":")[1]);

        // Code to Remove
        // ###
        // if (variants[0].studies?.length) {
        //     variants[0].studies.forEach(study => {
        //         if (study.studyId.includes("@")) {
        //             const studyId = study.studyId.split(":")[1];
        //             studyIds.push(studyId);
        //             cohortAlleleStatsColumns.push(`cohorts.${studyId}.alleleCount`, `cohorts.${studyId}.altAlleleFreq`);
        //             // alleleCount, altAlleleFreq
        //
        //             // cohort ALL is always the first element in study.stats
        //             // Remove
        //             alleleStats.push({
        //                 id: studyId,
        //                 stats: study.stats,
        //             });
        //         } else {
        //             console.error("Unexpected studyId format");
        //         }
        //     });
        // }
        // #####

        // const popStudyIds = populationFrequenciesStudies?.map(popFreqStudy => "popfreq." + popFreqStudy.id);

        /* // explicit list gives less maintainability but we need customisation (also in some cases for each column there is more than 1 field) */
        let flatFieldList = [];
        // fieldList is expected to be always defined in VB and SVB.
        // It would be not defined only in case of use of the old Download button and instead of the Export component.
        if (!fieldList) {
            // default list
            flatFieldList = [
                "id",
                "snp_id",
                "gene",
                "type",
                "hgvs",
                // Adding SAMPLES (includeSample=all in VB and Case samples in Sample VB)
                // ...samples.map(sample => sample.id || sample),
                "samples",
                "consequenceType",
                "deleteriousness.SIFT",
                "deleteriousness.polyphen",
                "deleteriousness.revel",
                "deleteriousness.cadd",
                "deleteriousness.spliceai",
                "conservation.phylop",
                "conservation.phastCons",
                "conservation.gerp",
                // AC / AF
                // fieldList (columns in the grid) is in the form: cohorts.RD38, cohorts.CG38
                // TSV in the form: cohort.RD38.alleleCount,cohort.RD38.altAlleleFreq
                // ...studyIds.map(studyId => `cohorts.${studyId}`),
                "cohortStats",
                // fieldList (columns in the grid) is in the form: popfreq.1kG_phase3, popfreq.GNOMAD_GENOMES
                // TSV in the form: popfreq.1kG_phase3_SAS,popfreq.GNOMAD_GENOMES_ALL,popfreq.GNOMAD_GENOMES_AFR
                // ...popStudyIds,
                "populationFrequencies",
                "clinicalInfo.clinvar",
                "clinicalInfo.cosmic",
                "acmgPrediction",
            ];
        } else {
            flatFieldList = fieldList
                .filter(f => f.export && !f.excludeFromExport)
                .flatMap(f => f.children?.filter(f => f.export && !f.excludeFromExport).map(x => f.id + "." + x.id) ?? f.id);
            // ESlint parse error. Cannot read property 'range' of null https://github.com/babel/babel-eslint/issues/681
            // flatFieldList = fieldList.filter(f => f.export).flatMap(f => f.children?.filter(f => f.export).map(x => `${f.id}.${x.id}`) ?? f.id);
        }

        // flatFieldList.forEach(f => {
        //     if ("id" === f) {
        //         headerString.push("id");
        //         // headerString.push("snp_id");
        //     } else if (f.startsWith("cohorts.")) {
        //         // Cohorts Variant Browser
        //         studyIds.forEach(id => {
        //             if (f === "cohorts." + id) {
        //                 headerString.push(`cohorts.${id}.alleleCount`, `cohorts.${id}.altAlleleFreq`);
        //             }
        //         });
        //     } else if ("frequencies.cohort" === f) {
        //         // Cohorts in Sample Variant Browser
        //         studyIds.forEach(id => headerString.push(`cohorts.${id}.alleleCount`, `cohorts.${id}.altAlleleFreq`));
        //     } else if (f.startsWith("popfreq.")) {
        //         // Pop freq in Variant Browser
        //         populationFrequenciesStudies.forEach(study => {
        //             if (f === "popfreq." + study.id) {
        //                 headerString.push(...study.populations.map(pop => "popfreq." + study.id + "_" + pop.id));
        //             }
        //         });
        //     } else if ("frequencies.populationFrequencies" === f) {
        //         // Pop freq in Sample Variant Browser
        //         populationFrequenciesStudies.forEach(study => headerString.push(...study.populations.map(pop => "popfreq." + study.id + "_" + pop.id)));
        //     } else {
        //         headerString.push(f);
        //     }
        // });

        //  TSV header
        rows.push(flatFieldList.join("\t"));

        for (const variant of variants) {
            const genes = new Set();
            const consequenceTypeNames = new Set();
            const proteinSubstitutionScores = {sift: "-", polyphen: "-", revel: "-"};
            let cadd = "-";
            let phylop = "-";
            let phastCons = "-";
            let gerp = "-";
            let clinvar = new Set();
            let cosmic = new Map();
            let acmgPrediction = "-";

            populationMap = {};
            const dataToTsv = {};

            if (variant.annotation) {
                // Process the information in the ConsequenceType arrays
                if (variant.annotation.consequenceTypes?.length > 0) {
                    for (const consequenceType of variant.annotation.consequenceTypes) {
                        // Genes
                        if (typeof consequenceType?.geneName === "string" && consequenceTypeNames?.geneName !== "") {
                            genes.add(consequenceType.geneName);
                        }

                        // Consequence Type
                        for (const consequenceTypeName of consequenceType.sequenceOntologyTerms) {
                            if (consequenceTypeName.name) {
                                consequenceTypeNames.add(consequenceTypeName.name);
                            }
                        }

                        // Sift, Polyphen, Revel
                        if (consequenceType.proteinVariantAnnotation?.substitutionScores) {
                            let siftMin = 10;
                            let polyphenMax = 0;
                            let revelMax = 0;
                            for (const substitutionScore of consequenceType.proteinVariantAnnotation.substitutionScores) {
                                switch (substitutionScore.source) {
                                    case "sift":
                                        if (substitutionScore.score < siftMin) {
                                            siftMin = substitutionScore.score;
                                            proteinSubstitutionScores.sift = substitutionScore.description + " (" + substitutionScore.score + ")";
                                        }
                                        break;
                                    case "polyphen":
                                        if (substitutionScore.score >= polyphenMax) {
                                            polyphenMax = substitutionScore.score;
                                            proteinSubstitutionScores.polyphen = substitutionScore.description + " (" + substitutionScore.score + ")";
                                        }
                                        break;
                                    case "revel":
                                        if (substitutionScore.score >= revelMax) {
                                            revelMax = substitutionScore.score;
                                            proteinSubstitutionScores.revel = substitutionScore.score;
                                        }
                                        break;
                                }
                            }
                        }
                    }
                }

                // CADD
                if (variant.annotation?.functionalScore) {
                    for (let fs = 0; fs < variant.annotation.functionalScore.length; fs++) {
                        if (variant.annotation.functionalScore[fs]?.source === "cadd_scaled") {
                            cadd = Number(variant.annotation.functionalScore[fs].score).toFixed(2);
                        }
                    }
                }

                // Conservation
                if (variant.annotation?.conservation) {
                    for (const conservation of variant.annotation.conservation) {
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
                populationFrequenciesStudies.forEach(study => {
                    populations[study.id] = study.populations.map(pop => pop.id);
                    study.populations.forEach(pop => {
                        populationMapExists[pop.id] = true;
                    });
                    populationStudyBidimensional[study.id] = populationMapExists;
                });

                if (populationFrequenciesStudies?.length > 0) {
                    for (let j = 0; j < populationFrequenciesStudies.length; j++) {
                        const study = populationFrequenciesStudies[j];
                        for (const popFreqIdx in variant.annotation.populationFrequencies) {
                            if (Object.prototype.hasOwnProperty.call(variant.annotation.populationFrequencies, popFreqIdx)) {
                                const popFreq = variant.annotation.populationFrequencies[popFreqIdx];
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

                if (variant.annotation?.populationFrequencies?.length) {
                    for (let pf = 0; pf < variant.annotation.populationFrequencies.length; pf++) {
                        const pop = variant.annotation.populationFrequencies[pf].study + "_" + variant.annotation.populationFrequencies[pf].population;
                        if (typeof populationMap[pop] !== "undefined" && populationMap[pop] === "NA") {
                            populationMap[pop] = Number(variant.annotation.populationFrequencies[pf].altAlleleFreq).toFixed(4);
                        }
                    }
                }

                // Clinvar, Cosmic
                if (variant.annotation?.traitAssociation?.length) {
                    variant.annotation.traitAssociation.forEach(clinicalData => {
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

                // genes = genes.size > 0 ? [...genes].join(",") : "-";
                // consequenceTypeNames = consequenceTypeNames.size > 0 ? [...consequenceTypeNames].join(",") : "-";
                // sift = typeof proteinSubstitutionScores.sift !== "undefined" ? proteinSubstitutionScores.sift : "-";
                // polyphen = typeof proteinSubstitutionScores.polyphen !== "undefined" ? proteinSubstitutionScores.polyphen : "-";
                clinvar = clinvar.size > 0 ? [...clinvar].join(",") : "-";
                cosmic = cosmic.size > 0 ? [...cosmic.entries()].map(([traitId, histologies]) => traitId + "(" + [...histologies].join(",") + ")").join(",") : "-";
            }

            // prediction
            if (variant.evidences) {
                acmgPrediction = this.getClassificationByClinicalSignificance(variant);
            }

            // START PREPARING THE LINE
            if (flatFieldList.includes("id")) {
                dataToTsv["id"] = variant.chromosome + ":" + variant.start + ":" + variant.reference || "-" + ":" + variant.alternate || "-";
            }
            if (flatFieldList.includes("snp_id")) {
                // SNP ID
                const dbSnpId = variant.names?.filter(name => name.startsWith("rs"))?.map(name => name).join(",");
                if (dbSnpId) {
                    dataToTsv["snp_id"] = dbSnpId;
                } else {
                    if (variant.annotation?.xrefs?.length > 0) {
                        const dbSnpXref = variant.annotation.xrefs.find(el => el.source === "dbSNP");
                        if (dbSnpXref) {
                            dataToTsv["snp_id"] = dbSnpXref.id;
                        } else {
                            dataToTsv["snp_id"] = "-";
                        }
                    } else {
                        dataToTsv["snp_id"] = "-";
                    }
                }
            }
            if (flatFieldList.includes("gene")) {
                dataToTsv["gene"] = genes.size > 0 ? [...genes].join(",") : "-";
            }
            if (flatFieldList.includes("type")) {
                dataToTsv["type"] = variant.type;
            }
            if (flatFieldList.includes("hgvs")) {
                dataToTsv["hgvs"] = this.gethgvsValues(variant);
            }

            // Sample
            if (samples?.length > 0) {
                const gtSamples = this.getGenotypeSamples(variant, samples, nucleotideGenotype);
                const sampleGenotypes = [];
                gtSamples.forEach(sample => {
                    Object.keys(sample).forEach(sampleId => {
                        // if (flatFieldList.includes("sampleGenotypes." + sampleId)) {
                        //     dataToTsv["sampleGenotypes."+ sampleId] = sample[sampleId];
                        // }
                        // if (flatFieldList.includes("samples." + sampleId)) {
                        //     dataToTsv["samples."+ sampleId] = sample[sampleId];
                        // }
                        if (sample[sampleId] !== "-") {
                            sampleGenotypes.push(sampleId + ":" + sample[sampleId]);
                        }
                    });
                });
                dataToTsv["samples"] = sampleGenotypes.join(",");
            }

            if (flatFieldList.includes("consequenceType")) {
                dataToTsv["consequenceType"] = consequenceTypeNames.size > 0 ? [...consequenceTypeNames].join(",") : "-";
            }
            if (flatFieldList.includes("deleteriousness.SIFT")) {
                dataToTsv["deleteriousness.SIFT"] = proteinSubstitutionScores.sift || "-";
            }
            if (flatFieldList.includes("deleteriousness.polyphen")) {
                dataToTsv["deleteriousness.polyphen"] = proteinSubstitutionScores.polyphen || "-";
            }
            if (flatFieldList.includes("deleteriousness.revel")) {
                dataToTsv["deleteriousness.revel"] = proteinSubstitutionScores.revel || "-";
            }
            if (flatFieldList.includes("deleteriousness.cadd")) {
                dataToTsv["deleteriousness.cadd"] = cadd;
            }
            if (flatFieldList.includes("deleteriousness.spliceai")) {
                dataToTsv["deleteriousness.spliceai"] = this.getSpliceAI(variant);
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

            if (flatFieldList.includes("cohortStats")) {
                // variant?.studies.forEach(study => {
                //     const studyId = study.studyId.split(":")[1];
                //     if (flatFieldList.includes(`cohorts.${studyId}`) || flatFieldList.includes("frequencies.cohort")) {
                //         const ac = [];
                //         const af = [];
                //         study?.stats.map(cohort => {
                //             ac.push(`${cohort.cohortId}:${cohort.alleleCount}`);
                //             af.push(`${cohort.cohortId}:${cohort.altAlleleFreq}`);
                //         });
                //         dataToTsv[`cohorts.${studyId}.alleleCount`] = ac.join(";");
                //         dataToTsv[`cohorts.${studyId}.altAlleleFreq`] = af.join(";");
                //     }
                // });
                const cohortStats = [];
                for (const study of variant.studies) {
                    const studyId = study.studyId.split(":")[1];
                    for (const stats of study.stats) {
                        cohortStats.push(studyId + ":" + stats.cohortId + "=" + stats.altAlleleFreq);
                    }
                }
                dataToTsv["cohortStats"] = cohortStats.join(",");
            }

            if (flatFieldList.includes("populationFrequencies")) {
                // populationFrequenciesStudies.forEach(study => {
                //     study.populations.forEach(pop => {
                //         if (flatFieldList.includes("popfreq." + study.id) || flatFieldList.includes("frequencies.populationFrequencies")) {
                //             const valuePopFreq = populationMap[study.id + "_" + pop.id];
                //             dataToTsv[`popfreq.${study.id}_${pop.id}`] = UtilsNew.isNotEmpty(valuePopFreq) ? valuePopFreq : "-";
                //         }
                //     });
                // });

                const populationFrequencies = [];
                for (const study of populationFrequenciesStudies) {
                    for (const pop of study.populations) {
                        const valuePopFreq = populationMap[study.id + "_" + pop.id];
                        populationFrequencies.push(study.id + ":" + pop.id + "=" + valuePopFreq);
                    }
                }
                dataToTsv["populationFrequencies"] = populationFrequencies.join(",");
            }
            if (flatFieldList.includes("clinicalInfo.clinvar")) {
                dataToTsv["clinicalInfo.clinvar"] = clinvar;
            }
            if (flatFieldList.includes("clinicalInfo.cosmic")) {
                dataToTsv["clinicalInfo.cosmic"] = cosmic;
            }
            if (flatFieldList.includes("interpretation.prediction")) {
                dataToTsv["acmgPrediction"] = acmgPrediction;
            }

            const rowValues = flatFieldList.map(header => dataToTsv[header]);
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

    static gethgvsValues(variant) {
        BioinfoUtils.sort(variant.annotation?.consequenceTypes, v => v.geneName);
        const gridConfig = {
            geneSet: {
                ensembl: true,
                refseq: true,
            },
            consequenceType: {
                // all: false,
                maneTranscript: true,
                gencodeBasicTranscript: false,
                ensemblCanonicalTranscript: true,
                refseqTranscript: true,
                ccdsTranscript: false,
                ensemblTslTranscript: false,
                proteinCodingTranscript: false,
                highImpactConsequenceTypeTranscript: false,
                showNegativeConsequenceTypes: true
            }
        };
        const showArrayIndexes = VariantGridFormatter._consequenceTypeDetailFormatterFilter(variant.annotation?.consequenceTypes, gridConfig).indexes;

        if (showArrayIndexes?.length > 0 && variant.annotation.hgvs?.length > 0) {
            const results = [];
            for (const index of showArrayIndexes) {
                const consequenceType = variant.annotation.consequenceTypes[index];
                const hgvsTranscriptIndex = variant.annotation.hgvs.findIndex(hgvs => hgvs.startsWith(consequenceType.transcriptId));
                const hgvsProteingIndex = variant.annotation.hgvs.findIndex(hgvs => hgvs.startsWith(consequenceType.proteinVariantAnnotation?.proteinId));
                if (hgvsTranscriptIndex > -1 || hgvsProteingIndex > -1) {
                    results.push(`${this.getHgvs(consequenceType.transcriptId, variant.annotation.hgvs) || "-"} ${this.getHgvs(consequenceType.proteinVariantAnnotation?.proteinId, variant.annotation.hgvs) || "-"}`);
                }
            }
            return results.join();
        }
    }

    static getHgvs(id, hgvsArray) {
        if (!id) {
            return;
        }

        let hgvs = hgvsArray?.find(hgvs => hgvs.startsWith(id));
        if (hgvs) {
            if (hgvs.includes("(")) {
                const split = hgvs.split(new RegExp("[()]"));
                hgvs = split[0] + split[2];
            }
            const split = hgvs.split(":");
            return `${split[0]}:${split[1]}`;

        }
        return id;
    }

    static getSpliceAI(variant) {
        if (variant.annotation.consequenceTypes?.length > 0) {
            // We need to find the max Delta Score:
            //      Delta score of a variant, defined as the maximum of (DS_AG, DS_AL, DS_DG, DS_DL),
            //      ranges from 0 to 1 and can be interpreted as the probability of the variant being splice-altering.
            let dscore = 0;
            for (const ct of variant.annotation.consequenceTypes) {
                if (ct.spliceScores?.length > 0) {
                    const spliceAi = ct.spliceScores.find(ss => ss.source.toUpperCase() === "SPLICEAI");
                    if (spliceAi) {
                        const max = Math.max(spliceAi.scores["DS_AG"], spliceAi.scores["DS_AL"], spliceAi.scores["DS_DG"], spliceAi.scores["DS_DL"]);
                        if (max > dscore) {
                            dscore = max;
                        }
                    }
                }
            }
            return dscore;
        }
        return "-";
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
