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

import VariantFormatter from "./variant-formatter.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import VariantInterpreterGridFormatter from "./interpretation/variant-interpreter-grid-formatter";
import CustomActions from "../commons/custom-actions.js";
import GridCommons from "../commons/grid-commons.js";
import UtilsNew from "../../core/utils-new.js";


export default class VariantGridFormatter {

    static POPULATION_FREQUENCY_CLASSIFICATION = {
        VERY_RARE: "veryRare",
        RARE: "rare",
        AVERAGE: "average",
        COMMON: "common",
        UNOBSERVED: "unobserved",
    }

    // DEPRECATED: use new consequenceTypes.impact instead
    static assignColors(consequenceTypes, proteinSubstitutionScores) {
        let result = {};
        if (consequenceTypes) {
            const consequenceTypeToColor = {};
            const consequenceTypeToImpact = {};
            for (const category of consequenceTypes.categories) {
                if (category.terms) {
                    for (const term of category.terms) {
                        consequenceTypeToColor[term.name] = consequenceTypes.style[term.impact];
                        consequenceTypeToImpact[term.name] = term.impact;
                    }
                } else {
                    if (category.id && category.name) {
                        consequenceTypeToColor[category.name] = consequenceTypes[category.impact];
                        consequenceTypeToImpact[category.name] = category.impact;
                    }
                }
            }
            result = {
                consequenceTypeToColor: consequenceTypeToColor,
                consequenceTypeToImpact: consequenceTypeToImpact
            };
        }

        if (proteinSubstitutionScores) {
            const pssColor = new Map();
            for (const i in proteinSubstitutionScores) {
                if (Object.prototype.hasOwnProperty.call(proteinSubstitutionScores, i)) {

                    const obj = proteinSubstitutionScores[i];
                    Object.keys(obj).forEach(key => {
                        pssColor.set(key, obj[key]);
                    });
                }
            }
            result.pssColor = pssColor;
        }
        return result;
    }

    static variantIdFormatter(id, variant, index, species = "Homo sapiens", assembly, config = {}) {
        if (!variant) {
            return "";
        }

        // 1. Get the variant ID and snpId
        const variantId = VariantFormatter.variantIdFormatter(id, variant, config?.alleleStringLengthMax || 20);
        const snpIds = (VariantFormatter.snpFormatter(id, variant, index, assembly) || "").split(",").filter(Boolean);

        // 2. get highlight icons
        const iconHighlights = (config?.highlights || [])
            .filter(h => h.active && CustomActions.get(h).execute(variant, h) && h.style?.icon)
            .map(highlight => {
                const description = highlight.description || highlight.name || "";
                const icon = highlight.style.icon;
                const color = highlight.style.iconColor || "";

                return `<i title="${description}" class="fas fa-${icon}" style="color:${color};margin-left:4px;"></i>`;
            });

        // 3. Get cytoband (for structural variants, show first and last)
        const cytobands = variant.annotation?.cytoband || [];
        let cytoband = "";
        if (cytobands.length === 1) {
            cytoband = `${variant.chromosome}${cytobands[0].name}`;
        } else if (cytobands.length > 1) {
            cytoband = `${variant.chromosome}${cytobands[0].name} - ${variant.chromosome}${cytobands[cytobands.length - 1].name}`;
        }

        return `
            <div class="text-nowrap">
                <a class="link" data-action="copy" data-variant="${variant.id}">
                    <i class="far fa-copy pe-2"></i>
                </a>
                <a class="link fw-bold" data-action="view" data-variant="${variant.id}">
                    ${variantId}
                </a>
                ${iconHighlights.join("")}
            </div>
            ${snpIds.length > 0 ? `
                <div class="mt-0">
                    ${snpIds.map(snp => `
                        <a class="small link text-secondary d-flex align-items-center gap-1" href="${BioinfoUtils.getEnsemblLink(snp, "VARIANT", species, assembly)}" target="_blank">
                            <span>${snp}</span>
                            <i class="fa fa-external-link-alt fs-9"></i>
                        </a>
                    `).join("")}
                </div>
            ` : ""}
            ${cytoband ? `
                <div class="mt-0">
                    <i class="fas fa-map-marker-alt small text-secondary me-1" title="Cytoband"></i>
                    <span class="small text-secondary" title="Cytoband">${cytoband}</span>
                </div>
            ` : ""}
        `;
    }

    static geneFormatter(variant, index, query, opencgaSession, gridCtSettings) {
        // FIXME
        if (!variant.annotation) {
            variant.annotation = {
                consequenceTypes: []
            };
        }
        const {selectedConsequenceTypes, notSelectedConsequenceTypes} =
            VariantGridFormatter._consequenceTypeDetailFormatterFilter(variant.annotation.consequenceTypes, gridCtSettings);

        // Keep a map of genes and the SO accessions and names
        const geneHasQueryCt = new Set();
        if (query?.ct) {
            const consequenceTypes = new Set();
            for (const ct of query.ct.split(",")) {
                consequenceTypes.add(ct);
            }

            for (const ct of selectedConsequenceTypes) {
                if (ct.sequenceOntologyTerms.some(so => consequenceTypes.has(so.name))) {
                    geneHasQueryCt.add(ct.geneName);
                }
            }
        }

        if (variant?.annotation?.consequenceTypes?.length > 0) {
            const visited = {};
            const geneLinks = [];
            const geneWithCtLinks = [];
            for (let i = 0; i < variant.annotation.consequenceTypes.length; i++) {
                const geneName = variant.annotation.consequenceTypes[i].geneName;

                // We process Genes just one time
                if (geneName && !visited[geneName]) {
                    let geneViewMenuLink = "";
                    if (opencgaSession.project && opencgaSession.study) {
                        geneViewMenuLink = `
                            <div class='p-1'>
                                <a class='text-decoration-none' style='cursor: pointer' href='#gene/${opencgaSession.project.id}/${opencgaSession.study.id}?id=${geneName}' data-cy='gene-view'>Gene View</a>
                            </div>
                        `;
                    }

                    const tooltipText = `
                        ${geneViewMenuLink}
                        ${this.getGeneTooltip(geneName, this.opencgaSession?.project?.organism?.scientificName, this.opencgaSession?.project?.organism?.assembly)}
                    `;

                    // If query.ct exists
                    if (query?.ct) {
                        // If gene contains one of the query.ct
                        if (geneHasQueryCt.has(geneName)) {
                            geneWithCtLinks.push(
                                `<a class="gene-tooltip text-decoration-none text-nowrap" tooltip-title="Links" tooltip-text="${tooltipText}" style="margin: 5px 2px;">
                                    ${geneName}
                                 </a>`
                            );
                        } else {
                            geneLinks.push(
                                `<a class="gene-tooltip text-decoration-none text-nowrap" tooltip-title="Links" tooltip-text="${tooltipText}" style="margin: 5px 2px;color: darkgray;font-style: italic">
                                    ${geneName}
                                </a>`);
                        }
                    } else {
                        // No query.ct passed
                        geneLinks.push(
                            `<a class="gene-tooltip text-decoration-none text-nowrap" tooltip-title="Links" tooltip-text="${tooltipText}" style="margin: 5px 2px">
                                ${geneName}
                            </a>`);
                    }
                    visited[geneName] = true;
                }
            }

            const maxDisplayedGenes = 5;
            const allGenes = [...geneWithCtLinks, ...geneLinks].map(gene => {
                return `<div>${gene}</div>`;
            });
            return GridCommons.generateExpandCollapseContent(allGenes, maxDisplayedGenes);
        }
        return "-";
    }

    static getGeneTooltip(geneName, species, assembly) {
        return `
            <div class='dropdown-header ps-1 mt-2 mb-1'>
                External Links
            </div>
            <div class='p-1'>
                <a class='text-decoration-none' target='_blank' href='${BioinfoUtils.getEnsemblLink(geneName, "gene", species, assembly)}'>Ensembl</a>
            </div>
            <div class='p-1'>
                <a class='text-decoration-none' target='_blank' href='${BioinfoUtils.getUniprotLink(geneName)}'>UniProt</a>
            </div>
            <div class='p-1' data-cy='varsome-gene-link'>
                <a class='text-decoration-none' target='_blank' href='${BioinfoUtils.getGeneLink(geneName, "varsome", species, assembly)}'>Varsome</a>
            </div>
            <div class='dropdown-header ps-1 mt-2 mb-1'>
                Clinical Resources
            </div>
            <hr class='dropdown-divider'>
            <div class='p-1'>
                <a class='text-decoration-none' target='_blank' href='${BioinfoUtils.getGeneLink(geneName, "decipher")}'>Decipher</a>
            </div>
            <div class='p-1'>
                <a class='text-decoration-none' target='_blank' href='${BioinfoUtils.getGeneLink(geneName, "cosmic", species, assembly)}'>COSMIC</a>
            </div>
            <div class='p-1'>
                <a class='text-decoration-none' target='_blank' href='${BioinfoUtils.getGeneLink(geneName, "omim")}'>OMIM</a>
            </div>
            <div class='p-1'>
                <a class='text-decoration-none' target='_blank' href='${BioinfoUtils.getGeneLink(geneName, "cbioportal")}'>cBioPortal</a>
            </div>
        `;
    }

    static hgvsFormatter(variant, gridConfig, species, assembly) {
        BioinfoUtils.sort(variant.annotation?.consequenceTypes, v => v.geneName);
        const showArrayIndexes = VariantGridFormatter._consequenceTypeDetailFormatterFilter(variant.annotation?.consequenceTypes, gridConfig).indexes;

        if (showArrayIndexes?.length > 0 && variant.annotation.hgvs?.length > 0) {
            const results = [];
            for (const index of showArrayIndexes) {
                const consequenceType = variant.annotation.consequenceTypes[index];
                const hgvsTranscriptIndex = variant.annotation.hgvs.findIndex(hgvs => hgvs.startsWith(consequenceType.transcriptId));
                const hgvsProteingIndex = variant.annotation.hgvs.findIndex(hgvs => hgvs.startsWith(consequenceType.proteinVariantAnnotation?.proteinId));
                if (hgvsTranscriptIndex > -1 || hgvsProteingIndex > -1) {
                    results.push(`
                        <div style="margin: 5px 0">
                            ${VariantGridFormatter.getHgvsLink(consequenceType.transcriptId, variant.annotation.hgvs, species, assembly) || "-"}
                        </div>
                        <div style="margin: 5px 0">
                            ${VariantGridFormatter.getHgvsLink(consequenceType.proteinVariantAnnotation?.proteinId, variant.annotation.hgvs, species, assembly) || "-"}
                        </div>
                    `);
                }
            }
            return results.join("<hr style='margin: 5px'>");
        }
    }

    static vcfFormatter(value, row, field, type = "INFO") {
        if (type.toUpperCase() === "INFO") {
            return row.studies[0].files[0].data[field];
        } else {
            const index = row.studies[0].sampleDataKeys.findIndex(f => f === field);
            return row.studies[0].samples[0].data[index];
        }
    }
    static typeGetColour(value) {
        if (value) {
            let displayLabel = value;
            let color = "";
            switch (value) {
                case "SNP": // Deprecated
                    displayLabel = "SNV";
                    color = "black";
                    break;
                case "INDEL":
                case "CNV": // Deprecated
                case "COPY_NUMBER":
                case "COPY_NUMBER_GAIN":
                case "COPY_NUMBER_LOSS":
                case "MNV":
                    color = "darkorange";
                    break;
                case "SV":
                case "INSERTION":
                case "DELETION":
                case "DUPLICATION":
                case "TANDEM_DUPLICATION":
                case "BREAKEND":
                    color = "red";
                    break;
                default:
                    color = "black";
                    break;
            }
            return {displayLabel, color};
        } else {
            return [];
        }
    }

    static typeFormatter(value) {
        if (value) {
            let color = "";
            switch (value) {
                case "SNP": // Deprecated
                    type = "SNV";
                    color = "black";
                    break;
                case "INDEL":
                case "CNV": // Deprecated
                case "COPY_NUMBER":
                case "COPY_NUMBER_GAIN":
                case "COPY_NUMBER_LOSS":
                case "MNV":
                    color = "darkorange";
                    break;
                case "SV":
                case "INSERTION":
                case "DELETION":
                case "DUPLICATION":
                case "TANDEM_DUPLICATION":
                case "BREAKEND":
                    color = "red";
                    break;
                default:
                    color = "black";
                    break;
            }
            return `<span style="color: ${color}">${value}</span>`;
        } else {
            return "-";
        }
    }

    static consequenceTypeFormatter(value, row, ctQuery, gridCtSettings) {
        if (row?.annotation && row.annotation.consequenceTypes?.length > 0) {
            let {selectedConsequenceTypes, notSelectedConsequenceTypes, indexes} =
                VariantGridFormatter._consequenceTypeDetailFormatterFilter(row.annotation.consequenceTypes, gridCtSettings);

            // If CT is passed in the query then we must make an AND with the selected transcript by the user.
            // This means that only the selectedConsequenceTypes that ARE ALSO IN THE CT QUERY are displayed.
            if (ctQuery) {
                const consequenceTypes = new Set();
                for (const ct of ctQuery.split(",")) {
                    consequenceTypes.add(ct);
                }

                const newSelectedConsequenceTypes = [];
                for (const ct of selectedConsequenceTypes) {
                    if (ct.sequenceOntologyTerms.some(so => consequenceTypes.has(so.name))) {
                        newSelectedConsequenceTypes.push(ct);
                    } else {
                        notSelectedConsequenceTypes.push(ct);
                    }
                }
                selectedConsequenceTypes = newSelectedConsequenceTypes;
            }

            const positiveConsequenceTypes = [];
            const negativeConsequenceTypes = [];
            const soVisited = new Set();
            for (const ct of selectedConsequenceTypes) {
                for (const so of ct.sequenceOntologyTerms) {
                    if (!soVisited.has(so?.name)) {
                        positiveConsequenceTypes.push(`<span style="color: ${CONSEQUENCE_TYPES.style[CONSEQUENCE_TYPES.impact[so.name]] || "black"}">${so.name}</span>`);
                        soVisited.add(so.name);
                    }
                }
            }

            // Print negative SO, if not printed as positive
            let negativeConsequenceTypesText = "";
            if (gridCtSettings.consequenceType.showNegativeConsequenceTypes) {
                for (const ct of notSelectedConsequenceTypes) {
                    for (const so of ct.sequenceOntologyTerms) {
                        if (!soVisited.has(so.name)) {
                            negativeConsequenceTypes.push(`<div style="color: ${CONSEQUENCE_TYPES.style[CONSEQUENCE_TYPES.impact[so.name]] || "black"}; margin: 5px">${so.name}</div>`);
                            soVisited.add(so.name);
                        }
                    }
                }

                if (negativeConsequenceTypes.length > 0) {
                    negativeConsequenceTypesText = `<a tooltip-title="Terms Filtered" tooltip-text='${negativeConsequenceTypes.join("")}'>
                                                        <span style="color: darkgray;font-style: italic">${negativeConsequenceTypes.length} terms filtered</span>
                                                    </a>`;
                }
            }

            return `
                <div>
                    ${positiveConsequenceTypes.join("<br>")}
                </div>
                <div>
                    ${negativeConsequenceTypesText}
                </div>`;
        }
        return "-";
    }

    /* Usage:
        columns: [
            {
                title: "", classes: "", style: "",
                columns: [      // nested column
                    {
                        title: "", classes: "", style: ""
                    }
                ]
            }
        ]

        rows: [
            {values: ["", ""], classes: "", style: ""}
        ]
     */
    static renderTable(id, columns, rows, config) {
        if (!rows || rows.length === 0) {
            return `<span>${config?.defaultMessage ? config.defaultMessage : "No data found"}</span>`;
        }

        let tr = "";
        const nestedColumnIndex = columns.findIndex(col => col.columns?.length > 0);
        if (nestedColumnIndex > -1) {
            let thTop = "";
            let thBottom = "";
            for (const column of columns) {
                if (column.columns?.length > 0) {
                    thTop += `<th rowspan="1" colspan="${column.columns.length}" class="${column.classes ?? ""}" style="text-align: center; ${column.style ?? ""}">${column.title}</th>`;
                    for (const bottomColumn of column.columns) {
                        thBottom += `<th rowspan="1">${bottomColumn.title}</th>`;
                    }
                } else {
                    thTop += `<th rowspan="2" class="${column.classes ?? ""}" style="${column.style ?? ""}">${column.title}</th>`;
                }
            }
            tr += `<tr>${thTop}</tr>`;
            tr += `<tr>${thBottom}</tr>`;
        } else {
            const th = columns.map(column => `<th>${column.title}</th>`).join("");
            tr = `<tr>${th}</tr>`;
        }

        let html = `<table id="${id ? id : null}" class="table ${config?.classes ? config.classes : "table-hover table-no-bordered"}">
                        <thead class="table-light">
                            ${tr}
                        </thead>
                        <tbody>`;
        // Render rows
        for (const row of rows) {
            let td = "";
            for (const value of row.values) {
                td += `<td>${value}</td>`;
            }
            html += `<tr class="${row.classes ?? ""}" style="${row.style ?? ""}">${td}</tr>`;
        }
        html += "</tbody></table>";

        return html;
    }

    static _consequenceTypeManeFilter(cts, bothSources = false) {
        const isMane = ct => {
            const flags = ct.transcriptFlags ?? ct.transcriptAnnotationFlags;
            const hasManeFlag = flags?.includes("MANE Select") || flags?.includes("MANE Plus Clinical");
            return bothSources ? hasManeFlag : ct.source === "ensembl" && hasManeFlag;
        };

        const maneConsequenceTypes = cts.filter(isMane);
        const notManeConsequenceTypes = cts.filter(ct => !isMane(ct));
        const indexes = maneConsequenceTypes.map(ct => cts.indexOf(ct));

        return {maneConsequenceTypes, notManeConsequenceTypes, indexes};
    }

    static _consequenceTypeDetailFormatterFilter(cts, filter) {
        const selectedConsequenceTypes = [];
        const notSelectedConsequenceTypes = [];
        const showArrayIndexes = [];

        const geneSet = filter?.geneSet ? filter.geneSet : {};
        for (let i = 0; i < cts.length; i++) {
            const ct = cts[i];

            // Check if gene source is valid
            let isSourceValid = false;
            if (geneSet["ensembl"] && (!ct.source || ct.source.toUpperCase() === "ENSEMBL")) { // FIXME: Ensembl regulatory CT do not have 'source'
                isSourceValid = true;
            } else {
                if (geneSet["refseq"] && ct.source?.toUpperCase() === "REFSEQ") {
                    isSourceValid = true;
                }
            }
            if (!isSourceValid) {
                // Not a valid source, let's continue to next ct
                continue;
            }

            // TODO Remove in IVA 2.3
            // To keep compatability with CellBase 4
            const transcriptFlags = ct.transcriptFlags ?? ct.transcriptAnnotationFlags;
            let isCtSelected = filter.consequenceType?.all || false;
            if (filter && isCtSelected === false) {
                if (filter.consequenceType.maneTranscript) {
                    isCtSelected = isCtSelected || transcriptFlags?.includes("MANE Select") || transcriptFlags?.includes("MANE Plus Clinical");
                }
                if (filter.consequenceType.ensemblCanonicalTranscript) {
                    isCtSelected = isCtSelected || transcriptFlags?.includes("canonical");
                }
                if (filter.consequenceType.gencodeBasicTranscript) {
                    isCtSelected = isCtSelected || transcriptFlags?.includes("basic");
                }
                if (filter.consequenceType.ccdsTranscript) {
                    isCtSelected = isCtSelected || transcriptFlags?.includes("CCDS");
                }
                if (filter.consequenceType.lrgTranscript) {
                    isCtSelected = isCtSelected || transcriptFlags?.includes("LRG");
                }
                if (filter.consequenceType.ensemblTslTranscript) {
                    isCtSelected = isCtSelected || transcriptFlags?.includes("TSL:1");
                }
                if (filter.consequenceType.illuminaTSO500Transcript) {
                    isCtSelected = isCtSelected || transcriptFlags?.includes("TSO500");
                }
                if (filter.consequenceType.eglhHaemoncTranscript) {
                    isCtSelected = isCtSelected || transcriptFlags?.includes("EGLH_HaemOnc");
                }
                if (filter.consequenceType.proteinCodingTranscript && ct.biotype === "protein_coding") {
                    isCtSelected = isCtSelected || ct.biotype === "protein_coding";
                }
                if (filter.consequenceType.highImpactConsequenceTypeTranscript) {
                    for (const so of ct.sequenceOntologyTerms) {
                        const impact = CONSEQUENCE_TYPES?.impact[so.name]?.toUpperCase();
                        isCtSelected = isCtSelected || impact === "HIGH" || impact === "MODERATE";
                    }
                }
            }
            // Check if the CT satisfy any condition
            if (isCtSelected) {
                showArrayIndexes.push(i);
                selectedConsequenceTypes.push(ct);
            } else {
                notSelectedConsequenceTypes.push(ct);
            }
        }
        return {
            selectedConsequenceTypes: selectedConsequenceTypes,
            notSelectedConsequenceTypes: notSelectedConsequenceTypes,
            indexes: showArrayIndexes
        };
    }

    static getHgvsLink(id, hgvsArray, species = "hsapiens", assembly = "GRCh38") {
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
            let link;
            if (hgvs.includes(":p.")) {
                link = BioinfoUtils.getProteinLink(split[0], null, species, assembly);
            } else {
                link = BioinfoUtils.getTranscriptLink(split[0], null, species, assembly);
            }

            return `<a href="${link}" target="_blank">${split[0]}</a>:<span style="font-weight:bold">${split[1]}</span>`;
        } else {
            if (id.startsWith("ENST") || id.startsWith("NM_") || id.startsWith("NR_")) {
                return `<a href=${BioinfoUtils.getTranscriptLink(id, null, species, assembly)} target="_blank">${id}</a>`;
            } else {
                return `<a href=${BioinfoUtils.getProteinLink(id, null, species, assembly)} target="_blank">${id}</a>`;
            }
        }
    }

    static toggleDetailConsequenceType(e) {
        const id = e.target.dataset.id;
        const elements = document.getElementsByClassName(this._prefix + id + "Filtered");
        for (const element of elements) {
            if (element.style.display === "none") {
                element.style.display = "";
            } else {
                element.style.display = "none";
            }
        }
    }

    static consequenceTypeDetailFormatter(value, row, variantGrid, query, filter, species, assembly) {
        if (row?.annotation?.consequenceTypes && row.annotation.consequenceTypes.length > 0) {
            // Sort and group CTs by Gene name
            BioinfoUtils.sort(row.annotation.consequenceTypes, v => v.geneName);

            const showArrayIndexes = VariantGridFormatter._consequenceTypeDetailFormatterFilter(row.annotation.consequenceTypes, filter).indexes;
            let message = "";
            if (filter) {
                // Create two different divs to 'show all' or 'apply filter' title
                message = `<div class="${variantGrid._prefix}${row.id}Filtered">
                                Showing <span style="font-weight: bold; color: red">${showArrayIndexes.length}</span> of
                                <span style="font-weight: bold; color: red">${row.annotation.consequenceTypes.length}</span> consequence types,
                                <a class="link-primary" id="${variantGrid._prefix}${row.id}ShowCt" data-id="${row.id}" style="cursor: pointer">show all...</a>
                            </div>
                            <div class="${variantGrid._prefix}${row.id}Filtered" style="display: none">
                                Showing <span style="font-weight: bold; color: red">${row.annotation.consequenceTypes.length}</span> of
                                <span style="font-weight: bold; color: red">${row.annotation.consequenceTypes.length}</span> consequence types,
                                <a class="link-primary" id="${variantGrid._prefix}${row.id}HideCt" data-id="${row.id}" style="cursor: pointer">apply filters...</a>
                            </div>
                            `;
            }

            let ctHtml = `<div style="padding-bottom: 5px">
                              ${message}
                          </div>
                          <table id="ConsqTypeTable" class="table table-hover table-no-bordered">
                              <thead class="table-light">
                                  <tr>
                                      <th rowspan="2">Gene</th>
                                      <th rowspan="2">Transcript</th>
                                      <th rowspan="2">Consequence Type</th>
                                      <th rowspan="2">Transcript Flags</th>
                                      <th rowspan="1" colspan="4" style="text-align: center; padding-top: 5px; padding-right: 2px">Transcript Variant Annotation</th>
                                      <th rowspan="1" colspan="4" style="text-align: center; padding-top: 5px">Protein Variant Annotation</th>
                                  </tr>
                                  <tr style="margin: 5px">
                                      <th rowspan="1" style="padding-top: 5px">cDNA / CDS</th>
                                      <th rowspan="1">Codon</th>
                                      <th rowspan="1" style="">Exon (%)</th>
                                      <th rowspan="1" style="padding-right: 20px">SpliceAI</th>
                                      <th rowspan="1">UniProt Acc</th>
                                      <th rowspan="1">Position</th>
                                      <th rowspan="1">Ref/Alt</th>
                                      <th rowspan="1">Domains</th>
                                  </tr>
                              </thead>
                              <tbody>`;

            for (let i = 0; i < row.annotation.consequenceTypes.length; i++) {
                const ct = row.annotation.consequenceTypes[i];

                // Keep backward compatibility with old ensemblGeneId and ensemblTranscriptId
                const source = ct.source || "ensembl";
                const geneId = ct.geneId || ct.ensemblGeneId;
                const transcriptId = ct.transcriptId || ct.ensemblTranscriptId;
                const geneIdLink = `${BioinfoUtils.getGeneLink(geneId, source, species, assembly)}`;
                const ensemblTranscriptIdLink = `${BioinfoUtils.getTranscriptLink(transcriptId, source, species, assembly)}`;

                // Prepare data info for columns
                const geneName = ct.geneName ? `<a href="${BioinfoUtils.getGeneNameLink(ct.geneName)}" target="_blank">${ct.geneName}</a>` : "-";

                const geneIdLinkHtml = geneId ? `<a href="${geneIdLink}" target="_blank">${geneId}</a>` : "";
                const geneHtml = `
                    <div>${geneName}</div>
                    <div style="margin: 5px 0px">${geneIdLinkHtml}</div>
                `;

                const transcriptIdHtml = `
                    <div>
                        <span>${ct.biotype ? ct.biotype : "-"}</span>
                    </div>
                    <div style="margin: 5px 0px">
                        <span>
                            ${transcriptId ? `
                                <div style="margin: 5px 0px">
                                    ${VariantGridFormatter.getHgvsLink(transcriptId, row.annotation.hgvs, species, assembly) || ""}
                                </div>
                                <div style="margin: 5px 0px">
                                    ${VariantGridFormatter.getHgvsLink(ct?.proteinVariantAnnotation?.proteinId, row.annotation.hgvs, species, assembly) || ""}
                                </div>
                            ` : ""}
                        </span>
                    </div>
                `;

                const soArray = [];
                for (const so of ct.sequenceOntologyTerms) {
                    const color = CONSEQUENCE_TYPES.style[CONSEQUENCE_TYPES.impact[so.name]] || "black";
                    const soUrl = `${BioinfoUtils.getSequenceOntologyLink(so.accession)}`;
                    const soTitle = `Go to Sequence Ontology ${so.accession} term`;
                    soArray.push(`
                        <div style="color: ${color}; margin-bottom: 5px">
                            <span style="padding-right: 5px">${so.name}</span>
                            <a title="${soTitle}" href="${soUrl}" target="_blank">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        </div>
                    `);
                }

                let transcriptFlags = ["-"];
                if (transcriptId && (ct.transcriptFlags?.length > 0 || ct.transcriptAnnotationFlags?.length > 0)) {
                    transcriptFlags = ct.transcriptFlags ?
                        ct.transcriptFlags.map(flag => `<div style="margin-bottom: 5px">${flag}</div>`) :
                        ct.transcriptAnnotationFlags.map(flag => `<div style="margin-bottom: 5px">${flag}</div>`);
                }

                let exons = ["-"];
                if (ct.exonOverlap && ct.exonOverlap.length > 0) {
                    exons = ct.exonOverlap.map(exon => `
                        <div>
                            <span>${exon.number}</span>
                        </div>
                        ${exon?.percentage ? `
                            <div>
                                <span class="d-block text-secondary" style="margin: 2px 0px">${exon?.percentage.toFixed(2) ?? "-"}%</span>
                            </div>` :
                        ""}
                    `);
                }

                let spliceAIScore = "-";
                if (ct.spliceScores?.length > 0) {
                    const spliceAi = ct.spliceScores.find(ss => ss.source.toUpperCase() === "SPLICEAI");
                    if (spliceAi) {
                        const keys = ["DS_AG", "DS_AL", "DS_DG", "DS_DL"];
                        const max = Math.max(spliceAi.scores["DS_AG"], spliceAi.scores["DS_AL"], spliceAi.scores["DS_DG"], spliceAi.scores["DS_DL"]);
                        const index = [spliceAi.scores[keys[0]], spliceAi.scores[keys[1]], spliceAi.scores[keys[2]], spliceAi.scores[keys[3]]].findIndex(e => e === max);

                        const color = (max >= 0.8) ? "red" : (max >= 0.5) ? "darkorange" : "black";
                        spliceAIScore = `
                            <div>
                                <span style="color: ${color}">${max} (${keys[index]})</span>
                            </div>
                        `;
                    }
                }

                const pva = ct.proteinVariantAnnotation ? ct.proteinVariantAnnotation : {};
                let uniprotAccession = "-";
                if (pva.uniprotAccession) {
                    uniprotAccession = `
                        <div style="margin: 5px 0px">
                            <span><a href="${BioinfoUtils.getUniprotLink(pva.uniprotAccession)}" target="_blank">${pva.uniprotAccession}</a></span>
                        </div>
                        ${pva.uniprotVariantId ? `
                            <div>
                                <span class="d-block text-secondary" style="margin: 0px">${pva.uniprotVariantId}</span>
                            </div>` :
                        ""}
                    `;
                }

                let domains = `<a class="ct-protein-domain-tooltip" tooltip-title='Info' tooltip-text='No protein domains found' tooltip-position-at="left bottom" tooltip-position-my="right top">
                                    <i class='fa fa-times' style='color: gray'></i>
                               </a>`;
                if (pva.features) {
                    let tooltipText = "";
                    const visited = new Set();
                    for (const feature of pva.features) {
                        if (feature.id && !visited.has(feature.id)) {
                            visited.add(feature.id);
                            tooltipText += `
                                <div>
                                    <span style="font-weight: bold; margin: 5px">${feature.id}</span><span class="d-block text-secondary" style="margin: 5px">${feature.description}</span>
                                </div>
                            `;
                        }
                    }
                    domains = `<a class="ct-protein-domain-tooltip" tooltip-title='Links' tooltip-text='${tooltipText}' tooltip-position-at="left bottom" tooltip-position-my="right top">
                                    <i class='fa fa-check' style='color: green'></i>
                               </a>`;
                }

                // Create the table row
                const hideClass = showArrayIndexes.includes(i) ? "" : `${variantGrid._prefix}${row.id}Filtered`;
                const displayStyle = showArrayIndexes.includes(i) ? "" : "display: none";
                ctHtml += `<tr class="detail-view-row ${hideClass}" style="${displayStyle}">
                                <td>${geneHtml}</td>
                                <td>${transcriptIdHtml}</td>
                                <td>${soArray.join("")}</td>
                                <td>${transcriptFlags.join("")}</td>

                                <td>${ct.cdnaPosition || "-"} / ${ct.cdsPosition || "-"}</td>
                                <td>${ct.codon || "-"}</td>
                                <td>${exons.join("<br>")}</td>
                                <td>${spliceAIScore}</td>

                                <td>${uniprotAccession}</td>
                                <td>${pva.position !== undefined ? pva.position : "-"}</td>
                                <td>${pva.reference !== undefined ? pva.reference + "/" + pva.alternate : "-"}</td>
                                <td>${domains}</td>
                           </tr>`;
            }
            ctHtml += "</tbody></table>";
            return ctHtml;
        }
        return "-";
    }

    static siftPproteinScoreFormatter(value, row, consequenceTypeColors) {
        let min = 10;
        let description = "";
        if (row && row.annotation?.consequenceTypes?.length > 0) {
            for (let i = 0; i < row.annotation.consequenceTypes.length; i++) {
                if (row.annotation.consequenceTypes[i]?.proteinVariantAnnotation?.substitutionScores) {
                    for (let j = 0; j < row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores.length; j++) {
                        const substitutionScore = row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j];
                        if (substitutionScore.source === "sift" && substitutionScore.score < min) {
                            min = substitutionScore.score;
                            description = substitutionScore.description;
                        }
                    }
                }
            }
        }

        if (min < 10) {
            return `<span style="color: ${consequenceTypeColors?.pssColor.get("sift")[description]}" title=${min}>${description}</span>`;
        }
        return "-";
    }

    static polyphenProteinScoreFormatter(value, row, consequenceTypeColors) {
        let max = 0;
        let description = "";
        if (row && row.annotation?.consequenceTypes?.length > 0) {
            for (let i = 0; i < row.annotation.consequenceTypes.length; i++) {
                if (row.annotation.consequenceTypes[i]?.proteinVariantAnnotation?.substitutionScores) {
                    for (let j = 0; j < row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores.length; j++) {
                        const substitutionScore = row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j];
                        if (substitutionScore.source === "polyphen" && substitutionScore.score >= max) {
                            max = substitutionScore.score;
                            description = substitutionScore.description;
                        }
                    }
                }
            }
        }

        if (max > 0) {
            return `<span style="color: ${consequenceTypeColors?.pssColor.get("polyphen")[description]}" title=${max}>${description}</span>`;
        }
        return "-";
    }

    static revelProteinScoreFormatter(value, row, index) {
        let max = 0;
        if (row && row.annotation?.consequenceTypes?.length > 0) {
            for (let i = 0; i < row.annotation.consequenceTypes.length; i++) {
                if (row.annotation.consequenceTypes[i]?.proteinVariantAnnotation?.substitutionScores) {
                    for (let j = 0; j < row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores.length; j++) {
                        const substitutionScore = row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j];
                        if (substitutionScore.source === "revel" && substitutionScore.score >= max) {
                            max = substitutionScore.score;
                        }
                    }
                }
            }
        }

        if (max > 0) {
            return `<span style="color: ${max > 0.5 ? "darkorange" : "black"}" title=${max}>${max}</span>`;
        }
        return "-";
    }

    static caddScaledFormatter(value, row, index) {
        if (row && row.type !== "INDEL" && row.annotation?.functionalScore?.length > 0) {
            for (const functionalScore of row.annotation.functionalScore) {
                if (functionalScore.source === "cadd_scaled") {
                    const value = Number(functionalScore.score).toFixed(2);
                    if (value < 15) {
                        return value;
                    } else {
                        return "<span style=\"color: red\">" + value + "</span>";
                    }
                }
            }
        } else {
            return "-";
        }
    }

    static spliceAIFormatter(value, row) {
        if (row.annotation.consequenceTypes?.length > 0) {
            // We need to find the max Delta Score:
            //      Delta score of a variant, defined as the maximum of (DS_AG, DS_AL, DS_DG, DS_DL),
            //      ranges from 0 to 1 and can be interpreted as the probability of the variant being splice-altering.
            let dscore = 0;
            let spliceAiScores = [];
            let transcriptId;
            for (const ct of row.annotation.consequenceTypes) {
                if (ct.spliceScores?.length > 0) {
                    const spliceAi = ct.spliceScores.find(ss => ss.source.toUpperCase() === "SPLICEAI");
                    if (spliceAi) {
                        const max = Math.max(spliceAi.scores["DS_AG"], spliceAi.scores["DS_AL"], spliceAi.scores["DS_DG"], spliceAi.scores["DS_DL"]);
                        if (max > dscore) {
                            dscore = max;
                            spliceAiScores = spliceAi.scores;
                            transcriptId = ct.transcriptId;
                        }
                    }
                }
            }

            // const color = VariantGridFormatter.spliceAIColor(dscore);
            // <div>
            //     <span title="${transcriptId || "not found"}" style="color: ${color}; font-weight: bold;">${dscore || "-"}</span>
            // </div>
            const hasScores = spliceAiScores["DS_AG"] != null;
            return `
                ${hasScores ? `
                    <div class="text-secondary my-1"
                         title="Transcript: ${transcriptId || "not found"}&#10;&#10;Delta Positions:&#10;  AG: ${spliceAiScores["DP_AG"]}&#10;  AL: ${spliceAiScores["DP_AL"]}&#10;  DG: ${spliceAiScores["DP_DG"]}&#10;  DL: ${spliceAiScores["DP_DL"]}">
                        <div class="text-nowrap" style="color: ${VariantGridFormatter.spliceAIColor(spliceAiScores["DS_AG"])}">AG: ${spliceAiScores["DS_AG"]}</div>
                        <div class="text-nowrap" style="color: ${VariantGridFormatter.spliceAIColor(spliceAiScores["DS_AL"])}">AL: ${spliceAiScores["DS_AL"]}</div>
                        <div class="text-nowrap" style="color: ${VariantGridFormatter.spliceAIColor(spliceAiScores["DS_DG"])}">DG: ${spliceAiScores["DS_DG"]}</div>
                        <div class="text-nowrap" style="color: ${VariantGridFormatter.spliceAIColor(spliceAiScores["DS_DL"])}">DL: ${spliceAiScores["DS_DL"]}</div>
                    </div>
                ` : ""}
            `;
        } else {
            return "-";
        }
    }

    static spliceAIColor(dscore) {
        if (dscore >= 0.8) {
            return "red";
        }
        if (dscore >= 0.5) {
            return "darkorange";
        }
        if (dscore >= 0.2) {
            return "goldenrod";
        }
        return "black";
    }

    static populationFrequenciesInfoTooltipContent(populationFrequencies) {
        return `
            One coloured square is shown for each population. Frequencies are coded with colours which classify values
            into 'very rare', 'rare', 'average', 'common' or 'missing', see
            <a href='https://www.nature.com/scitable/topicpage/multifactorial-inheritance-and-genetic-disease-919' target='_blank'>
                https://www.nature.com/scitable/topicpage/multifactorial-inheritance-and-genetic-disease-919
            </a>. Please, leave the cursor over each square to display the actual frequency values. <br>
            <span style='font-weight: bold'>Note that that all frequencies are percentages.</span>
            <div style='padding: 10px 0px 0px 0px'><label>Legend: </label></div>
            <div><span><i class='fa fa-square' style='color: ${populationFrequencies.style.veryRare}' aria-hidden='true'></i> Very rare:  freq < 0.1 %</span></div>
            <div><span><i class='fa fa-square' style='color: ${populationFrequencies.style.rare}' aria-hidden='true'></i> Rare:  freq < 0.5 %</span></div>
            <div><span><i class='fa fa-square' style='color: ${populationFrequencies.style.average}' aria-hidden='true'></i> Average:  freq < 5 %</span></div>
            <div><span><i class='fa fa-square' style='color: ${populationFrequencies.style.common}' aria-hidden='true'></i> Common:  freq >= 5 %</span></div>
            <div><span><i class='fa fa-square' style='color: black' aria-hidden='true'></i> Not observed</span></div>
        `;
    }
    static interpretationSummaryTooltipContent() {
        return `
            The Variant Interpretation summary presents key information about the variant’s clinical interpretation within the case.
            It is shown only when the variant is classified as a Primary or Secondary Finding in a clinical context.
            Supporting information — including evidences, status, or number of publications or images among others —
            is also visualized here, and can be further explored in the Variant Review modal.
        `;
    }

    static transcriptsSummaryTooltipContent() {
        return `
            Consequence types linked to transcripts flagged as MANE-selected and source Ensembl.
        `;
    }

    static variantInfoSummaryTooltipContent() {
        return `
            Description of variant info.
        `;
    }

    static clinicalSignificanceSummaryTooltipContent() {
        return `
            Clinical significance in the consequence types evidences.
        `;
    }

    static csClinvarSummaryTooltipContent() {
        return `
            ClinVar variant traits by clinical significance and germline review stars.
        `;
    }

    static qualitySummaryTooltipContent() {
        return `
        The Sample Quality summary provides a clear overview of variant quality across all sequenced individuals in a case
        to help assess the variant reliability and review evidences effectively.<br>
        The table on the left-hand side, includes information about:
        <ul>
            <li>
                <b>Genotype / Zygosity:</b> Called genotype (e.g., het, hom, hemi).
            </li>
            <li>
                <b>Read Depth (DP):</b> Total reads covering the site — higher means stronger support.
            </li>
            <li>
                <b>Genotype Quality (GQ):</b> Confidence in the genotype call — low values may indicate uncertainty.
            </li>
            <li>
                <b>Allelic Depth (AD):</b> Reads supporting reference vs. alternate alleles — imbalance may suggest noise or mosaicism.
            </li>
            <li>
                <b>Variant Allele Fraction (EXT_VAF):</b>Fraction of reads carrying the alternate allele.
            </li>
            <li>
                <b>Quality (QUAL) / Filter (FILTER):</b> Overall variant quality and applied filters.
            </li>
        </ul>
        The pichart on the right-hand side shows the proportion of reads supporting the reference (REF)
        and alternate (ALT) alleles in the proband. Balanced 50:50 suggest a reliable heterozygous call,
        where strong imbalance may indicate sequencing or alignment issues.
        `;
    }

    static populationFrequenciesSummaryTooltipContent(populationFrequencies) {
        return `
            Variant alt allele frequency distributions for population frequencies projects 1000G and gnomAD_GENOMES.
            Each coloured arc segment represents the proportion of sub-populations per project classified as 'very rare', 'rare', 'average', 'common' or 'missing' (see
            <a href='https://www.nature.com/scitable/topicpage/multifactorial-inheritance-and-genetic-disease-919' target='_blank'>
                https://www.nature.com/scitable/topicpage/multifactorial-inheritance-and-genetic-disease-919
            </a>). Please, leave the cursor over each arc to display the actual sub-populations. <br>
            <div style='padding: 10px 0px 0px 0px'><label>Legend: </label></div>
            <div><span><i class='fa fa-square' style='color: ${populationFrequencies.style.veryRare}' aria-hidden='true'></i> Very rare:  freq < 0.1 %</span></div>
            <div><span><i class='fa fa-square' style='color: ${populationFrequencies.style.rare}' aria-hidden='true'></i> Rare:  freq < 0.5 %</span></div>
            <div><span><i class='fa fa-square' style='color: ${populationFrequencies.style.average}' aria-hidden='true'></i> Average:  freq < 5 %</span></div>
            <div><span><i class='fa fa-square' style='color: ${populationFrequencies.style.common}' aria-hidden='true'></i> Common:  freq >= 5 %</span></div>
            <div><span><i class='fa fa-square' style='color: black' aria-hidden='true'></i> Not observed</span></div>
        `;
    }

    static conservationTooltipSummaryContent() {
        return `
            <div class="">
                <strong>Thresholds for each qualitative description:</strong>
                <ul style="padding-left: 20px; margin-top: 5px;">
                    <li><b>GERP++:</b> Low for scores ≤ 3, Moderate for scores &gt; 3, and High for scores &gt; 4.4.</li>
                    <li><b>PhastCons:</b> Low for scores ≤ 0.5, Moderate for scores &gt; 0.5, and High for scores &gt; 0.9.</li>
                    <li><b>Phylop:</b> Low for scores ≤ 0.5, Moderate for scores &gt; 0.5, and High for scores &gt; 1.5.</li>
                </ul>
            </div>
        `;
    }

    static deleteriousTooltipSummaryContent(chartDelId) {
        return `
            <div class="">
                Deleterious scores linked to transcripts flagged as MANE-selected and source Ensembl<br>. <strong>Thresholds for each qualitative description:</strong>
                <ul style="padding-left: 20px; margin-top: 5px;">
                    <li><b>SIFT:</b> Deleterious for scores &le; 0.05, Tolerated for scores &gt; 0.05</li>
                    <li><b>PolyPhen-2:</b> Probably damaging for scores &gt; 0.85, Possibly damaging for scores &gt; 0.15, and Benign otherwise.</li>
                    <li><b>REVEL:</b> Likely pathogenic for scores &ge; 0.75, Potentially pathogenic for scores &ge; 0.5, and Benign otherwise.</li>
                    <li><b>CADD Scaled:</b> Top 0.1% for scores &ge; 30, Top 1% for scores &gt; 20, Top 5% for scores &ge; 15, Top 10% for scores &ge; 10, and Bottom 90% for scores &lt; 10.</li>
                    <li><b>SpliceAI:</b> High for scores &ge; 0.8, Moderate for scores &ge; 0.5, and Low otherwise</li>
                </ul>
            </div>
        `;
    }

    static getDeleteriousPredictorDisplayName(key) {
        const deleteriousPredictorDisplay = {
            "sift": "SIFT",
            "polyphen": "PolyPhen-2",
            "revel": "REVEL",
            "cadd_scaled": "CADD Scaled", // changed to underscore if your keys have underscores
            "spliceai": "SpliceAI"
        };
        return deleteriousPredictorDisplay[key] ?? key;
    }

    static getPopulationFrequenciesTooltip(populations, populationFrequenciesMap, populationFrequenciesColor) {
        const tooltipRows = (populations || []).map(population => {
            const popFreq = populationFrequenciesMap.get(population) || null;
            const altFreq = popFreq?.altAlleleFreq?.toPrecision(4) || 0;
            const altCount = popFreq?.altAlleleCount || 0;

            // TASK-5854: Check if altHomGenotypeFreq (population freqs) or genotypeFreq (cohort stats)
            const homAltFreq = popFreq?.altHomGenotypeFreq?.toPrecision(4) ?? popFreq?.genotypeFreq?.["1/1"]?.toPrecision(4) ?? 0;
            const homAltCount = popFreq?.altHomGenotypeCount ?? popFreq?.genotypeCount?.["1/1"] ?? 0;
            const color = VariantGridFormatter.getPopulationFrequencyColor(altFreq, populationFrequenciesColor);
            let altFreqText = "";
            let homAltFreqText = "";

            // ALT freq tell us if the VARIANT has been OBSERVED.
            if (altFreq > 0) {
                altFreqText = `${altFreq || "-"} / ${altCount} (${altFreq > 0 ? (altFreq * 100).toPrecision(4) + "%" : "-"})`;
                homAltFreqText = `${homAltFreq > 0 ? homAltFreq : "-"} / ${homAltCount} ${homAltFreq > 0 ? `(${(homAltFreq * 100).toPrecision(4)} %)` : ""}`;
            } else {
                altFreqText = "<span style='font-style: italic'>Not Observed</span>";
                homAltFreqText = "<span style='font-style: italic'>Not Observed</span>";
            }

            return `
                <tr style='border-top:1px solid #ededed;'>
                    <td style='width:140px;padding:8px 8px 8px 0;'>
                        <i class='fa fa-xs fa-square' style='color: ${color}' aria-hidden='true'></i>
                        <label style='padding-left: 5px;'>${population}</label>
                    </td>
                    <td style='font-weight:bold;padding:8px 8px 8px 0;'>${altFreqText}</td>
                    <td style='font-weight:bold;padding:8px 0 8px 0;'>${homAltFreqText}</td>
                </td>
            `;
        });

        return `
            <table class='population-freq-tooltip'>
                <thead>
                    <tr>
                        <th style='padding:0 8px 8px 0;'>Population</th>
                        <th style='min-width:100px;padding:0 8px 8px 0;'>Allele ALT<br><span style='font-style: italic'>Freq / Count (%)</span></th>
                        <th style='min-width:100px;padding:0 0 8px 0;'>Genotype HOM_ALT<br><span style='font-style: italic'>Freq / Count (%)</span></th>
                    </tr>
                </thead>
                <tbody>${tooltipRows.join("")}</tbody>
            </table>
        `;
    }

    // Creates the colored table with one row and as many columns as populations.
    static renderPopulationFrequencies(populations, populationFrequenciesMap, populationFrequenciesColor = {}, populationFrequenciesConfig = {}) {
        // NOTE: FREQUENCY_NUMBER is now deprecated, so we will use FREQUENCY_BOX instead
        const displayMode = populationFrequenciesConfig?.displayMode || "FREQUENCY_BOX";

        if (displayMode === "FREQUENCY_COMPACT") {
            const onlyCohortAll = populations.length === 1 && populations[0].toUpperCase() === "ALL";

            // 1. initialize map with the available classifications
            const classificationsMap = new Map();
            Object.values(VariantGridFormatter.POPULATION_FREQUENCY_CLASSIFICATION).forEach(key => {
                classificationsMap.set(key, {
                    classification: key,
                    color: populationFrequenciesColor[key] || "black",
                    populations: [],
                });
            });

            // 2. initialize the variable to save the classification of the population ALL
            const allPopulationTooltip = VariantGridFormatter.getPopulationFrequenciesTooltip(populations, populationFrequenciesMap, populationFrequenciesColor);
            let allPopulationClassification = VariantGridFormatter.POPULATION_FREQUENCY_CLASSIFICATION.UNOBSERVED;

            // 3. fill the map with populations
            (populations || []).forEach(population => {
                let classification = VariantGridFormatter.POPULATION_FREQUENCY_CLASSIFICATION.UNOBSERVED;
                if (typeof populationFrequenciesMap.get(population) !== "undefined") {
                    const freq = populationFrequenciesMap.get(population).altAlleleFreq || 0;
                    classification = VariantGridFormatter.getPopulationFrequencyClassification(freq);
                }
                if (population.toUpperCase() === "ALL") {
                    allPopulationClassification = classification;
                } else {
                    // add population to the corresponding classification
                    classificationsMap.get(classification).populations.push(population);
                }
            });

            // 4. render the html of the compact view
            return `
                <div class="d-flex justify-content-center align-items-center user-select-none gap-1">
                    <a tooltip-title="Population Frequencies" tooltip-text="${allPopulationTooltip}" tooltip-position-my="top right">
                        <div class="px-2 py-1 rounded" style="background-color:${populationFrequenciesColor[allPopulationClassification]};">
                            <span class="small text-white fw-bold">ALL</span>
                        </div>
                    </a>
                    ${!onlyCohortAll ? `
                        <div class="d-flex rounded overflow-hidden" style="gap:1px;">
                            ${Array.from(classificationsMap.values()).map(entry => {
                if (entry.populations.length > 0) {
                    const tooltip = VariantGridFormatter.getPopulationFrequenciesTooltip(entry.populations, populationFrequenciesMap, populationFrequenciesColor);
                    return `
                                        <a tooltip-title="Population Frequencies" tooltip-text="${tooltip}" tooltip-position-my="top right">
                                            <div class="px-1 py-1 text-center" style="background-color:${entry.color};min-width:26px;">
                                                <span class="small text-white fw-bold">${entry.populations.length}</span>
                                            </div>
                                        </a>
                                    `;
                } else {
                    return `
                                        <div class="px-1 py-3 cursor-not-allowed" style="background-color:${entry.color};min-width:26px;opacity:0.25;"></div>
                                    `;
                }
            }).join("")}
                        </div>
                    ` : ""}
                </div>
            `;
        } else {
            const tooltip = VariantGridFormatter.getPopulationFrequenciesTooltip(populations, populationFrequenciesMap, populationFrequenciesColor);
            return `
                <a tooltip-title="Population Frequencies" tooltip-text="${tooltip}" tooltip-position-my="top right">
                    <div class="d-flex justify-content-center align-items-center">
                        <div class="d-flex rounded overflow-hidden" style="gap:1px;">
                            ${populations.map(population => {
                let color = "black";
                if (typeof populationFrequenciesMap.get(population) !== "undefined") {
                    const freq = populationFrequenciesMap.get(population).altAlleleFreq || 0;
                    color = VariantGridFormatter.getPopulationFrequencyColor(freq, populationFrequenciesColor);
                }
                return `<div class="px-2 py-3" style="background-color:${color}"></div>`;
            }).join("")}
                        </div>
                    </div>
                </a>
            `;
        }
    }

    static classifyFrequency(freq) {
        if (freq === null || freq === undefined || freq === 0) return "unobserved";
        if (freq < 0.001) return "veryRare";
        if (freq < 0.01) return "rare";
        if (freq < 0.05) return "average";
        return "common";
    }

    static categorizeFrequencies(data) {
        const dataCohorts = {};
        const dataAll = {};
        const dataMaxMin = {};

        for (const {study, population, refAlleleFreq, altAlleleFreq} of data) {

            const maf = Math.min(refAlleleFreq, altAlleleFreq); // MAF

            if (!dataCohorts[study]) {
                dataCohorts[study] = {
                    unobserved: {counts: 0, cohorts: []},
                    veryRare: {counts: 0, cohorts: []},
                    rare: {counts: 0, cohorts: []},
                    average: {counts: 0, cohorts: []},
                    common: {counts: 0, cohorts: []},
                    total: 0
                };
            }

            if (population === 'ALL' || population === 'JOINT') {
                const category = VariantGridFormatter.classifyFrequency(maf);
                const color = POPULATION_FREQUENCIES.style[category] || '#999';
                dataAll[study] = {
                    freq: maf,
                    label: population,
                    category,
                    color
                };
                continue;
            }

            const category = VariantGridFormatter.classifyFrequency(maf);
            dataCohorts[study][category].counts++;
            dataCohorts[study][category].cohorts.push(population);
            dataCohorts[study].total++;

            // Compute max and min MAF and its population per study
            const mafPercentage = Number((maf * 100).toFixed(4)); // MAF in %

            if (!dataMaxMin[study]) {
                dataMaxMin[study] = {
                    maxMAF: {value: mafPercentage, populations: [population]},
                    minMAF: {value: mafPercentage, populations: [population]},
                };
            } else {
                const studyData = dataMaxMin[study];

                if (mafPercentage > studyData.maxMAF.value) {
                    studyData.maxMAF = {value: mafPercentage, populations: [population]};
                } else if (mafPercentage === studyData.maxMAF.value) {
                    studyData.maxMAF.populations.push(population);
                }

                if (mafPercentage < studyData.minMAF.value) {
                    studyData.minMAF = {value: mafPercentage, populations: [population]};
                } else if (mafPercentage === studyData.minMAF.value) {
                    studyData.minMAF.populations.push(population);
                }
            }
        }

        return {dataCohorts, dataAll, dataMaxMin};
    }

    static prettifyFrequencyLabel(label) {
        const prettyLables = {
            unobserved: "Unobserved",
            veryRare: "Very Rare",
            rare: "Rare",
            average: "Average",
            common: "Common"
        };
        return prettyLables[label];
    };

    static applyLinearTransform(summary, minVisible = 5, maxVisible = 100) {
        const transformed = {};

        Object.entries(summary).forEach(([study, counts]) => {
            const total = counts.total;
            const values = [];

            // Step 1: Compute raw proportions (for min/max scaling)
            for (const [cat, obj] of Object.entries(counts)) {
                if (cat === "total") continue;
                values.push(obj.counts / total);
            }

            const min = Math.min(...values);
            const max = Math.max(...values);

            // Step 2: Build transformed structure
            transformed[study] = Object.entries(counts)
                .filter(([cat]) => cat !== "total")
                .map(([cat, obj]) => {
                    const val = obj.counts / total;
                    const rawPercent = val * 100;

                    const scaled =
                        min === max ?
                            100 / (Object.keys(counts).length - 1) :
                            minVisible + (val - min) * (maxVisible - minVisible) / (max - min);

                    return {
                        name: VariantGridFormatter.prettifyFrequencyLabel(cat) || cat,
                        y: parseFloat(scaled.toFixed(2)),
                        color: POPULATION_FREQUENCIES.style[cat] || '#999',
                        count: obj.counts,
                        realPercent: parseFloat(rawPercent.toFixed(1)),
                        cohorts: obj.cohorts
                    };
                })
                .filter(d => d.realPercent > 0);
        });

        return transformed;
    };

    static getPopulationFrequencyClassification(freq) {
        const freqFloat = Number.parseFloat(freq);
        if (freqFloat === 0 || freqFloat === "0") {
            return VariantGridFormatter.POPULATION_FREQUENCY_CLASSIFICATION.UNOBSERVED;
        } else if (freqFloat < 0.001) {
            return VariantGridFormatter.POPULATION_FREQUENCY_CLASSIFICATION.VERY_RARE;
        } else if (freqFloat < 0.005) {
            return VariantGridFormatter.POPULATION_FREQUENCY_CLASSIFICATION.RARE;
        } else if (freqFloat < 0.05) {
            return VariantGridFormatter.POPULATION_FREQUENCY_CLASSIFICATION.AVERAGE;
        } else {
            return VariantGridFormatter.POPULATION_FREQUENCY_CLASSIFICATION.COMMON;
        }
    }

    static getPopulationFrequencyColor(freq, populationFrequenciesColor = {}) {
        return populationFrequenciesColor[VariantGridFormatter.getPopulationFrequencyClassification(freq)] || "black";
    }

    static clinicalTraitAssociationFormatter(value, row, index) {
        const phenotypeHtml = "<span><i class='fa fa-times' style='color: red'></i></span>";

        // Check for ClinVar, Cosmic and HGMD annotations
        if (row?.annotation?.traitAssociation) {
            // Filter the traits for this column and check the number of existing traits
            const traits = row.annotation.traitAssociation.filter(trait => trait.source.name.toUpperCase() === this.field.toUpperCase());
            if (traits.length === 0) {
                return "<span title='No clinical records found for this variant'><i class='fa fa-times' style='color: gray'></i></span>";
                // return "<span title='No clinical records found for this variant'>-</span>";
            }

            let tooltipText = "";
            const tooltipRows = [];
            switch (this.field?.toUpperCase()) {
                case "CLINVAR":
                    const germlineStarRating = {
                        "practice guideline": 4,
                        "reviewed by expert panel": 3,
                        "criteria provided, multiple submitters, no conflicts": 2,
                        "criteria provided, conflicting classifications": 1,
                        "criteria provided, single submitter": 1,
                        "CRITERIA_PROVIDED_SINGLE_SUBMITTER": 1,
                    };

                    const results = [];
                    const clinicalSignificanceVisited = new Set();
                    for (const trait of traits) {
                        let clinicalSignificance,
                            drugResponseClassification;
                        if (trait?.variantClassification?.clinicalSignificance) {
                            clinicalSignificance = trait.variantClassification.clinicalSignificance;
                        } else {
                            if (trait?.variantClassification?.drugResponseClassification) {
                                clinicalSignificance = "drug_response";
                                drugResponseClassification = trait?.variantClassification?.drugResponseClassification;
                            } else {
                                clinicalSignificance = "unknown";
                            }
                        }
                        let code = "";
                        let color = "";
                        let tooltip = "";
                        switch (clinicalSignificance.toUpperCase()) {
                            case "BENIGN":
                                code = CLINICAL_SIGNIFICANCE_SETTINGS.BENIGN.id;
                                color = "green";
                                tooltip = "Classified as benign following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                                break;
                            case "LIKELY_BENIGN":
                                code = CLINICAL_SIGNIFICANCE_SETTINGS.LIKELY_BENIGN.id;
                                color = "darkgreen";
                                tooltip = "Classified as likely benign following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                                break;
                            case "VUS":
                            case "UNCERTAIN_SIGNIFICANCE":
                                code = CLINICAL_SIGNIFICANCE_SETTINGS.UNCERTAIN_SIGNIFICANCE.id;
                                color = "darkorange";
                                tooltip = "Classified as of uncertain significance following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                                break;
                            case "LIKELY_PATHOGENIC":
                                code = CLINICAL_SIGNIFICANCE_SETTINGS.LIKELY_PATHOGENIC.id;
                                color = "darkred";
                                tooltip = "Classified as likely pathogenic following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                                break;
                            case "PATHOGENIC":
                                code = CLINICAL_SIGNIFICANCE_SETTINGS.PATHOGENIC.id;
                                color = "red";
                                tooltip = "Classified as pathogenic following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                                break;
                            case "DRUG_RESPONSE":
                                code = "DR";
                                color = "darkred";
                                tooltip = "Classified as drug response following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                                break;
                            case "UNKNOWN":
                                code = "NP";
                                color = "grey";
                                tooltip = "ClinVar submissions without an interpretation of clinical significance";
                                break;
                        }

                        if (code !== "NP" && !clinicalSignificanceVisited.has(code)) {
                            results.push(`<span style="color: ${color}">${code}</span>`);
                            clinicalSignificanceVisited.add(code);
                        }

                        // Calculate the star rating from status
                        const starRating = trait?.additionalProperties?.find(p => p.name === "ReviewStatus_in_source_file")?.value || "";
                        const starRatingHtml = [];
                        for (let i = 0; i < 4; i++) {
                            if (i < germlineStarRating[starRating]) {
                                starRatingHtml.push(`<i class="fas fa-star" style="color: darkgoldenrod"></i>`);
                            } else {
                                starRatingHtml.push(`<i class="far fa-star" style="color: darkgoldenrod"></i>`);
                            }
                        }

                        // Prepare the tooltip links
                        if (!trait.id?.startsWith("SCV")) {
                            const heritableTraits = trait.heritableTraits
                                .filter(t => t.trait && t.trait !== "not specified" && t.trait !== "not provided");
                            const row = `
                                <tr style="border-top:1px solid #ededed;">
                                    <td class="p-2">
                                        <a href="${trait.url}" target="_blank">${trait.id}</a>
                                    </td>
                                    <td class="p-2">
                                        ${trait.genomicFeatures?.find(gf => gf.featureType === "gene")?.xrefs?.symbol || ""}
                                    </td>
                                    <td class="p-2">
                                        <span style="color: ${color}">${clinicalSignificance} ${drugResponseClassification ? "(" + drugResponseClassification + ")" : ""}</span>
                                    </td>
                                    <td class="p-2">
                                        <div class="text-nowrap" title="${starRating}">
                                            ${starRatingHtml?.length > 0 ? starRatingHtml.join("") : ""}
                                        </div>
                                    </td>
                                    <td class="p-2">
                                        ${heritableTraits?.length > 0 ? `
                                            ${heritableTraits.map(t => `<span>${t.trait}</span>`).join("")}
                                        ` : "-"}
                                    </td>
                                </tr>
                            `;
                            tooltipRows.push(row);
                        }
                    }

                    // This can only be shown if nothing else exists
                    if (results.length === 0) {
                        return `<span style="color: grey" title="ClinVar submissions without an interpretation of clinical significance">NP</span>`;
                    }

                    tooltipText = `
                        <table class="tooltip-2xl">
                            <thead>
                                <tr>
                                    <th class="p-2">ClinVar ID</th>
                                    <th class="p-2">Gene</th>
                                    <th class="p-2">Clinical Significance</th>
                                    <th class="p-2">Review Status</th>
                                    <th class="p-2">Heritable Trait</th>
                                </tr>
                            </thead>
                            <tbody>${tooltipRows.join("")}</tbody>
                        </table>
                     `;

                    return `<a class="clinvar-tooltip" tooltip-title='ClinVar' tooltip-text='${tooltipText}' tooltip-position-at="left bottom" tooltip-position-my="right top">${results.join("<br>")}</a>`;
                case "COSMIC":
                    // Prepare the tooltip links
                    const cosmicMap = new Map();
                    traits.forEach(trait => {
                        if (!cosmicMap.has(trait.id)) {
                            cosmicMap.set(trait.id, new Set());
                        }
                        if (trait?.somaticInformation?.primaryHistology) {
                            cosmicMap.get(trait.id).add(trait.somaticInformation.primaryHistology);
                        }
                    });

                    for (const trait of traits) {
                        const row = `
                             <tr style="border-top:1px solid #ededed;">
                                <td class="p-2">
                                    <a href="${BioinfoUtils.getCosmicVariantLink(trait.id)}" target="_blank">${trait.id}</a>
                                </td>
                                <td class="p-2">
                                     ${trait.genomicFeatures?.find(gf => gf.featureType === "gene")?.xrefs?.symbol || ""}
                                </td>
                                <td class="p-2">
                                    ${trait.somaticInformation?.primarySite}
                                </td>
                                <td class="p-2">
                                    ${trait.somaticInformation?.primaryHistology}
                                </td>
                                 <td class="p-2">
                                    ${trait.somaticInformation?.histologySubtype || "-"}
                                </td>
                            </tr>
                        `;
                        tooltipRows.push(row);
                    }

                    tooltipText = `
                        <table class="tooltip-2xl">
                            <thead>
                                <tr>
                                    <th class="p-2">Cosmic ID</th>
                                    <th class="p-2">Gene</th>
                                    <th class="p-2">Primary Site</th>
                                    <th class="p-2">Primary Histology</th>
                                    <th class="p-2">Histology Subtype</th>
                                </tr>
                            </thead>
                            <tbody>${tooltipRows.join("")}</tbody>
                        </table>
                     `;

                    return `
                        <a class="cosmic-tooltip" tooltip-title='Cosmic' tooltip-text='${tooltipText}' tooltip-position-at="left bottom" tooltip-position-my="right top">
                            <div class="text-nowrap" style="color: green">${cosmicMap.size} ${cosmicMap.size > 1 ? "entries" : "entry"}</div>
                            ${traits.length > 1 ? `
                                <div class="text-nowrap" style="color: green">(${traits.length} traits)</div>
                            ` : ""}
                        </a>
                    `;
                case "HGMD":
                    // Prepare the tooltip links
                    const hgmdMap = new Map();
                    traits.forEach(trait => {
                        if (!hgmdMap.has(trait.id)) {
                            hgmdMap.set(trait.id, new Set());
                        }
                        if (trait?.heritableTraits?.length > 0) {
                            for (const heritableTrait of trait.heritableTraits) {
                                if (heritableTrait?.trait) {
                                    hgmdMap.get(trait.id).add(heritableTrait.trait);
                                }
                            }
                        }
                    });

                    for (const trait of traits) {
                        const heritableTraits = (trait?.heritableTraits || []).map(t => {
                            return `<span>${UtilsNew.escapeHtml(t.trait)}</span>`;
                        });
                        const row = `
                            <tr style="border-top:1px solid #ededed;">
                                <td class="p-2">
                                    <span>${UtilsNew.escapeHtml(trait.id)}</span>
                                </td>
                                <td class="p-2">
                                     ${heritableTraits.join(", ") || ""}
                                </td>
                                <td class="p-2">
                                    ${UtilsNew.escapeHtml(trait.additionalProperties?.find(p => p.name === "RANKSCORE")?.value || "-")}
                                </td>
                            </tr>
                        `;
                        tooltipRows.push(row);
                    }

                    tooltipText = `
                        <table class="tooltip-2xl">
                            <thead>
                                <tr>
                                    <th class="p-2">HGMD ID</th>
                                    <th class="p-2">Heritable Traits</th>
                                    <th class="p-2">Rank Score</th>
                                </tr>
                            </thead>
                            <tbody>${tooltipRows.join("")}</tbody>
                        </table>
                     `;

                    return `
                        <a class="hgmd-tooltip" tooltip-title='HGMD' tooltip-text='${tooltipText}' tooltip-position-at="left bottom" tooltip-position-my="right top">
                            <div class="text-nowrap" style="color: green">${hgmdMap.size} ${hgmdMap.size > 1 ? "entries" : "entry" }</div>
                            ${traits.length > 1 ? `
                                <div class="text-nowrap" style="color: green">(${traits.length} traits)</div>
                            ` : ""}
                        </a>`;
                default:
                    console.error("Wrong clinical source : " + this.field);
                    break;
            }
        }
        return phenotypeHtml;
    }

    static clinicalCancerHotspotsFormatter(value, row) {
        if (row?.annotation?.cancerHotspots?.length > 0) {
            const cancerHotspotsHtml = new Map();
            for (const ct of row.annotation.consequenceTypes) {
                for (const hotspot of row.annotation.cancerHotspots) {
                    if (ct.geneName === hotspot.geneName && ct.proteinVariantAnnotation?.position === hotspot.aminoacidPosition) {
                        cancerHotspotsHtml.set(`${hotspot.geneName}_${hotspot.aminoacidPosition}`, hotspot);
                    }
                }
            }
            let tooltipText = "";
            for (const [key, hotspot] of cancerHotspotsHtml.entries()) {
                const hotspotVariantsText = hotspot.variants.map(variant => `
                    <span class="d-block text-secondary" style="margin: 5px 1px">
                        ${AMINOACID_CODE[hotspot.aminoacidReference]}${hotspot.aminoacidPosition}${AMINOACID_CODE[variant.aminoacidAlternate]}: ${variant.count} sample(s)
                    </span>
                `);
                tooltipText += `
                    <div style="margin: 10px 5px">
                        <div>
                            <label style="">Gene: ${hotspot.geneName} - Aminoacid: ${hotspot.aminoacidPosition} (${AMINOACID_CODE[hotspot.aminoacidReference]})</label>
                            <div style="">Cancer Type: ${hotspot.cancerType} - ${hotspot.variants.length} ${hotspot.variants.length === 1 ? "mutation" : "mutations"}</div>
                        </div>
                        <div>
                            ${hotspot.variants
                    .map(variant => `
                                    <span
                                        class="d-block text-secondary"
                                        style="margin: 5px 1px">${AMINOACID_CODE[hotspot.aminoacidReference]}${hotspot.aminoacidPosition}${AMINOACID_CODE[variant.aminoacidAlternate]}: ${variant.count} sample(s)
                                    </span>`)
                    .join("")
                }
                        </div>
                    </div>`;
            }

            if (cancerHotspotsHtml.size > 0) {
                return `
                    <a class="hotspots-tooltip" tooltip-title='Info' tooltip-text='${tooltipText}' tooltip-position-at="left bottom" tooltip-position-my="right top">
                        <span style="color: green">${cancerHotspotsHtml.size} ${cancerHotspotsHtml.size === 1 ? "variant" : "variants"}</span>
                    </a>
                `;
            }
        }
        return "<span title='No clinical records found for this variant'><i class='fa fa-times' style='color: gray'></i></span>";
    }

    static clinicalOmimFormatter(value, variant) {
        const omim = new Map();
        const orpha = new Map();
        for (const geneTrait of variant?.annotation?.geneTraitAssociation) {
            if (geneTrait?.id?.startsWith("OMIM:") && !omim.has(geneTrait.id)) {
                omim.set(geneTrait.id, geneTrait);
            }
            if (geneTrait?.id?.startsWith("ORPHA:") && !orpha.has(geneTrait.id)) {
                orpha.set(geneTrait.id, geneTrait);
            }
        }

        if (omim.size > 0 || orpha.size > 0) {
            // 1. Prepare OMIM tooltip
            const omimTooltipRows = [];
            for (const [_, entry] of omim.entries()) {
                const row = `
                    <tr style="border-top:1px solid #ededed;">
                        <td class="p-2">
                            <a href="${BioinfoUtils.getOmimOntologyLink(entry.id?.replace("OMIM:", ""))}" target="_blank">${entry.id}</a>
                        </td>
                       <td class="p-2">
                            <a href="${BioinfoUtils.getHpoLink(entry.hpo)}" target="_blank">${entry.hpo}</a>
                        </td>
                        <td class="p-2">
                            <span>${entry.name}</span>
                        </td>
                    </tr>
                `;
                omimTooltipRows.push(row);
            }

            let omimTooltipText = `
                <table class="tooltip-2xl">
                    <thead>
                        <tr>
                            <th class="p-2">OMIM ID</th>
                            <th class="p-2">HPO</th>
                            <th class="p-2">Name</th>
                        </tr>
                    </thead>
                    <tbody>${omimTooltipRows.join("")}</tbody>
                </table>
            `;

            // 2. Prepare Orphanet tooltip
            const orphaTooltipRows = [];
            for (const [_, entry] of orpha.entries()) {
                const row = `
                    <tr style="border-top:1px solid #ededed;">
                        <td class="p-2">
                            <a href="https://www.orpha.net/en/disease/detail/${entry.id}" target="_blank">${entry.id}</a>
                        </td>
                       <td class="p-2">
                            <a href="${BioinfoUtils.getHpoLink(entry.hpo)}" target="_blank">${entry.hpo}</a>
                        </td>
                        <td class="p-2">
                            <span>${entry.name}</span>
                        </td>
                    </tr>
                `;
                orphaTooltipRows.push(row);
            }

            let orphaTooltipText = `
                <table class="tooltip-2xl">
                    <thead>
                        <tr>
                            <th class="p-2">Orphanet ID</th>
                            <th class="p-2">HPO</th>
                            <th class="p-2">Name</th>
                        </tr>
                    </thead>
                    <tbody>${orphaTooltipRows.join("")}</tbody>
                </table>
            `;

            return `
                <div>
                    ${omim.size > 0 ? `
                        <a class="omim-tooltip" tooltip-title='OMIM' tooltip-text='${omimTooltipText}' tooltip-position-at="left bottom" tooltip-position-my="right top">
                            <span class="text-nowrap" style='color:green;'>${omim.size} OMIM</span>
                        </a>
                    ` : `
                        <span class="my-1" title='No clinical records found for this variant'>
                            <i class='fa fa-times' style='color: gray'></i>
                        </span>
                    `}
                </div>
                <div>
                    ${orpha.size > 0 ? `
                        <a class="omim-tooltip" tooltip-title='Orphanet' tooltip-text='${orphaTooltipText}' tooltip-position-at="left bottom" tooltip-position-my="right top">
                            <span class="text-nowrap" style='color:green;'>${orpha.size} Orphanet</span>
                        </a>
                    ` : `
                        <span class="my-1" title='No clinical records found for this variant'>
                            <i class='fa fa-times' style='color: gray'></i>
                        </span>
                    `}
                </div>
            `;
        } else {
            return `
                <span title='No clinical records found for this variant'>
                    <i class='fa fa-times' style='color: gray'></i>
                </span>
            `;
        }
    }

    static clinicalPharmGKBFormatter(value, variant) {
        if (variant?.annotation?.pharmacogenomics?.length > 0) {
            const pharmaTooltipRows = [];
            for (const pharmaEntry of variant.annotation.pharmacogenomics) {
                const row = `
                    <tr style="border-top:1px solid #ededed;">
                        <td class="p-2">
                            <a href="${BioinfoUtils.getPharmGKBLink(pharmaEntry.id)}" target="_blank">${pharmaEntry.id}</a>
                        </td>
                        <td class="p-2">
                            <span>${pharmaEntry.name}</span>
                        </td>
                        <td class="p-2">
                            <span>${pharmaEntry.annotations[0]?.phenotypes?.join("<br>")}</span>
                        </td>
                        <td class="p-2">
                            <span>${pharmaEntry.annotations[0]?.confidence}</span>
                        </td>
                        <td class="p-2">
                            <span>${pharmaEntry.annotations[0]?.score}</span>
                        </td>
                        <td class="p-2">
                            <div>${pharmaEntry.annotations[0]?.summary}</div>
                            <a class="my-1" href="${pharmaEntry.annotations[0]?.url}" target="_blank">More info</a>
                        </td>
                        <td class="p-2">
                            <span>
                                ${pharmaEntry.annotations[0]?.pubmed?.map(pubmedId => `<a class="my-1" href="${BioinfoUtils.getPubmedLink(pubmedId)}" target="_blank">${pubmedId}</a>`).join("<br>") || "-"}
                            </span>
                        </td>
                    </tr>
                `;
                pharmaTooltipRows.push(row);
            }

            let tooltipText = UtilsNew.escapeHtml(`
                <table class="tooltip-2xl">
                    <thead>
                        <tr>
                            <th class="p-2">ClinPGx</th>
                            <th class="p-2">Name</th>
                            <th class="p-2">Phenotypes</th>
                            <th class="p-2">Confidence</th>
                            <th class="p-2">Score</th>
                            <th class="p-2">Summary</th>
                            <th class="p-2">PubMed</th>
                        </tr>
                    </thead>
                    <tbody>${pharmaTooltipRows.join("")}</tbody>
                </table>
            `);

            return `
                <a class="hotspots-tooltip" tooltip-title='ClinPGx' tooltip-text='${tooltipText}' tooltip-position-at="left bottom" tooltip-position-my="right top">
                    <span class="text-nowrap" style="color:green">${variant.annotation.pharmacogenomics.length} ${variant.annotation.pharmacogenomics.length === 1 ? "entry" : "entries"}</span>
                </a>
            `;
        } else {
            return `
                <span title='No pharmacogenomic records found for this variant'>
                    <i class='fa fa-times' style='color: gray'></i>
                </span>
            `;
        }
    }

    /*
     * Reported Variant formatters
     */
    static toggleDetailClinicalEvidence(e) {
        const id = e.target.dataset.id;
        const elements = document.getElementsByClassName(this._prefix + id + "EvidenceFiltered");
        for (const element of elements) {
            if (element.style.display === "none") {
                element.style.display = "";
            } else {
                element.style.display = "none";
            }
        }
    }

    static reportedVariantFormatter(value, variant) {
        if (variant?.interpretations?.length > 0) {
            return `
                <div>${variant.interpretations.length === 1 ? "1 case found" : `${variant.interpretations.length} cases found`}</div>
                <div class="text-muted">
                    <div>REPORTED: ${variant.interpretationStats?.status?.REPORTED || 0} times</div>
                    <div>TIER 1: ${variant.interpretationStats?.tier?.TIER1 || 0} times</div>
                    <div>DISCARDED: ${variant.interpretationStats?.status?.DISCARDED || 0} times</div>
                </div>
            `;
        }
        return `<div>No cases found</div>`;
    }

    static reportedVariantDetailFormatter(value, row, opencgaSession) {
        if (row?.interpretations?.length > 0) {
            let reportedHtml = `
                <table id="ConsqTypeTable" class="table table-hover table-no-bordered">
                    <thead class="table-light">
                        <tr>
                            <th rowspan="2">Case</th>
                            <th rowspan="2">Disease Panel</th>
                            <th rowspan="2">Sample</th>
                            <th rowspan="2">Genotype</th>
                            <th rowspan="2">Status</th>
                            <th rowspan="2">Discussion</th>
                            <th rowspan="1" colspan="5" style="text-align: center; padding-top: 5px; padding-right: 2px">Evidences</th>
                        </tr>
                        <tr style="margin: 5px">
                            <th rowspan="1" style="padding-top: 5px">Gene</th>
                            <th rowspan="1">Transcript</th>
                            <th rowspan="1">ACMG</th>
                            <th rowspan="1">Tier</th>
                            <th rowspan="1">Clinical Significance</th>
                        </tr>
                    </thead>
                    <tbody>`;

            for (const interpretation of row.interpretations) {
                // Prepare data info for columns
                const caseId = interpretation.id.split(".")[0];
                const interpretationIdHtml = `
                    <div>
                        <label>
                            ${caseId}
                       </label>
                    </div>
                `;

                const panelsHtml = `
                    <div>
                        ${interpretation.panels?.map(panel => {
                    if (panel?.source?.project === "PanelApp") {
                        return `<a href="${BioinfoUtils.getPanelAppLink(panel.source.id)}" target="_blank">${panel.name}</a>`;
                    } else {
                        return `<span>${panel.name || "-"}</span>`;
                    }
                })?.join("<br>")}
                    </div>`;

                const interpretedVariant = interpretation.primaryFindings.find(variant => variant.id === row.id);

                const sampleHtml = `
                    <div>
                        <label>${interpretedVariant.studies[0]?.samples[0]?.sampleId || "-"}</label>
                    </div>`;

                const genotype = VariantInterpreterGridFormatter.alleleGenotypeRenderer(row, interpretedVariant.studies[0]?.samples[0], "call");
                const genotypeHtml = `
                    <div>
                        <span>${genotype || "-"}</span>
                    </div>`;

                const statusHtml = `
                    <div>
                        ${interpretedVariant.status || "-"}
                    </div>`;
                const discussionHtml = `
                    <div>
                        ${interpretedVariant?.discussion?.text || "-"}
                    </div>`;

                const genes = [];
                const transcripts = [];
                const acmgClassifications = [];
                const tierClassifications = [];
                const clinicalSignificances = [];
                for (const evidence of interpretedVariant.evidences.filter(ev => ev.review.select)) {
                    genes.push(`
                        <a href="${BioinfoUtils.getGeneLink(evidence.genomicFeature.geneName, "HGNC")}" target="_blank">
                            ${evidence.genomicFeature.geneName}
                        </a>
                    `);
                    transcripts.push(`
                        <a href="${BioinfoUtils.getTranscriptLink(evidence.genomicFeature.transcriptId)}" target="_blank">
                            ${evidence.genomicFeature.transcriptId}
                        </a>
                    `);
                    acmgClassifications.push(evidence.review.acmg?.map(acmg => acmg.classification)?.join(", ")|| "-");
                    tierClassifications.push(evidence.review.tier || "-");
                    clinicalSignificances.push(`
                        <span style="color:${CLINICAL_SIGNIFICANCE_SETTINGS[evidence.review.clinicalSignificance?.toUpperCase()]?.color || "black"}">
                            ${evidence.review.clinicalSignificance || "-"}
                        </span>
                    `);
                }

                // Create the table row
                reportedHtml += `
                    <tr class="detail-view-row">
                        <td>${interpretationIdHtml}</td>
                        <td>${interpretation?.panels?.length > 0 ? panelsHtml : "-"}</td>
                        <td>${sampleHtml}</td>
                        <td>${genotypeHtml}</td>
                        <td>${statusHtml}</td>
                        <td style="max-width:280px;">${discussionHtml}</td>

                        <td>${genes.length > 0 ? genes.join("<br>") : "-"}</td>
                        <td>${transcripts.length > 0 ? transcripts.join("<br>") : "-"}</td>
                        <td>${acmgClassifications.length > 0 ? acmgClassifications.join("<br>") : "-"}</td>
                        <td>${tierClassifications.length > 0 ? tierClassifications.join("<br>") : "-"}</td>
                        <td>${clinicalSignificances.length > 0 ? clinicalSignificances.join("<br>") : "-"}</td>
                    </tr>
                `;
            }
            reportedHtml += "</tbody></table>";
            return reportedHtml;
        }
        return "-";
    }

    static deleteriousnessInfoTooltipContent() {
        return `
            SIFT scores are classified into tolerated and deleterious.
            Polyphen scores are classified into benign, possibly damaging, probably damaging and possibly &amp; probably damaging.
            Please, leave the cursor over each tag to visualize the actual score value.
            SIFT score takes values in the range [0, infinite[, the lower the values, the more damaging the prediction.
            Polyphen score takes values in the range [0, 1[, the closer to 2, the more damaging the prediction.
            CADD is a tool for scoring the deleteriousness of single nucleotide variants in the human genome.
            C-scores strongly correlate with allelic diversity, pathogenicity of both coding and non-coding variants,
            and experimentally measured regulatory effects, and also highly rank causal variants within individual genome sequences.
            SpliceAI: a deep learning-based tool to identify splice variants.
        `;
    }

    static conservationInfoTooltipContent() {
        return `
            Positive PhyloP scores measure conservation which is slower
            evolution than expected, at sites that are predicted to be conserved. Negative PhyloP scores measure acceleration, which is
            faster evolution than expected, at sites that are predicted to be fast-evolving. Absolute values of phyloP scores represent
            -log p-values under a null hypothesis of neutral evolution. The phastCons scores represent probabilities of negative selection and
            range between 0 and 1. Positive GERP scores represent a substitution deficit and thus indicate that a site may be under evolutionary constraint.
            Negative scores indicate that a site is probably evolving neutrally. Some authors suggest that a score threshold of 2 provides high sensitivity while
            still strongly enriching for truly constrained sites.
        `;
    }

    static clinicalInfoTooltipContent() {
        return `
            <div class='mb-1'>
                <b>ClinVar</b> is a freely accessible, public archive of reports of the relationships among human variations and phenotypes, with supporting evidence.
            </div>
            <div class=''>
                <b>COSMIC</b> is the world's largest and most comprehensive resource for exploring the impact of somatic mutations in human cancer.
            </div>
        `;
    }

    static interpretationInfoTooltipContent() {
        return `
            <span class='fw-bold'>Prediction</span> column shows the Clinical Significance prediction and Tier following the ACMG guide recommendations.
        `;
    }

    static getCellbaseActionsLinks(opencgaSession) {
        let hasCurrentVersion = false;
        const currentCellbaseHost = opencgaSession?.project?.cellbase?.url || opencgaSession?.cellbaseClient?._config?.host;
        const currentCellbaseVersion = opencgaSession?.project?.cellbase?.version || opencgaSession?.cellbaseClient?._config?.version;
        const currentCellbaseDataRelease = opencgaSession?.project?.cellbase?.dataRelease || opencgaSession?.cellbaseClient?._config?.dataRelease;

        // 1. get the cellbase supported versions from the configuration
        const cellbaseVersions = (CELLBASE?.supportedVersions || []).map(cellbaseConfig => {
            const cb = UtilsNew.objectClone(cellbaseConfig);
            cb.current = false;
            if (!hasCurrentVersion && cb.host === currentCellbaseHost && cb.version === currentCellbaseVersion && cb.dataRelease === currentCellbaseDataRelease) {
                hasCurrentVersion = true;
                cb.current = true;
                cb.apiKey = opencgaSession?.project?.cellbase?.apiKey || opencgaSession?.cellbaseClient?._config?.apiKey || "";
            }
            return cb;
        });

        // 2. check if current version is not in the list, then add it
        if (!hasCurrentVersion && currentCellbaseHost && currentCellbaseVersion) {
            cellbaseVersions.push({
                host: currentCellbaseHost,
                version: currentCellbaseVersion,
                dataRelease: currentCellbaseDataRelease || "",
                apiKey: opencgaSession?.project?.cellbase?.apiKey || opencgaSession?.cellbaseClient?._config?.apiKey || "",
                current: true,
            });
        }

        // 3. return the cellbase versions to display in the actions menu
        return cellbaseVersions;
    }

}
