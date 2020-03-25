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
import Utils from "./../../../utils.js";

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
            },
            consequenceTypes: {
                type: Object,
            },
            hashFragmentCredentials: {
                type: Object
            }
        }
    }

    _init() {
        this._prefix = "actg" + Utils.randomString(6);
        // this.data = [];
    }

    updated(changedProperties) {
        if (changedProperties.has("data")) {
            this.renderTable();
        }
        if (changedProperties.has("consequenceTypes")) {
            this.assignColors();
        }
        // this.requestUpdate();
        // this.renderTable();
    }

    assignColors() {
        if (typeof this.consequenceTypes !== "undefined") {
            let consequenceTypeToColor = {};
            let consequenceTypeToImpact = {};
            for (let i = 0; i < this.consequenceTypes.categories.length; i++) {
                if (typeof this.consequenceTypes.categories[i].terms !== "undefined") {
                    for (let j = 0; j < this.consequenceTypes.categories[i].terms.length; j++) {
                        consequenceTypeToColor[this.consequenceTypes.categories[i].terms[j].name] = this.consequenceTypes.color[this.consequenceTypes.categories[i].terms[j].impact];
                    }
                } else if (typeof this.consequenceTypes.categories[i].id !== "undefined" && typeof this.consequenceTypes.categories[i].name !== "undefined") {
                    consequenceTypeToColor[this.consequenceTypes.categories[i].name] = this.consequenceTypes.color[this.consequenceTypes.categories[i].impact];
                }
            }
            this.consequenceTypeToColor = consequenceTypeToColor;

            this.renderTable();
            // this.requestUpdate();
        }
    }

    //it was render();
    renderTable() {
        // this.data
        // debugger
        let _this = this;
        $('#' + this._prefix + 'ConsequenceTypeTable').bootstrapTable('destroy');
        $('#' + this._prefix + 'ConsequenceTypeTable').bootstrapTable({
            data: _this.data,
            detailView: true,
            detailFormatter: _this.detailFormatter,
            columns: [
                [
                    {
                        title: 'Gene',
                        field: 'geneName',
                        colspan: 1,
                        rowspan: 2
                    },
                    {
                        title: 'Ensembl Gene',
                        field: 'ensemblGeneId',
                        colspan: 1,
                        rowspan: 2
                    },
                    {
                        title: 'Ensembl Transcript',
                        field: 'ensemblTranscriptId',
                        colspan: 1,
                        rowspan: 2
                    },
                    {
                        title: 'Biotype',
                        field: 'biotype',
                        colspan: 1,
                        rowspan: 2
                    },
                    {
                        title: 'Sequence Ontology Term',
                        field: {context : _this},
                        formatter: _this.seqOntologyFormatter,
                        colspan: 1,
                        rowspan: 2
                    },
                    {
                        title: 'Protein Variant Annotation',
                        colspan: 6,
                        rowspan: 1
                    }
                ],
                [
                    {
                        title: 'Uniprot Accession',
                        field: {context: _this},
                        formatter: _this.uniprotAccessionFormatter,
                        colspan: 1,
                        rowspan: 1
                    },
                    {
                        title: 'Position',
                        field: 'proteinVariantAnnotation.position',
                        colspan: 1,
                        rowspan: 1
                    },
                    {
                        title: 'Ref/Alt',
                        formatter: _this.proteinAlleleFormatter,
                        colspan: 1,
                        rowspan: 1
                    },
                    {
                        title: 'Sift',
                        formatter: _this.siftScoreFormatter,
                        cellStyle: _this.siftCellStyle,
                        colspan: 1,
                        rowspan: 1
                    },
                    {
                        title: 'Polyphen',
                        formatter: _this.polyphenScoreFormatter,
                        cellStyle: _this.polyphenCellStyle,
                        colspan: 1,
                        rowspan: 1
                    },
                    {
                        title: 'Functional Description',
                        field: 'proteinVariantAnnotation.functionalDescription',
                        colspan: 1,
                        rowspan: 1
                    }
                ]
            ]
        });
        // this.requestUpdate();
    }

    uniprotAccessionFormatter(value, row, index) {
        // debugger
        if (typeof row.proteinVariantAnnotation !== 'undefined' && typeof row.proteinVariantAnnotation.uniprotAccession !== 'undefined') {
            if (typeof this.field.context.hashFragmentCredentials !== "undefined") {
                return '<a href="#protein/' + this.field.context.hashFragmentCredentials.project + '/' + this.field.context.hashFragmentCredentials.study + '/' +
                    row.proteinVariantAnnotation.uniprotAccession + '">' + row.proteinVariantAnnotation.uniprotAccession + '</a>';
            } else {
                return '<a href="http://www.uniprot.org/uniprot/' + row.proteinVariantAnnotation.uniprotAccession + '">' + row.proteinVariantAnnotation.uniprotAccession
                    + '</a>';
            }
        } else {
            return '-';
        }
    }

    seqOntologyFormatter(value, row, index) {
        let soTerm = row.sequenceOntologyTerms[0];
        if (typeof this.field.context.consequenceTypeToColor !== "undefined" && typeof this.field.context.consequenceTypeToColor[soTerm.name] !== "undefined") {
            return '<span style="color: ' + this.field.context.consequenceTypeToColor[soTerm.name] + '">' + soTerm.name + '</span>&nbsp;'
                + '(<a target="_blank" href="http://www.sequenceontology.org/browser/current_svn/term/' + soTerm.accession + '">' + soTerm.accession + '</a>)';
        } else {
            return soTerm.name + '&nbsp;(<a target="_blank" href="http://www.sequenceontology.org/browser/current_svn/term/' + soTerm.accession + '">' + soTerm.accession + '</a>)';
        }
    }

    proteinAlleleFormatter(value, row, index) {
        if (typeof row.proteinVariantAnnotation !== 'undefined' && typeof row.proteinVariantAnnotation.reference !== 'undefined'
            && typeof row.proteinVariantAnnotation.alternate !== 'undefined') {
            return row.proteinVariantAnnotation.reference + "/" + row.proteinVariantAnnotation.alternate;
        } else {
            return '-';
        }
    }

    detailFormatter(index, row) {
        if (row.biotype === "protein_coding") {
            if (typeof row.proteinVariantAnnotation !== 'undefined') {
                if (typeof row.proteinVariantAnnotation.uniprotVariantId !== 'undefined') {
                    var html = [];
                    var result = "";
                    if (typeof row.proteinVariantAnnotation.features !== 'undefined') {
                        let features = row.proteinVariantAnnotation.features;
                        var xxx = [];
                        for (let i in features) {
                            features[i].id = features[i].id || '-';
                            features[i].type = features[i].type || '-';
                            features[i].description = features[i].description || '-';
                            xxx.push('<span> ID: ' + features[i].id + ', Start:' + features[i].start + ', End:' + features[i].end +
                                ', Type:' + features[i].type + ', Description:' + features[i].description + ' </span> <br>');
                        }
                        result = xxx.join('');
                    } else {
                        result = '-';
                    }

                    html.push('<b>Uniprot Variant ID:</b> ' + row.proteinVariantAnnotation.uniprotVariantId +
                        '<br> <b>Keywords:</b> ' + row.proteinVariantAnnotation.keywords +
                        '<br> <b>Features:</b><br> ' + result);
                    return html.join('');
                } else {
                    return "No Uniprot Data Available";
                }
            }
            else {
                return "No Uniprot Data Available";
            }
        } else {
            return '-';
        }

    }

    siftScoreFormatter(value, row, index) {
        if (typeof row.proteinVariantAnnotation !== 'undefined') {
            let sub = row.proteinVariantAnnotation.substitutionScores;
            for (let i in sub) {
                if (sub[i].source === "sift") {
                    return '<span title="' + sub[i].description + '">' + sub[i].score + '</span>';
                }
            }
        } else {
            return '-';
        }
    }

    polyphenScoreFormatter(value, row, index) {
        if (typeof row.proteinVariantAnnotation !== 'undefined') {
            let sub = row.proteinVariantAnnotation.substitutionScores;
            for (let i in sub) {
                if (sub[i].source === "polyphen") {
                    return '<span title="' + sub[i].description + '">' + sub[i].score + '</span>';
                }
            }
        } else {
            return '-';
        }
    }

    siftCellStyle(value, row, index) {
        if (typeof row.proteinVariantAnnotation !== 'undefined') {
            if (typeof row.proteinVariantAnnotation.substitutionScores !== 'undefined') {
                let sift = row.proteinVariantAnnotation.substitutionScores[0];
                if (sift) {
                    switch (sift.description) {
                    case 'tolerated':
                        return {
                            css: {
                                "background-color": "green"
                            }
                        };
                    case 'deleterious':
                        return {
                            css: {
                                "background-color": "red"
                            }
                        };
                    }
                }
            }
        }
        return {};
    }

    polyphenCellStyle(value, row, index) {
        if (typeof row.proteinVariantAnnotation !== 'undefined') {
            if (typeof row.proteinVariantAnnotation.substitutionScores !== 'undefined') {
                let polyphen = row.proteinVariantAnnotation.substitutionScores[1];
                if (polyphen) {
                    switch (polyphen.description) {
                    case 'probably damaging':
                        return {
                            css: {
                                "background-color": "red"
                            }
                        };
                    case 'possibly damaging':
                        return {
                            css: {
                                "background-color": "orange"
                            }
                        };
                    case 'benign':
                        return {
                            css: {
                                "background-color": "green"
                            }
                        };
                    case 'unknown':
                        return {
                            css: {
                                "background-color": "blue"
                            }
                        };
                    }
                }
            }
        }
        return {};
    }

    render() {
        return html`
            <div style="padding: 10px;">
                <table id="${this._prefix}ConsequenceTypeTable" data-search="true" data-show-columns="true" data-pagination="true"
                       data-page-list="[10, 25, 50]" data-show-pagination-switch="true" data-show-export="true" data-icons-prefix="fa" data-icons="icons">
                </table>
            </div>
        `;
    }
}

customElements.define('cellbase-annotation-consequencetype-grid', AnnotationConsequencetypeGrid);
