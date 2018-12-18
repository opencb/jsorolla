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
                                    ${row.chromosome}:${row.start} ${ref}/${alt}
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="${this.prefix}dropdownMenu1" style="font-size: 1.25rem;margin-top: 0px">
                               ${genomeBrowserMenuLink}
                                <li class="dropdown-header">External Links</li>
                                <li><a target='_blank' href="https://www.ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=${id}">Ensembl</a></li>
                                <li><a target='_blank' href="https://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs=${id}">dbSNP</a></li>
                                <li><a target='_blank' href="https://www.snpedia.com/index.php/${id}">SNPedia</a></li>
                                <li class="dropdown-header">Clinical Links</li>
                                <li><a target='_blank' href="https://www.ncbi.nlm.nih.gov/clinvar/?term=${id}">ClinVar</a></li>
                            </ul>
                        </div>
                        `;
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
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined") {
            if (typeof row.annotation !== "undefined" && typeof row.annotation.consequenceTypes !== "undefined" && row.annotation.consequenceTypes.length > 0) {
                let visited = {};
                let geneLinks = [];
                for (let i = 0; i < row.annotation.consequenceTypes.length; i++) {
                    if (typeof row.annotation.consequenceTypes[i].geneName !== "undefined" && row.annotation.consequenceTypes[i].geneName !== ""
                        && typeof visited[row.annotation.consequenceTypes[i].geneName] === "undefined") {
                        if (typeof this.opencgaSession.project !== "undefined" && typeof this.opencgaSession.study !== "undefined") {
                            geneLinks.push("<a style=\"cursor: pointer;white-space: nowrap\" href=\"#gene/" + this.opencgaSession.project.alias +"/" +
                                this.opencgaSession.study.alias + "/" + row.annotation.consequenceTypes[i].geneName + "\">" + row.annotation.consequenceTypes[i].geneName + "</a>");
                        } else {
                            geneLinks.push("<a style=\"cursor: pointer;white-space: nowrap\">" + row.annotation.consequenceTypes[i].geneName + "</a>")
                        }
                        visited[row.annotation.consequenceTypes[i].geneName] = true;
                    }
                }
                return geneLinks.join(", ");
            }
        }
        return "-";
    }

    consequenceTypeFormatter(value, row, index) {
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined") {
            if (typeof row.annotation !== "undefined" && typeof row.annotation.consequenceTypes !== "undefined" && row.annotation.consequenceTypes.length > 0) {
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
        }
        return "-";
    }

}