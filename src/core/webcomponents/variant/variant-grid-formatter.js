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

import UtilsNew from "../../utilsNew.js";
import BioinfoUtils from "../../bioinfo-utils.js";


//TODO urgent review of the whole class

export default class VariantGridFormatter {

    constructor(opencgaSession, config) {
        this.opencgaSession = opencgaSession;
        this.config = config;
        this.CT = consequenceTypes; //global var
        this.prefix = UtilsNew.randomString(8);
    }

    assignColors(consequenceTypes, proteinSubstitutionScores) {
        let result = {};
        if (typeof consequenceTypes !== "undefined") {
            let consequenceTypeToColor = {};
            let consequenceTypeToImpact = {};
            for (let i = 0; i < consequenceTypes.categories.length; i++) {
                if (typeof consequenceTypes.categories[i].terms !== "undefined") {
                    for (let j = 0; j < consequenceTypes.categories[i].terms.length; j++) {
                        consequenceTypeToColor[consequenceTypes.categories[i].terms[j].name] = this.CT.style[consequenceTypes.categories[i].terms[j].impact];
                        consequenceTypeToImpact[consequenceTypes.categories[i].terms[j].name] = consequenceTypes.categories[i].terms[j].impact;
                    }
                } else if (typeof consequenceTypes.categories[i].id !== "undefined" && typeof consequenceTypes.categories[i].name !== "undefined") {
                    consequenceTypeToColor[consequenceTypes.categories[i].name] = consequenceTypes[consequenceTypes.categories[i].impact];
                    consequenceTypeToImpact[consequenceTypes.categories[i].name] = consequenceTypes.categories[i].impact;
                }
            }
            // this.consequenceTypeToColor = consequenceTypeToColor;
            // this.consequenceTypeToImpact = consequenceTypeToImpact;
            result = {
                consequenceTypeToColor: consequenceTypeToColor,
                consequenceTypeToImpact: consequenceTypeToImpact
            };
        }

        if (typeof proteinSubstitutionScores !== "undefined") {
            let pssColor = new Map();
            for (let i in proteinSubstitutionScores) {
                let obj = proteinSubstitutionScores[i];
                Object.keys(obj).forEach(key => {
                    pssColor.set(key, obj[key]);
                });
            }
            // this.pssColor = pssColor;
            result.pssColor = pssColor;
        }

        return result;
    }

    variantFormatter(value, row, config) {
        if (row === undefined) {
            return;
        }

        // If REF/ALT is greater than maxAlleleLength we display the first and last 5 bp
        let ref = (UtilsNew.isNotEmpty(row.reference)) ? row.reference : "-";
        let alt = (UtilsNew.isNotEmpty(row.alternate)) ? row.alternate : "-";
        let maxAlleleLength = 15;
        if (UtilsNew.isNotUndefinedOrNull(config) && UtilsNew.isNotUndefinedOrNull(config.alleleStringLengthMax)) {
            maxAlleleLength = config.alleleStringLengthMax;
        }
        ref = (ref.length > maxAlleleLength) ? ref.substring(0, 5) + "..." + ref.substring(ref.length - 5) : ref;
        alt = (alt.length > maxAlleleLength) ? alt.substring(0, 5) + "..." + alt.substring(alt.length - 5) : alt;

        let id = row.id;
        if (UtilsNew.isEmpty(id)) {
            console.warn("row.id is empty: " + row);
            id = `${row.chromosome}:${row.start}:${ref}:${alt}`;
        }

        if (typeof row.annotation !== "undefined" && UtilsNew.isNotEmptyArray(row.annotation.xrefs)) {
            row.annotation.xrefs.find(function (element) {
                if (element.source === "dbSNP") {
                    id = element.id;
                }
            });
        }

        let genomeBrowserMenuLink = "";
        if (UtilsNew.isNotUndefinedOrNull(config) && config.showGenomeBrowser) {
            genomeBrowserMenuLink = `<div>
                                        <a class="genome-browser-option" data-variant-position="${row.chromosome}:${row.start}-${row.end}" style="cursor: pointer">
                                            <i class="fa fa-list" aria-hidden="true"></i> Genome Browser
                                        </a>
                                     </div>`;
        }

        let ensemblLinkHtml = id.startsWith("rs")
            ? "https://www.ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=" + id
            : "http://www.ensembl.org/Homo_sapiens/Location/View?r=" + row.chromosome + ":" + row.start + "-" + row.end;

        let snpLinkHtml = "";
        if (id.startsWith("rs")) {
            snpLinkHtml = `<div class="pad5"><a target="_blank" href="https://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs=${id}">dbSNP</a></div>
                           ${application.appConfig === "opencb" ? `<div class="pad5"><a target="_blank" href="https://www.snpedia.com/index.php/${id}">SNPedia</a></div>` : ``}
                           <div class="pad5"><a target="_blank" href="https://www.ncbi.nlm.nih.gov/clinvar/?term=${id}">ClinVar</a></div>
                `;
        }

        // <div style="padding: 5px 15px; color: darkgray; font-weight: bolder">External Links</div>
        let tooltipText = `${genomeBrowserMenuLink}
                            <div style="padding: 5px">
                                <a target="_blank" href="${ensemblLinkHtml}">Ensembl</a>
                            </div>
                            ${snpLinkHtml}
                `;

        return `<div>
                    <a tooltip-title='Links' tooltip-text='${tooltipText}'>
                        ${row.chromosome}:${row.start}&nbsp;&nbsp;${ref}/${alt}
                    </a>
                </div>`;
    }

    snpFormatter(value, row, index) {
        /*
            We try first to read SNP ID from the 'names' of the variant (this identifier comes from the file).
            If this ID is not a "rs..." then we search the rs in the CellBase XRef annotations.
            This field is in annotation.xref when source: "dbSNP".
        */
        let snpId = null;
        if (row.names && row.names.length > 0) {
            for (let name of row.names) {
                if (name.startsWith("rs")) {
                    snpId = name;
                    break;
                }
            }
        } else {
            if (row.annotation) {
                if (row.annotation.id && row.annotation.id.startsWith("rs")) {
                    snpId = row.annotation.id;
                } else {
                    if (row.annotation.xrefs) {
                        for (let xref of row.annotation.xrefs) {
                            if (xref.source === "dbSNP") {
                                snpId = xref.id;
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (snpId) {
            if (this.opencgaSession.project.organism && this.opencgaSession.project.organism.assembly.toUpperCase() === "GRCH37") {
                return "<a target='_blank' href='http://grch37.ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=" + snpId + "'>" + snpId + "</a>";
            } else {
                return "<a target='_blank' href='http://www.ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=" + snpId + "'>" + snpId + "</a>";
            }
        }
        return "-";
    }

    geneFormatter(value, row, index) {
        let geneToSo = null;
        let queryCtArray = null;

        // Check 'query' is passed through formatter bind()
        // Keep a map of genes and the SO accessions and names
        if (this.query?.ct) {
            queryCtArray = this.query.ct.split(",");
            geneToSo = {};
            for (let ct of row.annotation.consequenceTypes) {
                let geneName = ct.geneName;
                if (typeof geneToSo[geneName] === "undefined") {
                    geneToSo[geneName] = [];
                }
                for (let so of ct.sequenceOntologyTerms) {
                    geneToSo[geneName].push(so.accession);
                    geneToSo[geneName].push(so.name);
                }
            }
        }

        if (typeof row !== "undefined" && row.annotation !== undefined && UtilsNew.isNotEmptyArray(row.annotation.consequenceTypes)) {
            let visited = {};
            let geneLinks = [];
            let geneWithSoLinks = [];
            for (let i = 0; i < row.annotation.consequenceTypes.length; i++) {
                let geneName = row.annotation.consequenceTypes[i].geneName;

                // We process Genes just one time
                if (UtilsNew.isNotEmpty(geneName) && typeof visited[geneName] === "undefined") {
                    let geneViewMenuLink = "";
                    let genomeBrowserMenuLink = "";

                    if (this.config && this.config.showGenomeBrowser) {
                        genomeBrowserMenuLink = `<div>
                                                    <a class="genome-browser-option" data-variant-position="${row.chromosome}:${row.start}-${row.end}" style="cursor: pointer">
                                                        Genome Browser
                                                    </a>
                                                 </div>`;
                    }

                    if (this.opencgaSession.project && this.opencgaSession.study) {
                        geneViewMenuLink = `<div style="padding: 5px"><a style="cursor: pointer" href="#gene/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${geneName}">Gene View</a></div>`;
                    }

                    let tooltipText = `${geneViewMenuLink}
                                       ${genomeBrowserMenuLink}
                                       <div class="dropdown-header" style="padding-left: 10px">External Links</div>
                                       <div style="padding: 5px">
                                            <a target="_blank" href="${BioinfoUtils.getEnsemblLink(geneName, "gene", this.opencgaSession.project.organism.assembly)}">Ensembl</a>
                                       </div>
                                       <div style="padding: 5px">
                                            <a target="_blank" href="${BioinfoUtils.getCosmicLink(geneName, this.opencgaSession.project.organism.assembly)}">COSMIC</a>
                                       </div>
                                       <div style="padding: 5px">
                                            <a target="_blank" href="${BioinfoUtils.getUniprotLink(geneName)}">UniProt</a></div>`;

                    // If query.ct exists
                    if (geneToSo) {
                        let geneContainSo = false;
                        for (let so of queryCtArray) {
                            if (geneToSo[geneName].includes(so)) {
                                geneContainSo = true;
                                break;
                            }
                        }

                        // If gene contains one of the query.ct
                        if (geneContainSo) {
                            geneWithSoLinks.push(`<span class="gene-tooltip" data-tooltip-text='${tooltipText}' style="margin-left: 2px;">
                                                    <a>
                                                        ${geneName}
                                                    </a>
                                                 </span>`);
                        } else {
                            geneLinks.push(`<span class="gene-tooltip" data-tooltip-text='${tooltipText}' style="margin-left: 2px;color: darkgray;font-style: italic">
                                                <span>
                                                    ${geneName}
                                                </span>
                                            </span>`);
                        }
                    } else {
                        // No query.ct passed
                        geneLinks.push(`<span class="gene-tooltip" data-tooltip-text='${tooltipText}' style="margin-left: 2px">
                                            <a>
                                                ${geneName}
                                            </a>
                                        </span>`);
                    }
                    visited[geneName] = true;
                }
            }

            // Do not write more than 4 genes per line, this could be easily configurable
            let resultHtml = "";

            // First, print Genes with query CT
            if (geneToSo) {
                for (let i = 0; i < geneWithSoLinks.length; i++) {
                    resultHtml += geneWithSoLinks[i];
                    if (i + 1 !== geneWithSoLinks.length) {
                        resultHtml += ",";
                    }
                }
                resultHtml += "<br>";
            }

            // Second, the other genes
            for (let i = 0; i < geneLinks.length; i++) {
                resultHtml += geneLinks[i];
                if (i + 1 !== geneLinks.length) {
                    if (i === 0) {
                        resultHtml += ",";
                    } else if ((i + 1) % 2 !== 0) {
                        resultHtml += ",";
                    } else {
                        resultHtml += "<br>";
                    }
                }
            }

            return resultHtml;
        } else {
            return "-";
        }
    }

    typeFormatter(value, row, index) {
        if (row !== undefined) {
            let type = row.type;
            let color = "";
            switch (row.type) {
                case "SNP":
                    type = "SNV";
                    break;
                case "INDEL":
                case "MNV":
                    color = "darkorange";
                    break;
                case "INSERTION":
                case "DELETION":
                    color = "red";
                    break;
                default:
                    color = "black";
                    break;
            }
            return `<span style="color: ${color}">${type}</span>`;
        } else {
            return "-";
        }
    }

    consequenceTypeFormatter(value, row, index) {
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined" && UtilsNew.isNotEmptyArray(row.annotation.consequenceTypes)) {
            let consequenceTypesArr = [];
            let visited = new Set();
            let impact = {};
            for (let i = 0; i < row.annotation.consequenceTypes.length; i++) {
                for (let j = 0; j < row.annotation.consequenceTypes[i].sequenceOntologyTerms.length; j++) {

                    let consequenceTypeName = row.annotation.consequenceTypes[i].sequenceOntologyTerms[j].name;

                    // FIXME This is a temporal fix for some wrong CTs. This must be removed ASAP.
                    if (consequenceTypeName === "2KB_downstream_gene_variant") {
                        consequenceTypeName = "2KB_downstream_variant";
                    }
                    if (consequenceTypeName === "2KB_upstream_gene_variant") {
                        consequenceTypeName = "2KB_upstream_variant";
                    }

                    if (typeof consequenceTypeName !== "undefined" && consequenceTypeName !== "" && !visited.has(consequenceTypeName)) {
                        if (typeof this.consequenceTypeToImpact !== "undefined"
                            && typeof this.consequenceTypeToImpact[consequenceTypeName] !== "undefined") {
                            let imp = this.consequenceTypeToImpact[consequenceTypeName];
                            if (typeof impact[imp] === "undefined") {
                                impact[imp] = [];
                            }
                            if (typeof this.consequenceTypeToColor !== "undefined"
                                && typeof this.consequenceTypeToColor[consequenceTypeName] !== "undefined") {
                                impact[imp].push("<span style=\"color: " + this.consequenceTypeToColor[consequenceTypeName] + "\">" + consequenceTypeName + "</span>");
                            } else {
                                impact[imp].push("<span>" + consequenceTypeName + "</span>");
                            }

                        }
                        visited.add(consequenceTypeName);
                    }
                }
            }

            if (Object.keys(impact).length > 0) {
                if (typeof impact["high"] !== "undefined" || typeof impact["moderate"] !== "undefined") {
                    if (typeof impact["high"] !== "undefined") {
                        Array.prototype.push.apply(consequenceTypesArr, impact["high"]);
                    }
                    if (typeof impact["moderate"] !== "undefined") {
                        Array.prototype.push.apply(consequenceTypesArr, impact["moderate"]);
                    }
                } else if (typeof impact["low"] !== "undefined") {
                    Array.prototype.push.apply(consequenceTypesArr, impact["low"]);
                } else if (typeof impact["modifier"] !== "undefined") {
                    Array.prototype.push.apply(consequenceTypesArr, impact["modifier"]);
                }
            }

            return consequenceTypesArr.join("<br>");
        }
        return "-";
    }

    _consequenceTypeDetailFormatterFilter(cts, query, filter) {
        let showArrayIndexes = [];
        for (let i = 0; i < cts.length; i++) {
            let ct = cts[i];
            let result = true;
            if (filter) {
                if (filter.consequenceType.gencodeBasic) {
                    result = result && ct.transcriptAnnotationFlags && ct.transcriptAnnotationFlags.includes("basic");
                }
                // if (result && filter.consequenceType.filterByBiotype) {
                //     if (query && query.biotype) {
                //         result = result && query.biotype.split(",").includes(ct.biotype);
                //     }
                // }
                // if (result && filter.consequenceType.filterByConsequenceType) {
                //     if (query && query.ct) {
                //         let cts = query.ct.split(",");
                //         let isSoPresent = false;
                //         for (let term of ct.sequenceOntologyTerms) {
                //             isSoPresent = isSoPresent || cts.includes(term.name);
                //         }
                //         result = result && isSoPresent;
                //     }
                // }
            }
            if (result) {
                showArrayIndexes.push(i);
            }
        }
        return showArrayIndexes;
    }

    toggleDetailConsequenceType(e) {
        let id = e.target.dataset.id;
        let elements = document.getElementsByClassName(this._prefix + id + "Filtered");
        for (let element of elements) {
            if (element.style.display === "none") {
                element.style.display = "";
            } else {
                element.style.display = "none";
            }
        }
    }

    consequenceTypeDetailFormatter(value, row, variantGrid, query, filter) {
        if (row?.annotation?.consequenceTypes && row.annotation.consequenceTypes.length > 0) {
            // Sort and group CTs by Gene name
            row.annotation.consequenceTypes.sort(function (a, b) {
                if (a.geneName === "" && b.geneName !== "") {
                    return 1;
                }
                if (a.geneName !== "" && b.geneName === "") {
                    return -1;
                }
                if (a.geneName < b.geneName) {
                    return -1;
                }
                if (a.geneName > b.geneName) {
                    return 1;
                }
                return 0;
            });

            let showArrayIndexes = this._consequenceTypeDetailFormatterFilter(row.annotation.consequenceTypes, query, filter);
            let message = "";
            if (filter) {
                // Create two different divs to 'show all' or 'apply filter' title
                message = `<div class="${variantGrid._prefix}${row.id}Filtered">Showing <span style="font-weight: bold; color: red">${showArrayIndexes.length}</span> of 
                                <span style="font-weight: bold; color: red">${row.annotation.consequenceTypes.length}</span> consequence types, 
                                <a id="${variantGrid._prefix}${row.id}ShowCt" data-id="${row.id}" style="cursor: pointer">show all...</a>
                            </div>
                            <div class="${variantGrid._prefix}${row.id}Filtered" style="display: none">Showing <span style="font-weight: bold; color: red">${row.annotation.consequenceTypes.length}</span> of 
                                <span style="font-weight: bold; color: red">${row.annotation.consequenceTypes.length}</span> consequence types, 
                                <a id="${variantGrid._prefix}${row.id}HideCt" data-id="${row.id}" style="cursor: pointer">apply filters...</a>
                           </div>
                            `;
            }

            let ctHtml = `<div style="padding-bottom: 5px">
                              ${message}
                          </div>
                          <table id="ConsqTypeTable" class="table table-hover table-no-bordered">
                              <thead>
                                  <tr>
                                      <th rowspan="2">Gene Name</th>
                                      <th rowspan="2">Ensembl Gene</th>                                     
                                      <th rowspan="2">Ensembl Transcript</th>
                                      <th rowspan="2">Biotype</th>
                                      <th rowspan="2">Transcript Flags</th>
                                      <th rowspan="2">Consequence Types (SO Term)</th>
                                      <th rowspan="1" colspan="3" style="text-align: center">Protein Variant Annotation</th>
                                  </tr>
                                  <tr>
                                      <th rowspan="1">UniProt Acc</th>
                                      <th rowspan="1">Position</th>
                                      <th rowspan="1">Ref/Alt</th>
                                  </tr>
                              </thead>
                              <tbody>`;

            for (let i = 0; i < row.annotation.consequenceTypes.length; i++) {
                let ct = row.annotation.consequenceTypes[i];

                // Prepare data info for columns
                let geneName = ct.geneName ? `<a href="https://www.genenames.org/tools/search/#!/all?query=${ct.geneName}" target="_blank">${ct.geneName}</a>` : "-";
                let geneId = ct.ensemblGeneId ? `<a href="${BioinfoUtils.getEnsemblLink(ct.ensemblGeneId, "gene", this.opencgaSession.project.organism.assembly)}" target="_blank">${ct.ensemblGeneId}</a>` : "-";
                let transcriptId = ct.ensemblTranscriptId ? `<a href="${BioinfoUtils.getEnsemblLink(ct.ensemblTranscriptId, "transcript", this.opencgaSession.project.organism.assembly)}" target="_blank">${ct.ensemblTranscriptId}</a>` : "-";

                let transcriptAnnotationFlags = "-";
                if (ct.ensemblTranscriptId) {
                    transcriptAnnotationFlags = ct.transcriptAnnotationFlags && ct.transcriptAnnotationFlags.length ? ct.transcriptAnnotationFlags.join(", ") : "NA";
                }

                let soArray = [];
                for (let so of ct.sequenceOntologyTerms) {
                    let color = "black";
                    if (typeof variantGrid.consequenceTypeToColor !== "undefined"
                        && typeof variantGrid.consequenceTypeToColor[so.name] !== "undefined") {
                        color = variantGrid.consequenceTypeToColor[so.name];
                    }
                    soArray.push(`<div style="color: ${color}">
                                    ${so.name} (<a href="http://www.sequenceontology.org/browser/current_svn/term/${so.accession}" target="_blank">${so.accession}</a>)
                                  </div>`);
                }

                let pva = ct.proteinVariantAnnotation ? ct.proteinVariantAnnotation : {};
                let uniprotAccession = pva.uniprotAccession ? `<a href="https://www.uniprot.org/uniprot/${pva.uniprotAccession}" target="_blank">${pva.uniprotAccession}</a>` : "-";

                // Create the table row
                let hideClass = showArrayIndexes.includes(i) ? "" : `${variantGrid._prefix}${row.id}Filtered`;
                let displayStyle = showArrayIndexes.includes(i) ? "" : "display: none";
                ctHtml += `<tr class="detail-view-row ${hideClass}" style="${displayStyle}">
                                <td>${geneName}</td>
                                <td>${geneId}</td>
                                <td>${transcriptId}</td>
                                <td>${UtilsNew.isNotEmpty(ct.biotype) ? ct.biotype : "-"}</td>
                                <td>${transcriptAnnotationFlags}</td>
                                <td>${soArray.join("")}</td>
                                <td>${uniprotAccession}</td>
                                <td>${pva.position !== undefined ? pva.position : "-"}</td>
                                <td>${pva.reference !== undefined ? pva.reference + "/" + pva.alternate : "-"}</td>
                           </tr>`;
            }
            ctHtml += "</tbody></table>";
            return ctHtml;
        }
        return "-";
    }

    addCohortStatsInfoTooltip(div, populationFrequencies) {
        $("#" + div).qtip({
            content: {
                title: "Cohort Stats",
                text: function (event, api) {
                    return `One coloured square is shown for each cohort. Frequencies are coded with colours which classify values 
                            into 'very rare', 'rare', 'average', 'common' or 'missing', see 
                            <a href="http://www.dialogues-cns.com/wp-content/uploads/2015/03/DialoguesClinNeurosci-17-69-g001.jpg" target="_blank">
                                http://www.dialogues-cns.com/wp-content/uploads/2015/03/DialoguesClinNeurosci-17-69-g001.jpg
                            </a>. Please, leave the cursor over each square to visualize the actual frequency values.
                            <div style="padding: 10px 0px 0px 0px"><label>Legend: </label></div>
                            <div><span><i class="fa fa-square" style="color: ${populationFrequencies.style.veryRare}" aria-hidden="true"></i> Very rare:  freq < 0.001</span></div>
                            <div><span><i class="fa fa-square" style="color: ${populationFrequencies.style.rare}" aria-hidden="true"></i> Rare:  freq < 0.005</span></div>
                            <div><span><i class="fa fa-square" style="color: ${populationFrequencies.style.average}" aria-hidden="true"></i> Average:  freq < 0.05</span></div>
                            <div><span><i class="fa fa-square" style="color: ${populationFrequencies.style.common}" aria-hidden="true"></i> Common:  freq >= 0.05</span></div>
                            <div><span><i class="fa fa-square" style="color: black" aria-hidden="true"></i> Not observed</span></div>`;
                },
            },
            position: {target: "mouse", adjust: {x: 2, y: 2, mouse: false}},
            style: {width: true, classes: "qtip-light qtip-rounded qtip-shadow qtip-custom-class"},
            show: {delay: 200},
            hide: {fixed: true, delay: 300}
        });
    }

    /**
     * Creates the colored table with one row and as many columns as populations.
     * @param cohorts
     * @param populationFrequenciesColor
     */
    createCohortStatsTable(cohorts, cohortStats, populationFrequenciesColor) {
        // This is used by the tooltip function below to display all population frequencies
        let popFreqsTooltip;
        let popFreqsArray = [];
        for (let cohort of cohorts) {
            let freq = (cohortStats.get(cohort.id) !== undefined) ? cohortStats.get(cohort.id) : 0;
            popFreqsArray.push(cohort.name + "::" + freq);
        }
        popFreqsTooltip = popFreqsArray.join(",");

        // Create the table (with the tooltip info)
        let tableSize = cohorts.length * 15;
        let htmlPopFreqTable = `<table style="width:${tableSize}px" class="cohortStatsTable" data-pop-freq="${popFreqsTooltip}"><tr>`;
        for (let cohort of cohorts) {
            let color = "black";
            if (typeof cohortStats.get(cohort.id) !== "undefined") {
                let freq = cohortStats.get(cohort.id);
                color = this._getPopulationFrequencyColor(freq, populationFrequenciesColor);
            }
            htmlPopFreqTable += `<td style="width: 15px; background: ${color}">&nbsp;</td>`;
        }
        htmlPopFreqTable += "</tr></table>";
        return htmlPopFreqTable;
    }

    addPopulationFrequenciesInfoTooltip(selector, populationFrequencies) {
        $(selector).qtip({
            content: {
                title: "Population Frequencies",
                text: function (event, api) {
                    return `One coloured square is shown for each population. Frequencies are coded with colours which classify values 
                            into 'very rare', 'rare', 'average', 'common' or 'missing', see 
                            <a href="https://www.nature.com/scitable/topicpage/multifactorial-inheritance-and-genetic-disease-919" target="_blank">
                                https://www.nature.com/scitable/topicpage/multifactorial-inheritance-and-genetic-disease-919
                            </a>. Please, leave the cursor over each square to display the actual frequency value.
                            <div style="padding: 10px 0px 0px 0px"><label>Legend: </label></div>
                            <div><span><i class="fa fa-square" style="color: ${populationFrequencies.style.veryRare}" aria-hidden="true"></i> Very rare:  freq < 0.001</span></div>
                            <div><span><i class="fa fa-square" style="color: ${populationFrequencies.style.rare}" aria-hidden="true"></i> Rare:  freq < 0.005</span></div>
                            <div><span><i class="fa fa-square" style="color: ${populationFrequencies.style.average}" aria-hidden="true"></i> Average:  freq < 0.05</span></div>
                            <div><span><i class="fa fa-square" style="color: ${populationFrequencies.style.common}" aria-hidden="true"></i> Common:  freq >= 0.05</span></div>
                            <div><span><i class="fa fa-square" style="color: black" aria-hidden="true"></i> Not observed</span></div>`;
                },
            },
            position: {target: "mouse", adjust: {x: 2, y: 2, mouse: false}},
            style: {width: true, classes: "qtip-light qtip-rounded qtip-shadow qtip-custom-class"},
            show: {delay: 200},
            hide: {fixed: true, delay: 300}
        });
    }

    /**
     * Creates the colored table with one row and as many columns as populations.
     * @param populations
     * @param populationFrequenciesMap
     * @param populationFrequenciesColor
     */
    createPopulationFrequenciesTable(populations, populationFrequenciesMap, populationFrequenciesColor) {
        // This is used by the tooltip function below to display all population frequencies
        let popFreqsTooltip;
        let popFreqsArray = [];
        for (let population of populations) {
            let freq = (populationFrequenciesMap.get(population) !== undefined) ? populationFrequenciesMap.get(population) : 0;
            popFreqsArray.push(population + "::" + freq);
        }
        popFreqsTooltip = popFreqsArray.join(",");

        // Create the table (with the tooltip info)
        let tableSize = populations.length * 15;
        let htmlPopFreqTable = `<table style="width:${tableSize}px" class="populationFrequenciesTable" data-pop-freq="${popFreqsTooltip}"><tr>`;
        for (let population of populations) {
            // This array contains "study:population"
            let color = "black";
            if (typeof populationFrequenciesMap.get(population) !== "undefined") {
                let freq = populationFrequenciesMap.get(population);
                color = this._getPopulationFrequencyColor(freq, populationFrequenciesColor);
            }
            htmlPopFreqTable += `<td style="width: 15px; background: ${color}; border-right: 1px solid white;">&nbsp;</td>`;
        }
        htmlPopFreqTable += "</tr></table>";
        return htmlPopFreqTable;
    }

    addPopulationFrequenciesTooltip(div, populationFrequencies) {
        if (UtilsNew.isEmpty(div)) {
            div = "table.populationFrequenciesTable";
        }

        let _this = this;
        $(div).qtip({
            content: {
                title: "Population Frequencies",
                text: function (event, api) {
                    let popFreqs = $(this).attr("data-pop-freq").split(",");
                    let html = "";
                    for (let popFreq of popFreqs) {
                        let arr = popFreq.split("::");
                        let color = _this._getPopulationFrequencyColor(arr[1], populationFrequencies.style);
                        let freq = (arr[1] !== 0 && arr[1] !== "0") ? arr[1] : "0.00 (NA)";
                        html += `<div>
                                    <span><i class="fa fa-xs fa-square" style="color: ${color}" aria-hidden="true"></i>
                                        <label style="padding-left: 5px">${arr[0]}:</label>
                                    </span>
                                    <span style="font-weight: bold">${freq}</span>
                                </div>`;
                    }
                    return html;
                }
            },
            position: {target: "mouse", adjust: {x: 2, y: 2, mouse: false}},
            style: {width: true, classes: "qtip-light qtip-rounded qtip-shadow qtip-custom-class"},
            show: {delay: 200},
            hide: {fixed: true, delay: 300}
        });
    }

    _getPopulationFrequencyColor(freq, populationFrequenciesColor) {
        let color;
        if (freq === 0 || freq === "0") {
            color = populationFrequenciesColor.unobserved;
        } else if (freq < 0.001) {
            color = populationFrequenciesColor.veryRare;
        } else if (freq < 0.005) {
            color = populationFrequenciesColor.rare;
        } else if (freq < 0.05) {
            color = populationFrequenciesColor.average;
        } else {
            color = populationFrequenciesColor.common;
        }
        return color;
    }

    clinicalPhenotypeFormatter(value, row, index) {
        let phenotypeHtml = "<span><i class='fa fa-times' style='color: red'></i></span>";
        if (row?.annotation?.traitAssociation) {
            // Filter the traits for this column
            const traits = row.annotation.traitAssociation.filter(trait => trait.source.name.toUpperCase() === this.field.toUpperCase());
            if (this.field === "clinvar") {
                let results = [];
                if (traits.length === 0) {
                    return "<span title='No ClinVar record found for this variant'><i class='fa fa-times' style='color: gray'></i></span>";
                }
                // There are some clinvar traits
                let clinicalSignificanceVisited = {};
                for (let trait of traits) {
                    let clinicalSignificance = trait?.variantClassification?.clinicalSignificance || "UNKNOWN";
                    let code = "";
                    let color = "";
                    let tooltip = "";
                    switch (clinicalSignificance.toUpperCase()) {
                        case "BENIGN":
                            code = "B";
                            color = "green";
                            tooltip = "Classified as benign following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                            break;
                        case "LIKELY_BENIGN":
                            code = "LB";
                            color = "brown";
                            tooltip = "Classified as likely benign following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                            break;
                        case "VUS":
                        case "UNCERTAIN_SIGNIFICANCE":
                            code = "US";
                            color = "darkorange";
                            tooltip = "Classified as of uncertain significance following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                            break;
                        case "LIKELY_PATHOGENIC":
                            code = "LP";
                            color = "darkred";
                            tooltip = "Classified as likely pathogenic following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                            break;
                        case "PATHOGENIC":
                            code = "P";
                            color = "red";
                            tooltip = "Classified as pathogenic following ACMG/AMP recommendations for variants interpreted for Mendelian disorders";
                            break;
                        case "UNKNOWN":
                            code = "NP";
                            color = "grey";
                            tooltip = "ClinVar submissions without an interpretation of clinical significance";
                            break;
                    }

                    if (code !== "NP") {
                        if (typeof clinicalSignificanceVisited[code] === "undefined") {
                            if (code === "BB" || code === "LB") {
                                results.push(`<span style="color: ${color}" title="${tooltip}">${code}</span>`);
                            } else {
                                results.push(`<span style="color: ${color}" title="${tooltip}">${code}</span>`);
                            }
                            clinicalSignificanceVisited[code] = true;
                        }
                    }
                }

                // This can only be shown if nothing else exists
                if (results.length === 0) {
                    results.push(`<span style="color: grey" title="ClinVar submissions without an interpretation of clinical significance">NP</span>`);
                }
                return results.join("<br>");
            } else {
                if (this.field === "cosmic") {
                    if (traits.length === 0) {
                        return "<span title='No Cosmic record found for this variant'><i class='fa fa-times' style='color: gray'></i></span>";
                    }
                    let tooltip = [];
                    for (let trait of traits) {
                        if (trait?.somaticInformation) {
                            tooltip.push(trait?.somaticInformation?.primaryHistology);
                        }
                    }
                    return `<span data-toggle="tooltip" data-placement="bottom" title="${tooltip.join(", ")}"><i class='fa fa-check' style='color: green'></i></span>`;

                } else {
                    console.error("Wrong clinical source : " + this.field);
                }
            }
        }
        return phenotypeHtml;
    }

    addPhenotypesInfoTooltip(div) {
        $("#" + div).qtip({
            content: {
                title: "Phenotypes",
                text: function (event, api) {
                    return `<div>
                                <span style="font-weight: bold">ClinVar</span> is a freely accessible, public archive of reports of the relationships among human variations 
                                and phenotypes, with supporting evidence.
                            </div>
                            <div style="padding-top: 10px">
                                <span style="font-weight: bold">COSMIC</span> is the world's largest and most comprehensive resource for exploring the impact of somatic mutations in human cancer.
                            </div>

                           `;
                },
            },
            position: {target: "mouse", adjust: {x: 2, y: 2, mouse: false}},
            style: {width: true, classes: "qtip-light qtip-rounded qtip-shadow qtip-custom-class"},
            show: {delay: 200},
            hide: {fixed: true, delay: 300}
        });
    }

    /*
    * File attributes formatters
    */
    variantAlleleFrequencyDetailFormatter(value, row, variantGrid) {
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
            for (let sample of study.samples) {
                let file = study.files?.length > sample.fileIndex ? study.files[sample.fileIndex] : null;

                let referenceFreq, referenceCount;
                let alternateFreq, alternateCount;
                let secondaryAlternate = "-";
                let secondaryAlternateFreq;
                let originalCall;

                let ad, af, dp;
                // Get DP value
                let dpIdx = study.sampleDataKeys.findIndex(e => e === "DP");
                if (dpIdx !== -1) {
                    dp = Number.parseInt(sample.data[dpIdx]);
                } else {
                    dp = file.data.DP ? Number.parseInt(file.data.DP) : null;
                }

                // Sample format can contain AD or AF
                let adIdx = study.sampleDataKeys.findIndex(e => e === "AD");
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
                    let afIdx = study.sampleDataKeys.findIndex(e => e === "AF");
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
                        let split = originalCall.split(",");
                        secondaryAlternate = split[1] !== "&lt;NON_REF&gt;" ? split[1] : "none";
                    }
                } else {
                    originalCall = `${row.chromosome}:${row.position}:${row.reference}:${row.alternate}`;
                }

                let format = [];
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
                let sampleIdColor = variantGrid?.clinicalAnalysis?.proband?.samples[0]?.id === sample.sampleId ? "darkred" : "black";
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

            fileAttrHtml += `</tbody></table>`;
        }
        return fileAttrHtml;
    }

    /*
     * Reported Variant formatters
     */
    toggleDetailClinicalEvidence(e) {
        let id = e.target.dataset.id;
        let elements = document.getElementsByClassName(this._prefix + id + "EvidenceFiltered");
        for (let element of elements) {
            if (element.style.display === "none") {
                element.style.display = "";
            } else {
                element.style.display = "none";
            }
        }
    }

    reportedEventDetailFormatter(value, row, variantGrid, query, filter) {
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

            let showArrayIndexes = this._consequenceTypeDetailFormatterFilter(row.annotation.consequenceTypes, query, filter);
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
                                        <th rowspan="1" colspan="2" style="text-align: center">Classification</th>
                                    </tr>
                                    <tr>
                                        <th rowspan="1">Tier</th>
                                        <th rowspan="1">Clinical Significance</th>
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
                let re = row.evidences[i];

                // FIXME Maybe this should happen in the server?
                // If ct exist and there are some consequenceTypeIds then we check that the report event matches the query
                if (UtilsNew.isNotEmptyArray(re.consequenceTypeIds) && consequenceTypeSet.size > 0) {
                    let hasConsequenceType = false;
                    for (let ct of re.consequenceTypeIds) {
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
                        for (let ct of row.annotation.consequenceTypes) {
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
                    for (let ct of row.annotation.consequenceTypes) {
                        if (re.genomicFeature.transcriptId === ct.ensemblTranscriptId) {
                            if (ct.transcriptAnnotationFlags !== undefined && ct.transcriptAnnotationFlags.includes("basic")) {
                                transcriptFlag = `<span data-toggle="tooltip" data-placement="bottom" title="Proband">
                                                    <i class='fa fa-check' style='color: green'></i>
                                                  </span>`;
                                transcriptFlagChecked = true;
                            } else {
                                if (re.genomicFeature.transcriptId) {
                                    transcriptFlag = `<span><i class='fa fa-times' style='color: red'></i></span>`;
                                } else {
                                    transcriptFlag = `-`;
                                }
                            }
                            break;
                        }
                    }
                }

                let soArray = [];
                if (re.genomicFeature.consequenceTypes && re.genomicFeature.consequenceTypes.length > 0) {
                    for (let so of re.genomicFeature.consequenceTypes) {
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
                let hideClass = showArrayIndexes.includes(i) ? "" : `${variantGrid._prefix}${row.id}EvidenceFiltered`;
                let displayStyle = showArrayIndexes.includes(i) ? "" : "display: none";

                // Create the table row
                if (variantGrid.clinicalAnalysis.type.toUpperCase() !== "CANCER") {
                    ctHtml += `<tr class="detail-view-row ${hideClass}" style="${displayStyle}">
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
                    ctHtml += `<tr class="detail-view-row ${hideClass}" style="${displayStyle}">
                            <td>${gene}</td>
                            <td>${transcriptId}</td>
                            <td>${hgvsHtml}</td>
                            <td>${transcriptFlag}</td>
                            <td>${soArray.join("")}</td>
                            <td>${panel}</td>
                            <td>${roleInCancer}</td>
                            <td>${actionable}</td>
                            <td>${tier}</td>
                            <td>${clinicalSignificance}</td>
                           </tr>`;
                }

            }
            ctHtml += "</tbody></table>";
            return ctHtml;
        }
        return "-";
    }

    addTooltip(selector, title, content, config) {
        $(selector).qtip({
            content: {
                title: title,
                text: function (event, api) {
                    if (UtilsNew.isNotEmpty(content)) {
                        return content;
                    } else {
                        return $(this).attr("data-tooltip-text");
                    }
                }
            },
            position: {target: "mouse", adjust: {x: 2, y: 2, mouse: false}},
            style: {classes: "qtip-light qtip-rounded qtip-shadow qtip-custom-class"},
            show: {delay: 200},
            hide: {fixed: true, delay: 300}
        });
    }

}
