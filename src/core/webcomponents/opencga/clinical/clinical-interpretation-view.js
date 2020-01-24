/**
 * Copyright 2015-2019 OpenCB
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

// todo check functionality (there is a _render() method and explicit calls to render())

import {LitElement, html} from "/web_modules/lit-element.js";
import "../../variant/annotation/cellbase-variantannotation-view.js";
import "../../variant/variant-beacon-network.js";
import "../../variant/variant-genome-browser.js";
import "../../../../genome-browser/webcomponent/genome-browser.js";

export default class ClinicalInterpretationView extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            proteinSubstitutionScores: {
                type: Object
            },
            consequenceTypes: {
                type: Object
            },
            opencgaClient: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            interpretation: {
                type: Object
            },
            interpretationId: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "clinical-interpretation-" + Utils.randomString(6) + "_";
        this.tracks = {
            sequence: {type: "sequence"},
            gene: {type: "gene"}
        };
        this.config = {
            summary: true,
            toolbar: true,
            detail: true
        };
    }

    updated(changedProperties) {
        if (changedProperties.has("interpretationId")) {
            this.onChangeId();
        }
        if (changedProperties.has("opencgaSession")) {
            this.projectStudyObtained();
        }
    }

    ready() {
        super.ready();
        this._summaryCollapsed = false;
        this.variantObj = {};
        this.reportVariants = [];
    }

    connectedCallback() {
        super.connectedCallback();
        PolymerUtils.hide(this._prefix + "container-interpretation-view");
        this._render();
    }

    _render() {
        if (UtilsNew.isNotUndefinedOrNull(this.interpretation)) {
            PolymerUtils.show(this._prefix + "container-interpretation-view");
            this.render();
            this.pedigreeRender();

            const table = $("#" + this._prefix + "mainTable");
            const _this = this;
            table.on("expand-row.bs.table", function(e, index, row, $detail) {
                const res = _this.detailFormatter(index, row);
                $detail.html(res);
                console.log("row expanded", e, index);
            });

            // Add click event to "Add to Report" button
            PolymerUtils.querySelectorAll(".interpretation-add-to-report").forEach(elem => elem.addEventListener("click", function(e) {
                _this.onAddVariantToReport(e.target.dataset.variantId);
                e.stopPropagation();
            }, true));
        }
    }

    _summaryOnClick() {
        if (this._summaryCollapsed) {
            $("#" + this._prefix + "SummaryCollapseIcon").removeClass("fa-plus-square-o").addClass("fa-minus-square-o");
        } else {
            $("#" + this._prefix + "SummaryCollapseIcon").removeClass("fa-minus-square-o").addClass("fa-plus-square-o");
        }
        this._summaryCollapsed = !this._summaryCollapsed;
    }

    onCreateReport() {
        // Make a deep copy object
        const copy = JSON.parse(JSON.stringify(this.interpretation));

        // Find all reportedVariant object from this.reportVariants
        const _reportVariants = [];
        for (const variantId of this.reportVariants) {
            for (const reportedVariant of this.interpretation.reportedVariants) {
                if (variantId === reportedVariant.id) {
                    _reportVariants.push(reportedVariant);
                    break;
                }
            }
        }
        copy.reportedVariants = _reportVariants;

        // Fire an event with the new interpretation data model
        this.dispatchEvent(new CustomEvent("createreport", {detail: {interpretation: copy}}));
        this.reportVariants = [];
        this._render();
    }

    onAddVariantToReport(variantId) {
        const _reportVariants = this.reportVariants;
        if (!_reportVariants.includes(variantId)) {
            PolymerUtils.getElementById("v" + variantId + "ButtonText").innerHTML = "Remove from Report";
            PolymerUtils.removeClass("v" + variantId + "Button", "btn-success");
            PolymerUtils.addClass("v" + variantId + "Button", "btn-danger");
            PolymerUtils.removeClass("v" + variantId + "ButtonIcon", "fa-check");
            PolymerUtils.addClass("v" + variantId + "ButtonIcon", "fa-times");

            _reportVariants.push(variantId);
        } else {
            PolymerUtils.getElementById("v" + variantId + "ButtonText").innerHTML = "Add to Report";
            PolymerUtils.removeClass("v" + variantId + "Button", "btn-danger");
            PolymerUtils.addClass("v" + variantId + "Button", "btn-success");
            PolymerUtils.removeClass("v" + variantId + "ButtonIcon", "fa-times");
            PolymerUtils.addClass("v" + variantId + "ButtonIcon", "fa-check");

            const idx = _reportVariants.indexOf(variantId);
            _reportVariants.splice(idx, 1);
        }
        this.reportVariants = [];
        this.reportVariants = _reportVariants;
    }

    _getFileMetricsArray() {
        if (this.variantObj === undefined || this.variantObj.studies === undefined) {
            return [];
        }
        const files = this.variantObj.studies[0].files;
        // Let's find all the existing attributes
        const attributesSet = new Set();
        for (const file of files) {
            for (const attr of Object.keys(file.attributes)) {
                if (attr !== "QUAL" && attr !== "FILTER") {
                    attributesSet.add(attr);
                }
            }
        }
        const attributesArray = Array.from(attributesSet.values()).sort();
        attributesArray.unshift("QUAL", "FILTER");

        // We store the values as: result = [{name: "AC", values: [1, 2, 3, 4]}]
        const result = [];
        for (const attr of attributesArray) {
            const tmp = {name: attr, values: []};
            for (const file of files) {
                tmp.values.push(file.attributes[attr]);
            }
            result.push(tmp);
        }
        return result;
    }

    onChangeId(e) {
        const params = {
            study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias
        };
        const _this = this;
        if (UtilsNew.isNotUndefinedOrNull(this.interpretationId)) {
            this.opencgaClient.files().content(this.interpretationId, params)
                .then(response => {
                    _this.interpretation = JSON.parse(response);
                    console.log("end");
                    this._render();
                });
        }
    }

    detailFormatter(value, row) {
        const ctHtml = [];
        for (const ct of row.annotation.consequenceTypes) {
            let x = "<span class='col-md-12' style='padding: 0px'>";
            if (ct.geneName !== undefined) {
                x += `<span class='col-md-3'>
                            <span style="font-weight: bold">${ct.geneName}</span> (<a href='http://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${ct.ensemblGeneId};r=13:32315474-32400266' target="_blank">${ct.ensemblGeneId}</a>)
                          </span>`;
                x += `<span class='col-md-3'><a href="http://www.ensembl.org/Homo_sapiens/Transcript/Summary?db=core;t=${ct.ensemblTranscriptId}" target="_blank">${ct.ensemblTranscriptId}</a> (${ct.biotype})</span>`;
            } else {
                x += "<span class='col-md-3' style=\"font-weight: bold\">NA</span>";
                x += "<span class='col-md-3' style=\"font-weight: bold\">NA</span>";
            }
            x += "<span class='col-md-3'>";
            for (const so of ct.sequenceOntologyTerms) {
                x += `<span><span style="font-weight: bold">${so.name}</span>&nbsp;(${so.accession})</span> `;
            }
            x += "</span>";
            x += "<span class='col-md-3'>";
            if (ct.exonOverlap !== undefined) {
                x += `<span><span style="font-weight: bold">cDNA:</span> ${ct.cdnaPosition}, <span style="font-weight: bold">CDS:</span> ${ct.cdsPosition}, <span style="font-weight: bold">Codon:</span> ${ct.codon}, <span style="font-weight: bold">Exon:</span> ${ct.exonOverlap[0].number}</span>`;
            }
            x += "</span>";
            x += "</span>";
            ctHtml.push(x);
        }
        const commentsHtml = [];
        for (const comment of row.comments) {
            const x = `<span class='col-md-12'>${comment.comment} (${comment.author}, ${comment.date})</span><br>`;
            commentsHtml.push(x);
        }

        const html = `<div class="col-md-12" style="padding: 2px 0px">
                                <div class="col-md-2" style="padding: 0px 5px">
                                    <label>Consequence Type:</label>
                                </div>
                                <div class="col-md-10" style="padding: 0px 5px">
                                    <form class="form-horizontal">
                                        <div class="form-group" style="margin: 0px 2px">
                                            ${ctHtml.join("\n")}
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div class="col-md-12" style="padding: 2px 0px">
                                <div class="col-md-2" style="padding: 0px 5px">
                                    <label>Comments:</label>
                                </div>
                                <div class="col-md-10" style="padding: 0px 5px">
                                    <form class="form-horizontal">
                                        <div class="form-group" style="margin: 0px 2px">
                                            ${commentsHtml.join("\n")}
                                        </div>
                                    </form>
                                </div>
                            </div>`;
        return html;
    }

    render() {
        this.variant = ""; // Empty the variant every time the grid is loaded
        this.from = 1;
        this.to = Math.min(this.interpretation.reportedVariants.length, 10);
        this.numTotalResultsText = this.interpretation.reportedVariants.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        this.cols = this._refreshTableColumns();
        this._genomeBrowserActive = false;
        if (UtilsNew.isNotUndefinedOrNull(this.interpretation.reportedVariants[0])) {
            this.regionGenomeBrowser = new Region({chromosome: this.interpretation.reportedVariants[0].chromosome,
                start: this.interpretation.reportedVariants[0].start, end: this.interpretation.reportedVariants[0].end});
        }
        this._collapse = false;
        const _this = this;
        const _table = $("#" + this._prefix + "mainTable");
        $("#" + this._prefix + "mainTable").bootstrapTable("destroy");
        $("#" + this._prefix + "mainTable").bootstrapTable({
            data: _this.interpretation.reportedVariants,
            columns: _this.cols,
            onPageChange: function(page, size) {
                _this.from = (page - 1) * size + 1;
                _this.to = page * size;
            },
            onClickRow: function(row, $element) {
                $(".success").removeClass("success");
                $($element).addClass("success");
                _this._onSelectVariant(row);
                _this.regionGenomeBrowser = new Region({chromosome: row.chromosome, start: row.start, end: row.end});
            },
            onPostBody: function(data) {
                if (UtilsNew.isNotUndefinedOrNull(_table)) {
                    PolymerUtils.querySelector(_table.selector).rows[2].setAttribute("class", "success");
                    _this._onSelectVariant(data[0]);
                }
            }
        });
    }
    _onSelectVariant(row) {
        if (typeof row !== "undefined") {

            //                    let variant = row.chromosome + ":" + row.start + ":" + row.reference + ":" + row.alternate;
            this.variant = row.chromosome + ":" + row.start + ":" + row.reference + ":" + row.alternate;
            //                    this.variant  = row.annotation.chromosome + ":" + row.annotation.start + ":" + row.annotation.reference + ":" + row.annotation.alternate;
            this.variantObj = row;

            this.dispatchEvent(new CustomEvent("selectvariant", {detail: {id: this.variant, variant: row}, bubbles: true, composed: true}));
        }
    }
    projectStudyObtained(project, study) {
        if (typeof this.opencgaSession.project !== "undefined" && this.opencgaSession.project.alias !== "" && typeof this.opencgaSession.study !== "undefined" && this.opencgaSession.study.alias !== "") {
            this.hashFragmentCredentials = {
                project: this.opencgaSession.project.alias,
                study: this.opencgaSession.study.alias
            };
        }
    }
    variantIdFormatter(value, row, index) {
        //                let res = "";
        const ref = (row.reference != "") ? row.reference : "-";
        const alt = (row.alternate != "") ? row.alternate : "-";
        return "<span style='white-space: nowrap'>" + row.chromosome + ":" + row.start + " " + ref + "/" + alt + "</span>";
        //
        //                if (UtilsNew.isNotUndefinedOrNull(row.id)) {
        //                    res += "<label>" + row.id + "</label><br>";
        //                    if (row.annotation.cytoband !== undefined) {
        //                        res += "<label>" + row.annotation.cytoband[0].name + "</label><br>";
        //                    }
        //                }
        //                if (UtilsNew.isNotUndefinedOrNull(row.names) && row.names.length > 0) {
        //                    res += "<label><a href='https://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs="
        //                        + row.names[0]+ "' target='_blank'>dbSNP " + row.names[0] + "</a></label>";
        //                }
        //                return res;
    }
    geneFormatter(value, row, index) {
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined") {
            if (typeof row.annotation !== "undefined" && typeof row.annotation.consequenceTypes !== "undefined" && row.annotation.consequenceTypes.length > 0) {
                const visited = {};
                const geneLinks = [];
                for (let i = 0; i < row.annotation.consequenceTypes.length; i++) {
                    if (typeof row.annotation.consequenceTypes[i].geneName !== "undefined" && row.annotation.consequenceTypes[i].geneName !== "" &&
                        typeof visited[row.annotation.consequenceTypes[i].geneName] === "undefined") {
                        if (typeof this.field.context.project !== "undefined" && typeof this.field.context.study !== "undefined") {
                            geneLinks.push("<a style=\"cursor: pointer;white-space: nowrap\" href=\"#gene/" + this.field.context.project.alias +"/" +
                                this.field.context.study.alias + "/" + row.annotation.consequenceTypes[i].geneName + "\">" + row.annotation.consequenceTypes[i].geneName + "</a>");
                        } else {
                            geneLinks.push("<a style=\"cursor: pointer;white-space: nowrap\">" + row.annotation.consequenceTypes[i].geneName + "</a>");
                        }
                        visited[row.annotation.consequenceTypes[i].geneName] = true;
                    }
                }
                return geneLinks.join(", ");
            }
        }
        return "-";
    }
    geneAnnotationFormatter(value, row, index) {
        const val = "<span style='color: red'>missense_variant</span>";
        return val;
    }
    prediciotnFormatter(value, row, index) {
        let res = "";
        if (UtilsNew.isNotUndefinedOrNull(row.reportEvents)) {
            row.reportEvents.forEach(reportEvent => {
                if (UtilsNew.isNotUndefinedOrNull(reportEvent.prediction)) {
                    res += "<label>" + reportEvent.prediction + "</label>";
                }
                if (UtilsNew.isNotUndefinedOrNull(reportEvent.score)) {
                    res += " (<label>" + reportEvent.score + "</label>)";
                }
            });
        }
        return res;
    }
    zigosityFormatter(value, row, index) {
        let res = "";
        if (UtilsNew.isNotUndefinedOrNull(row.studies)) {
            let left; let right;
            if (UtilsNew.isNotUndefinedOrNull(row.studies[0]) && UtilsNew.isNotUndefinedOrNull(row.studies[0].samplesData) &&
                UtilsNew.isNotUndefinedOrNull(row.studies[0].samplesData[this.field.memberIdx]) && UtilsNew.isNotUndefinedOrNull(row.studies[0].samplesData[this.field.memberIdx][0])) {
                switch (row.studies[0].samplesData[this.field.memberIdx][0]) {
                case "0/0":
                case "0|0":
                    left = "white";
                    right = "white";
                    break;
                case "0/1":
                case "1/0":
                    left = "black";
                    right = "white";
                    break;
                case "1/1":
                case "1|1":
                    left = "black";
                    right = "black";
                    break;
                }
            }
            res = `<table>
                                <tr style="padding: 0px;">
                                    <td style="padding: 0px"><div style='width: 15px;height: 15px;border: 1px solid black;border-radius: 50%;background-color: ${left}'></div></td>
                                    <td style="padding: 0px"><div style='width: 15px;height: 15px;border: 1px solid black;border-radius: 50%;background-color: ${right}'></div></td>
                                </tr>
                           </table>`;
        }
        return res;
    }
    fileMetricsFormatter(value, row, index) {
        let val;
        if (row !== undefined && row.studies !== undefined && row.studies.length > 0 && row.studies[0].files.length > 0 && UtilsNew.isNotUndefinedOrNull(row.studies[0].files[0].attributes)) {
            val = `<div class="col-md-12" style="padding: 0px">
                                <form class="form-horizontal">
                                    <div class="form-group" style="margin: 0px 2px">
                                        <label class="col-md-4">Quality:</label>
                                        <span class="col-md-8">${row.studies[0].files[0].attributes.QUAL}</span>
                                    </div>
                                    <div class="form-group" style="margin: 0px 2px">
                                        <label class="col-md-4">Filter:</label>
                                        <span class="col-md-8">${row.studies[0].files[0].attributes.FILTER}</span>
                                    </div>
                                    <div class="form-group" style="margin: 0px 2px">
                                        <label class="col-md-4">DP:</label>
                                        <span class="col-md-8">${row.studies[0].files[0].attributes.DP}</span>
                                    </div>
                                </form>
                            </div>`;
        }
        return val;
    }

    interpretationFormatter(value, row, index) {
        const res = `<button id="v${row.id}Button" type='button' class='btn btn-success btn-xs interpretation-add-to-report' data-variant-id='${row.id}'>
                                    <i id="v${row.id}ButtonIcon" class="fa fa-check interpretation-add-to-report" aria-hidden="true" data-variant-id='${row.id}'></i>
                                    <span id="v${row.id}ButtonText" class="interpretation-add-to-report" data-variant-id='${row.id}'>Add to Report</span>
                               </button>`;


        const comments = UtilsNew.isNotEmptyArray(row.comments) ? row.comments.length : 0;
        return res + "<br><br><span>Comments (" + comments + ")</span>";
    }

    _refreshTableColumns() {
        this.cols = this._createDefaultColumns();
        if (typeof this.cols !== "undefined" && ((UtilsNew.isNotUndefinedOrNull(this.interpretation.clinicalAnalysis.family) && this.interpretation.clinicalAnalysis.family.id > 0 &&
            Object.keys(this.interpretation.clinicalAnalysis.family.members).length > 0) ||
            UtilsNew.isNotUndefinedOrNull(this.interpretation.clinicalAnalysis.subjects) && UtilsNew.isNotEmptyArray(this.interpretation.clinicalAnalysis.subjects))) {
            const zigosityIdx = 5;
            let members = [];
            if (UtilsNew.isNotUndefinedOrNull(this.interpretation.clinicalAnalysis.family) && this.interpretation.clinicalAnalysis.family.id > 0 ) {
                members = this.interpretation.clinicalAnalysis.family.members;
            } else {
                members.push(this.interpretation.clinicalAnalysis.subjects[0]);
            }
            this.cols[0].splice(zigosityIdx, 0, {
                title: "Zigosity",
                rowspan: 1,
                colspan: members.length,
                halign: "center"
            });
            for (let i = 0; i < members.length; i++) {
                this.cols[1].splice(i, 0, {
                    title: members[i].name,
                    field: {
                        memberIdx: i,
                        memberName: members[i].name
                    },
                    rowspan: 1,
                    colspan: 1,
                    halign: "center",
                    formatter: this.zigosityFormatter
                });
            }
        }
        return this.cols;
    }
    _createDefaultColumns() {
        return [
            [
                {
                    title: "Variant",
                    field: "variant",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.variantIdFormatter,
                    halign: "center",
                    sortable: true
                },
                {
                    title: "Genes",
                    field: {name: "genes", context: this},
                    rowspan: 2,
                    colspan: 1,
                    halign: "center",
                    formatter: this.geneFormatter
                },
                {
                    title: "Type",
                    field: "type",
                    rowspan: 2,
                    colspan: 1,
                    halign: "center"
                },
                {
                    title: "Gene Annotation",
                    field: "consequence",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.geneAnnotationFormatter,
                    halign: "center"
                },
                {
                    title: "Prediction",
                    field: "prediction",
                    rowspan: 2,
                    colspan: 1,
                    halign: "center",
                    formatter: this.prediciotnFormatter
                },
                {
                    title: "Max allele freq",
                    field: "masAllele",
                    rowspan: 2,
                    colspan: 1,
                    halign: "center"
                },
                {
                    title: "File metrics",
                    field: "read",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.fileMetricsFormatter,
                    halign: "center"
                },
                {
                    title: "Custom Annotations",
                    field: "customAnnotations",
                    rowspan: 2,
                    colspan: 1,
                    halign: "center"
                },
                {
                    title: "Interpretation",
                    field: "interpretation",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.interpretationFormatter,
                    halign: "center"
                }
            ],
            []
        ];
    }

    triggerBeacon(e) {
        this.variantToBeacon = this.variant;
    }

    _toArray(obj) {
        return Object.keys(obj).map(function(key) {
            const spacers= [",", ";"];
            return {
                name: key,
                value: (obj[key]).split(new RegExp(spacers.join("|"), "g")).join(", ")
            };
        });
    }


    pedigreeRender() {
        if (UtilsNew.isNotUndefinedOrNull(PolymerUtils.getElementById(this._prefix + "PedigreeView"))) {
            PolymerUtils.innerHTML(this._prefix + "PedigreeView", "");
        }
        if (UtilsNew.isNotUndefinedOrNull(this.interpretation.clinicalAnalysis) && UtilsNew.isNotUndefinedOrNull(this.interpretation.clinicalAnalysis.family) && this.interpretation.clinicalAnalysis.family.id > 0 ) {
            //                    if (UtilsNew.isNotUndefined(this.svg)) {
            //                        PolymerUtils.getElementById(this._prefix + "PedigreeView").removeChild(this.svg);
            //                    }
            const body = Object.assign({}, this.interpretation.clinicalAnalysis.family);
            const membersNew =[];
            body.members.forEach(member => {
                const newMember = Object.assign({}, member);
                if (UtilsNew.isNotUndefinedOrNull(newMember.father) && UtilsNew.isNotUndefinedOrNull(newMember.father.id)) {
                    const newFather = body.members.find(member =>{
                        return member.id === newMember.father.id;
                    });
                    if (UtilsNew.isNotUndefinedOrNull(newFather)) {
                        newMember.father = newFather.name;
                    }
                }

                if (UtilsNew.isNotUndefinedOrNull(newMember.mother) && UtilsNew.isNotUndefinedOrNull(newMember.mother.id)) {
                    const newMother = body.members.find(member =>{
                        return member.id === newMember.mother.id;
                    });
                    if (UtilsNew.isNotUndefinedOrNull(newMother)) {
                        newMember.mother = newMother.name;
                    }
                }
                membersNew.push(newMember);
            });
            body.members = membersNew;

            // Render new Pedigree
            const querySelector = PolymerUtils.getElementById(this._prefix + "PedigreeView");
            const pedigree = new Pedigree(body, {selectShowSampleNames: true});
            this.svg = pedigree.pedigreeFromFamily(pedigree.pedigree, {
                width: 200,
                height: 180
            });
            querySelector.appendChild(this.svg);
        }
    }
    activeGenomeBrowser() {
        const width = $(".tab-content").width();
        this.settings = {width: width};
        this._genomeBrowserActive = true;

    }

    render() {
        return html`<template>
    <style include="jso-styles">
        .clinical-bottom-tab-title {
            font-size: 115%;
            font-weight: bold;
        }

        .file-metrics-table-FILTER {
            border-bottom: 2px solid #ccc;
        }
    </style>


    <div class="container-fluid" id="${this._prefix}container-interpretation-view">
        <div class="row">

            <div id="${this._prefix}mainIntepretation" class="">

                ${this.config.summary ? html`
                        <!--<h2 style="border-bottom-width: 1px;border-bottom-style: solid;border-bottom-color: #ddd">-->
                        <h2 style="">
                            Interpretation Analysis: ${this.interpretation.name}
                        </h2>
                        <hr style="margin-top: 5px">
    
    
                        <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
                            <div class="panel panel-default">
                                <div class="panel-heading" role="tab" id="headingTwo">
                                    <h4 class="panel-title">
                                        <a role="button" data-toggle="collapse" data-parent="#accordion"
                                           href="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo"
                                           @click="${this._summaryOnClick}">
                                            <i id="${this._prefix}SummaryCollapseIcon" class="fa fa-minus-square-o"
                                               aria-hidden="true"></i> Summary
                                        </a>
                                    </h4>
                                </div>
                                <div id="collapseTwo" class="panel-collapse collapse in" role="tabpanel"
                                     aria-labelledby="headingTwo">
                                    <div class="panel-body">
                                        <div class="col-md-12">
                                            <div class="col-md-4">
                                                <label>Sample</label>
                                                <hr style="margin: 2px 0px;border-top: 2px solid #eee">
                                                <form class="form-horizontal">
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Name:</label>
                                                        <span class="col-md-8">
                                                                ${this.interpretation.clinicalAnalysis.subjects[0].samples[0].name}
                                                            </span>
                                                    </div>
                                                    <!--<div class="form-group" style="margin: 0px 2px">-->
                                                    <!--<label class="col-md-4">File:</label>-->
                                                    <!--<span class="col-md-8">${this.interpretation.clinicalAnalysis.germline.name}</span>-->
                                                    <!--</div>-->
                                                    <!--<div class="form-group" style="margin: 0px 2px">-->
                                                    <!--<label class="col-md-4">Genome Assembly:</label>-->
                                                    <!--<span class="col-md-8">${this.interpretation.clinicalAnalysis.germline.assembly}</span>-->
                                                    <!--</div>-->
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Somatic:</label>
                                                        <span class="col-md-6">${this.interpretation.clinicalAnalysis.subjects[0].samples[0].somatic}</span>
                                                    </div>
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Phenotypes:</label>
                                                        <span class="col-md-8">
                                                                <template is="dom-repeat"
                                                                          items="${this.interpretation.clinicalAnalysis.subjects[0].samples[0].phenotypes}">
                                                                    <span>${this.item.name} (<a
                                                                            href="http://compbio.charite.de/hpoweb/showterm?id=${this.item.id}"
                                                                            target="_blank">${this.item.id}</a>)</span>
                                                                    <br>
                                                                </template>
                                                            </span>
                                                    </div>
                                                    <!--<div class="form-group" style="margin: 0px 2px">-->
                                                    <!--<label class="col-md-4">Description:</label>-->
                                                    <!--<span class="col-md-8">${this.interpretation.clinicalAnalysis.subjects[0].samples[0].description}</span>-->
                                                    <!--</div>-->
                                                </form>
                                            </div>
                                            <div class="col-md-4">
                                                <label>Subject</label>
                                                <hr style="margin: 2px 0px;border-top: 2px solid #eee">
                                                <form class="form-horizontal">
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Name:</label>
                                                        <span class="col-md-8">
                                                                ${this.interpretation.clinicalAnalysis.subjects[0].name}
                                                            </span>
                                                    </div>
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Sex (karyotype):</label>
                                                        <span class="col-md-8">${this.interpretation.clinicalAnalysis.subjects[0].sex} &nbsp;&nbsp; (${this.interpretation.clinicalAnalysis.subjects[0].karyotypicSex})</span>
                                                    </div>
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Date of Birth:</label>
                                                        <span class="col-md-8">${this.interpretation.clinicalAnalysis.subjects[0].dateOfBirth} &nbsp;&nbsp; (${this.interpretation.clinicalAnalysis.subjects[0].lifeStatus})</span>
                                                    </div>
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Parental Consanguinity:</label>
                                                        <span class="col-md-8">${this.interpretation.clinicalAnalysis.subjects[0].parentalConsanguinity}</span>
                                                    </div>
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Phenotypes:</label>
                                                        <span class="col-md-8">
                                                                <template is="dom-repeat"
                                                                          items="${this.interpretation.clinicalAnalysis.subjects[0].phenotypes}">
                                                                    <span>${this.item.name} (<a
                                                                            href="http://compbio.charite.de/hpoweb/showterm?id=${this.item.id}"
                                                                            target="_blank">${this.item.id}</a>)</span>
                                                                    <br>
                                                                </template>
                                                            </span>
                                                    </div>
                                                    <!--<div class="form-group" style="margin: 0px 2px">-->
                                                    <!--<label class="col-md-4">Description:</label>-->
                                                    <!--<span class="col-md-8">${this.interpretation.clinicalAnalysis.subjects[0].description}</span>-->
                                                    <!--</div>-->
                                                </form>
                                            </div>
                                            <div class="col-md-4">
                                                <label>Family</label>
                                                <hr style="margin: 2px 0px;border-top: 2px solid #eee">
                                                <form class="form-horizontal">
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Name:</label>
                                                        <span class="col-md-8">${this.interpretation.clinicalAnalysis.family.name}</span>
                                                    </div>
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Phenotypes:</label>
                                                        <span class="col-md-8">
                                                                ${this.interpretation.clinicalAnalysis.family.phenotypes && this.interpretation.clinicalAnalysis.family.phenotypes.length ? this.interpretation.clinicalAnalysis.family.phenotypes.map( item => html`
                                                                    <span>${this.item.name} (<a href="http://compbio.charite.de/hpoweb/showterm?id=${this.item.id}" target="_blank">${this.item.id}</a>)</span>
                                                                    <br>
                                                                `) : null}
                                                            </span>
                                                    </div>
    
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Pedigree:</label>
                                                        <span class="col-md-8">
                                                                 <div class="col-md-12">
                                                                     <div id="${this._prefix}PedigreeView"></div>
                                                                </div>
                                                            <!--<br>-->
                                                            <!--
                                                                                                                        <span>Click <a href="" style="font-weight: bold">here</a> for more info</span>
                                                            -->
                                                            </span>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
    
                                        <div class="col-md-12">
                                            <br>
                                            <div class="col-md-4">
                                                <label>Analysis</label>
                                                <hr style="margin: 2px 0px;border-top: 2px solid #eee">
                                                <form class="form-horizontal">
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Name (date):</label>
                                                        <span class="col-md-8">${this.interpretation.name} &nbsp; (${this.interpretation.creationDate})</span>
                                                    </div>
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Type:</label>
                                                        <span class="col-md-8">${this.interpretation.clinicalAnalysis.type}</span>
                                                    </div>
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Analyst:</label>
                                                        <span class="col-md-8">${this.interpretation.analyst.name} (<a>${this.interpretation.analyst.email}</a>)</span>
                                                    </div>
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Description:</label>
                                                        <span class="col-md-8">${this.interpretation.description}</span>
                                                    </div>
                                                </form>
                                            </div>
                                            <div class="col-md-4">
                                                <label>Software</label>
                                                <hr style="margin: 2px 0px;border-top: 2px solid #eee">
                                                <form class="form-horizontal">
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Name:</label>
                                                        <span class="col-md-8">
                                                                ${this.interpretation.software.name} (<a
                                                                href="${this.interpretation.software.website}"
                                                                target="_blank"><i class="fa fa-external-link"
                                                                                   aria-hidden="true"></i> website</a>)
                                                            </span>
                                                    </div>
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Version:</label>
                                                        <span class="col-md-8">
                                                                ${this.interpretation.software.version} (<a
                                                                href="${this.interpretation.software.repository}/commit/${this.interpretation.software.commit}"
                                                                target="_blank"><i class="fa fa-external-link" aria-hidden="true"></i> commit</a>)
                                                            </span>
                                                    </div>
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-4">Dependencies:</label>
                                                        <span class="col-md-8">
                                                                ${this.interpretation.versions && this.interpretation.versions.length ? this.interpretation.versions.map( item => html`
                                                                    <span>${this.item.name} (v${this.item.version})</span>
                                                                `) : null }
                                                            </span>
                                                    </div>
                                                </form>
                                            </div>
                                            <div class="col-md-4">
                                                <label>Variant Filters</label>
                                                <hr style="margin: 2px 0px;border-top: 2px solid #eee">
                                                <form class="form-horizontal">
                                                    ${this._toArray(this.interpretation.filters).map( item => html`
                                                        <div class="form-group" style="margin: 0px 2px">
                                                            <label class="col-md-4">${item.name}:</label>
                                                            <span class="col-md-8">${item.value}</span>
                                                        </div>
                                                    `) }
                                                </form>
                                            </div>
                                        </div>
                                    </div>
    
                                </div>
                            </div>
                        </div>
                    ` : null }
                


                <div style="padding-top: 5px">
                    <h2 style="border-bottom-width: 1px;border-bottom-style: solid;border-bottom-color: #ddd">Reported
                        Variants</h2>

                    <div class="panell panel--default">
                        <div class="panel--body">
                            <!--<div class="row">-->
                            <div class="col-md-12" style="padding: 5px 0px 15px 0px">
                                <div class="btn-toolbar" role="toolbar" aria-label="..." style="float: right">
                                    <!--<div class="btn-group btn-group-sm" role="group" aria-label="..." style="padding: 10px 0px">-->
                                    <!--<button type="button" class="btn btn-default btn-warning gene-ct-buttons active" on-click="updateQuery">-->
                                    <!--All-->
                                    <!--</button>-->
                                    <!--<button type="button" class="btn btn-default btn-warning gene-ct-buttons" on-click="updateQuery">-->
                                    <!--SNV-->
                                    <!--</button>-->
                                    <!--<button type="button" class="btn btn-default btn-warning gene-ct-buttons" on-click="updateQuery">-->
                                    <!--INDEL-->
                                    <!--</button>-->
                                    <!--<button type="button" class="btn btn-default btn-warning gene-ct-buttons" on-click="updateQuery">-->
                                    <!--SV-->
                                    <!--</button>-->
                                    <!--</div>-->

                                    <!--<div class="btn-group btn-group-sm" role="group" aria-label="..." style="padding: 10px 0px">-->
                                    <!--<button type="button" class="btn btn-default btn-warning gene-ct-buttons active" on-click="updateQuery">-->
                                    <!--All-->
                                    <!--</button>-->
                                    <!--<button type="button" class="btn btn-default btn-warning gene-ct-buttons" on-click="updateQuery">-->
                                    <!--Missense-->
                                    <!--</button>-->
                                    <!--<button type="button" class="btn btn-default btn-warning gene-ct-buttons" on-click="updateQuery">-->
                                    <!--LoF-->
                                    <!--</button>-->
                                    <!--</div>-->

                                    <!--<div class="btn-group btn-group-sm" role="group" aria-label="..." style="padding: 10px 0px">-->
                                    <!--<button type="button" class="btn btn-default btn-warning gene-ct-buttons active" on-click="updateQuery">-->
                                    <!--All-->
                                    <!--</button>-->
                                    <!--<button type="button" class="btn btn-default btn-warning gene-ct-buttons" on-click="updateQuery">-->
                                    <!--Tier 1-->
                                    <!--</button>-->
                                    <!--<button type="button" class="btn btn-default btn-warning gene-ct-buttons" on-click="updateQuery">-->
                                    <!--Tier 2-->
                                    <!--</button>-->
                                    <!--<button type="button" class="btn btn-default btn-warning gene-ct-buttons" on-click="updateQuery">-->
                                    <!--Tier 3-->
                                    <!--</button>-->
                                    <!--</div>-->
                                </div>
                            </div>
                            <!--</div>-->
                        </div>
                    </div>

                    <!-- GRID HEADER TOOLBAR -->
                    <div class="col-md-15" style="padding: 12px 0px 0px 0px">
                        <div id="${this._prefix}ToolbarLeft" class="col-md-6" style="padding: 15px 0px 0px 0px">
                                    <span style="padding: 0px 0px 0px 0px">
                                        Showing <label>${this.from}-${this.to}</label> of <label>${this.numTotalResultsText}</label> variants
                                    </span>
                        </div>

                        <div class="col-md-6" style="padding: 0px">
                            <div class="form-inline">
                                <div class="form-group" style="padding: 0px;float: right">
                                    <div class="input-group">
                                        <!--<input type="text" class="form-control" name="date" size="20" placeholder="Search for...">-->
                                        <!--<span class="input-group-btn">-->
                                        <!--<button type="button" class="btn btn-default"><i class="fa fa-search" aria-hidden="true"></i></button>-->
                                        <!--</span>-->
                                    </div>

                                    ${this.config.toolbar ? html`
                                        <div class="btn-group">
                                            <!--<button type="button" class="btn btn-primary">-->
                                            <!--<i class="fa fa-pencil" aria-hidden="true"></i>&nbsp;&nbsp;Update-->
                                            <!--</button>-->
                                            <!--<button type="button" class="btn btn-primary">-->
                                            <!--<i class="fa fa-comments-o" aria-hidden="true"></i>&nbsp;&nbsp;Review Case-->
                                            <!--</button>-->
                                            <button type="button" class="btn btn-primary" @click="${this.onCreateReport}">
                                                <i class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;&nbsp;Create
                                                Report&nbsp;&nbsp;<span class="badge" style="font-size: 75%">${this.reportVariants.length}</span>
                                            </button>
                                        </div>
                                    ` : null }
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="${this._prefix}GridTableDiv" style="margin-top: 5px">
                        <table id="${this._prefix}mainTable" data-pagination="true" data-page-list="[5, 10, 25]"
                               data-show-export="true" data-detail-view="true" data-detail-formatter="detailFormatter">
                            <thead style="background-color: #eee"></thead>
                        </table>
                    </div>
                </div>


                <div class="" style="padding-top: 10px">
                    <h3>Variant Detail View: ${this.variant}</h3>
                    <!-- Bottom TABs -->
                    <div style="padding-top: 20px">
                        <ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">
                            <li role="presentation" class="active">
                                <a href="#${this._prefix}Annotation" role="tab" data-toggle="tab"
                                   class="clinical-bottom-tab-title">
                                    Current Annotation
                                </a>
                            </li>
                            <!--<li role="presentation">-->
                            <!--<a href="#${this._prefix}Genotype" role="tab" data-toggle="tab" class="clinical-bottom-tab-title">-->
                            <!--Genotype Stats-->
                            <!--</a>-->
                            <!--</li>-->
                            <li role="presentation">
                                <a href="#${this._prefix}FileMetrics" role="tab" data-toggle="tab"
                                   class="clinical-bottom-tab-title">
                                    File Metrics
                                </a>
                            </li>
                            <li role="presentation">
                                <a href="#${this._prefix}BeaconNetwork" role="tab" data-toggle="tab"
                                   class="clinical-bottom-tab-title">
                                    Beacon Network
                                </a>
                            </li>
                            <li role="presentation" @click="${this.activeGenomeBrowser}">
                                <a href="#${this._prefix}GenomeBrowser" role="tab" data-toggle="tab"
                                   class="clinical-bottom-tab-title">
                                    Genome Browser
                                </a>
                            </li>
                        </ul>

                        <div class="tab-content" style="height: 680px">
                            <!-- Current Annotation Tab -->
                            <div role="tabpanel" class="tab-pane active" id="${this._prefix}Annotation">
                                <cellbase-variantannotation-view _prefix="${this._prefix}"
                                                                mode="vertical"
                                                                .data="${this.variant}"
                                                                .cellbaseClient="${this.cellbaseClient}"
                                                                .assembly="${this.opencgaSession.project.organism.assembly}"
                                                                .hashFragmentCredentials="${this.hashFragmentCredentials}"
                                                                .consequenceTypes="${this.consequenceTypes}"
                                                                .proteinSubstitutionScores="${this.proteinSubstitutionScores}"
                                                                style="font-size: 12px">
                                </cellbase-variantannotation-view>
                            </div>

                            <!--&lt;!&ndash; Genotypes & Files Tab &ndash;&gt;-->
                            <!--<div id="${this._prefix}Genotype" role="tabpanel" class="tab-pane">-->
                            <!--Under construction.-->
                            <!--</div>-->

                            <!-- File Metrics Tab -->
                            <div id="${this._prefix}FileMetrics" role="tabpanel" class="tab-pane">
                                <div class="col-md-8 col-md-offset-1" style="padding-top: 20px;overflow: auto;">
                                    <table class="table table-hover">
                                        <thead>
                                        <tr>
                                            <th>VCF Attribute</th>
                                            ${this.interpretation.clinicalAnalysis.family.members.map( member => html`
                                                <th>${member.name}</th>
                                            `)}
                                        </tr>
                                        </thead>
                                        <tbody id="${this._prefix}TableTBody">
                                        ${this._getFileMetricsArray(this.variantObj.studies[0].files).map( attrs => html`
                                            <tr id="${attrs.name}" class="file-metrics-table-${attrs.name}">
                                                <td><span style="font-weight: bold">${attrs.name}</span></td>
                                                ${attrs.values.map( attr => html`
                                                    <td>${attr}</td>
                                                `) }
                                            </tr>  
                                        `) }
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!--Beacon network-->
                            <div role="tabpanel" class="tab-pane" id="${this._prefix}BeaconNetwork">
                                <br>
                                <button class="btn btn-primary" type="button" @click="${this.triggerBeacon}">Search Beacon
                                    Network
                                </button>
                                <a data-toggle="tooltip"
                                   title="Beacon Network is a search engine across the world's public beacons. You can find it here - https://beacon-network.org/#/">
                                    <i class="fa fa-info-circle" aria-hidden="true"></i>
                                </a>
                                <br>
                                <br>
                                <variant-beacon-network .clear="${this.variant}" .variant="${this.variantToBeacon}"></variant-beacon-network>
                            </div>

                            <!-- Genome Browser -->
                            <div role="tabpanel" class="tab-pane" id="${this._prefix}GenomeBrowser">
                                <div class="" style="padding: 0px 5px">
                                    <!--<variant-genome-browser project="${this.project}" study="${this.study}" samples="${this.samples}" active="${this._genomeBrowserActive}"-->
                                    <!--opencga-client="${this.opencgaClient}" cellbase-client="${this.cellbaseClient}" region="${this.regionGenomeBrowser}">-->
                                    <!--</variant-genome-browser>-->
                                    <genome-browser .cellbaseclient="${this.cellbaseClient}"
                                                    .opencgaClient="${this.opencgaClient}"
                                                    .region="${this.regionGenomeBrowser}"
                                                    .opencgaSession="${this.opencgaSession}"
                                                    .active="${this._genomeBrowserActive}"
                                                    .settings="${this.settings}">
                                    </genome-browser>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
</template>
        `;
    }

}

customElements.define("clinical-interpretation-view", ClinicalInterpretationView);

