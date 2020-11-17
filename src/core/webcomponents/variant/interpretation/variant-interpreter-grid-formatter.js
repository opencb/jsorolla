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



    /*
    * File attributes formatters
    */
    static variantAlleleFrequencyDetailFormatter(value, row, variantGrid) {
        let fileAttrHtml = "";
        if (row && row.studies?.length > 0) {
            fileAttrHtml = `<table class="table table-hover table-no-bordered">
                                    <thead>
                                        <tr>
                                            <th rowspan="2" style="padding: 0px 10px"><span style="white-space: nowrap">Sample ID</span></th>
                                            <th rowspan="2" style="padding: 0px 10px">VCF Call</th>
                                            <th rowspan="2" style="padding: 0px 10px">Genotype</th>
                                            <th rowspan="1" colspan="2" style="text-align:center;padding: 0px 10px">Reference</th>
                                            <th rowspan="1" colspan="2" style="text-align:center;padding: 0px 10px">Alternate</th>
                                            <th rowspan="2" style="padding: 0px 10px">Secondary Alternate</th>
                                            <th rowspan="2" style="padding: 0px 10px">Other</th>
                                        </tr>
                                        <tr>
                                            <th rowspan="1" style="padding: 0px 10px">Allele</th>
                                            <th rowspan="1" style="padding: 0px 10px"><span style="white-space: nowrap">Frequency (Depth)</span></th>
                                            <th rowspan="1" style="padding: 0px 10px">Allele</th>
                                            <th rowspan="1" style="padding: 0px 10px"><span style="white-space: nowrap">Frequency (Depth)</span></th>
                                        </tr>
                                    </thead>
                                    <tbody>`;

            const study = row.studies[0];
            for (const sample of study.samples) {
                const file = study.files?.length > sample.fileIndex ? study.files[sample.fileIndex] : null;

                let referenceFreq; let referenceCount;
                let alternateFreq; let alternateCount;
                let secondaryAlternate = "-";
                let secondaryAlternateFreq;
                let originalCall;

                let ad; let af; let dp;
                // Get DP value
                const dpIdx = study.sampleDataKeys.findIndex(e => e === "DP");
                if (dpIdx !== -1) {
                    dp = Number.parseInt(sample.data[dpIdx]);
                } else {
                    dp = file.data.DP ? Number.parseInt(file.data.DP) : null;
                }

                // Sample format can contain AD or AF
                const adIdx = study.sampleDataKeys.findIndex(e => e === "AD");
                if (adIdx !== -1) {
                    ad = sample.data[adIdx]?.split(",");
                    referenceCount = Number.parseInt(ad[0]);
                    alternateCount = Number.parseInt(ad[1]);
                    if (ad > 1) {
                        secondaryAlternateFreq = ad[2];
                    }
                    if (dp) {
                        referenceFreq = referenceCount !== 0 && referenceCount !== dp ? Number.parseFloat(referenceCount / dp).toFixed(3) : referenceCount / dp;
                        alternateFreq = alternateCount !== 0 && alternateCount !== dp ? Number.parseFloat(alternateCount / dp).toFixed(3) : alternateCount / dp;
                    }
                } else {
                    const afIdx = study.sampleDataKeys.findIndex(e => e === "AF");
                    if (afIdx !== -1) {
                        af = sample.data[afIdx]?.split(",");
                        referenceFreq = af[0];
                        alternateFreq = af[1];
                        if (af > 1) {
                            secondaryAlternateFreq = af[2];
                        }
                        referenceCount = "NA";
                        alternateCount = "NA";
                    }
                }

                if (file.call?.variantId) {
                    originalCall = file.call.variantId.replace("<", "&lt;").replace(">", "&gt;");
                    if (originalCall.includes(",")) {
                        const split = originalCall.split(",");
                        secondaryAlternate = split[1] !== "&lt;NON_REF&gt;" ? split[1] : "none";
                    }
                } else {
                    originalCall = `${row.chromosome}:${row.position}:${row.reference}:${row.alternate}`;
                }

                const format = [];
                for (let i = 0; i < study.sampleDataKeys.length; i++) {
                    format.push(study.sampleDataKeys[i] + ": " + sample.data[i]);
                }

                let genotypeColor = "black";
                if (sample.data[0] === "0/1" || sample.data[0] === "0|1" && sample.data[0] === "1|0") {
                    genotypeColor = "darkorange";
                } else {
                    if (sample.data[0] === "1/1" || sample.data[0] === "1|1") {
                        genotypeColor = "red";
                    }
                }
                const sampleIdColor = variantGrid?.clinicalAnalysis?.proband?.samples[0]?.id === sample.sampleId ? "darkred" : "black";
                fileAttrHtml += `<tr class="detail-view-row">
                                    <td><span style="font-weight: bold; color: ${sampleIdColor}">${sample.sampleId}</span></td>
                                    <td><span style="white-space: nowrap">${originalCall}</span></td>
                                    <td><span style="color: ${genotypeColor}">${sample.data[0]}</span></td>
                                    <td>${row.reference}</td>
                                    <td>${referenceFreq} (${referenceCount})</td>
                                    <td>${row.alternate}</td>
                                    <td>${alternateFreq} (${alternateCount})</td>
                                    <td>${secondaryAlternate}</td>
                                    <td>${format.join("; ")}</td>
                                 </tr>`;
            }

            fileAttrHtml += "</tbody></table>";
        }
        return fileAttrHtml;
    }

    static reportedEventDetailFormatter(value, row, variantGrid, query, filter) {
        if (row && row.evidences.length > 0) {
            // Sort by Tier level
            row.evidences.sort(function (a, b) {
                if (a.tier === null || b.tier !== null) {
                    return 1;
                }
                if (a.tier !== null || b.tier === null) {
                    return -1;
                }
                if (a.tier < b.tier) {
                    return -1;
                }
                if (a.tier > b.tier) {
                    return 1;
                }
                return 0;
            });

            // let selectColumnHtml = "";
            // if (variantGrid._config.showSelectCheckbox) {
            //     selectColumnHtml = "<th rowspan=\"2\">Select</th>";
            // }

            const showArrayIndexes = VariantGridFormatter._consequenceTypeDetailFormatterFilter(row.annotation.consequenceTypes, query, filter);
            let message = "";
            if (filter) {
                // Create two different divs to 'show all' or 'apply filter' title
                message = `<div class="${variantGrid._prefix}${row.id}EvidenceFiltered">Showing <span style="font-weight: bold; color: red">${showArrayIndexes.length}</span> of 
                                <span style="font-weight: bold; color: red">${row.annotation.consequenceTypes.length}</span> clinical evidences, 
                                <a id="${variantGrid._prefix}${row.id}ShowEvidence" data-id="${row.id}" style="cursor: pointer">show all...</a>
                            </div>
                            <div class="${variantGrid._prefix}${row.id}EvidenceFiltered" style="display: none">Showing <span style="font-weight: bold; color: red">${row.annotation.consequenceTypes.length}</span> of 
                                <span style="font-weight: bold; color: red">${row.annotation.consequenceTypes.length}</span> clinical evidences, 
                                <a id="${variantGrid._prefix}${row.id}HideEvidence" data-id="${row.id}" style="cursor: pointer">apply filters...</a>
                           </div>
                            `;
            }

            let ctHtml = `<div style="padding-bottom: 5px">
                                ${message}
                           </div>
                           <table id="ConsqTypeTable" class="table table-hover table-no-bordered">`;

            if (variantGrid.clinicalAnalysis.type.toUpperCase() !== "CANCER") {
                ctHtml += `<thead>
                                    <tr>
                                        <th rowspan="2">Gene</th>
                                        <th rowspan="2">Transcript</th>
                                        <th rowspan="2">HGVS</th>
                                        <th rowspan="2">Gencode</th>
                                        <th rowspan="2">Consequence Type (SO Term)</th>
                                        <th rowspan="2">Panel</th>
                                        <th rowspan="2">Mode of Inheritance</th>
                                        <th rowspan="2">Actionable</th>
                                        <th rowspan="1" colspan="3" style="text-align: center">Classification</th>
                                    </tr>
                                    <tr>
                                        <th rowspan="1">ACMG</th>
                                        <th rowspan="1">Tier</th>
                                        <th rowspan="1">Clinical Significance</th>
                                    </tr>
                                </thead>
                                <tbody>`;
            } else {
                ctHtml += `<thead>
                                <tr>
                                    <th rowspan="2">Gene</th>
                                    <th rowspan="2">Transcript</th>
                                    <th rowspan="2">HGVS</th>
                                    <th rowspan="2">Gencode</th>
                                    <th rowspan="2">Consequence Type (SO Term)</th>
                                    <th rowspan="2">Panel</th>
                                    <th rowspan="2">Role in Cancer</th>
                                    <th rowspan="2">Actionable</th>
                                    <th rowspan="1" colspan="1" style="text-align: center">Classification</th>
                                </tr>
                                <tr>
                                    <th rowspan="1" style="text-align: center">Tier</th>
                                </tr>
                            </thead>
                            <tbody>`;
            }

            // FIXME Maybe this should happen in the server?
            // let biotypeSet = new Set();
            let consequenceTypeSet = new Set();
            if (UtilsNew.isNotUndefinedOrNull(variantGrid.query)) {
                // if (UtilsNew.isNotUndefinedOrNull(variantGrid.query.biotype)) {
                //     biotypeSet = new Set(variantGrid.query.biotype.split(","));
                // }
                if (UtilsNew.isNotUndefinedOrNull(variantGrid.query.ct)) {
                    consequenceTypeSet = new Set(variantGrid.query.ct.split(","));
                }
            }

            for (let i = 0; i < row.evidences.length; i++) {
                const re = row.evidences[i];

                // FIXME Maybe this should happen in the server?
                // If ct exist and there are some consequenceTypeIds then we check that the report event matches the query
                if (UtilsNew.isNotEmptyArray(re.consequenceTypeIds) && consequenceTypeSet.size > 0) {
                    let hasConsequenceType = false;
                    for (const ct of re.consequenceTypeIds) {
                        if (consequenceTypeSet.has(ct)) {
                            hasConsequenceType = true;
                        }
                    }
                    if (!hasConsequenceType) {
                        continue;
                    }
                }

                // Prepare data info for columns
                let gene = "-";
                if (UtilsNew.isNotEmpty(re.genomicFeature.id)) {
                    gene = `<div>
                                <a href="https://www.genenames.org/tools/search/#!/all?query=${re.genomicFeature.geneName}" target="_blank">
                                    ${re.genomicFeature.geneName}
                                </a>
                            </div>
                            <div style="padding-top: 5px">
                                <a href="http://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${re.genomicFeature.id}" target="_blank">
                                    ${re.genomicFeature.id}
                                </a>
                            </div>`;
                }


                let hgvsHtml = "-";
                let transcriptId = "-";
                if (UtilsNew.isNotEmpty(re.genomicFeature.transcriptId)) {
                    let biotype = "-";
                    if (row.annotation && row.annotation.consequenceTypes) {
                        for (const ct of row.annotation.consequenceTypes) {
                            if (ct.ensemblTranscriptId === re.genomicFeature.transcriptId) {
                                biotype = ct.biotype;
                                break;
                            }
                        }
                    }

                    transcriptId = `<div>
                                        <a href="http://www.ensembl.org/Homo_sapiens/Transcript/Idhistory?t=${re.genomicFeature.transcriptId}" target="_blank">
                                            ${re.genomicFeature.transcriptId}
                                        </a>
                                    </div>
                                    <div style="padding-top: 5px">
                                        ${biotype}
                                    </div>`;

                    if (row.annotation && row.annotation.hgvs) {
                        hgvsHtml = row.annotation.hgvs.filter(hgvs => hgvs.startsWith(re.genomicFeature.transcriptId));
                    }
                }

                let transcriptFlag = "";
                let transcriptFlagChecked = false;
                if (UtilsNew.isNotEmptyArray(row.annotation.consequenceTypes)) {
                    for (const ct of row.annotation.consequenceTypes) {
                        if (re.genomicFeature.transcriptId === ct.ensemblTranscriptId) {
                            if (ct.transcriptAnnotationFlags !== undefined && ct.transcriptAnnotationFlags.includes("basic")) {
                                transcriptFlag = `<span data-toggle="tooltip" data-placement="bottom" title="Proband">
                                                    <i class='fa fa-check' style='color: green'></i>
                                                  </span>`;
                                transcriptFlagChecked = true;
                            } else {
                                if (re.genomicFeature.transcriptId) {
                                    transcriptFlag = "<span><i class='fa fa-times' style='color: red'></i></span>";
                                } else {
                                    transcriptFlag = "-";
                                }
                            }
                            break;
                        }
                    }
                }

                const soArray = [];
                if (re.genomicFeature.consequenceTypes && re.genomicFeature.consequenceTypes.length > 0) {
                    for (const so of re.genomicFeature.consequenceTypes) {
                        let color = "black";
                        if (typeof variantGrid.consequenceTypeToColor !== "undefined" && typeof variantGrid.consequenceTypeToColor[so.name] !== "undefined") {
                            color = variantGrid.consequenceTypeToColor[so.name];
                        }
                        soArray.push(`<div style="color: ${color}">
                                    ${so.name} (<a href="http://www.sequenceontology.org/browser/current_svn/term/${so.accession}" target="_blank">${so.accession}</a>)
                                  </div>`);
                    }
                }


                let panel = "-";
                if (UtilsNew.isNotUndefinedOrNull(re.panelId)) {
                    panel = re.panelId;
                }

                let moi = "-";
                if (UtilsNew.isNotUndefinedOrNull(re.modeOfInheritance)) {
                    moi = re.modeOfInheritance;
                }

                let roleInCancer = "-";
                if (UtilsNew.isNotUndefinedOrNull(re.roleInCancer)) {
                    roleInCancer = re.roleInCancer === "TUMOR_SUPRESSOR_GENE" || re.roleInCancer === "TUMOR_SUPPRESSOR_GENE" ? "TSG" : re.roleInCancer;
                    // roleInCancer = re.roleInCancer;
                }

                let actionable = "-";
                if (UtilsNew.isNotUndefinedOrNull(re.actionable) && re.actionable) {
                    actionable = "Yes";
                }

                let acmg = "-";
                if (UtilsNew.isNotEmptyArray(re.classification.acmg)) {
                    acmg = re.classification.acmg.join(", ");
                }

                let tier = "-";
                let color = "black";
                if (UtilsNew.isNotUndefinedOrNull(re.tier)) {
                    color = (re.tier === "Tier1" || re.tier === "Tier 1") ? "red" : color;
                    color = (re.tier === "Tier2" || re.tier === "Tier 2") ? "darkorange" : color;
                    color = (re.tier === "Tier3" || re.tier === "Tier 3") ? "blue" : color;
                    tier = `<span style="color: ${color}">${re.tier}</span>`;
                }

                let clinicalSignificance = "-";
                if (re.classification.clinicalSignificance) {
                    clinicalSignificance = re.classification.clinicalSignificance;
                    switch (clinicalSignificance) {
                        case "PATHOGENIC":
                        case "PATHOGENIC_VARIANT":
                        case "LIKELY_PATHOGENIC":
                        case "LIKELY_PATHOGENIC_VARIANT":
                            clinicalSignificance = `<span style='color: red'>${clinicalSignificance.replace("_", " ")}</span>`;
                            break;
                        case "UNCERTAIN_SIGNIFICANCE":
                        case "VARIANT_OF_UNKNOWN_CLINICAL_SIGNIFICANCE":
                            clinicalSignificance = `<span style='color: darkorange'>${clinicalSignificance.replace("_", " ")}</span>`;
                            break;
                        case "LIKELY_BENIGN":
                        case "LIKELY_BENIGN_VARIANT":
                        case "BENIGN":
                        case "BENIGN_VARIANT":
                            clinicalSignificance = `<span style='color: blue'>${clinicalSignificance.replace("_", " ")}</span>`;
                            break;
                        case "NOT_ASSESSED":
                            clinicalSignificance = `<span style='color: black'>${clinicalSignificance.replace("_", " ")}</span>`;
                            break;
                        default:
                            clinicalSignificance = "NA";
                            break;
                    }
                }

                // let checboxHtml = "";
                // if (variantGrid._config.showSelectCheckbox) {
                //     let checked = "";
                //     if (transcriptFlagChecked && tier !== "-") {
                //         checked = "checked";
                //     }
                //     checboxHtml = `<td><input type="checkbox" ${checked}></td>`;
                // }

                // Create the table row
                const hideClass = showArrayIndexes.includes(i) ? "" : `${variantGrid._prefix}${row.id}EvidenceFiltered`;
                const displayStyle = showArrayIndexes.includes(i) ? "" : "display: none";

                // Create the table row
                if (variantGrid.clinicalAnalysis.type.toUpperCase() !== "CANCER") {
                    ctHtml += `
                        <tr class="detail-view-row ${hideClass}" style="${displayStyle}">
                            <td>${gene}</td>
                            <td>${transcriptId}</td>
                            <td>${hgvsHtml}</td>
                            <td>${transcriptFlag}</td>
                            <td>${soArray.join("")}</td>
                            <td>${panel}</td>
                            <td>${moi}</td>
                            <td>${actionable}</td>
                            <td>${acmg}</td>
                            <td>${tier}</td>
                            <td>${clinicalSignificance}</td>
                        </tr>`;
                } else {
                    ctHtml += `
                        <tr class="detail-view-row ${hideClass}" style="${displayStyle}">
                            <td>${gene}</td>
                            <td>${transcriptId}</td>
                            <td>${hgvsHtml}</td>
                            <td>${transcriptFlag}</td>
                            <td>${soArray.join("")}</td>
                            <td>${panel}</td>
                            <td>${roleInCancer}</td>
                            <td>${actionable}</td>
                            <td>${tier}</td>
                        </tr>`;
                }
            }
            ctHtml += "</tbody></table>";
            return ctHtml;
        }
        return "-";
    }

    /*
     *  SAMPLE GENOTYPE RENDERER
     */
    static sampleGenotypeFormatter(value, row, index) {
        let resultHtml = "";

        if (row && row.studies?.length > 0 && row.studies[0].samples?.length > 0) {
            const sampleId = this.field.sampleId;
            let sampleEntries = [row.studies[0].samples.find(s => s.sampleId === sampleId)];

            // Check if there are any DISCREPANCY issue for this sample and add it to the calls to be displayed
            if (row.studies[0]?.issues?.length > 0) {
                const sampleIssues = row.studies[0].issues.filter(e => e.sample.sampleId === sampleId && e.type === "DISCREPANCY");
                sampleEntries = sampleEntries.concat(sampleIssues.map(e => e.sample));
            }

            for (let sampleEntry of sampleEntries) {
                // Get the file for this sample
                let file;
                if (row.studies[0].files) {
                    let fileIdx = sampleEntry?.fileIndex ?? 0;
                    if (fileIdx >= 0) {
                        file = row.studies[0].files[fileIdx];
                    }
                }

                // Render genotypes
                let content;
                switch (this.field.config.genotype.type.toUpperCase()) {
                    case "ALLELES":
                        content = VariantInterpreterGridFormatter._alleleGenotypeRenderer(row, sampleEntry);
                        break;
                    case "CIRCLE":
                        content = VariantInterpreterGridFormatter._circleGenotypeRenderer(sampleEntry, file, 6);
                        break;
                    case "VAF":
                        let vaf = VariantInterpreterGridFormatter._getVariantAlleleFraction(row, sampleEntry, file);
                        if (vaf && vaf.vaf >= 0 && vaf.depth >= 0) {
                            content = VariantInterpreterGridFormatter._vafGenotypeRenderer(vaf.vaf, vaf.depth, file, {});
                        } else {    // Just in case we cannot render freqs, this should never happen.
                            content = VariantInterpreterGridFormatter._circleGenotypeRenderer(sampleEntry, file, 6);
                        }
                        break;
                    case "ALLELE_FREQUENCY":
                        let alleleFreqs = VariantInterpreterGridFormatter._getAlleleFrequencies(row, sampleEntry, file);
                        if (alleleFreqs && alleleFreqs.ref >= 0 && alleleFreqs.alt >= 0) {
                            content = VariantInterpreterGridFormatter._alleleFrequencyGenotypeRenderer(alleleFreqs.ref, alleleFreqs.alt, file, {width: 80});
                        } else {    // Just in case we cannot render freqs, this should never happen.
                            content = VariantInterpreterGridFormatter._alleleGenotypeRenderer(row);
                        }
                        break;
                    default:
                        console.error("No valid genotype render option:", this.field.config.genotype.type.toUpperCase());
                        break;
                }

                // Get tooltip text
                const tooltipText = VariantInterpreterGridFormatter._getSampleGenotypeTooltipText(row, sampleEntry, file);
                resultHtml = `<a class="zygositySampleTooltip" tooltip-title="Variant Call Information" tooltip-text='${tooltipText}'>
                                ${content}
                              </a>`;
            }
        }

        return resultHtml;
    }

    static _circleGenotypeRenderer(sampleEntry, file, radius) {
        let {left, right} = VariantInterpreterGridFormatter._getLeftRightColors(sampleEntry.data[0], file.data.FILTER);
        return `<svg viewBox="0 0 70 30" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="15" r="${radius ?? 6}" style="stroke: black;fill: ${left}"/>
                    <circle cx="50" cy="15" r="${radius ?? 6}" style="stroke: black;fill: ${right}"/>
                </svg>`;
    }

    static _vafGenotypeRenderer(vaf, depth, file, config) {
        return `<span>${vaf.toFixed(4)} / ${depth}</span>`;
    }

    static _alleleFrequencyGenotypeRenderer(refFreq, altFreq, file, config) {
        let widthPx = config?.width ? config.width : 80;
        let refWidth = Math.max(widthPx * refFreq, 1);
        let refColor = refFreq !== 0 ? "blue" : "black";
        let altWidth = widthPx - refWidth;
        let altColor = altFreq !== 0 ? "red" : "black";
        let opacity = file?.data && file.data.FILTER === "PASS" ? 100 : 60;
        return `<table style="width: ${widthPx}px">
                    <tr>
                        <td style="width: ${refWidth}px; background-color: ${refColor}; border-right: 1px solid white; opacity: ${opacity}%">&nbsp;</td>
                        <td style="width: ${altWidth}px; background-color: ${altColor}; border-right: 1px solid white; opacity: ${opacity}%">&nbsp;</td>
                    </tr>
                </table>`;
    }

    static _alleleGenotypeRenderer(variant, sampleEntry) {
        let res = "-";

        if (variant && variant.studies?.length > 0) {
            let leftAlleleText = "-";
            let rightAlleleText = "-";

            const genotypeMatch = new Map();
            genotypeMatch.set(0, variant.reference !== "" ? variant.reference : "-");
            genotypeMatch.set(1, variant.alternate !== "" ? variant.alternate : "-");

            if (sampleEntry?.data && sampleEntry.data.length > 0) {
                const genotype = sampleEntry.data[0];

                // Check special cases
                if (genotype === "NA") {
                    return `<span style='color: darkorange'>${genotype}</span>`;
                }

                if (genotype === "./." || genotype === ".|.") {
                    return `<span style='color: darkorange'>${genotype}</span>`;
                }

                let allelesArray = genotype.split(new RegExp("[/|]"));
                let leftAlleleCode = Number.parseInt(allelesArray[0]);
                let rightAlleleCode = Number.parseInt(allelesArray[1]);

                const leftAllele = genotypeMatch.get(leftAlleleCode);
                const rightAllele = genotypeMatch.get(rightAlleleCode);

                // Init
                leftAlleleText = leftAllele;
                rightAlleleText = rightAllele;

                // Not equal X/- or -/X
                if (leftAllele !== "-" && rightAllele !== "-") {
                    if ((leftAllele.length <= 5 && rightAllele.length > 5) || (leftAllele.length > 5 && rightAllele.length <= 5)) {
                        if (leftAllele.length > 5) {
                            leftAlleleText = leftAllele.substring(0, 3) + "...";
                        } else {
                            rightAlleleText = rightAllele.substring(0, 3) + "...";
                        }
                    } else {
                        // Both > 5 should never happen
                        if (leftAllele.length > 5 && rightAllele.length > 5) {
                            leftAlleleText = leftAllele.substring(0, 3) + "...";
                            rightAlleleText = rightAllele.substring(0, 3) + "...";
                        }
                    }
                } else {
                    if (leftAllele !== "-" && leftAllele.length > 10) {
                        const substringReference = leftAllele.substring(0, 5) + "...";
                        leftAlleleText = substringReference;
                        rightAlleleText = "-";
                    } else {
                        if (rightAllele !== "-" && rightAllele.length > 10) {
                            const substringAlternate = rightAllele.substring(0, 5) + "...";
                            rightAlleleText = substringAlternate;
                            leftAlleleText = "-";
                        }
                    }
                }

                if (leftAlleleCode === 1 && (leftAlleleText !== "-" && leftAlleleText !== "*")) {
                    leftAlleleText = "<span style='color: darkorange'>" + leftAlleleText + "</span>";
                } else if (leftAlleleCode > 1 && (leftAlleleText !== "-" && leftAlleleText !== "*")) {
                    leftAlleleText = "<span style='color: darkred'>" + leftAlleleText + "</span>";
                }
                if (rightAlleleCode === 1 && (rightAlleleText !== "-" && rightAlleleText !== "*")) {
                    rightAlleleText = "<span style='color: darkorange'>" + rightAlleleText + "</span>";
                } else if (rightAlleleCode > 1 && (rightAlleleText !== "-" && rightAlleleText !== "*")) {
                    rightAlleleText = "<span style='color: darkred'>" + rightAlleleText + "</span>";
                }
                res = `<span>${leftAlleleText} / ${rightAlleleText}</span>`;
            }
        }
        return res;
    }

    static _getLeftRightColors(gt, filter) {
        let leftColor;
        let rightColor;

        let noCallColor = "rgba(255, 0, 0, 0.5)";
        let mutationColor = filter && filter === "PASS" ? "black" : "silver";

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

        // Try to guess the variant caller used.
        // Check if is Caveman by looking to specific sample FORMAT fields
        if (file.data.ASMD && file.data.CLPM) {
            let set = new Set(["FAZ", "FCZ", "FGZ", "FTZ", "RAZ", "RCZ", "RGZ", "RTZ"]);
            depth = 0;
            for (let i in variant.studies[0].sampleDataKeys) {
                if (set.has(variant.studies[0].sampleDataKeys[i])) {
                    depth += Number.parseInt(sampleEntry.data[i]);
                } else {
                    if (variant.studies[0].sampleDataKeys[i] === "PM") {
                        vaf = Number.parseFloat(sampleEntry.data[i]);
                    }
                }
            }
        }

        // Check if is Pindel by looking to specific sample FORMAT fields
        if (file.data.PC && file.data.VT) {
            let values = {};
            let fields = ["PU", "NU", "PR", "NR"];
            for (let field of fields) {
                let index = variant.studies[0].sampleDataKeys.findIndex(elem => elem === field);
                values[field] = Number.parseInt(sampleEntry.data[index]);
            }
            vaf = (values.PU + values.NU) / (values.PR + values.NR);
            depth = values.PR + values.NR;

        }

        return {vaf: vaf, depth: depth};
    }

    static _getAlleleFrequencies(variant, sampleEntry, file) {
        let af, ad, dp;
        let afIndex, adIndex, dpIndex;
        let refFreq, altFreq;


        // Find and get the DP
        dpIndex = variant.studies[0].sampleDataKeys.findIndex(e => e === "DP");
        if (dpIndex === -1) {
            dp = file ? file.DP : null;
        } else {
            dp = Number.parseInt(sampleEntry.data[dpIndex]);
        }

        // Get Allele Frequencies
        adIndex = variant.studies[0].sampleDataKeys.findIndex(e => e === "AD");
        if (adIndex !== -1) {
            ad = sampleEntry.data[adIndex];
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
            afIndex = variant.studies[0].sampleDataKeys.findIndex(e => e === "AF");
            if (afIndex !== -1) {
                af = Number.parseFloat(sampleEntry.data[afIndex]);
                refFreq = 1 - af;
                altFreq = af;
            }
        }
        return {ref: refFreq, alt: altFreq, depth: dp};
    }

    static _getSampleGenotypeTooltipText(variant, sampleEntry, file) {
        // Fetch sampleFormat and file to simplify code
        const sampleFormat = sampleEntry.data;

        // 1. Get INFO fields
        const infoFields = [];
        if (file && file.data) {
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

        // 2. Get FORMAT fields
        const formatFields = [];
        for (const formatFieldIndex in variant.studies[0].sampleDataKeys) {
            // GT field is treated separately
            let key = variant.studies[0].sampleDataKeys[formatFieldIndex];
            key = key !== "GT" ? key : `${key} (${variant.reference || "-"}/${variant.alternate || "-"})`;
            let value = sampleFormat[formatFieldIndex] ? sampleFormat[formatFieldIndex] : "-";
            const html = `<div class="form-group" style="margin: 2px 2px">
                                    <label class="col-md-5">${key}</label>
                                    <div class="col-md-7">${value}</div>
                                  </div>`;
            formatFields.push(html);
        }

        // 3. Get SECONDARY ALTERNATES fields
        const secondaryAlternates = [];
        for (const v of variant.studies[0].secondaryAlternates) {
            const html = `<div class="form-group" style="margin: 2px 2px">
                                    <label class="col-md-5">${v.chromosome}:${v.start}-${v.end}</label>
                                    <div class="col-md-7">${v.reference}/${v.alternate} ${v.type}</div>
                                  </div>`;
            secondaryAlternates.push(html);
        }

        // 4. Build the Tooltip text
        const tooltipText = `<div class="zygosity-formatter">
                                <form class="form-horizontal">
                                    <div class="form-group" style="margin: 2px 2px">
                                        <label class="col-md-12" style="color: darkgray;padding: 10px 0px 5px 0px">SUMMARY</label>
                                    </div>
                                    <div class="form-group" style="margin: 2px 2px">
                                        <label class="col-md-4">Sample ID</label>
                                        <div class="col-md-8">${sampleEntry?.sampleId ? sampleEntry.sampleId : "-"}</div>
                                    </div>
                                    <div class="form-group" style="margin: 2px 2px">
                                        <label class="col-md-4">File Name</label>
                                        <div class="col-md-8">${file?.fileId ? file.fileId : "-"}</div>
                                    </div>
                                    <div class="form-group" style="margin: 2px 2px">
                                        <label class="col-md-4">File FILTER</label>
                                        <div class="col-md-8">${file.data.FILTER}</div>
                                    </div>
                                    <div class="form-group" style="margin: 2px 2px">
                                        <label class="col-md-4">File QUAL</label>
                                        <div class="col-md-8">${Number(file.data.QUAL).toFixed(2)}</div>
                                    </div>
                                    <div class="form-group" style="margin: 2px 2px">
                                        <label class="col-md-4">File VCF call</label>
                                        <div class="col-md-8">${file.call?.variantId ? file.call.variantId 
                                            : `${variant.chromosome}:${variant.start}:${variant.reference}:${variant.alternate}`}
                                        </div>
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
                                    ${secondaryAlternates?.length > 0 ? secondaryAlternates.join("")
                                        : `<div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-12">-</label>
                                           </div>`
                                    }
                                </form>
                             </div>`;
        return tooltipText;
    }
}