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

export default class VariantInterpreterGridFormatter {

    static roleInCancerFormatter(value, row, index) {
        if (value) {
            const roles = new Set();
            for (const evidence of value) {
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
            }
            const rolesList = Array.from(roles.keys());
            if (rolesList.length > 0) {
                // Do not display more than 'maxDisplayedRoles' roles
                const maxDisplayedRoles = 8;
                if (rolesList.length <= maxDisplayedRoles) {
                    return Array.from(roles.keys()).join("<br>");
                } else {
                    return `
                        <div data-role="roles-list" data-variant-index="${index}">
                            ${rolesList.slice(0, maxDisplayedRoles).join("<br>")}
                            <span data-role="roles-list-extra" style="display:none">
                                ${rolesList.slice(maxDisplayedRoles).join("<br>")}
                            </span>
                            <div style="margin-top:8px;">
                                <a data-role="roles-list-show" style="cursor:pointer;font-size:13px;font-weight:bold;display:block;">
                                    ... show more (${(rolesList.length - maxDisplayedRoles)})
                                </a>
                                <a data-role="roles-list-hide" style="cursor:pointer;font-size:13px;font-weight:bold;display:none;">
                                    show less
                                </a>
                            </div>
                        </div>
                    `;
                }
            }
        }
        return "-";
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
        let clinicalSignificanceTooltipText = "";

        for (const re of row.evidences) {
            if (CLINICAL_SIGNIFICANCE_SETTINGS[re.classification.clinicalSignificance]?.code > clinicalSignificanceCode) {
                clinicalSignificanceCode = CLINICAL_SIGNIFICANCE_SETTINGS[re.classification.clinicalSignificance].code;
                const clinicalSignificance = CLINICAL_SIGNIFICANCE_SETTINGS[re.classification.clinicalSignificance].id;
                clinicalSignificanceHtml = `
                    <div style="margin: 5px 0px; color: ${CLINICAL_SIGNIFICANCE_SETTINGS[re.classification.clinicalSignificance].color}">${clinicalSignificance}</div>
                    <div class="text-body-secondary">${re.classification.acmg.map(acmg => acmg.classification).join(", ")}</div>
                `;
                clinicalSignificanceTooltipText = `<div class='p-1' style='width: 250px;'>
                                                        <div class='row mb-2'>
                                                            <div class='col-6'>ACMG</div>
                                                            <div class='col-6'>${re.classification?.acmg?.join(", ")}</div>
                                                        </div>
                                                        <div class='row mb-2'>
                                                            <div class='col-6'>ACMG Tier</div>
                                                            <div class='col-6'>${re.classification.tier}</div>
                                                        </div>
                                                    </div>`;
            }
        }
        return `<a class='predictionTooltip text-decoration-none' tooltip-title="Classification" tooltip-text="${clinicalSignificanceTooltipText}">
                    ${clinicalSignificanceHtml}
                </a>`;
    }

    /*
    * File attributes formatters
    */
    static reportedEventDetailFormatter(value, row, variantGrid, query, review, config) {
        if (row && row.evidences.length > 0) {
            // Sort and group CTs by Gene name
            BioinfoUtils.sort(row.evidences, v => v.genomicFeature?.geneName);

            // we need to prepare evidences to be filtered properly,
            // the easiest way is to recycle the existing function 'consequenceTypeDetailFormatterFilter',
            // so we need to add consequenceType information
            const transcriptMap = new Map();
            row.annotation.consequenceTypes.forEach(ct => transcriptMap.set(ct.transcriptId, ct));
            const newEvidences = [];
            row.evidences.forEach((evidence, index) => {
                // we are missing regulatory variants
                if (evidence.genomicFeature?.transcriptId) {
                    const newEvidence = {
                        index,
                        ...evidence,
                        ...transcriptMap.get(evidence.genomicFeature.transcriptId)
                    };
                    newEvidences.push(newEvidence);
                }
            });
            const showArrayIndexes = VariantGridFormatter._consequenceTypeDetailFormatterFilter(newEvidences, config).indexes;

            let message = "";
            if (config) {
                // Create two different divs to 'show all' or 'apply filter' title
                message = `<div class="${variantGrid._prefix}${row.id}EvidenceFiltered">Showing <span class='fw-bold' style="color: red">${showArrayIndexes.length}</span> of
                                <span class='fw-bold' style=" color: red">${newEvidences.length}</span> clinical evidences
                                ${showArrayIndexes.length !== newEvidences.length ?
                    `, <a class="link-primary" id="${variantGrid._prefix}${row.id}ShowEvidence" data-id="${row.id}" style="cursor: pointer">show all...</a>` :
                    ""
                }
                            </div>
                            <div class="${variantGrid._prefix}${row.id}EvidenceFiltered" style="display: none">Showing <span class='fw-bold' style="color: red">${newEvidences.length}</span> of
                                <span class='fw-bold' style="color: red">${newEvidences.length}</span> clinical evidences,
                                ${showArrayIndexes.length !== newEvidences.length ?
                    `, <a class="link-primary" id="${variantGrid._prefix}${row.id}HideEvidence" data-id="${row.id}" style="cursor: pointer">apply filters...</a>` :
                    ""
                }
                           </div>
                            `;
            }

            let ctHtml = `<div style="padding-bottom: 5px">${message}</div>
                          <table id="ConsqTypeTable" class="table table-hover table-no-bordered">
            `;

            if (variantGrid.clinicalAnalysis.type.toUpperCase() !== "CANCER") {
                ctHtml += `<thead class="table-light">
                               <tr>
                                   <th rowspan="2" style="padding: 2px 5px">Gene</th>
                                   <th rowspan="2" style="padding: 2px 5px">Transcript</th>
                                   <th rowspan="2" style="padding: 2px 5px">Consequence Type</th>
                                   <th rowspan="2" style="padding: 2px 5px">Transcript Flags</th>
                                   <th rowspan="2" style="padding: 2px 5px">Disease Panel</th>
                                   <th rowspan="2" style="padding: 2px 5px">Automatic<br>Prediction</th>
                                   <th rowspan="1" colspan="${review ? 5 : 3}" style="text-align: center; padding: 5px 5px">User Classification</th>
                               </tr>
                               <tr>
                                   <th rowspan="1" style="padding-top: 5px">ACMG</th>
                                   <th rowspan="1">Tier</th>
                                   ${review ? "<th rowspan=\"1\">Select</th>" : ""}
                                   ${review ? "<th rowspan=\"1\">Edit</th>" : ""}
                               </tr>
                           </thead>
                           <tbody>`;
            } else {
                ctHtml += `<thead class="table-light">
                               <tr>
                                   <th rowspan="2" style="padding: 2px 5px">Gene</th>
                                   <th rowspan="2" style="padding: 2px 5px">Transcript</th>
                                   <th rowspan="2" style="padding: 2px 5px">Consequence Type</th>
                                   <th rowspan="2" style="padding: 2px 5px">Transcript Flags</th>
                                   <th rowspan="2" style="padding: 2px 5px">Disease Panel</th>
                                   <th rowspan="2" style="padding: 2px 5px">Role in Cancer</th>
                                   <th rowspan="2" style="padding: 2px 5px">Automatic<br>Prediction</th>
                                   <th rowspan="1" colspan="${review ? 5 : 3}" style="text-align: center; padding: 5px 5px">User Classification</th>
                               </tr>
                               <tr>
                                    <th rowspan="1" style="padding-top: 5px">ACMG</th>
                                    <th rowspan="1">Tier</th>
                                    ${review ? "<th rowspan=\"1\">Select</th>" : ""}
                                    ${review ? "<th rowspan=\"1\">Edit</th>" : ""}
                               </tr>
                           </thead>
                           <tbody>`;
            }

            for (let i = 0; i < newEvidences.length; i++) {
                const re = newEvidences[i];

                // Prepare data info for columns
                let geneHtml = "-";
                if (re.genomicFeature.geneName) {
                    geneHtml = `
                        <div>
                            <a class="text-decoration-none" href="${BioinfoUtils.getGeneNameLink(re.genomicFeature.geneName)}" target="_blank">
                                ${re.genomicFeature.geneName}
                            </a>
                        </div>
                        <div style="margin: 5px 0px">
                            <a class="text-decoration-none" href="${BioinfoUtils.getGeneLink(re.genomicFeature.id)}" target="_blank">
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
                if (re.genomicFeature.consequenceTypes?.length > 0) {
                    for (const so of re.genomicFeature.consequenceTypes) {
                        const color = CONSEQUENCE_TYPES.style[CONSEQUENCE_TYPES.impact[so.name]] || "black";
                        soArray.push(`<div style="color: ${color}; margin-bottom: 5px">
                                        <span style="padding-right: 5px">${so.name}</span>
                                        <a title="Go to Sequence Ontology ${so.accession} term"
                                            href="${BioinfoUtils.getSequenceOntologyLink(so.accession)}" target="_blank">
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

                let panelHtml = "-";
                if (re.panelId) {
                    // TODO should we fetch the panel from the case instead the study?
                    const panel = variantGrid.opencgaSession?.study?.panels?.find(panel => panel.id === re.panelId);
                    if (panel) {
                        const gene = panel.genes.find(gene => gene.id === re.genomicFeature.geneName || gene.name === re.genomicFeature.geneName);
                        const confidenceColor = gene.confidence === "HIGH" ? "green" : gene.confidence === "MEDIUM" ? "darkorange" : "red";
                        panelHtml = `
                            <div style="margin: 5px 0">
                                ${panel.source?.project?.toUpperCase() === "PANELAPP" ? `
                                    <div>
                                        <a href="${BioinfoUtils.getPanelAppLink(panel.source.id)}" title="Panel ID: ${panel.id}" target="_blank">
                                            ${panel.name} (${panel.source.project} v${panel.source.version})
                                        </a>
                                    </div>` : `
                                        <div style="margin: 5px 0">${panel.id}</div>`
                                }
                            </div>
                            ${gene.modesOfInheritance ? `
                                <div class="text-body-secondary" style="margin: 5px 0" title="Panel Mode of Inheritance of gene ${gene.name}">${gene.modesOfInheritance.join(", ")}</div>
                                ` : ""
                            }
                            ${gene.confidence ? `
                                <div style="color: ${confidenceColor}" title="Panel Confidence of gene ${gene.name}">${gene.confidence}</div>
                                ` : ""
                            }
                        `;
                    } else {
                        panelHtml = re.panelId;
                    }
                }

                let roleInCancer = "-";
                if (re.rolesInCancer) {
                    roleInCancer = re.rolesInCancer
                        .map(v => v.match(/^TUMOR_SUP{1,2}RESSOR_GENE$/) ? "TSG" : v)
                        .join(", ");

                }

                let acmgPrediction = "-";
                if (re.classification?.clinicalSignificance || re.classification?.acmg?.length > 0) {
                    acmgPrediction = `
                        ${re.classification?.clinicalSignificance ? `
                            <div style="margin: 5px 0; color: ${CLINICAL_SIGNIFICANCE_SETTINGS[re.classification.clinicalSignificance].color}">
                                ${CLINICAL_SIGNIFICANCE_SETTINGS[re.classification.clinicalSignificance].id}
                            </div>
                        ` : ""
                    }
                        <div class="text-body-secondary">${re.classification.acmg?.map(acmg => acmg.classification || acmg)?.join(", ")}</div>
                    `;
                }

                // const acmgCustom = re.review?.acmg ? re.review.acmg.join(",") : "-";
                let acmgCustom = "-";
                if (re.review?.clinicalSignificance || re.review?.acmg?.length > 0) {
                    acmgCustom = `
                        ${re.review?.clinicalSignificance ? `
                            <div style="margin: 5px 0; color: ${CLINICAL_SIGNIFICANCE_SETTINGS[re.review.clinicalSignificance].color}">
                                ${CLINICAL_SIGNIFICANCE_SETTINGS[re.review.clinicalSignificance].id}
                            </div>
                        ` : ""
                    }
                        <div class="text-body-secondary">${re.review.acmg?.map(acmg => acmg.classification)?.join(", ")}</div>
                    `;
                }

                let tier = "-";
                let color = "black";
                if (re.review?.tier) {
                    const tierClassification = re.review.tier?.toUpperCase();
                    color = (tierClassification === "TIER1" || tierClassification === "TIER 1") ? "red" : color;
                    color = (tierClassification === "TIER2" || tierClassification === "TIER 2") ? "darkorange" : color;
                    color = (tierClassification === "TIER3" || tierClassification === "TIER 3") ? "blue" : color;
                    tier = `<span style="color: ${color}">${re.review.tier}</span>`;
                }

                const clinicalAnalysis = variantGrid.clinicalAnalysis || {};
                const disabled = (clinicalAnalysis.locked || clinicalAnalysis.interpretation?.locked) ? "disabled" : "";
                // Evidence selected checkbox
                const checboxHtml = `
                    <input
                        type="checkbox"
                        ${re?.review?.select ? "checked" : ""}
                        class="${variantGrid._prefix}EvidenceReviewCheckbox"
                        data-variant-id="${row.id}"
                        data-clinical-evidence-index="${re.index}"
                        ${disabled}>
                `;

                // Evidence edit button
                const editButtonLink = `
                    <button
                        class="btn btn-link ${variantGrid._prefix}EvidenceReviewButton"
                        data-variant-id="${row.id}"
                        data-clinical-evidence-index="${re.index}"
                        ${disabled}>
                        <i class="fa fa-edit icon-padding" aria-hidden="true"></i>Edit
                    </button>
                `;

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
                            <td>${panelHtml}</td>
                            <td>${acmgPrediction}</td>
                            <td>${acmgCustom}</td>
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
                            <td>${panelHtml}</td>
                            <td>${roleInCancer}</td>
                            <td>${acmgPrediction}</td>
                            <td>${acmgCustom}</td>
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
            </table>`;
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
                sex = UtilsNew.isEmpty(individual?.sex) ? "Not specified" : individual.sex?.id || individual.sex;
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
                        <div class="col-8">${file.data[key]}</div>
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
                        <div class="col-8">${value}</div>
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
                <div>
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

    static reviewFormatter(row, index, checked, disabled, prefix, config) {
        // Prepare discussion tooltip text
        let discussionTooltipText = "";
        if (row.discussion?.text) {
            discussionTooltipText = `
                <div style="min-width:200px;">
                    <div>${row.discussion?.text || "-"}</div>
                    <div style="margin-top:6px;">
                        Added by <b>${row.discussion?.author || "-"}</b> on <b>${UtilsNew.dateFormatter(row.discussion?.date)}</b>
                    </div>
                </div>
            `;
        }
        // Prepare comments
        const commentsTooltipText = `
            <div style="min-width:200px;">
                ${(row.comments || []).map(comment => `
                    <div style="padding:4px;">
                        <label>${comment.author} - ${UtilsNew.dateFormatter(comment.date)}</label>
                        <div>${comment.message || "-"}</div>
                    </div>
                `).join("")}
            </div>
        `;

        return `
            <div>
                ${config?.showEditReview ? `
                    <button id="${prefix}${row.id}VariantReviewButton" class="btn btn-link text-decoration-none" style="width:80px" data-index="${index}" data-variant-id="${row.id}" ${disabled}>
                        <i class="fa fa-edit icon-padding" aria-hidden="true"></i>Edit ...
                    </button>
                `: ""}
                ${checked && row?.status ? `
                    <div class="text-body-secondary" style="margin: 5px 0">${row.status}</div>
                ` : ""}
                ${checked && (row.comments?.length > 0 || row.discussion?.text) ? `
                    <div style="">
                        ${row.discussion?.text ? `
                        <a tooltip-title='Discussion' tooltip-text='${discussionTooltipText}' tooltip-position-at="left bottom" tooltip-position-my="right top">
                            <i class="fas fa-comment-alt" style="margin-right:8px;"></i>
                        </a>
                        ` : ""}
                        ${row.comments?.length > 0 ? `
                        <a tooltip-title='Comments' tooltip-text='${commentsTooltipText}' tooltip-position-at="left bottom" tooltip-position-my="right top">
                            <i class="fas fa-comments" style="margin-right:2px;"></i>${row.comments.length}
                        </a>
                        ` : ""}
                    </div>
                ` : ""}
            </div>
        `;
    }

    static rearrangementFeatureOverlapFormatter(variant, genes, opencgaSession) {
        if (variant?.annotation?.consequenceTypes) {
            const overlaps = [];
            (variant.annotation.consequenceTypes || [])
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

            if (overlaps.length > 0) {
                const maxDisplayedOverlaps = 3;
                const separator = `<div style="background-color:currentColor;height:1px;margin-top:6px;margin-bottom:6px;opacity:0.2"></div>`;
                const displayedOverlaps = overlaps.map(overlap => {
                    let geneHtml = "-";
                    if (overlap.geneName) {
                        const tooltip = VariantGridFormatter.getGeneTooltip(overlap.geneName, opencgaSession?.project?.organism?.assembly);
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
                return `
                    <div data-role="gene-feature-overlaps-list">
                        ${displayedOverlaps.slice(0, maxDisplayedOverlaps).join(separator)}
                        <div data-role="gene-feature-overlaps-list-extra" style="display:none">
                            ${separator}
                            ${displayedOverlaps.slice(maxDisplayedOverlaps).join(separator)}
                        </div>
                        <div style="margin-top:8px;display:${overlaps.length > maxDisplayedOverlaps ? "block" : "none"}">
                            <a data-role="gene-feature-overlaps-list-show" style="cursor:pointer;font-size:13px;font-weight:bold;display:block;">
                                ... show more (${(overlaps.length - maxDisplayedOverlaps)})
                            </a>
                            <a data-role="gene-feature-overlaps-list-hide" style="cursor:pointer;font-size:13px;font-weight:bold;display:none;">
                                show less
                            </a>
                        </div>
                    </div>
                `;
            }
        }
        // Nothing to display
        return "-";
    }

    static rearrangementGeneFormatter(variants, genesByVariant, opencgaSession) {
        const separator = `<div style="background-color:currentColor;height:1px;margin-top:4px;margin-bottom:4px;opacity:0.2"></div>`;
        return variants
            .map((variant, index) => {
                let resultHtml = "-";
                const genes = Array.from(genesByVariant[variant.id] || []);

                if (genes.length > 0) {
                    const genesLinks = genes.map(gene => {
                        const tooltip = VariantGridFormatter.getGeneTooltip(gene, opencgaSession?.project?.organism?.assembly);
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

}
