/*
 * Copyright 2015-2024 OpenCB
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

import {html, LitElement} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import GridCommons from "../../commons/grid-commons.js";

export default class VariantConsequenceTypeView extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            consequenceTypes: {
                type: Array
            },
            active: {
                type: Boolean
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this._consequenceTypeColorMap = this._getConsequenceTypeColorMap();
    }

    updated(changedProperties) {
        if ((changedProperties.has("consequenceTypes") || changedProperties.has("active")) && this.active) {
            this.renderTable();
        }
    }

    _getConsequenceTypeColorMap() {
        const consequenceTypeToColor = {};
        if (CONSEQUENCE_TYPES) {
            for (const categoryIndex in CONSEQUENCE_TYPES.categories) {
                const terms = CONSEQUENCE_TYPES.categories[categoryIndex].terms;
                for (const termIndex in terms) {
                    consequenceTypeToColor[terms[termIndex].name] = CONSEQUENCE_TYPES.style[terms[termIndex].impact];
                }
            }
        }
        return consequenceTypeToColor;
    }

    detailFormatter(value, row) {
        let result = "<div class='row' style='padding-bottom: 20px'>";
        let detailHtml = "";

        // Transcript Section
        detailHtml += `<div style='padding: 20px 0px 10px 25px'><h4>Transcript Annotation</h4></div>
                            <div style='padding: 0px 40px'>`;
        if (row.transcriptId) {
            let exonOverlap = "NA";
            if (row.exonOverlap) {
                const exons = [];
                for (const exon in row.exonOverlap) {
                    exons.push(`${row.exonOverlap[exon].number} (${row.exonOverlap[exon].percentage})`);
                }
                exonOverlap = exons.join(", ");
            }
            detailHtml += `<label style="padding-right: 10px">Ensembl Transcript ID:</label><a href="https://www.ensembl.org/Homo_sapiens/Transcript/Idhistory?t=${row.transcriptId}" target="_blank">${row.transcriptId || "NA"}</a><br>
                           <label style="padding-right: 10px">Strand:</label>${row.strand || "NA"}<br>
                           <label style="padding-right: 10px">cDNA Position:</label>${row.cdnaPosition || "NA"}<br>
                           <label style="padding-right: 10px">CDS Position:</label>${row.cdsPosition || "NA"}<br>
                           <label style="padding-right: 10px">Codon:</label>${row.codon || "NA"}<br>
                           <label style="padding-right: 10px">Exon Overlap (%):</label>${exonOverlap}`;
        } else {
            detailHtml += "No Transcript Data Available";
        }
        detailHtml += "</div>";

        // Protein Section
        detailHtml += `<div style='padding: 20px 0px 10px 25px'><h4>Protein Annotation</h4></div>
                            <div style='padding: 0px 40px'>`;
        if (row.proteinVariantAnnotation) {
            const protAnnot = row.proteinVariantAnnotation;
            const uniprotAcc = protAnnot.uniprotAccession ? `<a href="https://www.uniprot.org/uniprot/${protAnnot.uniprotAccession}" target="_blank">${protAnnot.uniprotAccession}</a>` : "NA";
            const keywords = protAnnot.keywords ? protAnnot.keywords.join(", ") : "NA";
            let domains = "NA";
            if (protAnnot.features && protAnnot.features.length) {
                const _domains = [];
                for (const domainIndex in protAnnot.features) {
                    _domains.push(protAnnot.features[domainIndex].id);
                }
                domains = `${_domains.join(", ")} (check all protein domains at <a href="https://www.ebi.ac.uk/interpro/protein/reviewed/${protAnnot.uniprotAccession}" target="_blank">InterPro</a>)`;
            }
            detailHtml += `<label style="padding-right: 10px">UniProt Accession:</label>${uniprotAcc}<br>
                           <label style="padding-right: 10px">UniProt Variant ID:</label>${protAnnot.uniprotVariantId || "NA"}<br>
                           <label style="padding-right: 10px">Functional Description:</label>${protAnnot.functionalDescription || "NA"}<br>
                           <label style="padding-right: 10px">Keywords:</label>${keywords}<br>
                           <label style="padding-right: 10px">Domains:</label>${domains}`;
        } else {
            detailHtml += "No Uniprot Data Available";
        }
        detailHtml += "</div>";

        result += detailHtml + "</div>";
        return result;
    }

    geneNameFormatter(value) {
        if (value) {
            return `<a class="text-decoration-none" href="https://www.genenames.org/tools/search/#!/all?query=${value}" target="_blank">${value}</a>`;
        } else {
            return "-";
        }
    }

    ensemblGeneFormatter(value) {
        if (value) {
            return `<a class="text-decoration-none" href="https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${value}" target="_blank">${value}</a>`;
        } else {
            return "-";
        }
    }

    ensemblTranscriptFormatter(value) {
        if (value) {
            return `<a class="text-decoration-none" href="https://www.ensembl.org/Homo_sapiens/Transcript/Idhistory?t=${value}" target="_blank">${value}</a>`;
        } else {
            return "-";
        }
    }

    transcriptFlagFormatter(value, row) {
        if (row.transcriptId) {
            return row.transcriptFlags && row.transcriptFlags.length ? row.transcriptFlags.join(", ") : "NA";
        } else {
            return "-";
        }
    }

    consequenceTypeFormatter(values) {
        if (values) {
            const result = [];
            for (const soTerm of values) {
                const color = this._consequenceTypeColorMap && this._consequenceTypeColorMap[soTerm.name] ?
                    this._consequenceTypeColorMap[soTerm.name]: "black";
                result.push(`<span style="color: ${color}">${soTerm.name}</span>&nbsp;(<a class="text-decoration-none" href="http://www.sequenceontology.org/browser/current_svn/term/${soTerm.accession}" target="_blank">${soTerm.accession}</a>)`);
            }
            return result.join("<br>");
        } else {
            return "-";
        }
    }

    uniprotAccessionFormatter(value) {
        if (value && value.uniprotAccession) {
            return `<a href="https://www.uniprot.org/uniprot/${value.uniprotAccession}" target="_blank">${value.uniprotAccession}</a>`;
        } else {
            return "-";
        }
    }

    proteinAlleleFormatter(value) {
        if (value && value.reference && value.alternate) {
            return value.reference + "/" + value.alternate;
        } else {
            return "-";
        }
    }

    siftScoreFormatter(value) {
        if (value) {
            for (const i in value) {
                if (value[i].source === "sift") {
                    const color = PROTEIN_SUBSTITUTION_SCORE.style.sift[value[i].description];
                    return `<span title="${value[i].score}" style="color: ${color}">${value[i].description}</span>`;
                }
            }
        } else {
            return "-";
        }
    }

    polyphenScoreFormatter(value) {
        if (value) {
            for (const i in value) {
                if (value[i].source === "polyphen") {
                    const color = PROTEIN_SUBSTITUTION_SCORE.style.polyphen[value[i].description];
                    return `<span title="${value[i].score}" style="color: ${color}">${value[i].description}</span>`;
                }
            }
        } else {
            return "-";
        }
    }

    renderTable() {
        $("#" + this._prefix + "ConsequenceTypeTable").bootstrapTable("destroy");
        $("#" + this._prefix + "ConsequenceTypeTable").bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            data: this.consequenceTypes,
            pagination: true,
            showExport: true,
            detailView: !!this.detailFormatter,
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            detailFormatter: (value, row) => this.detailFormatter(value, row),
            columns: [
                [
                    {
                        title: "Gene",
                        field: "geneName",
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.geneNameFormatter,
                        halign: "center"
                    },
                    {
                        title: "Gene ID",
                        field: "geneId",
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.ensemblGeneFormatter,
                        halign: "center"
                    },
                    {
                        title: "Transcript ID",
                        field: "transcriptId",
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.ensemblTranscriptFormatter,
                        halign: "center"
                    },
                    {
                        title: "Source",
                        field: "source",
                        rowspan: 2,
                        colspan: 1,
                        halign: "center"
                    },
                    {
                        title: "Biotype",
                        field: "biotype",
                        rowspan: 2,
                        colspan: 1,
                        halign: "center"
                    },
                    {
                        title: "Transcript Flag",
                        field: "transcriptAnnotationFlags",
                        colspan: 1,
                        rowspan: 2,
                        formatter: this.transcriptFlagFormatter,
                        halign: "center"
                    },
                    {
                        title: "Consequence Types (SO Term)",
                        field: "sequenceOntologyTerms",
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.consequenceTypeFormatter.bind(this),
                        halign: "center"
                    },
                    {
                        title: "Protein Variant Annotation",
                        rowspan: 1,
                        colspan: 5,
                        halign: "center"
                    }
                ],
                [
                    {
                        title: "UniProt Accession",
                        field: "proteinVariantAnnotation",
                        formatter: this.uniprotAccessionFormatter,
                        rowspan: 1,
                        colspan: 1,
                        halign: "center"
                    },
                    {
                        title: "Position",
                        field: "proteinVariantAnnotation.position",
                        rowspan: 1,
                        colspan: 1,
                        align: "right",
                        halign: "center"
                    },
                    {
                        title: "Ref/Alt",
                        field: "proteinVariantAnnotation",
                        rowspan: 1,
                        colspan: 1,
                        formatter: this.proteinAlleleFormatter,
                        halign: "center"
                    },
                    {
                        title: "Sift",
                        field: "proteinVariantAnnotation.substitutionScores",
                        rowspan: 1,
                        colspan: 1,
                        formatter: this.siftScoreFormatter,
                        halign: "center"
                    },
                    {
                        title: "Polyphen",
                        field: "proteinVariantAnnotation.substitutionScores",
                        rowspan: 1,
                        colspan: 1,
                        formatter: this.polyphenScoreFormatter,
                        halign: "center"
                    }
                ]
            ]
        });
    }

    render() {
        return html`
            <div style="padding: 20px">
                <table id="${this._prefix}ConsequenceTypeTable"></table>
            </div>
        `;
    }

}

customElements.define("variant-consequence-type-view", VariantConsequenceTypeView);
