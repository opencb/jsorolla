/**
 * Created by swaathi on 28/03/17.
 */

class VariantUtils {

    static jsonToTabConvert(json, studiesPopFrequencies, samples, nucleotideGenotype) {
        let dataString = [];
        let variantString = [];
        let populationMap = {};

        for (var key in json[0]) {
            console.log(key);
        }

        variantString.push("Variant");
        variantString.push("SNP ID");
        variantString.push("Genes");
        variantString.push("Type");
        samples.forEach((sample) => {
            variantString.push(sample.name);
        });
        variantString.push("Consequence Type");
        variantString.push("SIFT");
        variantString.push("Polyphen");
        variantString.push("CADD");
        variantString.push("PhyloP");
        variantString.push("PhastCons");
        variantString.push("GERP");
        // variantString.push("Population frequencies");
        studiesPopFrequencies.forEach((study) => {
            study.populations.forEach(pop => variantString.push(study.id + "_" + pop.id));
        });
        variantString.push("Clinvar");
        variantString.push("Cosmic");
        dataString.push(variantString.join('\t'));
        variantString = [];
        for (let i = 0; i < json.length; i++) {
            variantString.push(json[i].chromosome + ':' + json[i].start + " " + json[i].reference + '/' + json[i].alternate);
            if (typeof json[i].id !== "undefined" && json[i].id.startsWith("rs")) {
                variantString.push(json[i].id);
            } else if (typeof json[i].annotation !== "undefined" && typeof json[i].annotation.xrefs !== "undefined" && json[i].annotation.xrefs.length > 0) {
                let annotation = json[i].annotation.xrefs.find(function (element) {
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

            let genes = [];
            let ct = [];
            let pfArray  = [];
            let sift, polyphen, cadd = "-", phylop = "-", phastCons = "-", gerp = "-";
            let clinvar = [];
            let cosmic = [];
            populationMap = {};

            let description = {sift: "-", polyphen:  "-"};
            let min = 10;
            let max = 0;
            if (typeof json[i].annotation !== "undefined") {
                if (typeof json[i].annotation.consequenceTypes !== "undefined" && json[i].annotation.consequenceTypes.length > 0) {
                    let visitedGenes = {};
                    let visitedCT = new Set();
                    for (let j = 0; j < json[i].annotation.consequenceTypes.length; j++) {
                        // gene
                        if (typeof json[i].annotation.consequenceTypes[j].geneName !== "undefined" && json[i].annotation.consequenceTypes[j].geneName != ""
                            && typeof visitedGenes[json[i].annotation.consequenceTypes[j].geneName] === "undefined") {
                            genes.push(json[i].annotation.consequenceTypes[j].geneName);
                            visitedGenes[json[i].annotation.consequenceTypes[j].geneName] = true;
                        }

                        // Consequence Type
                        for (let z = 0; z < json[i].annotation.consequenceTypes[j].sequenceOntologyTerms.length; z++) {
                            let consequenceTypeName = json[i].annotation.consequenceTypes[j].sequenceOntologyTerms[z].name;
                            if (typeof consequenceTypeName !== "undefined" && consequenceTypeName != "" && !visitedCT.has(consequenceTypeName)) {
                                ct.push(consequenceTypeName);
                                visitedCT.add(consequenceTypeName);
                            }
                        }

                        // Sift, Polyphen
                        if (typeof json[i].annotation.consequenceTypes[j].proteinVariantAnnotation !== "undefined"
                            && typeof json[i].annotation.consequenceTypes[j].proteinVariantAnnotation.substitutionScores !== "undefined") {
                            for (let ss = 0; ss < json[i].annotation.consequenceTypes[j].proteinVariantAnnotation.substitutionScores.length; ss++) {
                                let source = json[i].annotation.consequenceTypes[j].proteinVariantAnnotation.substitutionScores[ss].source;
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
                let populations = [];
                let populationStudyBidimensional = [];
                let populationMapExists = [];
                studiesPopFrequencies.forEach((study) => {
                    populations[study.id] = study.populations.map(pop => pop.id);
                    study.populations.forEach((pop) => {
                        populationMapExists[pop.id] = true;
                    });
                    populationStudyBidimensional[study.id] = populationMapExists;
                });
                if (typeof studiesPopFrequencies !== "undefined" && studiesPopFrequencies.length > 0) {
                    for (let j = 0; j < studiesPopFrequencies.length; j++) {
                        let study = studiesPopFrequencies[j];
                        for (let popFreqIdx in json[i].annotation.populationFrequencies) {
                            let popFreq = json[i].annotation.populationFrequencies[popFreqIdx];
                            if (UtilsNew.isNotUndefinedOrNull(popFreq)) {
                                let population = popFreq.population;
                                if (study.id === popFreq.study && populationStudyBidimensional[study.id][population] === true) {
                                    populationMap[study.id + "_" + population] = 'NA';
                                }
                            }
                        }
                    }
                }

                if (typeof json[i].annotation.populationFrequencies !== "undefined") {
                    for (let pf = 0; pf < json[i].annotation.populationFrequencies.length; pf++) {
                        let pop = json[i].annotation.populationFrequencies[pf].study + '_' + json[i].annotation.populationFrequencies[pf].population;
                        if (typeof populationMap[pop] !== "undefined" && populationMap[pop] == "NA") {
                            populationMap[pop] = Number(json[i].annotation.populationFrequencies[pf].altAlleleFreq).toFixed(4);
                        }
                    }
                }
                // pfArray = Object.keys(populationMap).map(key => populationMap[key]);

                // Clinvar, cosmic
                if (typeof json[i].annotation.variantTraitAssociation !== "undefined" && json[i].annotation.variantTraitAssociation != null) {
                    for (let key in json[i].annotation.variantTraitAssociation) {
                        let clinicalData = json[i].annotation.variantTraitAssociation[key];
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
                variantString.push(genes.join(','));
            } else {
                variantString.push("-");
            }
            variantString.push(json[i].type);
            this.getGenotypeSamples(json[i], samples, nucleotideGenotype, variantString);
            if (ct.length > 0) {
                variantString.push(ct.join(','));
            } else {
                variantString.push("-");
            }
            variantString.push(sift);
            variantString.push(polyphen);
            variantString.push(cadd);
            variantString.push(phylop);
            variantString.push(phastCons);
            variantString.push(gerp);
            studiesPopFrequencies.forEach((study) => {
                study.populations.forEach(pop => {
                    let valuePopFreq = populationMap[study.id + "_" + pop.id];
                    variantString.push(UtilsNew.isNotEmpty(valuePopFreq) ? valuePopFreq : "-");
                });
            });
            // variantString.push(pfArray.join(','));
            if (clinvar.length > 0) {
                variantString.push(clinvar.join(','));
            } else {
                variantString.push("-");
            }
            if (cosmic.length > 0) {
                variantString.push(cosmic.join(','));
            } else {
                variantString.push("-");
            }

            dataString.push(variantString.join('\t'));
            variantString = [];
        }
        return dataString;
    }

    static getGenotypeSamples(json,samples, nucleotideGenotype, variantString) {
        // Samples genotypes
        if (nucleotideGenotype) {
            samples.forEach((sample, indexSample) => {
                let alternateSequence = json.alternate;
                let referenceSequence = json.reference;
                let genotypeMatch = new Map();
                let colText = "";
                let referenceValueColText = "-";
                let alternateValueColText = "-";

                genotypeMatch.set(0, referenceSequence === "" ? "-" : referenceSequence);
                genotypeMatch.set(1, alternateSequence === "" ? "-" : alternateSequence);
                json.studies.forEach((study) => {
                    if (UtilsNew.isNotUndefinedOrNull(study.secondaryAlternates) && UtilsNew.isNotEmptyArray(study.secondaryAlternates)) {
                        study.secondaryAlternates.forEach((secondary) => {
                            genotypeMatch.set(genotypeMatch.size, secondary.alternate === "" ? "-" : secondary.alternate);
                        });
                    }
                    if (UtilsNew.isNotUndefinedOrNull(study.samplesData) && UtilsNew.isNotEmptyArray(study.samplesData)) {
                        if (UtilsNew.isNotUndefinedOrNull(study.samplesData[indexSample])) {
                            let currentGenotype = study.samplesData[indexSample][0];
                            let reference = currentGenotype.split("/")[0];
                            let alternate = currentGenotype.split("/")[1];
                            let tooltipText = reference + " / " + alternate;
                            if (UtilsNew.isNotEqual(reference, ".") && UtilsNew.isNotEqual(alternate, ".")) {
                                reference = parseInt(reference);
                                alternate = parseInt(alternate);
                                let referenceValue = genotypeMatch.get(reference);
                                let alternateValue = genotypeMatch.get(alternate);
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
                                    let substringReference = referenceValue.substring(0, 5) + "...";
                                    referenceValueColText = substringReference;
                                    alternateValueColText = "-";
                                    //                                                tooltipText += "<br>" +   referenceValue +" / " + alternateValue;
                                } else if (UtilsNew.isNotEqual(alternateValue, "-") && alternateValue.length > 10) {
                                    // -/X
                                    let substringAlternate = alternateValue.substring(0, 5) + "...";
                                    alternateValueColText = substringAlternate;
                                    referenceValueColText = "-";
                                    //                                                tooltipText += "<br>" +   referenceValue + " / " + alternateValue;
                                }
                                tooltipText += "<br>" + referenceValue + " / " + alternateValue;
                            } else {
                                referenceValueColText = reference;
                                alternateValueColText = alternate;
                                tooltipText += "<br>" + reference + " / " + alternate;
                            }

                            let referenceIndex = parseInt(reference);
                            let alternateIndex = parseInt(alternate);
                            referenceValueColText =  referenceValueColText;
                            alternateValueColText = alternateValueColText;
                            colText = referenceValueColText + " / " + alternateValueColText;
                            variantString.push(colText);

                            // res = "<span class='sampleGenotype' data-text='" + tooltipText + "'> " + colText + " </span>";
                            return;
                        }
                    }
                });
            });
        } else {
            if (UtilsNew.isNotUndefinedOrNull(samples)) {
                samples.forEach((sample, indexSample) => {
                    json.studies.forEach((study) => {
                        if (study.samplesData.length > 0) {
                            let currentGenotype = study.samplesData[indexSample];
                            if (UtilsNew.isNotUndefinedOrNull(currentGenotype)) {
                                variantString.push(currentGenotype[0]);
                                return;
                            }
                        }
                        variantString.push("-");
                    });
                });
            }
        }
    }
}