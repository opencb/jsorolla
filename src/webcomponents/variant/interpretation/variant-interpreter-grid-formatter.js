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
import UtilsNew from "../../../core/utilsNew.js";
import BioinfoUtils from "../../../core/bioinfo-utils.js";


export default class VariantInterpreterGridFormatter {

    static roleInCancerFormatter(value, row, index) {
        if (value) {
            const roles = new Set();
            for (const evidenceIndex in value) {
                const evidence = value[evidenceIndex];
                if (evidence.roleInCancer && evidence.genomicFeature.geneName) {
                    const roleInCancer = evidence.roleInCancer === "TUMOUR_SUPPRESSOR_GENE" || evidence.roleInCancer === "TUMOR_SUPPRESSOR_GENE" ? "TSG" : evidence.roleInCancer;
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
                cohortMap.set(s, study.stats.length ? Number(study.stats[0].altAlleleFreq).toPrecision(4) : "-");
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
                    popFreqMap.set(popFreq.study + ":" + popFreq.population, Number(popFreq.altAlleleFreq).toPrecision(4));
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
            NOT_ASSESSED: {id: "NA", code: 0, color: "black"},
            BENIGN: {id: "B", code: 1, color: "green"},
            LIKELY_BENIGN: {id: "LB", code: 2, color: "darkbrown"},
            UNCERTAIN_SIGNIFICANCE: {id: "US", code: 3, color: "darkorange"},
            LIKELY_PATHOGENIC: {id: "LP", code: 4, color: "darkred"},
            PATHOGENIC: {id: "P", code: 5, color: "red"}
        };

        let clinicalSignificanceCode = 0;
        let clinicalSignificanceHtml = "NA";
        let clinicalSignificanceTooltipText = "";
        const modeOfInheritances = [];

        for (const re of row.evidences) {
            if (re.modeOfInheritance && !modeOfInheritances.includes(re.modeOfInheritance)) {
                modeOfInheritances.push(re.modeOfInheritance);
            }

            if (clinicalSignificanceCodes[re.classification.clinicalSignificance]?.code > clinicalSignificanceCode) {
                clinicalSignificanceCode = clinicalSignificanceCodes[re.classification.clinicalSignificance].code;
                // let clinicalSignificance = re.classification.clinicalSignificance.replace("_", " ");
                const clinicalSignificance = clinicalSignificanceCodes[re.classification.clinicalSignificance].id;
                clinicalSignificanceHtml = `
                    <div style="margin: 5px 0px; color: ${clinicalSignificanceCodes[re.classification.clinicalSignificance].color}">${clinicalSignificance}</div>
                    <div class="help-block">${re.classification.acmg.join(", ")}</div>
                `;
                clinicalSignificanceTooltipText = `<div class='col-md-12 predictionTooltip-inner' style='padding: 0px'>
                                                        <form class='form-horizontal'>
                                                            <div class='form-group' style='margin: 0px 2px'>
                                                                <label class='col-md-5'>ACMG</label>
                                                                <div class='col-md-7'>${re.classification.acmg.join(", ")}</div>
                                                            </div>
                                                            <div class='form-group' style='margin: 0px 2px'>
                                                                <label class='col-md-5'>ACMG Tier</label>
                                                                <div class='col-md-7'>${re.classification.tier}</div>
                                                            </div>
                                                        </form>
                                                   </div>`;
            }
        }
        return `<a class='predictionTooltip' tooltip-title="Classification" tooltip-text="${clinicalSignificanceTooltipText}">
                    ${clinicalSignificanceHtml}
                </a>`;
    }


    /*
    * File attributes formatters
    */
    // DEPRECATED
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

                let referenceFreq, referenceCount, alternateFreq, alternateCount, secondaryAlternate = "-";
                let secondaryAlternateFreq;
                let originalCall;

                let ad;
                let af;
                let dp;

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

                if (file?.call?.variantId) {
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

    static reportedEventDetailFormatter(value, row, variantGrid, query, review, config) {
        if (row && row.evidences.length > 0) {
            // Sort and group CTs by Gene name
            BioinfoUtils.sort(row.evidences, v => v.genomicFeature?.geneName);

            const showArrayIndexes = VariantGridFormatter._consequenceTypeDetailFormatterFilter(row.annotation.consequenceTypes, config).indexes;
            let message = "";
            if (config) {
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
                                        <th rowspan="2">Consequence Type</th>
                                        <th rowspan="2">Transcript Flags</th>
                                        <th rowspan="2">Panel</th>
                                        <th rowspan="2">Mode of Inheritance</th>
                                        <th rowspan="2">Actionable</th>
                                        <th rowspan="1" colspan="${review ? 5 : 3}" style="text-align: center; padding-top: 5px">Classification</th>
                                    </tr>
                                    <tr>
                                        <th rowspan="1" style="padding-top: 5px">ACMG</th>
                                        <th rowspan="1">Clinical Significance</th>
                                        <th rowspan="1">Tier</th>
                                        ${review ? "<th rowspan=\"1\">Select</th>" : ""}
                                        ${review ? "<th rowspan=\"1\">Edit</th>" : ""}
                                    </tr>
                                </thead>
                                <tbody>`;
            } else {
                ctHtml += `<thead>
                                <tr>
                                    <th rowspan="2">Gene</th>
                                    <th rowspan="2">Transcript</th>
                                    <th rowspan="2">Consequence Type</th>
                                    <th rowspan="2">Transcript Flags</th>
                                    <th rowspan="2">Panel</th>
                                    <th rowspan="2">Role in Cancer</th>
                                    <th rowspan="2">Actionable</th>
                                    <th rowspan="1" colspan="${review ? 3 : 1}" style="text-align: center; padding-top: 5px">Classification</th>
                                </tr>
                                <tr>
                                    <th rowspan="1" style="text-align: center; padding-top: 5px">Tier</th>
                                    ${review ? "<th rowspan=\"1\">Select</th>" : ""}
                                    ${review ? "<th rowspan=\"1\">Edit</th>" : ""}
                                </tr>
                            </thead>
                            <tbody>`;
            }

            // FIXME Maybe this should happen in the server?
            let consequenceTypeSet = new Set();
            if (UtilsNew.isNotUndefinedOrNull(variantGrid.query)) {
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
                let geneHtml = "-";
                if (re.genomicFeature.geneName) {
                    geneHtml = `
                        <div>
                            <a href="${BioinfoUtils.getGeneNameLink(re.genomicFeature.geneName)}" target="_blank">
                                ${re.genomicFeature.geneName}
                            </a>
                        </div>
                        <div style="margin: 5px 0px">
                            <a href="${BioinfoUtils.getGeneLink(re.genomicFeature.id)}" target="_blank">
                                ${re.genomicFeature.id || ""}
                            </a>
                        </div>`;
                }

                // Get the CT for this transcript ID
                const ct = row.annotation?.consequenceTypes
                    ?.find(ct => ct.ensemblTranscriptId === re.genomicFeature.transcriptId || ct.transcriptId === re.genomicFeature.transcriptId);

                let transcriptHtml = "-";
                if (re.genomicFeature.transcriptId) {
                    transcriptHtml = `
                        <div style="">
                            <span>${ct?.biotype ? ct.biotype : "-"}</span>
                        </div>
                        <div style="margin: 5px 0px">
                            <span>
                                ${re.genomicFeature.transcriptId ? `
                                    <div style="margin: 5px 0px">
                                        ${VariantGridFormatter.getHgvsLink(re.genomicFeature.transcriptId, row.annotation.hgvs) || ""}
                                    </div>
                                    <div style="margin: 5px 0px">
                                        ${VariantGridFormatter.getHgvsLink(ct?.proteinVariantAnnotation?.proteinId, row.annotation.hgvs) || ""}
                                    </div>` : ""
                                }
                            </span>
                        </div>`;
                }

                const soArray = [];
                if (re.genomicFeature.consequenceTypes && re.genomicFeature.consequenceTypes.length > 0) {
                    for (const so of re.genomicFeature.consequenceTypes) {
                        const color = CONSEQUENCE_TYPES.style[CONSEQUENCE_TYPES.impact[so.name]] || "black";
                        soArray.push(`<div style="color: ${color}; margin-bottom: 5px">
                                        <span style="padding-right: 5px">${so.name}</span>
                                        <a title="Go to Sequence Ontology ${so.accession} term"
                                            href="http://www.sequenceontology.org/browser/current_svn/term/${so.accession}" target="_blank">
                                            <i class="fas fa-external-link-alt"></i>
                                        </a>
                                      </div>`);
                    }
                }

                let transcriptFlagHtml = ["-"];
                if ((ct?.transcriptId || ct?.ensemblTranscriptId) && (ct?.transcriptFlags?.length > 0 || ct?.transcriptAnnotationFlags?.length > 0)) {
                    transcriptFlagHtml = ct.transcriptFlags ?
                        ct.transcriptFlags.map(flag => `<div style="margin-bottom: 5px">${flag}</div>`) :
                        ct.transcriptAnnotationFlags.map(flag => `<div style="margin-bottom: 5px">${flag}</div>`);
                }

                let panel = "-";
                if (re.panelId) {
                    panel = re.panelId;
                }

                let moi = "-";
                if (re.modeOfInheritance) {
                    moi = re.modeOfInheritance;
                }

                let roleInCancer = "-";
                if (UtilsNew.isNotUndefinedOrNull(re.roleInCancer)) {
                    roleInCancer = re.roleInCancer === "TUMOR_SUPRESSOR_GENE" || re.roleInCancer === "TUMOR_SUPPRESSOR_GENE" ? "TSG" : re.roleInCancer;
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
                if (re.classification?.tier) {
                    const tierClassification = re.classification.tier?.toUpperCase();
                    color = (tierClassification === "TIER1" || tierClassification === "TIER 1") ? "red" : color;
                    color = (tierClassification === "TIER2" || tierClassification === "TIER 2") ? "darkorange" : color;
                    color = (tierClassification === "TIER3" || tierClassification === "TIER 3") ? "blue" : color;
                    tier = `<span style="color: ${color}">${re.classification.tier}</span>`;
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

                let checboxHtml = "";
                if (review) {
                    const checked = "";
                    // if (transcriptFlagChecked && tier !== "-") {
                    //     checked = "checked";
                    // }
                    checboxHtml = `<input type="checkbox" ${checked}>`;
                }
                const editButtonLink = `
                        <button class="btn btn-link reviewButton" data-variant-id="${row.id}">
                            <i class="fa fa-edit icon-padding reviewButton" aria-hidden="true"></i>Edit
                        </button>`;

                // Create the table row
                const hideClass = showArrayIndexes.includes(i) ? "" : `${variantGrid._prefix}${row.id}EvidenceFiltered`;
                const displayStyle = showArrayIndexes.includes(i) ? "" : "display: none";

                // Create the table row
                if (variantGrid.clinicalAnalysis.type.toUpperCase() !== "CANCER") {
                    ctHtml += `
                        <tr class="detail-view-row ${hideClass}" style="${displayStyle}">
                            <td>${geneHtml}</td>
                            <td>${transcriptHtml}</td>
                            <td>${soArray.join("")}</td>
                            <td>${transcriptFlagHtml.join("")}</td>
                            <td>${panel}</td>
                            <td>${moi}</td>
                            <td>${actionable}</td>
                            <td>${acmg}</td>
                            <td>${clinicalSignificance}</td>
                            <td>${tier}</td>
                            ${review ? `<td>${checboxHtml}</td><td>${editButtonLink}</td>` : ""}
                        </tr>`;
                } else {
                    ctHtml += `
                        <tr class="detail-view-row ${hideClass}" style="${displayStyle}">
                            <td>${geneHtml}</td>
                            <td>${transcriptHtml}</td>
                            <td>${soArray.join("")}</td>
                            <td>${transcriptFlagHtml.join("")}</td>
                            <td>${panel}</td>
                            <td>${roleInCancer}</td>
                            <td>${actionable}</td>
                            <td>${tier}</td>
                            ${review ? `<td>${checboxHtml}</td><td>${editButtonLink}</td>` : ""}
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
                let content;
                switch (this.field.config.genotype.type.toUpperCase()) {
                    case "ALLELES":
                        content = VariantInterpreterGridFormatter.alleleGenotypeRenderer(row, sampleEntry, "alleles");
                        break;
                    case "VCF_CALL":
                        content = VariantInterpreterGridFormatter.alleleGenotypeRenderer(row, sampleEntry, "call");
                        break;
                    case "ZYGOSITY":
                        content = VariantInterpreterGridFormatter.zygosityGenotypeRenderer(row, sampleEntry, this.field.clinicalAnalysis);
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
                        if (alleleFreqs && alleleFreqs.ref >= 0 && alleleFreqs.alt >= 0) {
                            content = VariantInterpreterGridFormatter.alleleFrequencyGenotypeRenderer(alleleFreqs.ref, alleleFreqs.alt, file, {width: 80});
                        } else { // Just in case we cannot render freqs, this should never happen.
                            content = VariantInterpreterGridFormatter.alleleGenotypeRenderer(row, sampleEntry);
                        }
                        break;
                    case "CIRCLE":
                        content = VariantInterpreterGridFormatter.circleGenotypeRenderer(sampleEntry, file, 10);
                        break;
                    default:
                        console.error("No valid genotype render option:", this.field.config.genotype.type.toUpperCase());
                        break;
                }

                // Get tooltip text
                const tooltipText = VariantInterpreterGridFormatter._getSampleGenotypeTooltipText(row, sampleEntry, file);
                resultHtml += `<a class="zygositySampleTooltip" tooltip-title="Variant Call Information" tooltip-text='${tooltipText}'>
                                ${content}
                              </a><br>`;
            }
        }

        return resultHtml;
    }

    static vafGenotypeRenderer(vaf, depth, file, config) {
        return `<span>${vaf.toFixed(4)} / ${depth}</span>`;
    }

    static alleleFrequencyGenotypeRenderer(refFreq, altFreq, file, config) {
        const widthPx = config?.width ? config.width : 80;
        const refWidth = Math.max(widthPx * refFreq, 1);
        const refColor = refFreq !== 0 ? "blue" : "black";
        const altWidth = widthPx - refWidth;
        const altColor = altFreq !== 0 ? "red" : "black";
        const opacity = file?.data && file.data.FILTER === "PASS" ? 100 : 60;
        return `<table style="width: ${widthPx}px">
                    <tr>
                        <td style="width: ${refWidth}px; background-color: ${refColor}; border-right: 1px solid white; opacity: ${opacity}%">&nbsp;</td>
                        <td style="width: ${altWidth}px; background-color: ${altColor}; border-right: 1px solid white; opacity: ${opacity}%">&nbsp;</td>
                    </tr>
                </table>`;
    }

    static alleleGenotypeRenderer(variant, sampleEntry, mode) {
        let res = "-";
        if (variant?.studies?.length > 0 && sampleEntry?.data.length > 0) {
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
            for (const allele of allelesArray) {
                switch (allele) {
                    case ".":
                        alleles.push(".");
                        break;
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
                const color = allelesArray[i] === "0" ? "black" : "darkorange";
                allelesHtml.push(`<span style="color: ${color}">${allelesSeq[i]}</span>`);
            }

            const bar = genotype.includes("/") ? "/" : "|";
            res = `<span>${allelesHtml[0]} ${bar} ${allelesHtml[1]}</span>`;
        }
        return res;
    }

    static zygosityGenotypeRenderer(variant, sampleEntry, ca) {
        let res = "-";
        if (variant?.studies?.length > 0 && sampleEntry?.data.length > 0) {
            let sex;
            if (ca.type === "FAMILY") {
                // we need to find the sex of each member of the family
                const individual = ca.family.members.find(m => m.samples[0].id === sampleEntry.sampleId);
                sex = individual.sex;
            } else {
                sex = ca?.proband?.sex !== "UNKOWN" ? ca.proband.sex : "";
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
        }

        // Check if is Pindel by looking to specific sample FORMAT fields
        if (file.data.PC && file.data.VT) {
            const values = {};
            const fields = ["PU", "NU", "PR", "NR"];
            for (const field of fields) {
                const index = variant.studies[0].sampleDataKeys.findIndex(elem => elem === field);
                values[field] = Number.parseInt(sampleEntry.data[index]);
            }
            vaf = (values.PU + values.NU) / (values.PR + values.NR);
            depth = values.PR + values.NR;
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
        }

        return {vaf: vaf, depth: depth};
    }

    static _getAlleleFrequencies(variant, sampleEntry, file) {
        let af, ad, dp,
            afIndex, adIndex, dpIndex,
            refFreq, altFreq;

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
            const adCounts = ad.split(",");
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
        if (!sampleEntry) {
            return "NA";
        }
        // Fetch sampleFormat and file to simplify code
        const sampleFormat = sampleEntry.data;

        // 1. Get INFO fields
        const infoFields = [];
        if (file && file.data) {
            for (const key of Object.keys(file.data)) {
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
            const value = sampleFormat[formatFieldIndex] ? sampleFormat[formatFieldIndex] : "-";
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
                                        <div class="col-md-8">${file?.data.FILTER}</div>
                                    </div>
                                    <div class="form-group" style="margin: 2px 2px">
                                        <label class="col-md-4">File QUAL</label>
                                        <div class="col-md-8">${Number(file?.data.QUAL).toFixed(2)}</div>
                                    </div>
                                    <div class="form-group" style="margin: 2px 2px">
                                        <label class="col-md-4">File VCF call</label>
                                        <div class="col-md-8">${file?.call?.variantId ? file.call.variantId :
                                            `${variant.chromosome}:${variant.start}:${variant.reference}:${variant.alternate}`}
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
                                    ${secondaryAlternates?.length > 0 ? secondaryAlternates.join("") :
                                        `<div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-12">-</label>
                                           </div>`
        }
                                </form>
                             </div>`;
        return tooltipText;
    }

}
