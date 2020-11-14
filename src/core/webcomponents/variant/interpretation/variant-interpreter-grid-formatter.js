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

import {html} from "/web_modules/lit-element.js";
import VariantGridFormatter from "../variant-grid-formatter.js";
import UtilsNew from "../../../utilsNew.js";
import BioinfoUtils from "../../../bioinfo-utils.js";


export default class VariantInterpreterGridFormatter {

    static roleInCancerFormatter(value, row, index) {
        if (value) {
            let roles = new Set();
            for (let evidenceIndex in value) {
                let evidence = value[evidenceIndex];
                if (evidence.roleInCancer && evidence.genomicFeature.geneName) {
                    let roleInCancer = evidence.roleInCancer === "TUMOUR_SUPPRESSOR_GENE" || evidence.roleInCancer === "TUMOR_SUPPRESSOR_GENE" ? "TSG" : evidence.roleInCancer;
                    roles.add(`${roleInCancer} (${evidence.genomicFeature.geneName})`);
                }
            }
            if (roles.size > 0) {
                return Array.from(roles.keys()).join("<br>");
            }
        }
        return "-";
    }

    static studyCohortsFormatter(value, row) {
        if (row?.studies) {
            const cohorts = [];
            const cohortMap = new Map();
            for (const study of row.studies) {
                const arr = study.studyId.split(":");
                const s = arr[arr.length - 1] + ":ALL";
                cohorts.push(s);
                cohortMap.set(s, study.stats.length ? Number(study.stats[0].altAlleleFreq).toFixed(4) : "-");
            }
            return VariantGridFormatter.createPopulationFrequenciesTable(cohorts, cohortMap, populationFrequencies?.style);
        } else {
            return "-";
        }
    }

    static clinicalPopulationFrequenciesFormatter(value, row) {
        if (row?.annotation) {
            const popFreqMap = new Map();
            if (row.annotation.populationFrequencies?.length > 0) {
                for (const popFreq of row.annotation.populationFrequencies) {
                    popFreqMap.set(popFreq.study + ":" + popFreq.population, Number(popFreq.altAlleleFreq).toFixed(4));
                }
            }
            return VariantGridFormatter.createPopulationFrequenciesTable(this._config.populationFrequencies, popFreqMap, populationFrequencies.style);
        } else {
            return "-";
        }
    }

    static predictionFormatter(value, row, index) {
        if (!row.evidences) {
            return "-";
        }

        const clinicalSignificanceCodes = {
            BENIGN: {code: 5, color: "blue"},
            LIKELY_BENIGN: {code: 5, color: "blue"},
            UNCERTAIN_SIGNIFICANCE: {code: 5, color: "darkorange"},
            LIKELY_PATHOGENIC: {code: 5, color: "red"},
            PATHOGENIC: {code: 5, color: "red"},
            NOT_ASSESSED: {code: 5, color: "black"},
        };

        let clinicalSignificanceCode = 0;
        let clinicalSignificanceHtml = "NA";
        let clinicalSignificanceTooltipText = "";
        const modeOfInheritances = [];

        for (const re of row.evidences) {
            if (re.modeOfInheritance && !modeOfInheritances.includes(re.modeOfInheritance)) {
                modeOfInheritances.push(re.modeOfInheritance);
            }

            if (clinicalSignificanceCodes[re.classification.clinicalSignificance] && clinicalSignificanceCodes[re.classification.clinicalSignificance].code > clinicalSignificanceCode) {
                clinicalSignificanceCode = clinicalSignificanceCodes[re.classification.clinicalSignificance].code;
                let clinicalSignificance = re.classification.clinicalSignificance.replace("_", " ");
                clinicalSignificanceHtml = `<span style="color: ${clinicalSignificanceCodes[re.classification.clinicalSignificance].color}">${clinicalSignificance}</span>`;
                clinicalSignificanceTooltipText = `<div class='col-md-12 predictionTooltip-inner' style='padding: 0px'>
                                                        <form class='form-horizontal'>
                                                            <div class='form-group' style='margin: 0px 2px'>
                                                                <label class='col-md-5'>ACMG</label>
                                                                <div class='col-md-7'>${re.classification.acmg.join(', ')}</div>
                                                            </div>
                                                            <div class='form-group' style='margin: 0px 2px'>
                                                                <label class='col-md-5'>ACMG Tier</label>
                                                                <div class='col-md-7'>${re.classification.tier}</div>
                                                            </div>
                                                        </form>
                                                   </div>`;
            }
        }
        return `<a class='predictionTooltip' tooltip-title="Classification" tooltip-text='${clinicalSignificanceTooltipText}'>
                    ${clinicalSignificanceHtml}
                </a>`;
    }

    static zygosityFormatter(value, row, index) {
        let resultHtml = "";

        if (row.studies?.length > 0 && row.studies[0].samples?.length > 0) {
            const sampleId = this.field.sampleId;
            const sampleIndex = row.studies[0].samples.findIndex(s => s.sampleId === sampleId);

            let sampleEntries = [row.studies[0].samples[sampleIndex]];

            // Check if there are any DISCREPANCY issue for this sample and add it to the calls to be displayed
            if (row.studies[0]?.issues?.length > 0) {
                const sampleIssues = row.studies[0].issues.filter(e => e.sample.sampleId === sampleId && e.type === "DISCREPANCY");
                sampleEntries = sampleEntries.concat(sampleIssues.map(e => e.sample));
            }

            for (let sampleEntry of sampleEntries) {
                // FIRST, get and check info fields QUAL, FILTER; and format fields DP, AD and GQ
                let filter = "-";
                let qual = "-";
                let originalCall = "";
                let mutationColor = "black";
                let noCallColor = "rgba(255, 0, 0, 0.5)";
                const sampleFormat = sampleEntry.data;

                let file;
                if (row.studies[0].files) {
                    let fileIdx = sampleEntry?.fileIndex ?? 0;
                    if (fileIdx >= 0) {
                        file = row.studies[0].files[fileIdx];
                    }
                }

                // INFO fields
                const infoFields = [];
                if (file && file.data) {
                    filter = file.data.FILTER;
                    qual = Number(file.data.QUAL).toFixed(2);
                    originalCall = file.call?.variantId ? file.call.variantId : `${row.chromosome}:${row.position}:${row.reference}:${row.alternate}`;

                    if (filter !== "PASS" || qual < this.field.quality.qual) {
                        mutationColor = "silver";
                    }

                    for (let key of Object.keys(file.data)) {
                        if (key !== "FILTER" && key !== "QUAL") {
                            const html = `<div class="form-group" style="margin: 2px 2px">
                                            <label class="col-md-5">${key}</label>
                                            <div class="col-md-7">${file.data[key]}</div>
                                          </div>`;
                            infoFields.push(html);
                        }
                    }
                } else {
                    // This can happen when no ref/ref calls are loaded
                    console.warn("file is undefined");
                }

                // FORMAT fields
                const formatFields = [];
                for (const formatField in row.studies[0].sampleDataKeys) {
                    // GT fields is treated separately
                    let key = row.studies[0].sampleDataKeys[formatField];
                    key = key !== "GT" ? key : `${key} (${row.reference || "-"}/${row.alternate || "-"})`;
                    let value = sampleFormat[formatField] ? sampleFormat[formatField] : "-";
                    const html = `<div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-5">${key}</label>
                                                <div class="col-md-7">${value}</div>
                                            </div>`;
                    formatFields.push(html);
                }

                // SECONDARY ALTERNATES fields
                const secondaryAlternates = [];
                for (const v of row.studies[0].secondaryAlternates) {
                    const html = `<div class="form-group" style="margin: 2px 2px">
                                    <label class="col-md-5">${v.chromosome}:${v.start}-${v.end}</label>
                                    <div class="col-md-7">${v.reference}/${v.alternate} ${v.type}</div>
                                  </div>`;
                    secondaryAlternates.push(html);
                }

                const tooltipText = `<div class="zygosity-formatter">
                                        <form class="form-horizontal">
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-12" style="color: darkgray;padding: 10px 0px 5px 0px">SUMMARY</label>
                                            </div>
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-4">Sample ID</label>
                                                <div class="col-md-8">${sampleId ? sampleId : "-"}</div>
                                            </div>
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-4">File Name</label>
                                                <div class="col-md-8">${file && file.fileId ? file.fileId : "-"}</div>
                                            </div>
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-4">File FILTER</label>
                                                <div class="col-md-8">${filter}</div>
                                            </div>
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-4">File QUAL</label>
                                                <div class="col-md-8">${qual}</div>
                                            </div>
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-4">File VCF call</label>
                                                <div class="col-md-8">${originalCall}</div>
                                            </div>
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-12" style="color: darkgray;padding: 10px 0px 5px 0px">SAMPLE DATA</label>
                                            </div>
                                            ${formatFields.join("")}
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-12" style="color: darkgray;padding: 10px 0px 5px 0px">FILE INFO</label>
                                            </div>
                                            ${infoFields.join("")}
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-12" style="color: darkgray;padding: 10px 0px 5px 0px">SECONDARY ALTERNATES</label>
                                            </div>
                                            ${secondaryAlternates && secondaryAlternates.length > 0
                    ? secondaryAlternates.join("")
                    : `<div class="form-group" style="margin: 2px 2px">
                                                        <label class="col-md-12">-</label>
                                                   </div>`
                }
                                        </form>
                                     </div>`;

                // SECOND, prepare the visual representation of genotypes
                let left;
                let right;
                let leftRadio = 6;
                let rightRadio = 6;
                const genotypeSplitRegExp = new RegExp("[/|]");
                let sampleGT;
                // Make sure we always render somatic sample first

                if (this.field.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.field.clinicalAnalysis.type.toUpperCase() === "FAMILY") {
                    sampleGT = sampleEntry.data[0];
                } else {
                    // FIXME check GT exists in sampleDataKeys to avoid issues with somatic VAF
                    if (row.studies[0].samples.length === 2) {
                        sampleGT = sampleEntry.data[0];
                    } else {
                        sampleGT = sampleEntry.data[0];
                    }
                }

                switch (sampleGT) {
                    case "./.":
                    case "?/?":
                    case "NA":
                        left = noCallColor;
                        right = noCallColor;
                        break;
                    case "0|1":
                    case "1|0":
                        left = "white";
                        right = mutationColor;
                        break;
                    default:
                        const alleles = sampleGT.split(genotypeSplitRegExp);
                        switch (alleles[0]) {
                            case "0":
                                left = "white";
                                break;
                            case ".":
                                left = noCallColor;
                                break;
                            default:
                                left = mutationColor;
                                break;
                        }
                        switch (alleles[1]) {
                            case "0":
                                right = "white";
                                break;
                            case ".":
                                right = noCallColor;
                                break;
                            default:
                                right = mutationColor;
                                break;
                        }
                        break;
                }

                // THIRD, render genotypes
                if (this.field.config.genotype.type === "bar") {
                    let af, ad, dp;
                    let afIndex, adIndex, dpIndex;
                    let refFreq, altFreq;
                    // let altFreqs = [];

                    // Find and get the DP
                    dpIndex = row.studies[0].sampleDataKeys.findIndex(e => e === "DP");
                    if (dpIndex === -1) {
                        dp = file ? file.DP : null;
                    } else {
                        dp = Number.parseInt(sampleFormat[dpIndex]);
                    }

                    // Get Allele Frequencies
                    adIndex = row.studies[0].sampleDataKeys.findIndex(e => e === "AD");
                    if (adIndex !== -1) {
                        ad = sampleFormat[adIndex];
                        let adCounts = ad.split(",");
                        if (!dp && adCounts.length > 1) {
                            dp = Number.parseInt(adCounts[0]) + Number.parseInt(adCounts[1]);
                        }
                        if (dp > 0) {
                            refFreq = Number.parseInt(adCounts[0]) / dp;
                            altFreq = Number.parseInt(adCounts[1]) / dp;
                        }
                    } else {
                        // In cancer data AF has just one single value for the ALT
                        afIndex = row.studies[0].sampleDataKeys.findIndex(e => e === "AF");
                        if (afIndex !== -1) {
                            af = Number.parseFloat(sampleFormat[afIndex]);
                            refFreq = 1 - af;
                            altFreq = af;
                        }
                    }

                    if (refFreq >= 0 && altFreq >= 0) {
                        let widthPx = 80;
                        let refWidth = Math.max(widthPx * refFreq, 1);
                        let refColor = refFreq !== 0 ? "blue" : "black";
                        let altWidth = widthPx - refWidth;
                        let altColor = altFreq !== 0 ? "red" : "black";
                        let opacity = file?.data?.FILTER === "PASS" ? 100 : 50;
                        resultHtml += `<a class="zygositySampleTooltip" tooltip-title="Variant Call Information" tooltip-text='${tooltipText}'>
                                        <table style="width: ${widthPx}px">
                                            <tr>
                                                <td style="width: ${refWidth}px; background-color: ${refColor}; border-right: 1px solid white; opacity: ${opacity}%">&nbsp;</td>
                                                <td style="width: ${altWidth}px; background-color: ${altColor}; border-right: 1px solid white; opacity: ${opacity}%">&nbsp;</td>
                                            </tr>
                                    `;
                        resultHtml += `</table></a>`;
                    } else {
                        // Just in case we cannot render freqs, this should never happen.
                        resultHtml += `
                            <a class='zygositySampleTooltip' tooltip-title="Variant Call Information" tooltip-text='${tooltipText}' style="width: 50px" align="center">
                                <svg viewBox="0 0 70 30" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="20" cy="15" r="${leftRadio}" style="stroke: black;fill: ${left}"/>
                                    <circle cx="50" cy="15" r="${rightRadio}" style="stroke: black;fill: ${right}"/>
                                </svg>
                            </a>`;
                    }
                } else {
                    resultHtml += `
                        <a class='zygositySampleTooltip'  tooltip-title="Variant Call Information" tooltip-text='${tooltipText}' style="width: 50px" align="center">
                            <svg viewBox="0 0 70 30" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="20" cy="15" r="${leftRadio}" style="stroke: black;fill: ${left}"/>
                                <circle cx="50" cy="15" r="${rightRadio}" style="stroke: black;fill: ${right}"/>
                            </svg>
                        </a>`;
                }
            }
        }

        return resultHtml;
    }

}