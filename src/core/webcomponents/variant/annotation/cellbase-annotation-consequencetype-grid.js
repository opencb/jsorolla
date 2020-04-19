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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "./../../../utilsNew.js";
import {consequenceTypes, proteinSubstitutionScore} from "../../commons/opencga-variant-contants.js";

export default class AnnotationConsequencetypeGrid extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            data: {
                type: Array
            }
        }
    }

    _init() {
        this._prefix = "actg" + UtilsNew.randomString(6);

        this._consequenceTypeColorMap = this._getConsequenceTypeColorMap();
    }

    updated(changedProperties) {
        if (changedProperties.has("data")) {
            this.renderTable();
        }
    }

    _getConsequenceTypeColorMap() {
        let consequenceTypeToColor = {};
        if (consequenceTypes) {
            for (let categoryIndex in consequenceTypes.categories) {
                let terms = consequenceTypes.categories[categoryIndex].terms;
                for (let termIndex in terms) {
                    consequenceTypeToColor[terms[termIndex].name] = consequenceTypes.style[terms[termIndex].impact];
                }
            }
        }
        return consequenceTypeToColor;
    }

    detailFormatter(value, row) {
        let result = "<div class='row' style='padding-bottom: 20px'>";
        let detailHtml = "";

        // Transcript Section
        detailHtml += "<div style='padding: 20px 0px 10px 25px'><h4>Transcript Annotation</h4></div>";
        let exonOverlap = "NA";
        if (row.exonOverlap) {
            let exons = [];
            for (let exon in row.exonOverlap) {
                exons.push(`${row.exonOverlap[exon].number} (${row.exonOverlap[exon].percentage})`);
            }
            exonOverlap = exons.join(", ");
        }
        detailHtml += `<div style='padding: 0px 40px'>
                                <label style="padding-right: 10px">Ensembl Transcript ID:</label>${row.ensemblTranscriptId || "NA"}<br>
                                <label style="padding-right: 10px">Strand:</label>${row.strand || "NA"}<br>
                                <label style="padding-right: 10px">cDNA Position:</label>${row.cdnaPosition || "NA"}<br>
                                <label style="padding-right: 10px">CDS Position:</label>${row.cdsPosition || "NA"}<br>
                                <label style="padding-right: 10px">Codon:</label>${row.codon || "NA"}<br>
                                <label style="padding-right: 10px">Exon Overlap (%):</label>${exonOverlap}
                       </div>`;

        // Protein Section
        detailHtml += `<div style='padding: 20px 0px 10px 25px'><h4>Protein Annotation</h4></div>
                            <div style='padding: 0px 40px'>`;
        if (row.proteinVariantAnnotation) {
            let protAnnot = row.proteinVariantAnnotation;
            let keywords = protAnnot.keywords ? protAnnot.keywords.join(", ") : "NA";
            let domains = protAnnot.features ? protAnnot.features.map(v => {if (v.id) {return " " + v.id}}) : "NA";
            detailHtml += `<label style="padding-right: 10px">UniProt Accession:</label>${protAnnot.uniprotAccession || "NA"}<br>
                           <label style="padding-right: 10px">UniProt Variant ID:</label>${protAnnot.uniprotVariantId || "NA"}<br>
                           <label style="padding-right: 10px">Functional Description:</label>${protAnnot.functionalDescription || "NA"}<br>
                           <label style="padding-right: 10px">Keywords:</label>${keywords}<br>
                           <label style="padding-right: 10px">Features:</label>${domains}`;
        } else {
            detailHtml += "No Uniprot Data Available";
        }
        detailHtml += "</div>";

        result += detailHtml + "</div>";
        return result;
    }

    geneNameFormatter(value, row, index) {
        if (value) {
            return `<a href="https://www.genenames.org/tools/search/#!/all?query=${value}" target="_blank">${value}</a>`;
        } else {
            return "";
        }
    }

    ensemblGeneFormatter(value, row, index) {
        if (value) {
            return `<a href="https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${value}" target="_blank">${value}</a>`;
        } else {
            return "-";
        }
    }

    ensemblTranscriptFormatter(value, row, index) {
        if (value) {
            return `<a href="https://www.ensembl.org/Homo_sapiens/Transcript/Idhistory?t=${value}" target="_blank">${value}</a>`;
        } else {
            return "-";
        }
    }

    transcriptFlagFormatter(value, row, index) {
        if (value) {
            return value.join(", ");
        } else {
            return "-";
        }
    }

    consequenceTypeFormatter(values, row, index) {
        if (values) {
            let result = [];
            for (let soTerm of values) {
                let color = this._consequenceTypeColorMap && this._consequenceTypeColorMap[soTerm.name]
                    ? this._consequenceTypeColorMap[soTerm.name]
                    : "black";
                result.push(`<span style="color: ${color}">${soTerm.name}</span>&nbsp;(<a href="http://www.sequenceontology.org/browser/current_svn/term/${soTerm.accession}" target="_blank">${soTerm.accession}</a>)`);
            }
            return result.join("<br>");
        } else {
            return "-";
        }
    }

    uniprotAccessionFormatter(value, row, index) {
        if (value && value.uniprotAccession) {
            return `<a href="https://www.uniprot.org/uniprot/${value.uniprotAccession}" target="_blank">${value.uniprotAccession}</a>`;
        } else {
            return "-";
        }
    }

    proteinAlleleFormatter(value, row, index) {
        if (value && value.reference && value.alternate) {
            return value.reference + "/" + value.alternate;
        } else {
            return "-";
        }
    }

    siftScoreFormatter(value, row, index) {
        if (value) {
            for (let i in value) {
                if (value[i].source === "sift") {
                    let color = proteinSubstitutionScore.style.sift[value[i].description];
                    return `<span title="${value[i].description}" style="color: ${color}">${value[i].score}</span>`;
                }
            }
        } else {
            return "-";
        }
    }

    polyphenScoreFormatter(value, row, index) {
        if (value) {
            for (let i in value) {
                if (value[i].source === "polyphen") {
                    let color = proteinSubstitutionScore.style.polyphen[value[i].description];
                    return `<span title="${value[i].description}" style="color: ${color}">${value[i].score}</span>`;
                }
            }
        } else {
            return "-";
        }
    }

    renderTable() {
        let _this = this;
        $('#' + this._prefix + 'ConsequenceTypeTable').bootstrapTable('destroy');
        $('#' + this._prefix + 'ConsequenceTypeTable').bootstrapTable({
            data: _this.data,
            pagination: false,
            showExport: true,
            detailView: true,
            detailFormatter: this.detailFormatter,
            columns: [
                [
                    {
                        title: 'Gene',
                        field: 'geneName',
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.geneNameFormatter,
                        halign: "center"
                    },
                    {
                        title: 'Ensembl Gene',
                        field: 'ensemblGeneId',
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.ensemblGeneFormatter,
                        halign: "center"
                    },
                    {
                        title: 'Ensembl Transcript',
                        field: 'ensemblTranscriptId',
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.ensemblTranscriptFormatter,
                        halign: "center"
                    },
                    {
                        title: 'Biotype',
                        field: 'biotype',
                        rowspan: 2,
                        colspan: 1,
                        halign: "center"
                    },
                    {
                        title: 'Transcript Flag',
                        field: 'transcriptAnnotationFlags',
                        colspan: 1,
                        rowspan: 2,
                        formatter: this.transcriptFlagFormatter,
                        halign: "center"
                    },
                    {
                        title: 'Consequence Types (SO Term)',
                        field: "sequenceOntologyTerms",
                        rowspan: 2,
                        colspan: 1,
                        formatter: this.consequenceTypeFormatter.bind(this),
                        halign: "center"
                    },
                    {
                        title: 'Protein Variant Annotation',
                        rowspan: 1,
                        colspan: 6,
                        halign: "center"
                    }
                ],
                [
                    {
                        title: 'Uniprot Accession',
                        field: "proteinVariantAnnotation",
                        formatter: this.uniprotAccessionFormatter,
                        rowspan: 1,
                        colspan: 1,
                        halign: "center"
                    },
                    {
                        title: 'Position',
                        field: 'proteinVariantAnnotation.position',
                        rowspan: 1,
                        colspan: 1,
                        align: "right",
                        halign: "center"
                    },
                    {
                        title: 'Ref/Alt',
                        field: 'proteinVariantAnnotation',
                        rowspan: 1,
                        colspan: 1,
                        formatter: this.proteinAlleleFormatter,
                        halign: "center"
                    },
                    {
                        title: 'Sift',
                        field: "proteinVariantAnnotation.substitutionScores",
                        rowspan: 1,
                        colspan: 1,
                        formatter: this.siftScoreFormatter,
                        align: "right",
                        halign: "center"
                    },
                    {
                        title: 'Polyphen',
                        field: "proteinVariantAnnotation.substitutionScores",
                        rowspan: 1,
                        colspan: 1,
                        formatter: this.polyphenScoreFormatter,
                        align: "right",
                        halign: "center"
                    }
                ]
            ]
        });
    }

    render() {
        return html`
            <div style="padding: 10px;">
                <table id="${this._prefix}ConsequenceTypeTable"></table>
            </div>
        `;
    }
}

customElements.define('cellbase-annotation-consequencetype-grid', AnnotationConsequencetypeGrid);
