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

class VariantGridFormatter {

    constructor(opencgaSession, config) {
        this.opencgaSession = opencgaSession;
        this.config = config;

        this.prefix = "VarBrowserGrid-" + Utils.randomString(6);
    }

    assignColors(consequenceTypes, proteinSubstitutionScores) {
        let result = {};
        if (typeof consequenceTypes !== "undefined") {
            let consequenceTypeToColor = {};
            let consequenceTypeToImpact = {};
            for (let i = 0; i < consequenceTypes.categories.length; i++) {
                if (typeof consequenceTypes.categories[i].terms !== "undefined") {
                    for (let j = 0; j < consequenceTypes.categories[i].terms.length; j++) {
                        consequenceTypeToColor[consequenceTypes.categories[i].terms[j].name] = consequenceTypes.color[consequenceTypes.categories[i].terms[j].impact];
                        consequenceTypeToImpact[consequenceTypes.categories[i].terms[j].name] = consequenceTypes.categories[i].terms[j].impact;
                    }
                } else if (typeof consequenceTypes.categories[i].id !== "undefined" && typeof consequenceTypes.categories[i].name !== "undefined") {
                    consequenceTypeToColor[consequenceTypes.categories[i].name] = consequenceTypes.color[consequenceTypes.categories[i].impact];
                    consequenceTypeToImpact[consequenceTypes.categories[i].name] = consequenceTypes.categories[i].impact;
                }
            }
            // this.consequenceTypeToColor = consequenceTypeToColor;
            // this.consequenceTypeToImpact = consequenceTypeToImpact;
            result = {
                consequenceTypeToColor: consequenceTypeToColor,
                consequenceTypeToImpact: consequenceTypeToImpact
            }
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

    variantFormatter(value, row, index) {
        if (row === undefined) {
            return;
        }

        let ref = (row.reference !== "") ? row.reference : "-";
        let alt = (row.alternate !== "") ? row.alternate : "-";

        ref = (ref.length > this.config.alleleStringLengthMax) ? ref.substring(0, this.config.alleleStringLengthMax - 3) + "..." : ref;
        alt = (alt.length > this.config.alleleStringLengthMax) ? alt.substring(0, this.config.alleleStringLengthMax - 3) + "..." : alt;

        let id = row.id;
        if (typeof row.annotation !== "undefined" && typeof row.annotation.xrefs !== "undefined" && row.annotation.xrefs.length > 0) {
            row.annotation.xrefs.find(function (element) {
                if (element.source === "dbSNP") {
                    id = element.id;
                }
            });
        }

        let genomeBrowserMenuLink = "";
        if (this.config.showGenomeBrowser) {
            genomeBrowserMenuLink = `<li class="dropdown-header">Internal Links</li>
                                     <li>
                                        <a class="genome-browser-option" data-variant-position="${row.chromosome}:${row.start}-${row.end}" style="cursor: pointer">
                                            <i class="fa fa-list" aria-hidden="true"></i> Genome Browser
                                        </a>
                                     </li>`;
        }

        // return "<span style='white-space: nowrap'>" + row.chromosome + ':' + row.start + " " + ref + '/' + alt + "</span>";
        return `<div class="dropdown variant-link-dropdown" style="white-space: nowrap">
                            <a id="${this.prefix}dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                                class="genome-browser-option" data-variant-position="${row.chromosome}:${row.start}-${row.end}" style="cursor: pointer">
                                    ${row.chromosome}:${row.start}&nbsp;&nbsp;${ref}/${alt}
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="${this.prefix}dropdownMenu1" style="font-size: 1.25rem;margin-top: 0px">
                                ${genomeBrowserMenuLink}
                                <li class="dropdown-header" style="padding-left: 15px">External Links</li>
                                <li><a target='_blank' href="https://www.ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=${id}">Ensembl</a></li>
                                <li><a target='_blank' href="https://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs=${id}">dbSNP</a></li>
                                <li><a target='_blank' href="https://www.snpedia.com/index.php/${id}">SNPedia</a></li>
                                <li><a target='_blank' href="https://www.ncbi.nlm.nih.gov/clinvar/?term=${id}">ClinVar</a></li>
                            </ul>
                </div>`;
    }

    snpFormatter(value, row, index) {
        /*
            We try first to read SNP ID from the identifier of the variant (this identifier comes from the file).
            If this ID is not a "rs..." (it is a variant with the format: "13:20277279:-:T") then we search
            the rs in the CellBase XRef annotations. This field is in annotation.xref when source: "dbSNP".
        */
        if (typeof row.id !== "undefined" && row.id.startsWith("rs")) {
            if (this.opencgaSession.project.organism !== undefined && this.opencgaSession.project.organism.assembly === "GRCh37") {
                return "<a target='_blank' href='http://grch37.ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=" + row.id + "'>" + row.id + "</a>";
            } else {
                return "<a target='_blank' href='http://www.ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=" + row.id + "'>" + row.id + "</a>";
            }
        } else if (typeof row.annotation !== "undefined" && typeof row.annotation.xrefs !== "undefined" && row.annotation.xrefs.length > 0) {
            let annotation = row.annotation.xrefs.find(function (element) {
                return element.source === "dbSNP";
            });
            if (typeof annotation !== "undefined") {
                return "<a target='_blank' href='http://grch37.ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=" + annotation.id + "'>" + annotation.id + "</a>";
            }
        }
        return "-";
    }

    geneFormatter(value, row, index) {
        if (typeof row !== "undefined" && row.annotation !== undefined && UtilsNew.isNotEmptyArray(row.annotation.consequenceTypes)) {
            let visited = {};
            let geneLinks = [];
            for (let i = 0; i < row.annotation.consequenceTypes.length; i++) {
                let geneName = row.annotation.consequenceTypes[i].geneName;
                if (UtilsNew.isNotEmpty(geneName) && typeof visited[geneName] === "undefined") {
                    if (typeof this.opencgaSession.project !== "undefined" && typeof this.opencgaSession.study !== "undefined") {
                        // geneLinks.push(`<a style="cursor: pointer"
                        //                         href="#gene/${this.opencgaSession.project.alias}/${this.opencgaSession.study.alias}/${row.annotation.consequenceTypes[i].geneName}">
                        //                             ${row.annotation.consequenceTypes[i].geneName}
                        //                     </a>`);


                        let genomeBrowserMenuLink = "";
                        if (this.config.showGenomeBrowser) {
                            genomeBrowserMenuLink = `<li>
                                                        <a class="genome-browser-option" data-variant-position="${row.chromosome}:${row.start}-${row.end}" style="cursor: pointer">
                                                            Genome Browser
                                                        </a>
                                                    </li>`;
                        }

                    // <li class="dropdown-header">Internal Links</li>
                        geneLinks.push(`<span class="dropdown variant-link-dropdown" style="white-space: nowrap;margin-left: 1px">
                            <a id="${this.prefix}dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                                class="genome-browser-option" data-variant-position="${row.chromosome}:${row.start}-${row.end}" style="cursor: pointer">
                                    ${geneName}
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="${this.prefix}dropdownMenu1" style="font-size: 1.25rem;margin-top: 0px">
                                <li><a style="cursor: pointer" href="#gene/${this.opencgaSession.project.alias}/${this.opencgaSession.study.alias}/${geneName}">Gene View</a></li>
                                ${genomeBrowserMenuLink}
                                <li class="dropdown-header" style="padding-left: 15px">External Links</li>
                                <li><a target='_blank' href="http://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${geneName}">Ensembl</a></li>
                                <li><a target='_blank' href="https://cancer.sanger.ac.uk/cosmic/gene/analysis?ln=${geneName}">COSMIC</a></li>
                                <li><a target='_blank' href="https://www.uniprot.org/uniprot/?sort=score&query=${geneName}">UniProt</a></li>
                            </ul>
                        </span>`);

                    } else {
                        geneLinks.push(`<a style="cursor: pointer">${geneName}</a>`)
                    }
                    visited[geneName] = true;
                }
            }
            return geneLinks.join(",");
        } else {
            return "-";
        }
    }

    typeFormatter(value, row, index) {
        if (row !== undefined) {
            let color = "";
            switch (row.type) {
                case "INDEL":
                case "MNV":
                    color = "orange";
                    break;
                case "INSERTION":
                case "DELETION":
                    color = "red";
                    break;
                default:
                    color = "black";
                    break;
            }

            return `<span style="color: ${color}">${row.type}</span>`;
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

    consequenceTypeDetailFormatter(value, row, variantGrid) {
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined" && UtilsNew.isNotEmptyArray(row.annotation.consequenceTypes)) {
            // Sort and group CTs by Gene name
            row.annotation.consequenceTypes.sort(function(a, b) {
                if (a.geneName < b.geneName) {
                    return -1;
                }
                if (a.geneName > b.geneName) {
                    return 1;
                }
                return 0;
            });

            let ctHtml = `<table id="{{prefix}}ConsqTypeTable" class="table table-hover table-no-bordered">
                                <thead>
                                    <tr>
                                        <th rowspan="2">Gene Name</th>
                                        <th rowspan="2">Ensembl Gene</th>                                     
                                        <th rowspan="2">Ensembl Transcript</th>
                                        <th rowspan="2">Biotype</th>
                                        <th rowspan="2">Transcript Flags</th>
                                        <th rowspan="2">SO Term</th>
                                        <th rowspan="1" colspan="4" style="text-align: center">Protein Variant Annotation</th>
                                    </tr>
                                    <tr>
                                        <th rowspan="1">UniProt Acc</th>
                                        <th rowspan="1">Position</th>
                                        <th rowspan="1">Ref/Alt</th>
                                        <th rowspan="1">Sift/Polyphen</th>
                                    </tr>
                                </thead>
                                <tbody>`;

            for (let ct of row.annotation.consequenceTypes) {
                // Prepare data info for columns

                let geneName = "NA";
                if (UtilsNew.isNotEmpty(ct.geneName)) {
                    geneName = `<a href="https://www.genenames.org/tools/search/#!/all?query=${ct.geneName}" target="_blank">
                                ${ct.geneName}
                              </a>`;
                }

                let geneId = "NA";
                if (UtilsNew.isNotEmpty(ct.ensemblGeneId)) {
                    geneId = `<a href="http://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${ct.ensemblGeneId}" target="_blank">
                                ${ct.ensemblGeneId}
                              </a>`;
                }

                let pva = {};
                if (UtilsNew.isNotUndefinedOrNull(ct.proteinVariantAnnotation)) {
                    pva = ct.proteinVariantAnnotation;
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

                let uniprotAccession = "-";
                if (UtilsNew.isNotUndefinedOrNull(pva.uniprotAccession)) {
                    uniprotAccession = `<a href="https://www.uniprot.org/uniprot/${pva.uniprotAccession}" target="_blank">${pva.uniprotAccession}</a>`;
                }

                let deleteriousness = "";
                if (UtilsNew.isNotEmptyArray(pva.substitutionScores)) {
                    let sift = "-";
                    let polyphen = "-";
                    for (let score of pva.substitutionScores) {
                        if (score.source === "sift") {
                            sift = score.description;
                        }
                        if (score.source === "polyphen") {
                            polyphen = score.description;
                        }
                    }
                    deleteriousness = sift + "/" + polyphen;
                }

                // Create the table row
                ctHtml += `<tr class="detail-view-row">
                            <td>${geneName}</td>
                            <td>${geneId}</td>
                            <td>${UtilsNew.isNotEmpty(ct.ensemblTranscriptId) ? ct.ensemblTranscriptId : "NA"}</td>
                            <td>${UtilsNew.isNotUndefinedOrNull(ct.biotype) ? ct.biotype: "NA"}</td>
                            <td>${UtilsNew.isNotEmptyArray(ct.transcriptAnnotationFlags) ? ct.transcriptAnnotationFlags.join(", ") : "NA"}</td>
                            <td>${soArray.join("")}</td>
                            <td>${uniprotAccession}</td>
                            <td>${pva.position !== undefined ? pva.position : "-"}</td>
                            <td>${pva.reference !== undefined ? pva.reference + "/" + pva.alternate : "-"}</td>
                            <td>${deleteriousness}</td>
                           </tr>`;
            }
            ctHtml += "</tbody></table>";
            return ctHtml;
        }
        return "-";
    }


    addPopulationFrequenciesInfoTooltip(div, populationFrequencies) {
        $("#" + div).qtip({
            content: {
                title: "Population Frequencies",
                text: function(event, api) {
                    return `One coloured square is shown for each population. Frequencies are coded with colours which classify values 
                            into 'very rare', 'rare', 'average', 'common' or 'missing', see 
                            <a href="http://www.dialogues-cns.com/wp-content/uploads/2015/03/DialoguesClinNeurosci-17-69-g001.jpg" target="_blank">
                                http://www.dialogues-cns.com/wp-content/uploads/2015/03/DialoguesClinNeurosci-17-69-g001.jpg
                            </a>. Please, leave the cursor over each square to visualize the actual frequency values.
                            <div style="padding: 10px 0px 0px 0px"><label>Legend: </label></div>
                            <div><span><i class="fa fa-square" style="color: ${populationFrequencies.color.veryRare}" aria-hidden="true"></i> Very rare:  freq < 0.001</span></div>
                            <div><span><i class="fa fa-square" style="color: ${populationFrequencies.color.rare}" aria-hidden="true"></i> Rare:  freq < 0.005</span></div>
                            <div><span><i class="fa fa-square" style="color: ${populationFrequencies.color.average}" aria-hidden="true"></i> Average:  freq < 0.05</span></div>
                            <div><span><i class="fa fa-square" style="color: ${populationFrequencies.color.common}" aria-hidden="true"></i> Common:  freq >= 0.05</span></div>
                            <div><span><i class="fa fa-square" style="color: black" aria-hidden="true"></i> Not observed</span></div>`
                },
            },
            position: {
                target: "mouse",
                adjust: {
                    x: 2, y: 2,
                    mouse: false
                }
            },
            style: {
                width: "240px",
            },
            show: {
                delay: 200
            },
            hide: {
                fixed: true,
                delay: 300
            }
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
        let popFreqs;
        let popFreqsArray = [];
        for (let population of populations) {
            let freq = (populationFrequenciesMap.get(population) !== undefined) ? populationFrequenciesMap.get(population) : 0;
            popFreqsArray.push(population + "::" + freq);
        }
        popFreqs = popFreqsArray.join(",");

        // Create the table (with the tooltip info)
        let tableSize = populations.length * 15;
        let htmlPopFreqTable = `<table style="width:${tableSize}px" class="populationFrequenciesTable" data-pop-freq="${popFreqs}"><tr>`;
        for (let population of populations) {
            // This array contains "study:population"
            let color = "black";
            if (typeof populationFrequenciesMap.get(population) !== "undefined") {
                let freq = populationFrequenciesMap.get(population);
                let color = this._getPopulationFrequencyColor(freq, populationFrequenciesColor);
                htmlPopFreqTable += `<td style="width: 15px; background: ${color}">&nbsp;</td>`;
            } else {
                htmlPopFreqTable += `<td style="width: 15px; background: ${color}">&nbsp;</td>`;
            }
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
                    let popFreqs = $(this).attr('data-pop-freq').split(",");
                    let html = "";
                    for (let popFreq of popFreqs) {
                        let arr = popFreq.split("::");
                        let color = _this._getPopulationFrequencyColor(arr[1], populationFrequencies.color);
                        let freq = (arr[1] !== 0 && arr[1] !== "0") ? arr[1] : "0.0 (not observed)";
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
            position: {
                target: "mouse",
                adjust: {
                    x: 2, y: 2,
                    mouse: false
                }
            },
            style: {
                width: "240px",
            },
            show: {
                delay: 200
            },
            hide: {
                fixed: true,
                delay: 300
            }
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

}