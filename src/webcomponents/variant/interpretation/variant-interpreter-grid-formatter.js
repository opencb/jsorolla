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

import VariantGridFormatter from "../variant-grid-formatter.js";
import UtilsNew from "../../../core/utils-new.js";
import BioinfoUtils from "../../../core/bioinfo/bioinfo-utils.js";
import GridCommons from "../../commons/grid-commons.js";
import VariantUtils from "../variant-utils.js";

export default class VariantInterpreterGridFormatter {

    static roleInCancerFormatter(evidences) {
        const roles = new Set();
        (evidences || []).forEach(evidence => {
            if (evidence?.rolesInCancer?.length > 0) {
                for (const roleInCancer of evidence.rolesInCancer) {
                    if (roleInCancer && evidence.genomicFeature.geneName) {
                        const roleInCancerText = roleInCancer === "TUMOUR_SUPPRESSOR_GENE" || roleInCancer === "TUMOR_SUPPRESSOR_GENE" ? "TSG" : roleInCancer;
                        roles.add(`${roleInCancerText} (${evidence.genomicFeature.geneName})`);
                    }
                }
            } else {
                // TODO Remove this legacy code
                if (evidence.roleInCancer && evidence.genomicFeature.geneName) {
                    const roleInCancer = evidence.roleInCancer === "TUMOUR_SUPPRESSOR_GENE" || evidence.roleInCancer === "TUMOR_SUPPRESSOR_GENE" ? "TSG" : evidence.roleInCancer;
                    roles.add(`${roleInCancer} (${evidence.genomicFeature.geneName})`);
                }
            }
        });
        const rolesList = Array.from(roles.keys()).map(role => {
            return `<div>${role}</div>`;
        });
        return GridCommons.generateExpandCollapseContent(rolesList, 8);
    }

    static studyCohortsFormatter(value, row) {
        if (row?.studies) {
            const cohorts = [];
            const cohortMap = new Map();
            row.studies.forEach(study => {
                const arr = study.studyId.split(":");
                const s = arr[arr.length - 1] + ":ALL";
                cohorts.push(s);
                cohortMap.set(s, (study.stats || []).find(stats => stats?.cohortId === "ALL"));
            });
            return VariantGridFormatter.renderPopulationFrequencies(
                cohorts,
                cohortMap,
                POPULATION_FREQUENCIES?.style,
                this._config.populationFrequenciesConfig,
            );
        } else {
            return "-";
        }
    }

    static clinicalPopulationFrequenciesFormatter(value, row, config) {
        const popFreqMap = new Map();
        // If variant population freqs exist read values
        if (row?.annotation?.populationFrequencies?.length > 0) {
            row.annotation.populationFrequencies.forEach(popFreq => {
                popFreqMap.set(popFreq.study + ":" + popFreq.population, popFreq);
            });
        }
        return VariantGridFormatter.renderPopulationFrequencies(
            config.populationFrequencies,
            popFreqMap,
            POPULATION_FREQUENCIES.style,
            config.populationFrequenciesConfig,
        );
    }

    static predictionFormatter(value, row) {
        if (!row.evidences) {
            return "-";
        }

        let clinicalSignificanceCode = 0;
        let clinicalSignificanceHtml = "NA";

        for (const re of row.evidences) {
            if (CLINICAL_SIGNIFICANCE_SETTINGS[re.classification.clinicalSignificance]?.code > clinicalSignificanceCode) {
                clinicalSignificanceCode = CLINICAL_SIGNIFICANCE_SETTINGS[re.classification.clinicalSignificance].code;
                const clinicalSignificance = CLINICAL_SIGNIFICANCE_SETTINGS[re.classification.clinicalSignificance].id;
                clinicalSignificanceHtml = `
                    <div style="margin: 5px 0px; color: ${CLINICAL_SIGNIFICANCE_SETTINGS[re.classification.clinicalSignificance].color}">${clinicalSignificance}</div>
                    <div class="text-body-secondary">${re.classification.acmg.map(acmg => acmg.classification).join(", ")}</div>
                `;
            }
        }
        return `
            <a class="text-decoration-none">${clinicalSignificanceHtml}</a>
        `;
    }

    static userClassificationFormatter(value, variant, evidences = null) {
        // note that we only consider the evidences that have been selected for review
        const visibleEvidences = (Array.isArray(evidences) ? evidences : variant?.evidences || []).filter(evidence => {
            return evidence?.review?.select && (evidence?.review?.clinicalSignificance || evidence?.review?.acmg?.length > 0 || evidence?.review?.tier);
        });

        if (visibleEvidences.length > 0) {
            const showTranscript = visibleEvidences.length > 1;
            const content = visibleEvidences.map(evidence => {
                return `
                    <div>
                        ${showTranscript && evidence?.genomicFeature?.transcriptId ? `
                            <div class="">
                                <strong>${evidence.genomicFeature.transcriptId}</strong>
                            </div>    
                        ` : ""}
                        ${evidence?.review?.clinicalSignificance ? `
                            <div class="my-1" style="color: ${CLINICAL_SIGNIFICANCE_SETTINGS[evidence.review.clinicalSignificance].color}">
                                ${CLINICAL_SIGNIFICANCE_SETTINGS[evidence.review.clinicalSignificance].id}
                            </div>
                        ` : ""}
                        ${evidence?.review?.acmg?.length > 0 ? `
                            <div class="text-secondary">
                                ${evidence.review.acmg.map(acmg => acmg.classification || acmg).join(", ")}
                            </div>
                        ` : ""}
                        ${evidence?.review?.tier ? `
                            <div class="">
                                <span style="color:${VariantUtils.getTierColor(evidence.review.tier)}">${evidence.review.tier}</span>
                            </div>
                        ` : ""}
                    </div>
                `;
            });
            return content.join(`<hr class="">`);
        }

        return "-";
    }

    /*
     *  SAMPLE GENOTYPE RENDERER
     */
    static sampleGenotypeFormatter(value, row, index, params) {
        let resultHtml = "";

        if (row && row.studies?.length > 0 && row.studies[0].samples?.length > 0) {
            const sampleId = params?.sampleId;
            let sampleEntries = [row.studies[0].samples.find(s => s.sampleId === sampleId)];

            // If not sampleId is found and there is only one sample we take that one
            if (!sampleEntries && row.studies[0].samples?.length === 1) {
                sampleEntries = [row.studies[0].samples[0]];
            }

            // Check if there are any DISCREPANCY issue for this sample and add it to the calls to be displayed
            if (row.studies[0]?.issues?.length > 0) {
                const sampleIssues = row.studies[0].issues.filter(e => e.sample.sampleId === sampleId && e.type === "DISCREPANCY");
                sampleEntries = sampleEntries.concat(sampleIssues.map(e => e.sample));
            }
            for (const sampleEntry of sampleEntries) {
                // Get the file for this sample
                let file;
                if (row.studies[0].files) {
                    const fileIdx = sampleEntry?.fileIndex ?? 0;
                    if (fileIdx >= 0) {
                        file = row.studies[0].files[fileIdx];
                    }
                }

                // Render genotypes
                let content = "";
                switch (params?.config?.genotype?.type?.toUpperCase() || "VCF_CALL") {
                    case "ALLELES":
                        content = VariantInterpreterGridFormatter.alleleGenotypeRenderer(row, sampleEntry, "alleles");
                        break;
                    case "VCF_CALL":
                        content = VariantInterpreterGridFormatter.alleleGenotypeRenderer(row, sampleEntry, "call");
                        break;
                    case "ZYGOSITY":
                        content = VariantInterpreterGridFormatter.zygosityGenotypeRenderer(row, sampleEntry, params?.clinicalAnalysis);
                        break;
                    case "VAF":
                        const vaf = VariantInterpreterGridFormatter._getVariantAlleleFraction(row, sampleEntry, file);
                        if (vaf && vaf.vaf >= 0 && vaf.depth >= 0) {
                            content = VariantInterpreterGridFormatter.vafGenotypeRenderer(vaf.vaf, vaf.depth, file, {});
                        } else { // Just in case we cannot render freqs, this should never happen.
                            content = VariantInterpreterGridFormatter.alleleGenotypeRenderer(row, sampleEntry);
                        }
                        break;
                    case "ALLELE_FREQUENCY":
                        const alleleFreqs = VariantInterpreterGridFormatter._getAlleleFrequencies(row, sampleEntry, file);
                        content = `<span>${Number.parseFloat(alleleFreqs.alt).toFixed(4)} / ${alleleFreqs.depth}</span>`;
                        break;
                    case "ALLELE_FREQUENCY_BAR":
                        const alleleFreqsBar = VariantInterpreterGridFormatter._getAlleleFrequencies(row, sampleEntry, file);
                        if (alleleFreqsBar && alleleFreqsBar.ref >= 0 && alleleFreqsBar.alt >= 0) {
                            content = VariantInterpreterGridFormatter.alleleFrequencyGenotypeRenderer(alleleFreqsBar.ref, alleleFreqsBar.alt, file, {width: 80});
                        } else { // Just in case we cannot render freqs, this should never happen.
                            content = VariantInterpreterGridFormatter.alleleGenotypeRenderer(row, sampleEntry);
                        }
                        break;
                    case "CIRCLE":
                        content = VariantInterpreterGridFormatter.circleGenotypeRenderer(sampleEntry, file, 10);
                        break;
                    default:
                        console.error("No valid genotype render option:", params?.config?.genotype?.type?.toUpperCase());
                        break;
                }

                // Get tooltip text
                const tooltipText = VariantInterpreterGridFormatter._getSampleGenotypeTooltipText(row, sampleEntry, file);
                resultHtml += `
                    <a class="zygositySampleTooltip text-decoration-none" tooltip-title="Variant Call Information" tooltip-text='${tooltipText}'>
                        ${content}
                    </a>
                    <br>
                `;
            }
        }

        return resultHtml;
    }

    static vafGenotypeRenderer(vaf, depth, file, config) {
        return `<span>${vaf.toFixed(4)} / ${depth}</span>`;
    }

    static alleleFrequencyGenotypeRenderer(refFreq, altFreq, file, config) {
        const widthPx = config?.width ? config.width : 80;
        const refWidth = widthPx * refFreq;
        const refColor = refFreq !== 0 ? "blue" : "black";
        const altWidth = widthPx - refWidth;
        const altColor = altFreq !== 0 ? "red" : "black";
        const opacity = file?.data.FILTER === "PASS" ? 100 : 60;
        return `
            <table style="width: ${widthPx}px">
                <tr>
                    <td style="width: ${refWidth}px; background-color: ${refColor}; border-right: 1px solid white; opacity: ${opacity}%; ${refWidth === 0 ? "display: none" : ""}">&nbsp;</td>
                    <td style="width: ${altWidth}px; background-color: ${altColor}; border-right: 1px solid white; opacity: ${opacity}%; ${altWidth === 0 ? "display: none" : ""}">&nbsp;</td>
                </tr>
            </table>
        `;
    }

    static alleleGenotypeRenderer(variant, sampleEntry, mode) {
        let res = "-";
        if (variant?.studies?.length > 0 && sampleEntry?.data?.length > 0) {
            const genotype = sampleEntry.data[0];

            // Check special cases
            if (genotype === "NA") {
                return `<span style='color: darkorange'>${genotype}</span>`;
            }
            if (genotype === "./." || genotype === ".|.") {
                return `<span style='color: darkorange'>${genotype}</span>`;
            }

            const alleles = [];
            const allelesArray = genotype.split(new RegExp("[/|]"));
            const isNumberRegex = /^\d+$/;
            for (const allele of allelesArray) {
                switch (allele) {
                    case "0":
                        if (mode === "alleles") {
                            alleles.push(variant.reference ? variant.reference : "-");
                        } else {
                            alleles.push(allele);
                        }
                        break;
                    case "1":
                        if (mode === "alleles") {
                            alleles.push(variant.alternate ? variant.alternate : "-");
                        } else {
                            alleles.push(allele);
                        }
                        break;
                    case ".":
                        alleles.push(".");
                        break;
                    case "?":
                        if (mode === "alleles") {
                            alleles.push(variant.reference ? variant.reference : "-");
                        } else {
                            alleles.push("0");
                        }
                        break;
                    default:
                        // Check allele is a number
                        if (isNumberRegex.test(allele)) {
                            if (mode === "alleles") {
                                // TASK-5635: check if the secondary alternate has the same coordinates.
                                const secondaryAlternate = variant.studies[0].secondaryAlternates[allele - 2];
                                if (secondaryAlternate.start === variant.start && secondaryAlternate.end === variant.end) {
                                    alleles.push(secondaryAlternate.alternate);
                                } else {
                                    alleles.push("<*>");
                                }
                            } else {
                                alleles.push(allele);
                            }
                        } else {
                            console.error("Allele not recognized: " + allele);
                        }
                        break;

                }
            }

            const allelesSeq = [];
            for (const allele of alleles) {
                let alleleSeq = allele;
                if (mode === "alleles") {
                    // Check size
                    if (allele.length > 10) {
                        alleleSeq = allele.substring(0, 4) + "...";
                    }
                    // Escape < and > symbols for <INS>, <DEL>, ...
                    alleleSeq = alleleSeq.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
                }
                allelesSeq.push(alleleSeq);
            }

            const allelesHtml = [];
            for (let i = 0; i < allelesSeq.length; i++) {
                const color = (allelesArray[i] === "0" || allelesArray[i] === "?") ? "black" : "darkorange";
                allelesHtml.push(`<span style="color: ${color}">${allelesSeq[i]}</span>`);
            }

            if (allelesHtml.length === 1) {
                res = `<span>${allelesHtml[0]}</span>`;
            } else {
                const bar = genotype.includes("/") ? "/" : "|";
                res = `<span>${allelesHtml[0]} ${bar} ${allelesHtml[1]}</span>`;
            }
        }
        return res;
    }

    static zygosityGenotypeRenderer(variant, sampleEntry, ca) {
        let res = "-";
        if (variant?.studies?.length > 0 && sampleEntry?.data.length > 0) {
            let sex;
            if (ca?.type === "FAMILY") {
                // we need to find the sex of each member of the family
                const individual = ca.family.members.find(m => m.samples[0].id === sampleEntry.sampleId);
                sex = UtilsNew.isEmpty(individual?.sex) ? "Not specified" : individual.sex?.id || individual.sex;
            } else {
                sex = (!!ca?.proband?.sex && ca?.proband?.sex !== "UNKNOWN") ? ca.proband.sex : "";
            }

            const genotype = sampleEntry.data[0];
            switch (genotype) {
                case "NA":
                    res = "<span style='color: darkorange'>NA</span>";
                    break;
                case "./.":
                case ".|.":
                    res = "<span style='color: darkorange'>MISSING</span>";
                    break;
                case "0/0":
                case "0|0":
                    res = "<span style='color: black'>HOM_REF</span>";
                    break;
                case "0/1":
                case "0|1":
                case "1|0":
                    if (variant.chromosome === "MT" || variant.chromosome === "Mt") {
                        res = "<span style='color: red'>HEMI</span>";
                    } else {
                        if (sex === "MALE" && (variant.chromosome === "X" || variant.chromosome === "Y")) {
                            res = "<span style='color: red'>HEMI</span>";
                        } else {
                            res = "<span style='color: darkorange'>HET</span>";
                        }
                    }
                    break;
                case "1/2":
                case "1|2":
                    res = "<span style='color: red'>BIALLELIC_HET</span>";
                    break;
                case "1/1":
                case "1|1":
                    if (variant.chromosome === "MT" || variant.chromosome === "Mt") {
                        res = "<span style='color: red'>HEMI</span>";
                    } else {
                        if (sex === "MALE" && (variant.chromosome === "X" || variant.chromosome === "Y")) {
                            res = "<span style='color: red'>HEMI</span>";
                        } else {
                            res = "<span style='color: red'>HOM_ALT</span>";
                        }
                    }
                    break;
                case "1":
                    res = "<span style='color: red'>HEMI</span>";
                    break;
            }
        }
        return res;
    }

    static circleGenotypeRenderer(sampleEntry, file, radius = 10) {
        const {left, right} = VariantInterpreterGridFormatter._getLeftRightColors(sampleEntry.data[0], file.data.FILTER);
        return `
            <div class="circle-genotype-render">
                <div class="circle" style="width: ${radius *2}px;height: ${radius *2}px;background: ${left}"></div>
                <div class="circle" style="width: ${radius *2}px;height: ${radius *2}px;background: ${right}"></div>
            </div>`;
    }

    static _getLeftRightColors(gt, filter) {
        let leftColor,
            rightColor;

        const noCallColor = "rgba(255, 0, 0, 0.5)";
        const mutationColor = filter && filter === "PASS" ? "black" : "silver";

        const genotypeSplitRegExp = new RegExp("[/|]");
        switch (gt) {
            case "./.":
            case "?/?":
            case "NA":
                leftColor = noCallColor;
                rightColor = noCallColor;
                break;
            case "0|1":
            case "1|0":
                leftColor = "white";
                rightColor = mutationColor;
                break;
            default:
                const alleles = gt.split(genotypeSplitRegExp);
                switch (alleles[0]) {
                    case "0":
                        leftColor = "white";
                        break;
                    case ".":
                        leftColor = noCallColor;
                        break;
                    default:
                        leftColor = mutationColor;
                        break;
                }
                switch (alleles[1]) {
                    case "0":
                        rightColor = "white";
                        break;
                    case ".":
                        rightColor = noCallColor;
                        break;
                    default:
                        rightColor = mutationColor;
                        break;
                }
                break;
        }
        return {left: leftColor, right: rightColor};
    }

    static _getVariantAlleleFraction(variant, sampleEntry, file) {
        let vaf, depth;

        const extVafIndex = variant.studies[0].sampleDataKeys.findIndex(key => key === "EXT_VAF");
        if (extVafIndex !== -1) {
            const dpIndex = variant.studies[0].sampleDataKeys.findIndex(key => key === "DP");
            return {vaf: Number.parseFloat(sampleEntry?.data[extVafIndex]), depth: Number.parseInt(sampleEntry?.data[dpIndex])};
        }

        // Try to guess the variant caller used.
        // Check if is Caveman by looking to specific sample FORMAT fields
        if (file.data.ASMD && file.data.CLPM) {
            const set = new Set(["FAZ", "FCZ", "FGZ", "FTZ", "RAZ", "RCZ", "RGZ", "RTZ"]);
            depth = 0;
            for (const i in variant.studies[0].sampleDataKeys) {
                if (set.has(variant.studies[0].sampleDataKeys[i])) {
                    depth += Number.parseInt(sampleEntry.data[i]);
                } else {
                    if (variant.studies[0].sampleDataKeys[i] === "PM") {
                        vaf = Number.parseFloat(sampleEntry.data[i]);
                    }
                }
            }
            return {vaf: vaf, depth: depth};
        }

        // Check if is Pindel by looking to specific sample FORMAT fields
        if (file.data.PC && file.data.S1 && file.data.S2) {
            const values = {};
            const fields = ["PU", "NU", "PR", "NR"];
            for (const field of fields) {
                const index = variant.studies[0].sampleDataKeys.findIndex(elem => elem === field);
                values[field] = Number.parseInt(sampleEntry.data[index]);
            }
            vaf = (values.PU + values.NU) / (values.PR + values.NR);
            depth = values.PR + values.NR;
            return {vaf: vaf, depth: depth};
        }

        if (variant?.studies[0].sampleDataKeys.includes("AD")) {
            const index = variant.studies[0].sampleDataKeys.findIndex(key => key === "AD");
            if (index >= 0) {
                const AD = sampleEntry.data[index];
                const ads = AD.split(",");
                const alt = ads.length === 2 ? ads[1] : "0";
                depth = 0;
                for (const ad of ads) {
                    depth += Number.parseInt(ad);
                }
                vaf = Number.parseInt(alt) / depth;
            }
            return {vaf: vaf, depth: depth};
        }
    }

    static _getAlleleFrequencies(variant, sampleEntry, file) {
        let af, ad, dp, adIndex, refFreq, altFreq;

        // Find and get the DP
        const dpIndex = variant.studies[0].sampleDataKeys.findIndex(e => e === "DP");
        if (dpIndex === -1) {
            dp = file ? file.DP : null;
        } else {
            dp = Number.parseInt(sampleEntry.data[dpIndex]);
        }

        const afIndex = variant.studies[0].sampleDataKeys.findIndex(e => e === "AF");
        if (afIndex !== -1) {
            af = Number.parseFloat(sampleEntry.data[afIndex]);
            refFreq = 1 - af;
            altFreq = af;
        } else {
            adIndex = variant.studies[0].sampleDataKeys.findIndex(e => e === "AD");
            if (adIndex !== -1) {
                ad = sampleEntry.data[adIndex];
                const adCounts = ad.split(",");
                if (!dp && adCounts.length > 1) {
                    dp = Number.parseInt(adCounts[0]) + Number.parseInt(adCounts[1]);
                }
                if (dp > 0) {
                    refFreq = Number.parseInt(adCounts[0]) / dp;
                    altFreq = Number.parseInt(adCounts[1]) / dp;
                }
            }
        }
        return {ref: refFreq, alt: altFreq, depth: dp};
    }

    static _getSampleGenotypeTooltipText(variant, sampleEntry, file) {
        if (!sampleEntry) {
            return "NA";
        }
        // Fetch sampleFormat and file to simplify code
        const sampleFormat = sampleEntry.data;

        // 1. Get INFO fields
        const infoFields = Object.keys(file?.data || {})
            .filter(key => key !== "FILTER" && key !== "QUAL")
            .map(key => {
                return `
                    <div class="row mb-1">
                        <div class="col-4 fw-bold">${key}</div>
                        <div class="col-8">${UtilsNew.escapeHtml(file.data[key])}</div>
                    </div>
                `;
            });

        // 2. Get FORMAT fields
        const formatFields = (variant?.studies?.[0]?.sampleDataKeys || [])
            .map((fieldKey, fieldIndex) => {
                // GT field is treated separately
                const key = fieldKey !== "GT" ? fieldKey : `${fieldKey} (${variant.reference || "-"}/${variant.alternate || "-"})`;
                const value = sampleFormat[fieldIndex] ? sampleFormat[fieldIndex] : "-";
                return `
                    <div class="row mb-1">
                        <div class="col-4 fw-bold">${key}</div>
                        <div class="col-8">${UtilsNew.escapeHtml(value)}</div>
                    </div>
                `;
            });

        // 3. Get SECONDARY ALTERNATES fields
        const secondaryAlternates = [];
        for (const v of variant.studies[0].secondaryAlternates) {
            const html = `
                <div class="row mb-1">
                    <div class="col-4 fw-bold">${v.chromosome}:${v.start}-${v.end}</div>
                    <div class="col-8">${v.reference}/${v.alternate} ${v.type}</div>
                </div>
            `;
            secondaryAlternates.push(html);
        }

        // 4. Build the Tooltip text
        const tooltipText = `
            <div class="zygosity-formatter">
                <div class="fw-bold text-secondary mb-2">SUMMARY</div>
                <div class="ms-2 mb-3">
                    <div class="row mb-1">
                        <div class="col-4 fw-bold">Sample ID</div>
                        <div class="col-8">${sampleEntry?.sampleId ? sampleEntry.sampleId : "-"}</div>
                    </div>
                    <div class="row mb-1">
                        <div class="col-4 fw-bold">File Name</div>
                        <div class="col-8">${file?.fileId ? file.fileId : "-"}</div>
                    </div>
                    <div class="row mb-1">
                        <div class="col-4 fw-bold">File FILTER</div>
                        <div class="col-8">${file?.data.FILTER}</div>
                    </div>
                    <div class="row mb-1">
                        <div class="col-4 fw-bold">File QUAL</div>
                        <div class="col-8">${Number(file?.data.QUAL).toFixed(2)}</div>
                    </div>
                    <div class="row">
                        <div class="col-4 fw-bold">File VCF call</div>
                        <div class="col-8">
                            ${file?.call?.variantId ? file.call.variantId : `${variant.chromosome}:${variant.start}:${variant.reference}:${variant.alternate}`}
                        </div>
                    </div>
                </div>
                <div class="fw-bold text-secondary mb-2">SAMPLE DATA</div>
                <div class="ms-2 mb-3">
                    ${formatFields?.length > 0 ? formatFields.join("") : "-"}
                </div>
                <div class="fw-bold text-secondary mb-2">FILE INFO</div>
                <div class="ms-2 mb-3">
                    ${infoFields.length > 0 ? infoFields.join("") : "-"}
                </div>
                <div class="fw-bold text-secondary mb-2">SECONDARY ALTERNATES</div>
                <div class="ms-2">
                    ${secondaryAlternates?.length > 0 ? secondaryAlternates.join("") : "-"}
                </div>
            </div>
        `;
        return tooltipText;
    }

    static exomiserScoresFormatter(value, row) {
        const evidence = (row?.evidences || []).find(evidence => {
            return !!evidence?.attributes?.exomiser;
        });

        if (evidence?.attributes?.exomiser) {
            const scoreFields = [
                {field: "EXOMISER_GENE_COMBINED_SCORE", title: "Gene Combined Score"},
                {field: "EXOMISER_GENE_PHENO_SCORE", title: "Gene Phenotype Score"},
                {field: "EXOMISER_GENE_VARIANT_SCORE", title: "Gene Variant Score"},
                {field: "EXOMISER_VARIANT_SCORE", title: "Variant Score"},
            ];
            const tooltipText = `
                <table style='width:160px;'>
                    ${scoreFields.map(value => `
                        <tr>
                            <td><strong>${value.title}:</strong></td>
                            <td>${evidence.attributes?.exomiser[value.field] || "-"}</td>
                        </tr>
                    `).join("")}
                </table>
            `;

            return `
                <div class="text-nowrap">
                    <a tooltip-title="Exomiser Scores" tooltip-text="${tooltipText}">
                        <div><b>Rank</b>: ${evidence.attributes.exomiser["RANK"] || "-"}</div>
                        <div><b>P-Value</b>: ${evidence.attributes.exomiser["P-VALUE"] || "-"}</div>
                    </a>
                </div>
            `;
        }

        // No exomiser scores to display
        return "-";
    }

    static reviewFormatter(variant, clinicalAnalysis, checked = false, config = {}) {
        const disabled = clinicalAnalysis?.locked || clinicalAnalysis?.interpretation?.locked;

        let discussionTooltipText = "";
        if (variant.discussion?.text) {
            discussionTooltipText = `
                <div style="min-width:200px;">
                    <div>${UtilsNew.escapeHtml(variant.discussion?.text || "-")}</div>
                    <div style="margin-top:6px;">
                        Added by <b>${UtilsNew.escapeHtml(variant.discussion?.author || "-")}</b> on <b>${UtilsNew.dateFormatter(variant.discussion?.date)}</b>
                    </div>
                </div>
            `;
        }
        // Prepare comments
        const commentsTooltipText = `
            <div style="min-width:200px;">
                ${(variant.comments || []).map(comment => `
                    <div style="padding:4px;">
                        <label>${UtilsNew.escapeHtml(comment.author)} - ${UtilsNew.dateFormatter(comment.date)}</label>
                        <div>${UtilsNew.escapeHtml(comment.message || "-")}</div>
                    </div>
                `).join("")}
            </div>
        `;

        return `
            <div>
                ${config?.showEditReview ? `
                    <div class="d-flex justify-content-center">
                        <button class="d-flex align-items-center btn btn-sm ${checked ? "btn-primary" : "btn-light"} ${disabled ? "disabled" : ""}" data-variant="${variant.id}">
                            <i class="fa fa-edit pe-2"></i>
                            <span class="fw-bold" style="white-space:nowrap;">${checked ? "Update" : "Select"}</span>
                        </button>
                    </div>
                `: ""}
                ${checked && variant?.status ? `
                    <div class="badge ${VariantUtils.getStatusColor(variant.status || "")} user-select-none my-2">
                        <b>${variant.status}</b>
                    </div>
                ` : ""}
                ${checked && (variant.comments?.length > 0 || variant.discussion?.text) ? `
                    <div class="d-flex justify-content-center gap-2">
                        ${variant.discussion?.text ? `
                            <a class='text-decoration-none text-secondary' tooltip-title='Discussion' tooltip-text='${discussionTooltipText}' tooltip-position-at='left bottom' tooltip-position-my='right top'>
                                <i class="fas fa-comment-alt"></i>
                            </a>
                        ` : ""}
                        ${variant.comments?.length > 0 ? `
                            <a class='d-flex align-items-center text-decoration-none text-secondary' tooltip-title='Comments' tooltip-text='${commentsTooltipText}' tooltip-position-at='left bottom' tooltip-position-my='right top'>
                                <i class="fas fa-comments pe-1"></i>
                                <span class="d-none">${variant.comments.length}</span>
                            </a>
                        ` : ""}
                    </div>
                ` : ""}
            </div>
        `;
    }

    static rearrangementFeatureOverlapFormatter(variant, genes, opencgaSession) {
        const overlaps = [];
        (variant?.annotation?.consequenceTypes || [])
            .filter(ct => genes.has(ct.geneName || ct.geneId || ""))
            .forEach(ct => {
                if (Array.isArray(ct.exonOverlap) && ct.exonOverlap?.length > 0) {
                    ct.exonOverlap.map(exon => {
                        overlaps.push({
                            geneName: ct.geneName || ct.geneId || "",
                            transcript: ct.transcript || ct.ensemblTranscriptId || "",
                            feature: `exon (${exon.number || "-"})`,
                        });
                    });
                } else if (Array.isArray(ct.sequenceOntologyTerms) && ct.sequenceOntologyTerms?.length > 0) {
                    ct.sequenceOntologyTerms.forEach(term => {
                        if (term.name === "intron_variant") {
                            overlaps.push({
                                geneName: ct.geneName || ct.geneId || "",
                                transcript: ct.transcript || ct.ensemblTranscriptId || "",
                                feature: "intron",
                            });
                        } else if (term.name === "5_prime_UTR_variant" || term.name === "3_prime_UTR_variant") {
                            overlaps.push({
                                geneName: ct.geneName || ct.geneId || "",
                                transcript: ct.transcript || ct.ensemblTranscriptId || "",
                                feature: `${term.name.charAt(0)}'-UTR`,
                            });
                        }
                    });
                }
            });
        const maxDisplayedOverlaps = 3;
        const displayedOverlaps = overlaps.map(overlap => {
            let geneHtml = "-";
            if (overlap.geneName) {
                const tooltip = VariantGridFormatter.getGeneTooltip(overlap.geneName, opencgaSession?.project?.organism?.scientificName, opencgaSession?.project?.organism?.assembly);
                geneHtml = `
                    <a class="gene-tooltip" tooltip-title="Links" tooltip-text="${tooltip}" style="margin-left: 2px">
                        ${overlap.geneName}
                    </a>
                `;
            }
            return `
                <div>
                    <div><b>Gene</b>: ${geneHtml}</div>
                    <div><b>Transcript</b>: ${overlap.transcript || "-"}</div>
                    <div><b>Feature</b>: ${overlap.feature || "-"}</div>
                </div>
            `;
        });
        // generate the list of overlap features using gridCommons
        return GridCommons.generateExpandCollapseContent(displayedOverlaps, maxDisplayedOverlaps);
    }

    static rearrangementGeneFormatter(variants, genesByVariant, opencgaSession) {
        const separator = `<div style="background-color:currentColor;height:1px;margin-top:4px;margin-bottom:4px;opacity:0.2"></div>`;
        return variants
            .map((variant, index) => {
                let resultHtml = "-";
                const genes = Array.from(genesByVariant[variant.id] || []);

                if (genes.length > 0) {
                    const genesLinks = genes.map(gene => {
                        const tooltip = VariantGridFormatter.getGeneTooltip(gene, opencgaSession?.project?.organism?.scientificName, opencgaSession?.project?.organism?.assembly);
                        return `
                            <a class="gene-tooltip" tooltip-title="Links" tooltip-text="${tooltip}">${gene}</a>
                        `;
                    });
                    resultHtml = genesLinks.join(" ");
                }

                return `<div><b>Variant ${index + 1}</b>: ${resultHtml}</div>`;
            })
            .join(separator);
    }

    static statusFormatter(variant, clinicalAnalysis, primaryFindings, secondaryFindings) {
        const disabled = clinicalAnalysis?.locked || clinicalAnalysis?.interpretation?.locked;
        // if (primaryFindings.has(variant.id) || secondaryFindings.has(variant.id)) {
        //     const status = primaryFindings.get(variant.id)?.status || secondaryFindings.get(variant.id)?.status || variant.status;
        //     if (status) {
        //         const color = VariantUtils.getStatusColor(status);
        //         const isPrimaryFinding = primaryFindings.has(variant.id);
        //         const tooltipText = `
        //             <div><b>Status</b>: ${status}</div>
        //             <div><b>Finding</b>: ${isPrimaryFinding ? "Primary" : "Secondary"}</div>
        //         `;
        //         return `
        //             <a class="d-block ${color} rounded-circle" tooltip-title="Status" tooltip-text="${tooltipText}" style="width:1.25rem;height:1.25rem;"></a>
        //         `;
        //     }
        // }
        // return "";
        let variantColor = "";
        let variantStatus = "";
        if (primaryFindings.has(variant.id) || secondaryFindings.has(variant.id)) {
            variantStatus = primaryFindings.get(variant.id)?.status || secondaryFindings.get(variant.id)?.status || variant.status;
            if (variantStatus) {
                variantColor = VariantUtils.getStatusColor(variantStatus);
            }
        }
        return `
            <div class="dropdown">
                <div class="d-flex ${disabled ? "disabled" : ""}" data-bs-toggle="dropdown">
                    <a class="d-block ${variantColor} rounded-circle" style="width:1.25rem;height:1.25rem;"></a>
                </div>
                <div class="dropdown-menu dropdown-menu-end">
                    <div class="d-flex flex-column gap-1">
                        ${VariantUtils.VARIANT_STATUS_VALUES.map(status => `
                            <div class="dropdown-item d-flex align-items-center gap-2 ${variantStatus === status ? "active" : "cursor-pointer"}">
                                <div class="d-block ${VariantUtils.getStatusColor(status)} rounded-circle border border-white" style="width:1rem;height:1rem;"></div>
                                <div class="lh-1 py-1">${status}</div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
        `;
    }

}
